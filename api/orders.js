import {createHmac} from 'node:crypto'
import {db,body,limited,PHONE,safeEq,createPaidOrder} from './_lib.js'
import {calcShip} from './_ship.js'
const bad=(res,m,c=400)=>res.status(c).json({error:m})
// token gắn mã đơn + tổng tiền + SĐT: khách chỉ xem/xác nhận được đơn của chính mình
const sign=(code,total,phone)=>createHmac('sha256',process.env.SUPABASE_SERVICE_ROLE_KEY).update(`${code}|${total}|${phone}`).digest('hex')
const AUTO=()=>!!(process.env.SEPAY_API_KEY||process.env.BANK_WEBHOOK_KEY)   // có khóa webhook = tự động nhận biết chuyển khoản
export default async function handler(req,res){
  if(req.method!=='POST')return bad(res,'Method not allowed',405)
  const b=body(req),s=db()
  if(b.hp)return res.json({ok:true})                       // honeypot: bot điền ô ẩn

  if(b.step==='status'||b.step==='confirm'){
    const code=String(b.code||''),tok=String(b.token||'')
    const {data:pe}=await s.from('pending_orders').select('*').eq('code',code).maybeSingle()
    if(!pe||!safeEq(tok,sign(pe.code,pe.total_vnd,pe.phone)))return bad(res,'Không tìm thấy đơn hàng',403)
    if(b.step==='status'){     // trạng thái đơn: chờ shop xác nhận / đã thanh toán / bị hủy
      const {data:od}=await s.from('orders').select('status').eq('code',code).maybeSingle()
      const st=od&&od.status
      return res.json({paid:pe.status==='paid'||['paid','confirmed','shipping','done'].includes(st),waiting:st==='new',cancelled:st==='cancelled',underpaid:pe.status==='underpaid',code:pe.code,total_vnd:pe.total_vnd})
    }
    // khách bấm "đã chuyển khoản": ghi nhận đơn ở trạng thái CHỜ SHOP XÁC NHẬN (chỉ dùng khi chưa bật tự động nhận biết chuyển khoản)
    if(AUTO())return bad(res,'Hệ thống sẽ tự xác nhận ngay khi nhận được tiền, bạn vui lòng chờ trong giây lát')
    if(limited(req,15))return bad(res,'Bạn gửi quá nhanh, vui lòng thử lại sau ít phút',429)
    const r=await createPaidOrder(s,{code:pe.code,...pe.payload,phone:pe.phone,total:pe.total_vnd,status:'new'})
    if(!r.ok)return bad(res,'Không tạo được đơn, vui lòng thử lại',500)
    return res.json({code:pe.code,total_vnd:pe.total_vnd,waiting:true})
  }

  // BƯỚC 1: kiểm tra giỏ hàng, tạo mã đơn + QR. Đơn CHƯA vào bảng orders, chỉ lưu tạm ở pending_orders
  if(limited(req,15))return bad(res,'Bạn gửi quá nhanh, vui lòng thử lại sau ít phút',429)
  const name=String(b.name||'').trim().slice(0,100),phone=String(b.phone||'').replace(/[\s.\-]/g,'')
  const note=String(b.note||'').trim().slice(0,500)
  const sh=b.ship||{},part=v=>String(v||'').trim().slice(0,120)
  const region=sh.region==='danang'?'danang':'other',street=part(sh.street),ward=part(sh.ward),province=part(sh.province)
  if(!name)return bad(res,'Vui lòng nhập họ tên')
  if(region==='danang'&&(street.length<3||ward.length<2))return bad(res,'Vui lòng nhập số nhà, tên đường và phường/xã')
  if(region==='other'&&(province.length<2||street.length<3))return bad(res,'Vui lòng nhập tỉnh/thành phố và địa chỉ chi tiết')
  const address=region==='danang'?`${street}, ${ward}, Đà Nẵng`:`${street}, ${province}`
  if(!PHONE.test(phone))return bad(res,'Số điện thoại không hợp lệ')
  const items=Array.isArray(b.items)?b.items:[]
  if(!items.length||items.length>20)return bad(res,'Đơn hàng cần từ 1 đến 20 dòng')
  if(items.some(i=>!Number.isInteger(i.quantity)||i.quantity<1||i.quantity>99))return bad(res,'Số lượng phải từ 1 đến 99')
  const ids=[...new Set(items.map(i=>i.product_id))]
  const {data:ps}=await s.from('products').select('id,name,price_vnd,in_stock,price_contact,product_colors(name)').in('id',ids).eq('is_active',true)
  const map=new Map((ps||[]).map(p=>[p.id,p]))
  const lines=[]
  for(const i of items){            // giá lấy từ DB, bỏ qua mọi giá do trình duyệt gửi
    const p=map.get(i.product_id)
    if(!p||!p.product_colors.some(c=>c.name===i.color))return bad(res,'Sản phẩm hoặc màu không còn tồn tại')
    if(p.price_contact)return bad(res,`Sản phẩm "${p.name}" có giá liên hệ, vui lòng liên hệ fanpage hoặc Zalo của shop để được báo giá`)
    if(p.in_stock===false)return bad(res,`Sản phẩm "${p.name}" đã hết hàng, vui lòng chọn sản phẩm khác`)
    lines.push({product_id:p.id,product_name:p.name,color_name:i.color,unit_price_vnd:p.price_vnd,quantity:i.quantity})
  }
  const items_total=lines.reduce((t,l)=>t+l.unit_price_vnd*l.quantity,0)
  const ship=await calcShip({region,ward,street})   // phí ship luôn do máy chủ tính, không tin số từ trình duyệt
  const total=items_total+ship.fee
  const {data:code}=await s.rpc('next_order_code')
  await s.from('pending_orders').delete().lt('created_at',new Date(Date.now()-7*864e5).toISOString())   // dọn đơn chờ quá 7 ngày
  const {error}=await s.from('pending_orders').insert({code,phone,total_vnd:total,payload:{name,address,note,lines,shipping_fee_vnd:ship.fee}})
  if(error)return bad(res,'Không tạo được đơn, vui lòng thử lại',500)
  const {BANK_ID,BANK_ACCOUNT,BANK_ACCOUNT_NAME}=process.env
  const qr_url=`https://img.vietqr.io/image/${BANK_ID}-${BANK_ACCOUNT}-compact2.png?amount=${total}&addInfo=${encodeURIComponent('thanh toan don hang #'+code)}&accountName=${encodeURIComponent(BANK_ACCOUNT_NAME||'')}`
  res.json({code,total_vnd:total,items_total,shipping_fee_vnd:ship.fee,ship_note:ship.note,qr_url,token:sign(code,total,phone),auto:AUTO()})
}