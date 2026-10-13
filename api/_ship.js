// Tính phí vận chuyển. Quy tắc:
//  - Trong Đà Nẵng: tính theo km đường đi từ đường Đống Đa. Dưới 5km miễn phí; từ 5km trở lên: mỗi km vượt 5km là 6.000đ (8km = 18.000đ).
//  - Ngoài Đà Nẵng: đồng giá 30.000đ.
const FREE_KM=5,PER_KM=6000,OUT_FEE=30000
const fmt=n=>Number(n).toLocaleString('vi-VN')+'đ'
const fallbackFee=()=>Number(process.env.SHIP_FALLBACK_FEE)||OUT_FEE
const BOX={lat:[14.9,16.4],lng:[107.5,109.0]}   // khung toạ độ của Đà Nẵng (gồm cả khu vực Quảng Nam cũ) để loại kết quả tìm sai chỗ
const cache=new Map()
async function goong(path,params){
  const u=new URL('https://rsapi.goong.io/'+path)
  for(const [k,v] of Object.entries(params))u.searchParams.set(k,v)
  u.searchParams.set('api_key',process.env.GOONG_API_KEY)
  const ac=new AbortController(),t=setTimeout(()=>ac.abort(),4500)
  try{const r=await fetch(u,{signal:ac.signal});if(!r.ok)throw new Error('goong '+r.status);return await r.json()}finally{clearTimeout(t)}
}
async function geocode(text){
  const k=text.toLowerCase();if(cache.has(k))return cache.get(k)
  const j=await goong('Geocode',{address:text})
  const loc=j.results&&j.results[0]&&j.results[0].geometry&&j.results[0].geometry.location
  if(!loc)throw new Error('no result')
  const p={lat:loc.lat,lng:loc.lng};if(cache.size>300)cache.clear();cache.set(k,p);return p
}
const inBox=p=>p.lat>=BOX.lat[0]&&p.lat<=BOX.lat[1]&&p.lng>=BOX.lng[0]&&p.lng<=BOX.lng[1]
let origin
async function getOrigin(){   // điểm xuất phát: toạ độ cố định (SHIP_ORIGIN_LATLNG="lat,lng") hoặc tự tìm đường Đống Đa
  if(origin)return origin
  const ll=String(process.env.SHIP_ORIGIN_LATLNG||'').split(',').map(Number)
  origin=ll.length===2&&ll.every(Number.isFinite)?{lat:ll[0],lng:ll[1]}:await geocode(process.env.SHIP_ORIGIN||'Đường Đống Đa, Hải Châu, Đà Nẵng')
  return origin
}
export async function calcShip({region,ward,street}){
  if(region!=='danang')return {fee:OUT_FEE,km:null,estimated:false}
  const est=why=>({fee:fallbackFee(),km:null,estimated:true,note:`${why} Tạm tính ${fmt(fallbackFee())}, shop sẽ liên hệ báo lại nếu phí khác.`})
  if(!process.env.GOONG_API_KEY)return est('Chưa xác định được khoảng cách.')
  try{
    const o=await getOrigin()
    const d=await geocode(`${street}, ${ward}, Đà Nẵng, Việt Nam`)
    if(!inBox(d))return est('Không xác định được vị trí địa chỉ.')
    const j=await goong('DistanceMatrix',{origins:`${o.lat},${o.lng}`,destinations:`${d.lat},${d.lng}`,vehicle:'bike'})
    const el=j.rows&&j.rows[0]&&j.rows[0].elements&&j.rows[0].elements[0]
    if(!el||el.status!=='OK'||!el.distance)throw new Error('no route')
    const km=Math.round(el.distance.value/100)/10                 // làm tròn 0,1 km
    const over=km>FREE_KM?Math.ceil(km-FREE_KM):0                   // số km vượt 5km, làm tròn lên
    const kmText=km.toFixed(1).replace('.',',')
    return {fee:over*PER_KM,km,estimated:false,
      }
  }catch{return est('Chưa xác định được khoảng cách.')}
}