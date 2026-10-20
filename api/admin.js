import {db,body,limited} from './_lib.js'
const PF=['slug','name','category','description','price_vnd','size_mm','material','badge','content_html','image_url','is_active','in_stock','sort_order']
const PRICE_ST=['paid','shipping','done']   // từ "Đã thanh toán" (khách đã chuyển khoản) trở đi thì phải có giá để tính doanh thu
const PRICE_EDIT=['accepted','paid','shipping','done']   // các trạng thái được phép sửa giá (đơn Khách đồng ý có giá cũ vẫn sửa được)
const money=v=>{const n=Number(v);return Number.isInteger(n)&&n>0&&n<=2e9?n:null}
const OS=['paid','shipping','done','cancelled'],QS=['new','quoted','accepted','paid','shipping','done','rejected']
const AC=new Map()   // cache phiên đăng nhập 60 giây
const rng=b=>{const p=Math.max(1,parseInt(b.page)||1);return [(p-1)*12,p*12-1]}   // 12 dòng mỗi trang
const clean=q=>String(q||'').replace(/[,()%*\\"'`:]/g,' ').replace(/\s+/g,' ').trim().slice(0,50)   // bỏ ký tự đặc biệt để người dùng không phá được bộ lọc
const E=(res,m,c=400)=>res.status(c).json({error:m})
const slug=t=>String(t).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
export default async function handler(req,res){
  if(req.method!=='POST')return E(res,'Method not allowed',405)
  const b=body(req),s=db(),a=b.action,kw=clean(b.q)
  if(a==='login'){
    if(limited(req,10))return E(res,'Thử lại sau ít phút',429)
    const {data,error}=await db(true).auth.signInWithPassword({email:String(b.email||''),password:String(b.password||'')})
    if(error||data.user?.app_metadata?.role!=='admin')return E(res,'Sai email hoặc mật khẩu',401)
    return res.json({token:data.session.access_token})
  }
  const tok=(req.headers.authorization||'').replace('Bearer ','')
  let hit=AC.get(tok)
  if(!hit||hit.exp<Date.now()){   // không gọi Supabase Auth ở mọi request
    const {data:{user:u}={}}=await s.auth.getUser(tok)
    if(!u||u.app_metadata?.role!=='admin')return E(res,'Phiên đăng nhập đã hết hạn',401)
    if(AC.size>50)AC.clear();hit={user:u,exp:Date.now()+60000};AC.set(tok,hit)
  }
  const user=hit.user
  try{
    let r
    switch(a){
      case 'products':{
        const [f,t]=rng(b)
        let qy=s.from('products').select('*,product_colors(name,hex,image_url,position)',{count:'exact'}).order('created_at',{ascending:false}).order('sort_order')
        if(kw)qy=qy.or(`name.ilike.*${kw}*,category.ilike.*${kw}*,slug.ilike.*${kw}*`)
        r=await qy.range(f,t)
        return res.json({rows:r.data||[],total:r.count||0})}
      case 'product.save':{
        const p=Object.fromEntries(PF.filter(k=>k in b.product).map(k=>[k,b.product[k]]))
        if(!String(p.name||'').trim()||!Number.isInteger(p.price_vnd)||p.price_vnd<0)return E(res,'Tên và giá (số nguyên ≥ 0) là bắt buộc')
        if(String(p.content_html||'').length>300000)return E(res,'Mô tả chi tiết quá dài')
        p.category=String(p.category||'').trim();if(!p.category)return E(res,'Vui lòng chọn danh mục')
        await s.from('categories').upsert({name:p.category},{onConflict:'name',ignoreDuplicates:true})   // đảm bảo danh mục có trong bảng
        p.slug=slug(p.slug||p.name)||'sp'
        if(!b.product.id)p.slug+='-'+Math.random().toString(36).slice(2,6)
        const q=b.product.id?s.from('products').update(p).eq('id',b.product.id):s.from('products').insert(p)
        const {data,error}=await q.select('id').single();if(error)return E(res,error.message)
        await s.from('product_colors').delete().eq('product_id',data.id)
        const cs=(b.product.colors||[]).filter(c=>c.name).map((c,i)=>({product_id:data.id,name:c.name,hex:c.hex,image_url:c.image_url||null,position:i}))
        if(cs.length)await s.from('product_colors').insert(cs)
        return res.json({id:data.id})}
      case 'product.delete':await s.from('products').delete().eq('id',b.id);return res.json({})
      case 'upload':{
        const m=/^data:image\/(jpeg|png|webp);base64,(.+)$/.exec(b.data||'');if(!m)return E(res,'Ảnh không hợp lệ')
        const buf=Buffer.from(m[2],'base64');if(buf.length>3e6)return E(res,'Ảnh quá lớn')
        const path=`${Date.now()}-${Math.random().toString(36).slice(2,8)}.${m[1]==='jpeg'?'jpg':m[1]}`
        const {error}=await s.storage.from('products').upload(path,buf,{contentType:'image/'+m[1]});if(error)return E(res,error.message)
        return res.json({url:s.storage.from('products').getPublicUrl(path).data.publicUrl})}
      case 'categories':{
        const [c,pr]=await Promise.all([s.from('categories').select('*').order('created_at',{ascending:false}).order('sort_order').order('name'),s.from('products').select('category')])
        const n={};(pr.data||[]).forEach(x=>{n[x.category]=(n[x.category]||0)+1})
        return res.json((c.data||[]).map(x=>({...x,count:n[x.name]||0})))}
      case 'category.save':{
        const name=String(b.name||'').trim().slice(0,50);if(!name)return E(res,'Vui lòng nhập tên danh mục')
        const dup=e=>e.code==='23505'?'Danh mục này đã tồn tại':e.message
        if(b.id){
          const {data:old}=await s.from('categories').select('name').eq('id',b.id).single();if(!old)return E(res,'Không tìm thấy danh mục')
          const {error}=await s.from('categories').update({name}).eq('id',b.id);if(error)return E(res,dup(error))
          if(old.name!==name)await s.from('products').update({category:name}).eq('category',old.name)   // đổi tên thì sản phẩm đi theo
        }else{
          const {data:mx}=await s.from('categories').select('sort_order').order('sort_order',{ascending:false}).limit(1)
          const {error}=await s.from('categories').insert({name,sort_order:((mx&&mx[0]&&mx[0].sort_order)||0)+1});if(error)return E(res,dup(error))
        }
        return res.json({})}
      case 'category.toggle':await s.from('categories').update({is_visible:!!b.is_visible}).eq('id',b.id);return res.json({})
      case 'category.delete':{
        const {data:c}=await s.from('categories').select('name').eq('id',b.id).single();if(!c)return E(res,'Không tìm thấy danh mục')
        const {count}=await s.from('products').select('id',{count:'exact',head:true}).eq('category',c.name)
        if(count>0)return E(res,`Danh mục đang có ${count} sản phẩm, hãy chuyển các sản phẩm sang danh mục khác trước khi xóa`)
        await s.from('categories').delete().eq('id',b.id);return res.json({})}
      case 'init':{   // gộp me + danh mục + trang sản phẩm đầu tiên vào 1 request
        const [f,t]=rng(b)
        const [pr,ct,pc]=await Promise.all([
          s.from('products').select('*,product_colors(name,hex,image_url,position)',{count:'exact'}).order('created_at',{ascending:false}).order('sort_order').range(f,t),
          s.from('categories').select('*').order('created_at',{ascending:false}).order('sort_order').order('name'),
          s.from('products').select('category')])
        const n={};(pc.data||[]).forEach(x=>{n[x.category]=(n[x.category]||0)+1})
        return res.json({
          me:{email:user.email,name:user.user_metadata?.full_name||'',avatar_url:user.user_metadata?.avatar_url||''},
          products:{rows:pr.data||[],total:pr.count||0},
          categories:(ct.data||[]).map(x=>({...x,count:n[x.name]||0}))})}
      case 'stats':{   // số liệu theo tháng, trang admin tự gộp thành quý và năm
        const {data,error}=await s.rpc('stats_monthly')
        if(error)return E(res,'Chưa chạy file 012_stats.sql trong Supabase SQL Editor')
        return res.json({months:data||[]})}
      case 'orders':{
        const [f,t]=rng(b)
        let qy=s.from('orders').select('*,order_items(*,products(image_url,product_colors(name,image_url)))',{count:'exact'}).order('created_at',{ascending:false})
        if(kw){   // tìm theo mã đơn, tên, SĐT, địa chỉ và tên sản phẩm trong đơn
          const ph=/^0\d{8,10}$/.test(kw)?`,phone.ilike.*84${kw.slice(1)}*`:''
          const {data:it}=await s.from('order_items').select('order_id').ilike('product_name','%'+kw+'%').limit(200)
          const ids=[...new Set((it||[]).map(x=>x.order_id))]
          qy=qy.or(`code.ilike.*${kw}*,customer_name.ilike.*${kw}*,phone.ilike.*${kw}*,address.ilike.*${kw}*${ph}${ids.length?`,id.in.(${ids.join(',')})`:''}`)
        }
        r=await qy.range(f,t)
        return res.json({total:r.count||0,rows:(r.data||[]).map(o=>({...o,order_items:o.order_items.map(({products:pr,...i})=>({...i,   // ảnh đúng màu khách chọn, không có thì dùng ảnh chính
          image_url:(pr&&pr.product_colors.find(c=>c.name===i.color_name)?.image_url)||(pr&&pr.image_url)||null}))}))})}
      case 'order.status':{
        if(!OS.includes(b.status))return E(res,'Trạng thái sai')
        const {data:cur}=await s.from('orders').select('status').eq('id',b.id).single()
        if(!cur)return E(res,'Không tìm thấy')
        if(['done','cancelled'].includes(cur.status))return E(res,'Đơn đã khóa, không thể đổi trạng thái')   // đã giao thành công / đã hủy
        await s.from('orders').update({status:b.status}).eq('id',b.id);return res.json({})}
      case 'quotes':{
        const [f,t]=rng(b)
        let qy=s.from('quote_requests').select('*',{count:'exact'}).order('created_at',{ascending:false})
        if(kw){
          const ph=/^0\d{8,10}$/.test(kw)?`,phone.ilike.*84${kw.slice(1)}*`:''
          qy=qy.or(`customer_name.ilike.*${kw}*,phone.ilike.*${kw}*,description.ilike.*${kw}*,material.ilike.*${kw}*${ph}`)
        }
        r=await qy.range(f,t)
        return res.json({rows:r.data||[],total:r.count||0})}
      case 'quote.status':{
        if(!QS.includes(b.status))return E(res,'Trạng thái sai')
        const price=b.price_vnd==null||b.price_vnd===''?null:money(b.price_vnd)
        if(b.price_vnd!=null&&b.price_vnd!==''&&!price)return E(res,'Giá đơn hàng phải là số nguyên lớn hơn 0')
        const {data:cur}=await s.from('quote_requests').select('status,price_vnd').eq('id',b.id).single()
        if(!cur)return E(res,'Không tìm thấy')
        if(['done','rejected'].includes(cur.status))return E(res,'Đơn đã khóa, không thể đổi trạng thái')   // đã giao thành công / từ chối
        if(PRICE_ST.includes(b.status)&&!(price||cur.price_vnd))return E(res,'Vui lòng nhập giá đơn hàng')
        await s.from('quote_requests').update({status:b.status,...(price?{price_vnd:price}:{})}).eq('id',b.id);return res.json({})}
      case 'quote.price':{   // sửa giá khi đơn chưa bị khóa
        const price=money(b.price_vnd);if(!price)return E(res,'Giá đơn hàng phải là số nguyên lớn hơn 0')
        const {data:cur}=await s.from('quote_requests').select('status').eq('id',b.id).single()
        if(!cur)return E(res,'Không tìm thấy')
        if(['done','rejected'].includes(cur.status))return E(res,'Đơn đã khóa, không sửa được giá')
        if(!PRICE_EDIT.includes(cur.status))return E(res,'Chỉ sửa giá khi khách đã đồng ý hoặc đã thanh toán')
        await s.from('quote_requests').update({price_vnd:price}).eq('id',b.id);return res.json({})}
      case 'quote.file':{
        const {data:qr}=await s.from('quote_requests').select('file_path').eq('id',b.id).single()
        if(!qr||!qr.file_path)return E(res,'Không có file')
        const {data,error}=await s.storage.from('models').createSignedUrl(qr.file_path,300,{download:true});if(error)return E(res,'File chưa được tải lên')
        return res.json({url:data.signedUrl})}
      case 'me.get':return res.json({email:user.email,name:user.user_metadata?.full_name||'',avatar_url:user.user_metadata?.avatar_url||''})
      case 'me.update':{   // tên + ảnh đại diện lưu trong user_metadata, email đổi trực tiếp (không cần xác nhận)
        const um={...user.user_metadata}
        if('name' in b)um.full_name=String(b.name||'').trim().slice(0,100)
        if('avatar_url' in b)um.avatar_url=b.avatar_url||null
        const u={user_metadata:um}
        if(b.email&&b.email!==user.email){u.email=String(b.email).trim();u.email_confirm=true}
        const {error}=await s.auth.admin.updateUserById(user.id,u);if(error)return E(res,error.message)
        AC.delete(tok);return res.json({})}
      case 'me.password':{
        if(String(b.password||'').length<8)return E(res,'Mật khẩu tối thiểu 8 ký tự')
        const {error}=await s.auth.admin.updateUserById(user.id,{password:b.password});if(error)return E(res,error.message)
        AC.delete(tok);return res.json({})}
      default:return E(res,'Hành động không hợp lệ')
    }
  }catch(e){return E(res,'Lỗi máy chủ',500)}
}