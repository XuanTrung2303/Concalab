import {db,body,limited,notify,PHONE} from './_lib.js'
const MATS=['PLA','PETG','ABS / ASA','TPU','Chưa biết, cần tư vấn']
const EXT=['stl','obj','3mf','jpg','jpeg','png'],MAX=50*1024*1024
export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'})
  const b=body(req)
  if(b.hp)return res.json({ok:true})
  if(limited(req))return res.status(429).json({error:'Bạn gửi quá nhanh, vui lòng thử lại sau'})
  const phone=String(b.phone||'').replace(/[\s.\-]/g,''),name=String(b.name||'').trim().slice(0,100),desc=String(b.description||'').trim().slice(0,2000),q=Number(b.quantity)
  if(!name||!desc||!PHONE.test(phone)||!Number.isInteger(q)||q<1||q>100000||!MATS.includes(b.material))return res.status(400).json({error:'Thông tin chưa hợp lệ'})
  let path=null
  if(b.file_name){
    const ext=String(b.file_name).split('.').pop().toLowerCase()
    if(!EXT.includes(ext))return res.status(400).json({error:'Chỉ nhận file .stl, .obj, .3mf, .jpg, .png'})
    if(!(b.file_size>0)||b.file_size>MAX)return res.status(400).json({error:'File tối đa 50 MB'})
    path=`quotes/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`
  }
  const s=db()
  const {data:row,error}=await s.from('quote_requests').insert({customer_name:name,phone,has_file:!!path,file_path:path,material:b.material,quantity:q,description:desc}).select('id').single()
  if(error)return res.status(500).json({error:'Không gửi được yêu cầu'})
  let upload=null
  if(path){
    const {data,error:e2}=await s.storage.from('models').createSignedUploadUrl(path)   // bucket riêng tư, khách chỉ ghi được đúng 1 file này
    if(e2){await s.from('quote_requests').delete().eq('id',row.id);return res.status(500).json({error:'Không tạo được liên kết tải file'})}
    upload={url:data.signedUrl}
  }
  await notify([
    '📐 Bạn có đơn hàng theo yêu cầu mới',
    `Tên KH: ${name}`,
    `SĐT/Zalo: ${phone}`,
    `Vật liệu: ${b.material}`,
    `Số lượng: x${q}`,
    path?'📎 Có file đính kèm':null,   // không có file thì không hiện dòng này
    `Mô tả: ${desc}`
  ].filter(Boolean).join('\n'))
  res.json({ok:true,upload})
}