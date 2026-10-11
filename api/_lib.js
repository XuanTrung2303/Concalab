import {createClient} from '@supabase/supabase-js'
import {timingSafeEqual} from 'node:crypto'
const make=()=>createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}})
let shared
export const db=fresh=>fresh?make():(shared||=make())   // dùng lại kết nối giữa các request; đăng nhập luôn dùng client riêng
export const PHONE=/^(0|\+84)(3|5|7|8|9)\d{8}$/
const hits=new Map() // best-effort theo instance; production nên dùng Upstash Redis
export function limited(req,max=5,win=600000){
  const ip=String(req.headers['x-forwarded-for']||'').split(',')[0].trim()||'x',n=Date.now()
  const a=(hits.get(ip)||[]).filter(t=>n-t<win);a.push(n);hits.set(ip,a);return a.length>max
}
export function body(req){try{return typeof req.body==='string'?JSON.parse(req.body):req.body||{}}catch{return {}}}
export const safeEq=(a,b)=>{a=Buffer.from(String(a));b=Buffer.from(String(b));return a.length===b.length&&timingSafeEqual(a,b)}
export async function notify(text){
  const t=process.env.TELEGRAM_BOT_TOKEN,c=process.env.TELEGRAM_CHAT_ID;if(!t||!c)return
  try{await fetch(`https://api.telegram.org/bot${t}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:c,text})})}catch{}
}
// tạo đơn thật (trạng thái đã thanh toán) + báo Telegram. Gọi lại nhiều lần với cùng mã đơn vẫn chỉ tạo 1 đơn
export async function createPaidOrder(s,{code,name,phone,address,note,total,lines,status='paid'}){
  const {data:ex}=await s.from('orders').select('code,total_vnd').eq('code',code).maybeSingle()
  if(ex)return {ok:true,existed:true}
  const {data:o,error}=await s.from('orders').insert({code,customer_name:name,phone,address,note,total_vnd:total,status}).select('id').single()
  if(error)return {ok:false}
  const {error:e2}=await s.from('order_items').insert(lines.map(l=>({...l,order_id:o.id})))
  if(e2){await s.from('orders').delete().eq('id',o.id);return {ok:false}}
  await notify([
    status==='paid'?`🛒 Đơn mới ${code} (đã chuyển khoản)`:`🔔 Đơn mới ${code}: khách báo ĐÃ CHUYỂN KHOẢN. Hãy kiểm tra app ngân hàng rồi bấm "Xác nhận đã nhận tiền" trong admin`,
    `Tên KH: ${name}`,
    `SĐT/Zalo: ${phone}`,
    ...lines.flatMap(l=>[`Tên sản phẩm: ${l.product_name} (${l.color_name})`,`Số lượng: x${l.quantity}`]),
    `Địa chỉ nhận hàng: ${address}`,
    `Tổng đơn hàng: ${total.toLocaleString('vi-VN')}đ`
  ].join('\n'))
  return {ok:true}
}

const vnd=n=>Number(n).toLocaleString('vi-VN')+'đ'
// xử lý 1 khoản tiền vào: tìm mã đơn trong nội dung, so số tiền, tạo đơn thật. Dùng chung cho SePay và webhook tự nhận biết từ SMS/email
export async function settleByText(s,{text,amount}){
  const m=/CCL[\s\-_.]*(\d{6})[\s\-_.]*(\d{3,8})/.exec(String(text||'').toUpperCase())   // ngân hàng có thể bỏ dấu # và -
  if(!m)return {status:'nomatch'}                                  // không phải đơn của website
  const cands=[3,4,5].filter(n=>m[2].length>=n).map(n=>`CCL-${m[1]}-${m[2].slice(0,n)}`)
  const {data:rows}=await s.from('pending_orders').select('*').in('code',cands)
  const pe=(rows||[]).find(r=>r.status!=='paid')
  if(!pe){
    if(!(rows&&rows.length))await notify(`💰 Có tiền về với mã ${cands[0]} nhưng không có đơn chờ khớp (đơn hết hạn hoặc sai mã): ${vnd(amount)}`)
    return {status:'nopending'}                                      // đã xử lý rồi (gửi trùng) hoặc không có đơn
  }
  if(!(amount>0)){
    await notify(`⚠️ Có tin báo cho đơn ${pe.code} nhưng không đọc được số tiền, hãy kiểm tra thủ công. Cần: ${vnd(pe.total_vnd)}`)
    return {status:'noamount'}
  }
  if(amount<pe.total_vnd){                                           // chuyển thiếu: không tạo đơn, báo cho shop
    await s.from('pending_orders').update({status:'underpaid'}).eq('code',pe.code)
    await notify(`⚠️ Đơn ${pe.code} chuyển thiếu tiền: nhận ${vnd(amount)} / cần ${vnd(pe.total_vnd)}\n${pe.payload.name} · ${pe.phone}`)
    return {status:'underpaid'}
  }
  const r=await createPaidOrder(s,{code:pe.code,...pe.payload,phone:pe.phone,total:pe.total_vnd})
  if(!r.ok)return {status:'error'}
  await s.from('pending_orders').update({status:'paid',paid_at:new Date().toISOString()}).eq('code',pe.code)
  return {status:'paid'}
}