import {body,limited} from './_lib.js'
import {calcShip} from './_ship.js'
// Báo phí ship cho khách xem trước khi đặt hàng (khi đặt thật, máy chủ tính lại ở /api/orders)
export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'})
  if(limited(req,40,600000,'ship'))return res.status(429).json({error:'Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút'})
  const b=body(req),part=v=>String(v||'').trim().slice(0,120)
  res.json(await calcShip({region:b.region==='danang'?'danang':'other',ward:part(b.ward),street:part(b.street)}))
}