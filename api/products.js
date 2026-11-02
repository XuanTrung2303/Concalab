import {db} from './_lib.js'
const COLS='id,slug,name,category,description,price_vnd,size_mm,material,badge,image_url,images,in_stock,has_content,price_contact,sort_order,product_colors(name,hex,image_url,images,position)'
// sản phẩm đánh sao xếp đầu tiên, còn lại mới thêm xếp trước (mục "Tất cả" ở trang chủ sẽ tự xáo trộn phần không có sao)
const list=featured=>{let q=db().from('products').select(featured?COLS+',is_featured':COLS).eq('is_active',true);if(featured)q=q.order('is_featured',{ascending:false});return q.order('created_at',{ascending:false}).order('sort_order')}
export default async function handler(req,res){
  let {data,error}=await list(true)
  if(error)({data,error}=await list(false))   // chưa chạy file SQL 019 thì trang chủ vẫn hiển thị như cũ
  if(error)return res.status(500).json({error:'Không tải được sản phẩm'})
  res.setHeader('Cache-Control','s-maxage=60, stale-while-revalidate=86400')
  res.json(data.map(({product_colors,...p})=>({...p,colors:[...product_colors].sort((a,b)=>a.position-b.position)})))
}