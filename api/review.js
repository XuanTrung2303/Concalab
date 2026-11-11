import {db,body,limited} from './_lib.js'
// GET  /api/review?product_id=...&page=1  : danh sách đánh giá của một sản phẩm (công khai)
// POST /api/review {action:'upload'}      : xin liên kết tải 1 ảnh đánh giá lên kho ảnh
// POST /api/review {action:'submit',...}  : gửi đánh giá mới
const PER=10
const fail=(res,m,c=400)=>res.status(c).json({error:m})
const clean=(v,max,keepLines)=>String(v==null?'':v).replace(keepLines?/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g:/[\u0000-\u001f\u007f]/g,keepLines?'':' ').replace(/[ \t]+/g,' ').trim().slice(0,max)
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export default async function handler(req,res){
  const s=db()
  if(req.method==='GET'){
    const pid=String((req.query&&req.query.product_id)||''),page=Math.max(1,parseInt(req.query&&req.query.page)||1)
    if(!UUID.test(pid))return fail(res,'Sản phẩm không hợp lệ')
    const [lr,pr]=await Promise.all([
      s.from('reviews').select('id,customer_name,content,rating,images,created_at',{count:'exact'}).eq('product_id',pid).order('created_at',{ascending:false}).range((page-1)*PER,page*PER-1),
      s.from('products').select('rating_avg,rating_count').eq('id',pid).maybeSingle()])
    if(lr.error)return fail(res,'Chưa tải được đánh giá',500)
    res.setHeader('Cache-Control','public, s-maxage=5, stale-while-revalidate=15')
    const p=pr.data||{}
    return res.json({rows:lr.data||[],total:lr.count||0,avg:Number(p.rating_avg)||0,count:p.rating_count!=null?p.rating_count:(lr.count||0)})
  }
  if(req.method!=='POST')return fail(res,'Method not allowed',405)
  const b=body(req)
  if(b.hp)return res.json({ok:true})                                  // ô ẩn dành cho bot
  if(b.action==='upload'){
    if(limited(req,15,600000,'rvup'))return fail(res,'Bạn tải ảnh quá nhanh, vui lòng thử lại sau ít phút',429)
    const path='r/'+Date.now()+'-'+Math.random().toString(36).slice(2,10)+'.jpg'
    const {data,error}=await s.storage.from('reviews').createSignedUploadUrl(path)
    if(error)return fail(res,'Không tạo được liên kết tải ảnh',500)
    return res.json({url:data.signedUrl,publicUrl:s.storage.from('reviews').getPublicUrl(path).data.publicUrl})
  }
  if(b.action==='submit'){
    if(limited(req,4,600000,'rvsub'))return fail(res,'Bạn gửi đánh giá quá nhanh, vui lòng thử lại sau ít phút',429)
    const name=clean(b.name,60,false),content=clean(b.content,1500,true),rating=Number(b.rating)
    if(!UUID.test(String(b.product_id||'')))return fail(res,'Sản phẩm không hợp lệ')
    if(!name)return fail(res,'Vui lòng nhập tên của bạn')
    if(content.length<3)return fail(res,'Vui lòng nhập nội dung đánh giá')
    if(!(rating>=1&&rating<=5&&rating*2===Math.floor(rating*2)))return fail(res,'Vui lòng chọn số sao từ 1 đến 5')
    const base=String(process.env.SUPABASE_URL||'').replace(/\/$/,'')+'/storage/v1/object/public/reviews/'
    const im=Array.isArray(b.images)?b.images:[]
    if(im.length>5||im.some(u=>typeof u!=='string'||u.length>400||!u.startsWith(base)))return fail(res,'Tối đa 5 ảnh hợp lệ')   // chỉ nhận ảnh đã tải lên kho ảnh của shop
    const {data:p}=await s.from('products').select('id').eq('id',b.product_id).eq('is_active',true).maybeSingle()
    if(!p)return fail(res,'Sản phẩm không tồn tại')
    const {error}=await s.from('reviews').insert({product_id:b.product_id,customer_name:name,content,rating,images:im})
    if(error)return fail(res,'Không gửi được đánh giá, vui lòng thử lại',500)
    const {data:q}=await s.from('products').select('rating_avg,rating_count').eq('id',b.product_id).maybeSingle()
    return res.json({ok:true,avg:q?Number(q.rating_avg)||0:null,count:q?q.rating_count:null})
  }
  return fail(res,'Yêu cầu không hợp lệ')
}