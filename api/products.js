import {db} from './_lib.js'
export default async function handler(req,res){
  const {data,error}=await db().from('products')
    .select('id,slug,name,category,description,price_vnd,size_mm,material,badge,image_url,in_stock,has_content,product_colors(name,hex,image_url,position)')
    .eq('is_active',true).order('sort_order')
  if(error)return res.status(500).json({error:'Không tải được sản phẩm'})
  res.setHeader('Cache-Control','s-maxage=60, stale-while-revalidate=86400')
  res.json(data.map(({product_colors,...p})=>({...p,colors:[...product_colors].sort((a,b)=>a.position-b.position)})))
}