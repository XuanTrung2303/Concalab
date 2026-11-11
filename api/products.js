import {db} from './_lib.js'
const BASE='id,slug,name,category,description,price_vnd,size_mm,material,badge,image_url,images,in_stock,has_content,price_contact,sort_order,product_colors(name,hex,image_url,images,position)'
// bộ nhớ đệm CDN chỉ 5 giây (+15 giây chạy ngầm): sản phẩm mới, đánh sao, đổi danh mục hiện lên trang chủ sau vài giây
// sản phẩm đánh sao xếp đầu tiên, còn lại mới thêm xếp trước (mục "Tất cả" ở trang chủ sẽ tự xáo trộn phần không có sao)
const list=(feat,rate)=>{let q=db().from('products').select(BASE+(feat?',is_featured':'')+(rate?',rating_avg,rating_count':'')).eq('is_active',true);if(feat)q=q.order('is_featured',{ascending:false});return q.order('created_at',{ascending:false}).order('sort_order')}
export default async function handler(req,res){
  let r=await list(true,true)
  if(r.error)r=await list(true,false)      // chưa chạy file SQL 020 (đánh giá)
  if(r.error)r=await list(false,false)     // chưa chạy file SQL 019 (đánh dấu sao)
  if(r.error)return res.status(500).json({error:'Không tải được sản phẩm'})
  res.setHeader('Cache-Control','public, s-maxage=5, stale-while-revalidate=15')
  res.json(r.data.map(({product_colors,...p})=>({...p,colors:[...product_colors].sort((a,b)=>a.position-b.position)})))
}