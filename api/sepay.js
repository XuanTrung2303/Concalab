import {db,body,safeEq,settleByText} from './_lib.js'
// Webhook nhận biến động số dư từ SePay (https://docs.sepay.vn). Header: Authorization: Apikey <SEPAY_API_KEY>
export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({success:false})
  const key=process.env.SEPAY_API_KEY
  if(!key||!safeEq(req.headers.authorization||'','Apikey '+key))return res.status(401).json({success:false})
  const b=body(req)
  if(b.transferType!=='in')return res.status(200).json({success:true})   // chỉ xét giao dịch tiền vào
  const r=await settleByText(db(),{text:`${b.code||''} ${b.content||''} ${b.description||''}`,amount:Number(b.transferAmount)||0})
  if(r.status==='error')return res.status(500).json({success:false})     // lỗi tạm thời: SePay sẽ gọi lại
  res.status(200).json({success:true})
}