import {db} from './_lib.js'
// trả mô tả chi tiết của 1 sản phẩm, chỉ tải khi khách bấm "Xem mô tả"
export default async function handler(req,res){
  const id=String((req.query&&req.query.id)||'')
  const {data}=await db().from('products').select('content_html').eq('id',id).eq('is_active',true).maybeSingle()
  res.setHeader('Cache-Control','s-maxage=60, stale-while-revalidate=86400')
  res.json({content_html:(data&&data.content_html)||''})
}