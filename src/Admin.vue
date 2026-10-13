<template>
<div v-if="!tok" class="lw"><form class="lc" @submit.prevent="login">
 <span class="lg fl" role="img" aria-label="Logo Con Cá Lab"><i class="n"></i><i class="c"></i></span>
 <h2>Đăng nhập admin</h2>
 <label>Email<input v-model="em" type="email" required autocomplete="username"></label>
 <label>Mật khẩu<input v-model="pw" type="password" required autocomplete="current-password"></label>
 <button class="btn c" :disabled="busy">Đăng nhập</button><p class="res">{{msg}}</p></form></div>

<div v-else class="adm">
 <aside><div class="ab"><span class="lg mk" role="img" aria-label="Logo Con Cá Lab"><i class="n"></i><i class="c"></i></span><span>Con Cá <b>Lab</b> · Admin</span></div>
  <button v-for="t in tabs" :key="t[0]" :class="{on:tab==t[0]}" @click="go(t[0])">{{t[1]}}</button>
  </aside>
 <div class="col">
 <header class="atop">
  <a class="btn s o" href="/" target="_blank" rel="noopener">🌐 Xem website</a>
  <button class="btn s o" @click="theme" aria-label="Đổi giao diện sáng tối" title="Sáng / tối">🌓</button>
  <div class="um">
   <button class="ub" @click="menu=!menu"><img v-if="prof.avatar_url" :src="prof.avatar_url" class="av" alt=""><span v-else class="av">{{ini}}</span><span class="un"><b>{{dname}}</b><small>{{prof.email}}</small></span></button>
   <template v-if="menu"><div class="ov" @click="menu=false"></div>
    <div class="dmenu">
     <div class="dh"><img v-if="prof.avatar_url" :src="prof.avatar_url" class="av" alt=""><span v-else class="av">{{ini}}</span><div class="un"><b>{{dname}}</b><small>{{prof.email}}</small></div></div>
     <button @click="openMe">👤 Thông tin tài khoản</button>
     <button @click="menu=false;logout()">↪ Đăng xuất</button>
    </div></template>
  </div>
 </header>
 <main>
  <section v-if="tab=='products'">
   <div class="sh"><div class="sl"><button class="btn s" @click="edit()">+ Thêm sản phẩm</button></div><h2>Sản phẩm</h2><div class="sbar"><span class="si">🔍</span><input type="search" v-model="search.products" placeholder="Tìm sản phẩm theo tên hoặc danh mục…" @input="onSearch('products')"><button v-if="search.products" type="button" class="sx" @click="search.products='';onSearch('products',0)" aria-label="Xóa tìm kiếm">✕</button></div></div>
   <div class="grid">
    <div class="card pcard" v-for="p in products" :key="p.id">
     <img v-if="p.image_url" :src="p.image_url" class="pimg2" alt="" loading="lazy" decoding="async"><div v-else class="pimg2 ph">3D</div>
     <div class="gr"><b>{{p.name}}</b><small>{{p.category}} · {{vnd(p.price_vnd)}} · {{p.is_active?'Đang bán':'Đã ẩn'}}{{p.in_stock===false?' · Hết hàng':''}}</small></div>
     <div class="acts"><button class="btn s b-edit" @click="edit(p)">Sửa</button><button class="btn s b-del" @click="del=p;dd.showModal()">Xóa</button></div>
    </div>
   </div>
   <nav class="pager" v-if="pages('products')>1"><button :disabled="pg.products<=1" @click="goPg('products',pg.products-1)" aria-label="Trang trước">‹</button><button v-for="n in pages('products')" :key="n" :class="{on:n==pg.products}" @click="goPg('products',n)">{{n}}</button><button :disabled="pg.products>=pages('products')" @click="goPg('products',pg.products+1)" aria-label="Trang sau">›</button></nav>
   <p class="empty" v-if="loading&&!products.length">Đang tải…</p>
   <p class="empty" v-if="!loading&&!products.length">{{search.products?'Không tìm thấy kết quả phù hợp.':'Chưa có sản phẩm.'}}</p>
  </section>

  <section v-else-if="tab=='categories'">
   <div class="sh"><div class="sl"><button class="btn s" @click="editCat()">+ Thêm danh mục</button></div><h2>Danh mục sản phẩm</h2><div class="sbar"><span class="si">🔍</span><input type="search" v-model="search.categories" placeholder="Tìm danh mục…"><button v-if="search.categories" type="button" class="sx" @click="search.categories=''" aria-label="Xóa tìm kiếm">✕</button></div></div>
   <div class="grid">
    <div class="card ccard" :class="{hid:!c.is_visible}" v-for="c in catsShown" :key="c.id">
     <div class="gr"><b>{{c.name}}</b><small>{{c.count}} sản phẩm · {{c.is_visible?'Đang hiện':'Đang ẩn'}}</small></div>
     <div class="acts">
      <button class="btn s eye" :class="{off:!c.is_visible}" @click="toggleCat(c)" :title="c.is_visible?'Bấm để ẩn danh mục':'Bấm để hiện danh mục'" :aria-label="c.is_visible?'Ẩn danh mục':'Hiện danh mục'">
       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path v-if="c.is_visible" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle v-if="c.is_visible" cx="12" cy="12" r="3"/><path v-if="!c.is_visible" d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-7-11-7a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><path v-if="!c.is_visible" d="M1 1l22 22"/></svg>
      </button>
      <button class="btn s b-edit" @click="editCat(c)">Sửa</button><button class="btn s b-del" @click="cdel=c;cdd.showModal()">Xóa</button>
     </div>
    </div>
   </div>
   <p class="empty" v-if="!catsShown.length">{{search.categories?'Không tìm thấy danh mục phù hợp.':'Chưa có danh mục.'}}</p>
  </section>

  <section v-else-if="tab=='orders'">
   <div class="sh"><div class="sl"></div><h2>Đơn hàng sản phẩm có sẵn</h2><div class="sbar"><span class="si">🔍</span><input type="search" v-model="search.orders" placeholder="Tìm theo mã đơn, tên khách, SĐT, địa chỉ, sản phẩm…" @input="onSearch('orders')"><button v-if="search.orders" type="button" class="sx" @click="search.orders='';onSearch('orders',0)" aria-label="Xóa tìm kiếm">✕</button></div></div>
   <div class="grid">
   <div class="card" v-for="o in orders" :key="o.id">
    <div class="hd"><b>{{o.code}}</b><select class="st" :style="{'--sc':SC[o.status]}" :value="o.status" :disabled="isLocked('order',o)" @change="setS('order.status',o,$event.target.value,$event)"><option v-for="(l,k) in ordFor(o)" :key="k" :value="k" :style="{color:SC[k]}">{{l}}</option></select></div>
    <small v-if="isLocked('order',o)">🔒 Đơn đã khóa, không thể đổi trạng thái</small>
    <button v-if="o.status=='new'" type="button" class="btn s b-edit" @click="setS('order.status',o,'paid',{target:{value:''}})">✅ Xác nhận đã nhận tiền</button>
    <small class="cl2">{{dt(o.created_at)}} · {{o.customer_name}} · {{o.phone}}</small><small class="cl2">{{o.address}}<template v-if="o.note"> · Ghi chú: {{o.note}}</template></small>
    <div class="oi" v-for="i in o.order_items.slice(0,1)" :key="i.id">
     <div>{{i.product_name}} ({{i.color_name}}) × {{i.quantity}} — {{vnd(i.unit_price_vnd*i.quantity)}}</div>
     <img v-if="i.image_url" :src="i.image_url" class="oimg" alt="" loading="lazy" decoding="async"><div v-else class="oimg ph">3D</div>
    </div>
    <button type="button" class="btn s o more" @click="openO(o)">{{o.order_items.length>1?'Xem tất cả '+o.order_items.length+' sản phẩm':'Xem chi tiết đơn'}}</button>
    <b class="tot">Tổng: {{vnd(o.total_vnd)}}</b>
   </div>
   </div>
   <nav class="pager" v-if="pages('orders')>1"><button :disabled="pg.orders<=1" @click="goPg('orders',pg.orders-1)" aria-label="Trang trước">‹</button><button v-for="n in pages('orders')" :key="n" :class="{on:n==pg.orders}" @click="goPg('orders',n)">{{n}}</button><button :disabled="pg.orders>=pages('orders')" @click="goPg('orders',pg.orders+1)" aria-label="Trang sau">›</button></nav>
   <p class="empty" v-if="loading&&!orders.length">Đang tải…</p>
   <p class="empty" v-if="!loading&&!orders.length">{{search.orders?'Không tìm thấy kết quả phù hợp.':'Chưa có đơn hàng.'}}</p>
  </section>

  <section v-else-if="tab=='quotes'">
   <div class="sh"><div class="sl"></div><h2>Đơn theo yêu cầu</h2><div class="sbar"><span class="si">🔍</span><input type="search" v-model="search.quotes" placeholder="Tìm theo tên khách, SĐT, vật liệu, mô tả…" @input="onSearch('quotes')"><button v-if="search.quotes" type="button" class="sx" @click="search.quotes='';onSearch('quotes',0)" aria-label="Xóa tìm kiếm">✕</button></div></div>
   <p class="sub">Các yêu cầu báo giá khách gửi từ trang chủ.</p>
   <div class="grid st">
   <div class="card" v-for="q in quotes" :key="q.id">
    <div class="hd"><b>{{q.customer_name}} · {{q.phone}}</b><select class="st" :style="{'--sc':SC[q.status]}" :value="q.status" :disabled="isLocked('quote',q)" @change="setS('quote.status',q,$event.target.value,$event)"><option v-for="(l,k) in QS" :key="k" :value="k" :style="{color:SC[k]}">{{l}}</option></select></div>
    <small v-if="isLocked('quote',q)">🔒 Đơn đã khóa, không thể đổi trạng thái</small>
    <small>{{dt(q.created_at)}} · {{q.material}} × {{q.quantity}} · {{q.has_file?'Có file':'Chưa có file'}}</small><span>{{q.description}}</span>
    <div v-if="q.file_path"><button class="btn s o" @click="dlFile(q)">📎 Tải file đính kèm</button></div>
   </div>
   </div>
   <nav class="pager" v-if="pages('quotes')>1"><button :disabled="pg.quotes<=1" @click="goPg('quotes',pg.quotes-1)" aria-label="Trang trước">‹</button><button v-for="n in pages('quotes')" :key="n" :class="{on:n==pg.quotes}" @click="goPg('quotes',n)">{{n}}</button><button :disabled="pg.quotes>=pages('quotes')" @click="goPg('quotes',pg.quotes+1)" aria-label="Trang sau">›</button></nav>
   <p class="empty" v-if="loading&&!quotes.length">Đang tải…</p>
   <p class="empty" v-if="!loading&&!quotes.length">{{search.quotes?'Không tìm thấy kết quả phù hợp.':'Chưa có yêu cầu.'}}</p>
  </section>

  <section v-else class="prof">
   <div class="card">
    <div class="phead">
     <img v-if="prof.avatar_url" :src="prof.avatar_url" class="pav" alt=""><div v-else class="pav">{{ini}}</div>
     <div><h2>{{dname}}</h2><small>✉️ {{prof.email}}</small></div>
    </div>
    <div class="ptabs"><button :class="{on:mtab=='info'}" @click="setM('info')">Thông tin</button><button :class="{on:mtab=='edit'}" @click="setM('edit')">Thay đổi thông tin</button><button :class="{on:mtab=='pwd'}" @click="setM('pwd')">Đổi mật khẩu</button></div>
   </div>
   <div class="card" v-if="mtab=='info'">
    <b>Thông tin tài khoản</b>
    <div class="kv"><span>Tên tài khoản</span><b>{{dname}}</b></div>
    <div class="kv"><span>Email</span><b>{{prof.email}}</b></div>
   </div>
   <form class="card" v-else-if="mtab=='edit'" @submit.prevent="saveProfile">
    <b>Thay đổi thông tin</b>
    <small style="color:var(--mut)">Chỉ cần điền mục bạn muốn thay đổi, các mục để trống sẽ được giữ nguyên.</small>
    <label>Ảnh đại diện mới<div class="logo"><img v-if="pe.avatar_url" :src="pe.avatar_url" class="pav" alt=""><input :key="fk" type="file" accept="image/*" @change="pick($event,u=>pe.avatar_url=u,400)"><button v-if="pe.avatar_url" type="button" class="btn s o" @click="pe.avatar_url='';fk++">Hủy ảnh vừa chọn</button></div></label>
    <label>Tên mới<input v-model="pe.name" :placeholder="prof.name||'Quản trị viên'"></label>
    <label>Email mới<input v-model="pe.email" type="email" :placeholder="prof.email"></label>
    <button class="btn c" :disabled="busy">Lưu thay đổi</button>
   </form>
   <form class="card" v-else @submit.prevent="savePwd">
    <b>Đổi mật khẩu</b>
    <label>Mật khẩu mới (tối thiểu 8 ký tự)<input v-model="np.p" type="password" minlength="8" required autocomplete="new-password"></label>
    <label>Xác nhận mật khẩu<input v-model="np.c" type="password" minlength="8" required autocomplete="new-password"></label>
    <button class="btn c" :disabled="busy">Đổi mật khẩu</button>
   </form>
  </section>
 </main></div>

 <dialog ref="pf" @click.self="pf.close()"><button class="x" @click="pf.close()" aria-label="Đóng">✕</button>
  <form class="pform" v-if="f" @submit.prevent="saveP">
   <h3>{{f.id?'Sửa sản phẩm':'Thêm sản phẩm'}}</h3>
   <label>Ảnh chính (ảnh của màu mặc định, tỉ lệ 4:3)<div class="logo"><img v-if="f.image_url" :src="f.image_url" class="th big" alt=""><input type="file" accept="image/*" @change="pick($event,u=>f.image_url=u,900)"></div></label>
   <label>Tên<input v-model="f.name" required></label>
   <div class="f2"><label>Danh mục<select v-model="f.category" required><option value="" disabled>Chọn danh mục…</option><option v-for="c in catOpts" :key="c.id" :value="c.name">{{c.name}}{{c.is_visible?'':' (đang ẩn)'}}</option></select></label><label>Giá (VNĐ)<input v-model.number="f.price_vnd" type="number" min="0" step="1000" required></label></div>
   <label>Mô tả ngắn (hiện trên thẻ sản phẩm)<textarea v-model="f.description" rows="2"></textarea></label>
   <div class="lbl">Mô tả chi tiết (chèn ảnh, đổi cỡ chữ, kiểu chữ, màu chữ… khách bấm "Xem mô tả sản phẩm" mới thấy)</div>
   <div class="qwrap"><div ref="qEl"></div></div>
   <div class="f2"><label>Kích thước (mm), ví dụ 110 × 110<input v-model="f.size_mm"></label><label>Vật liệu<input v-model="f.material"></label></div>
   <div class="f2"><label>Nhãn (Bán chạy, Còn hàng…)<input v-model="f.badge"></label><label>Thứ tự hiển thị<input v-model.number="f.sort_order" type="number"></label></div>
   <div class="lbl">Màu mặc định (dùng ảnh chính ở trên)</div>
   <div class="crow"><input v-model="f.colors[0].name" placeholder="Tên màu mặc định" required><input type="color" v-model="f.colors[0].hex"></div>
   <div class="lbl">Màu sắc phụ (ảnh không bắt buộc, không có ảnh thì dùng ảnh chính)</div>
   <template v-for="(c,i) in f.colors" :key="i"><div class="crow2" v-if="i>0">
    <input v-model="c.name" placeholder="Tên màu" required><input type="color" v-model="c.hex">
    <img v-if="c.image_url" :src="c.image_url" class="th" alt="">
    <label class="btn s o up">{{c.image_url?'Đổi ảnh':'Chọn ảnh'}}<input type="file" accept="image/*" style="display:none" @change="pick($event,u=>c.image_url=u,900)"></label>
    <button v-if="c.image_url" type="button" class="btn s o" @click="c.image_url=''">Bỏ ảnh</button>
    <button type="button" class="btn s o" @click="f.colors.splice(i,1)" aria-label="Xóa màu">✕</button>
   </div></template>
   <button type="button" class="btn s o" @click="f.colors.push({name:'',hex:'#00bcd4',image_url:''})">+ Thêm màu phụ</button>
   <label class="chk"><input type="checkbox" v-model="f.in_stock"> Còn hàng (bỏ chọn khi đã hết hàng)</label>
   <label class="chk"><input type="checkbox" v-model="f.is_active"> Đang bán (hiển thị ở trang chủ)</label>
   <button class="btn c" :disabled="busy">Lưu sản phẩm</button>
  </form></dialog>

 <dialog ref="dd" style="width:min(420px,calc(100% - 24px))" @click.self="dd.close()"><div class="cd">
  <h3>Xóa sản phẩm?</h3><p>Bạn sắp xóa “{{del&&del.name}}”. Hành động này không thể hoàn tác.</p>
  <div class="mact"><button class="btn o" @click="dd.close()">Hủy</button><button class="btn" style="background:#d93b3b;color:#fff" @click="doDel">Xác nhận xóa</button></div></div></dialog>
 <dialog ref="cf" style="width:min(420px,calc(100% - 24px))" @click.self="cf.close()"><button class="x" @click="cf.close()" aria-label="Đóng">✕</button>
  <form class="pform" @submit.prevent="saveCat"><h3>{{cid?'Sửa danh mục':'Thêm danh mục'}}</h3>
   <label>Tên danh mục<input v-model="cn" maxlength="50" required></label>
   <button class="btn c" :disabled="busy">Lưu danh mục</button></form></dialog>
 <dialog ref="cdd" style="width:min(420px,calc(100% - 24px))" @click.self="cdd.close()"><div class="cd">
  <h3>Xóa danh mục?</h3><p>Bạn sắp xóa danh mục “{{cdel&&cdel.name}}”. Chỉ xóa được khi danh mục không còn sản phẩm nào.</p>
  <div class="mact"><button class="btn o" @click="cdd.close()">Hủy</button><button class="btn" style="background:#d93b3b;color:#fff" @click="doDelCat">Xác nhận xóa</button></div></div></dialog>
 <dialog ref="vd" style="width:min(560px,calc(100% - 24px))" @click.self="vd.close()"><button class="x" @click="vd.close()" aria-label="Đóng">✕</button>
  <div class="cd" v-if="vo">
   <h3>Đơn {{vo.code}}</h3>
   <small style="color:var(--mut)">{{dt(vo.created_at)}} · <b :style="{color:SC[vo.status]}">{{ORD[vo.status]}}</b></small>
   <div class="kv"><span>Khách hàng</span><b>{{vo.customer_name}}</b></div>
   <div class="kv"><span>SĐT / Zalo</span><b>{{vo.phone}}</b></div>
   <div class="kv"><span>Địa chỉ</span><b>{{vo.address}}</b></div>
   <div class="kv" v-if="vo.note"><span>Ghi chú</span><b>{{vo.note}}</b></div>
   <div class="oi" v-for="i in vo.order_items" :key="i.id">
    <div>{{i.product_name}} ({{i.color_name}}) × {{i.quantity}} — {{vnd(i.unit_price_vnd*i.quantity)}}</div>
    <img v-if="i.image_url" :src="i.image_url" class="oimg" alt="" loading="lazy" decoding="async"><div v-else class="oimg ph">3D</div>
   </div>
   <div class="kv"><span>Phí vận chuyển</span><b>{{vo.shipping_fee_vnd?vnd(vo.shipping_fee_vnd):'Miễn phí'}}</b></div>
   <div class="kv"><span>Tổng cộng</span><b>{{vnd(vo.total_vnd)}}</b></div>
  </div>
 </dialog>
 <div id="toast" :class="{on:tOn}" role="status">{{tMsg}}</div>
</div>
</template>

<script setup>
import {ref,reactive,computed,nextTick} from 'vue'
const ORD={new:'Chờ xác nhận thanh toán',paid:'Đã thanh toán',shipping:'Đang giao hàng',done:'Giao hàng thành công',cancelled:'Đã hủy'}
const QS={new:'Mới',quoted:'Đã báo giá',accepted:'Khách đồng ý',paid:'Đã thanh toán',shipping:'Đang giao hàng',done:'Giao hàng thành công',rejected:'Từ chối'}
const PER=12,pg=reactive({products:1,orders:1,quotes:1})   // mỗi trang tối đa 12 thẻ (4 hàng × 3 cột)
const total=reactive({products:0,orders:0,quotes:0}),loading=ref(false),cache=new Map()   // chỉ tải 12 dòng mỗi trang; nhớ trang đã xem để chuyển tab là hiện ngay
const pages=k=>Math.max(1,Math.ceil(total[k]/PER))
// màu từng trạng thái: xanh dương = đã thanh toán, cam = đang giao, xanh lá = thành công, đỏ = hủy/từ chối
const SC={new:'#eab308',paid:'#3b82f6',quoted:'#a855f7',accepted:'#14b8a6',shipping:'#f59e0b',done:'#22c55e',cancelled:'#ef4444',rejected:'#ef4444'}
const prof=reactive({email:'',name:'',avatar_url:''}),pe=reactive({name:'',email:'',avatar_url:''}),np=reactive({p:'',c:''}),mtab=ref('info'),menu=ref(false),fk=ref(0)
const dname=computed(()=>prof.name||'Quản trị viên'),ini=computed(()=>dname.value.trim().charAt(0).toUpperCase())
const loadMe=()=>api('me.get').then(j=>Object.assign(prof,j)).catch(()=>{})
const clearEdit=()=>{pe.name=pe.email=pe.avatar_url='';fk.value++}
const setM=t=>{mtab.value=t;if(t=='edit')clearEdit()}
const openMe=()=>{menu.value=false;setM('info');go('me')}
const saveProfile=()=>{   // chỉ gửi những mục có điền; làm mới thông tin và xóa sạch form sau khi lưu
  const d={};if(pe.name.trim())d.name=pe.name.trim();if(pe.email.trim())d.email=pe.email.trim();if(pe.avatar_url)d.avatar_url=pe.avatar_url
  if(!Object.keys(d).length){toast('Bạn chưa nhập thông tin nào để thay đổi');return}
  return run(async()=>{await api('me.update',d);await loadMe();clearEdit();toast('Đã cập nhật thông tin')})
}
const savePwd=()=>{if(np.p!==np.c){toast('Mật khẩu xác nhận không khớp');return}return run(async()=>{await api('me.password',{password:np.p});np.p=np.c='';toast('Đã đổi mật khẩu')})}
const cats=ref([]),cn=ref(''),cid=ref(null),cdel=ref(null),cf=ref(null),cdd=ref(null)
const loadCats=async()=>{try{cats.value=await api('categories')}catch{}}
const catOpts=computed(()=>cats.value.filter(c=>c.is_visible||(f.value&&c.name===f.value.category)))   // danh mục ẩn không hiện trong ô chọn (trừ danh mục sản phẩm đang dùng)
const editCat=c=>{cid.value=c?c.id:null;cn.value=c?c.name:'';cf.value.showModal()}
const saveCat=()=>run(async()=>{await api('category.save',{id:cid.value,name:cn.value});cf.value.close();cache.clear();toast('Đã lưu danh mục');await loadCats()})
const toggleCat=c=>run(async()=>{await api('category.toggle',{id:c.id,is_visible:!c.is_visible});c.is_visible=!c.is_visible;toast(c.is_visible?'Đã hiện danh mục':'Đã ẩn danh mục')})
const doDelCat=()=>run(async()=>{await api('category.delete',{id:cdel.value.id});cdd.value.close();toast('Đã xóa danh mục');await loadCats()})
const vo=ref(null),vd=ref(null)
const openO=o=>{vo.value=o;vd.value.showModal()}   // popup chi tiết đơn
async function init(){   // khởi động bằng 1 request, rồi tải sẵn đơn hàng ở nền để bấm tab là có ngay
  tab.value='products';loading.value=true
  try{const j=await api('init',{page:pg.products});Object.assign(prof,j.me);cats.value=j.categories;cache.set(ck('products',pg.products,''),j.products);products.value=j.products.rows;total.products=j.products.total}
  catch(e){toast(e.message)}
  loading.value=false
  setTimeout(()=>['orders','quotes'].forEach(prefetch),600)
}
async function prefetch(t){if(cache.has(ck(t,1,'')))return;try{cache.set(ck(t,1,''),await api(t,{page:1,q:''}))}catch{}}
const {new:_n,...ORDX}=ORD   // trạng thái đang chờ xác nhận chỉ hiện cho đơn đang ở trạng thái đó
const ordFor=o=>o.status=='new'?ORD:ORDX
// ---- trình soạn thảo mô tả chi tiết (Quill, chỉ tải khi mở form sản phẩm để trang admin vẫn nhanh) ----
const qEl=ref(null);let q=null,qReady=null
const FONTS=['Outfit','Arial','Georgia','Times New Roman','Courier New','Verdana']
const SIZES=['12px','14px','16px','18px','20px','24px','28px','32px','40px']
function loadQuill(){
  return qReady||(qReady=(async()=>{
    const [{default:Quill}]=await Promise.all([import('quill'),import('quill/dist/quill.snow.css')])
    const Size=Quill.import('attributors/style/size'),Font=Quill.import('attributors/style/font'),Align=Quill.import('attributors/style/align')
    Size.whitelist=SIZES;Font.whitelist=FONTS   // lưu thẳng thành style="font-size:..." nên trang chủ hiển thị đúng, không cần CSS riêng
    Quill.register({'formats/size':Size,'formats/font':Font,'formats/align':Align},true)
    const st=document.createElement('style')
    st.textContent=FONTS.map(f=>`.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="${f}"]::before,.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="${f}"]::before{content:"${f}";font-family:"${f}"}`).join('')
     +SIZES.map(s=>`.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="${s}"]::before,.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="${s}"]::before{content:"${s.replace('px','')}"}`).join('')
     +'.ql-snow .ql-picker.ql-font .ql-picker-label:not([data-value])::before,.ql-snow .ql-picker.ql-font .ql-picker-item:not([data-value])::before{content:"Kiểu chữ"}.ql-snow .ql-picker.ql-size .ql-picker-label:not([data-value])::before,.ql-snow .ql-picker.ql-size .ql-picker-item:not([data-value])::before{content:"Cỡ chữ"}'
    document.head.appendChild(st)
    return Quill
  })())
}
async function uploadImg(file,max){
  const img=await createImageBitmap(file),k=Math.min(1,max/Math.max(img.width,img.height))
  const c=document.createElement('canvas');c.width=img.width*k;c.height=img.height*k;c.getContext('2d').drawImage(img,0,0,c.width,c.height)
  return (await api('upload',{data:c.toDataURL(file.type=='image/png'?'image/png':'image/jpeg',.82)})).url
}
function insertImage(){
  const inp=document.createElement('input');inp.type='file';inp.accept='image/*'
  inp.onchange=()=>{const file=inp.files[0];if(!file)return;run(async()=>{const url=await uploadImg(file,900);const r=q.getSelection(true);q.insertEmbed(r.index,'image',url,'user');q.setSelection(r.index+1,0);toast('Đã chèn ảnh')})}
  inp.click()
}
async function mountEditor(html){
  const Quill=await loadQuill();await nextTick()
  const el=qEl.value;if(!el)return
  if(!q||q.container!==el){
    el.innerHTML=''
    q=new Quill(el,{theme:'snow',placeholder:'Nhập mô tả chi tiết sản phẩm…',modules:{toolbar:{container:[[{font:FONTS},{size:SIZES}],['bold','italic','underline','strike'],[{color:[]},{background:[]}],[{align:[]}],[{list:'ordered'},{list:'bullet'}],['link','image'],['clean']],handlers:{image:insertImage}}}})
  }
  q.setContents(q.clipboard.convert({html:html||''}),'silent')
}
function syncContent(){   // lấy nội dung từ trình soạn thảo trước khi lưu (rỗng thì lưu chuỗi rỗng)
  if(q&&qEl.value&&q.container===qEl.value)f.value.content_html=(q.getText().trim()||q.root.querySelector('img'))?q.getSemanticHTML():''
}
const tabs=[['products','Sản phẩm'],['categories','Danh mục'],['orders','Đơn hàng'],['quotes','Đơn theo yêu cầu']]
const vnd=n=>Number(n).toLocaleString('vi-VN')+'đ',dt=d=>new Date(d).toLocaleString('vi-VN')
const tok=ref(localStorage.getItem('cc-at')||''),em=ref(''),pw=ref(''),msg=ref(''),busy=ref(false),tab=ref('products')
const products=ref([]),orders=ref([]),quotes=ref([])
const f=ref(null),del=ref(null),pf=ref(null),dd=ref(null),tMsg=ref(''),tOn=ref(false);let tt
function toast(m){tMsg.value=m;tOn.value=true;clearTimeout(tt);tt=setTimeout(()=>tOn.value=false,2000)}
function logout(){tok.value='';cache.clear();localStorage.removeItem('cc-at')}
async function api(action,data={}){
  const r=await fetch('/api/admin',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+tok.value},body:JSON.stringify({action,...data})})
  const j=await r.json().catch(()=>({}))
  if(r.status===401&&action!=='login'){logout()}
  if(!r.ok)throw new Error(j.error||'Có lỗi xảy ra');return j
}
async function run(fn){busy.value=true;try{await fn()}catch(e){toast(e.message)}busy.value=false}
async function login(){busy.value=true;msg.value=''
  try{const j=await api('login',{email:em.value,password:pw.value});tok.value=j.token;localStorage.setItem('cc-at',j.token);init()}catch(e){msg.value=e.message}
  busy.value=false}
const L={products,orders,quotes}
const search=reactive({products:'',orders:'',quotes:'',categories:''})
const ck=(t,page,q)=>t+':'+page+':'+q   // khóa cache gồm cả từ khóa tìm kiếm
async function load(t,page){
  const qq=(search[t]||'').trim()
  const c=cache.get(ck(t,page,qq))
  if(c){L[t].value=c.rows;total[t]=c.total}   // hiện ngay dữ liệu đã xem, rồi làm mới ngầm
  loading.value=!c
  try{
    const j=await api(t,{page,q:qq})
    if(qq!==(search[t]||'').trim())return                 // đã gõ từ khóa mới hơn: bỏ kết quả cũ
    if(!j.rows.length&&page>1){loading.value=false;pg[t]=page-1;return load(t,page-1)}
    cache.set(ck(t,page,qq),j);L[t].value=j.rows;total[t]=j.total
  }catch(e){toast(e.message)}
  loading.value=false
}
const timers={}
function onSearch(t,delay=350){clearTimeout(timers[t]);timers[t]=setTimeout(()=>{pg[t]=1;load(t,1)},delay)}   // đợi bạn ngừng gõ rồi mới tìm
const nm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase()
const catsShown=computed(()=>{const k=nm(search.categories.trim());return k?cats.value.filter(c=>nm(c.name).includes(k)):cats.value})
function goPg(k,n){n=Math.max(1,Math.min(n,pages(k)));if(n===pg[k])return;pg[k]=n;load(k,n);window.scrollTo({top:0,behavior:'smooth'})}
async function go(t){tab.value=t;if(!tok.value)return;if(L[t])load(t,pg[t]);if(t=='categories')loadCats()}
function edit(p){f.value=p?{...p,colors:[...p.product_colors].sort((a,b)=>a.position-b.position).map(c=>({name:c.name,hex:c.hex,image_url:c.image_url||''}))}:{name:'',category:'',description:'',price_vnd:0,size_mm:'',material:'PLA',badge:'',image_url:'',is_active:true,in_stock:true,sort_order:total.products+1,colors:[{name:'Xanh cyan',hex:'#00bcd4',image_url:''}]};if(!f.value.colors.length)f.value.colors.push({name:'',hex:'#00bcd4',image_url:''});pf.value.showModal();mountEditor(f.value.content_html)}
const saveP=()=>run(async()=>{syncContent();await api('product.save',{product:f.value});pf.value.close();toast('Đã lưu sản phẩm');cache.clear();go('products')})
const doDel=()=>run(async()=>{await api('product.delete',{id:del.value.id});dd.value.close();toast('Đã xóa');cache.clear();go('products')})
const LOCK={order:['done','cancelled'],quote:['done','rejected']}   // trạng thái cuối: khóa đơn
const isLocked=(k,o)=>LOCK[k].includes(o.status)
async function setS(a,o,status,ev){
  const ord=a=='order.status'
  if(LOCK[ord?'order':'quote'].includes(status)&&!confirm(`Chuyển sang "${(ord?ORD:QS)[status]}"? Sau đó đơn sẽ bị khóa và không thể đổi trạng thái nữa.`)){ev.target.value=o.status;return}
  busy.value=true
  try{await api(a,{id:o.id,status});o.status=status;toast('Đã cập nhật trạng thái')}catch(e){ev.target.value=o.status;toast(e.message)}
  busy.value=false
}
const dlFile=q=>run(async()=>{const j=await api('quote.file',{id:q.id});location.href=j.url})
function pick(e,set,max){ // thu nhỏ ảnh ở trình duyệt rồi tải lên bucket products
  const file=e.target.files[0];if(!file)return
  run(async()=>{
    const img=await createImageBitmap(file),k=Math.min(1,max/Math.max(img.width,img.height))
    const c=document.createElement('canvas');c.width=img.width*k;c.height=img.height*k;c.getContext('2d').drawImage(img,0,0,c.width,c.height)
    set((await api('upload',{data:c.toDataURL(file.type=='image/png'?'image/png':'image/jpeg',.82)})).url);toast('Đã tải ảnh lên')})
}
function theme(){const r=document.documentElement,a=r.getAttribute('data-theme'),d=a?a=='dark':matchMedia('(prefers-color-scheme:dark)').matches,n=d?'light':'dark';r.setAttribute('data-theme',n);try{localStorage.setItem('cc-theme',n)}catch{}}
if(tok.value){init()}
</script>

<style>
body{padding:0!important}
.lw{min-height:100dvh;display:grid;place-items:center;padding:16px}
.lc{width:min(380px,100%);background:var(--stage);border-radius:28px;padding:28px;box-shadow:var(--shadow)}
.lc h2,.adm h2{margin:0}
.adm{display:grid;grid-template-columns:230px 1fr;min-height:100dvh}
.adm aside{background:var(--stage);border-right:1px solid var(--bd);padding:18px 12px;display:flex;flex-direction:column;gap:4px;position:sticky;top:0;height:100dvh}
.ab{display:flex;align-items:center;gap:10px;font-weight:800;font-size:18px;padding:6px 12px 14px}.ab .lg.mk{height:40px}
.lc .lg.fl{width:150px;margin:0 auto 6px}.lc h2{text-align:center}.ab b{color:var(--lc)}
.adm aside button{font:500 15px Outfit,system-ui,sans-serif;text-align:left;border:0;background:none;color:var(--ink);padding:10px 14px;border-radius:14px;cursor:pointer}
.adm aside button:hover,.adm aside button.on{background:var(--row)}.adm aside button.on{font-weight:700;color:var(--cyd)}
.sp{flex:1}
.adm main{padding:28px 16px;display:block;min-width:0}
.adm main>section{width:100%;max-width:1100px;margin:0 auto;display:flex;flex-direction:column;gap:16px}
.sh{display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center}
.sh h2{margin:0}.adm .sub{text-align:center;margin:0}
.hd{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.row,.card{background:var(--stage);border:1px solid var(--bd);border-radius:20px;padding:16px 18px;display:flex;gap:12px;align-items:center}
.card{flex-direction:column;align-items:stretch;gap:8px}.card ul{margin:4px 0;padding-left:18px}
.card small,.row small{color:var(--mut)}.card form,form.card{gap:12px}
.gr{flex:1;display:grid}
.th{width:64px;height:48px;border-radius:12px;object-fit:cover;background:var(--row)}.th.big{width:160px;height:120px}
.ph{display:grid;place-items:center;color:var(--mut);font-weight:700}
.logo{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.logo img:not(.th){height:48px}
.pform{padding:28px}.crow{display:flex;gap:8px}.crow input[type=color]{width:56px;padding:2px}
.chk{display:flex;gap:8px;align-items:center;color:var(--ink)}.chk input{width:auto}
.hd select{width:auto;min-width:200px}
.empty{text-align:center}
select{font:500 14px Outfit,system-ui,sans-serif;padding:8px 10px;border-radius:12px;border:1px solid var(--bd);background:var(--stage);color:var(--ink)}
@media(max-width:760px){.adm{grid-template-columns:1fr}.adm aside{position:static;height:auto;flex-direction:row;flex-wrap:wrap;border-right:0;border-bottom:1px solid var(--bd)}.ab{width:100%}.sp{display:none}.adm main{padding:16px}.row{flex-wrap:wrap}}
.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.grid .card{min-width:0;overflow-wrap:anywhere}
.grid .card .hd{flex-direction:column;align-items:stretch;gap:8px}
.grid .card select{width:100%;min-width:0}
.tot{margin-top:auto}
.pcard .gr{flex:1}.pimg2{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:14px;background:var(--row)}
.pimg2.ph{display:grid;place-items:center;font-size:22px}
.acts{display:flex;gap:8px}.acts .btn{flex:1}
.pager{display:flex;justify-content:center;flex-wrap:wrap;gap:8px;margin-top:6px}
.pager button{min-width:40px;height:40px;padding:0 12px;border-radius:999px;border:1px solid var(--bd);background:var(--stage);color:var(--ink);font:600 15px Outfit,system-ui,sans-serif;cursor:pointer}
.pager button.on{background:var(--lc);border-color:var(--lc);color:#fff}
.pager button:disabled{opacity:.4;cursor:default}
@media(max-width:1000px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:620px){.grid{grid-template-columns:1fr}}
.crow2{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.crow2 input:not([type=color]){flex:1;min-width:140px}.crow2 input[type=color]{width:56px;padding:2px}.crow2 .th{width:48px;height:36px}
.up{display:inline-flex;align-items:center;cursor:pointer}
select:disabled{opacity:.6;cursor:not-allowed}
.acts .btn.b-edit{background:#2f7de1;border-color:#2f7de1;color:#fff}
.acts .btn.b-del{background:#d93b3b;border-color:#d93b3b;color:#fff}
.acts .btn.b-edit:hover,.acts .btn.b-del:hover{filter:brightness(1.12)}
select.st{background:color-mix(in srgb,var(--sc) 20%,var(--stage));border-color:var(--sc);color:var(--sc);font-weight:700}
select.st option{background:var(--stage);font-weight:600}
.oi{display:grid;gap:6px;padding:8px 0;border-top:1px dashed var(--bd)}
.oi:first-of-type{border-top:0}
.oimg{width:72px;height:54px;border-radius:10px;object-fit:cover;background:var(--row)}
.oimg.ph{display:grid;place-items:center;font-size:12px}
.col{min-width:0;display:flex;flex-direction:column}
.atop{position:sticky;top:0;z-index:20;display:flex;justify-content:flex-end;align-items:center;gap:10px;padding:10px 20px;background:var(--stage);border-bottom:1px solid var(--bd)}
.atop .btn{white-space:nowrap}
.um{position:relative}
.ub{display:flex;align-items:center;gap:10px;background:none;border:0;cursor:pointer;color:var(--ink);font:inherit;text-align:left;padding:0}
.av{width:38px;height:38px;border-radius:12px;object-fit:cover;background:var(--lc);color:#fff;display:grid;place-items:center;font-weight:800;flex:none}
.un{display:grid;line-height:1.25;min-width:0}.un small,.phead small{color:var(--mut);font-size:12px}
.ov{position:fixed;inset:0;z-index:30}
.dmenu{position:absolute;right:0;top:calc(100% + 10px);z-index:40;width:280px;background:var(--stage);border:1px solid var(--bd);border-radius:18px;padding:10px;box-shadow:var(--shadow);display:grid;gap:4px}
.dh{display:flex;gap:12px;align-items:center;padding:8px;border-bottom:1px solid var(--bd);margin-bottom:4px}
.dmenu>button{font:500 15px Outfit,system-ui,sans-serif;text-align:left;border:0;background:none;color:var(--ink);padding:11px 12px;border-radius:12px;cursor:pointer}
.dmenu>button:hover{background:var(--row)}
.adm main>section.prof{max-width:760px}
.phead{display:flex;gap:18px;align-items:center;flex-wrap:wrap}
.pav{width:96px;height:96px;border-radius:24px;object-fit:cover;background:var(--lc);color:#fff;display:grid;place-items:center;font-size:40px;font-weight:800}
.ptabs{display:flex;gap:6px;border-top:1px solid var(--bd);margin-top:8px;padding-top:10px;flex-wrap:wrap}
.ptabs button{font:600 15px Outfit,system-ui,sans-serif;border:0;background:none;color:var(--mut);padding:8px 14px;border-radius:999px;cursor:pointer}
.ptabs button.on{background:var(--row);color:var(--cyd)}
.kv{display:flex;justify-content:space-between;gap:12px;padding:12px 0;border-top:1px dashed var(--bd)}.kv span{color:var(--mut)}
@media(max-width:760px){.un{display:none}.atop{padding:10px 12px}.dmenu{width:min(280px,calc(100vw - 24px))}}
.pform select{width:100%;height:46px;padding:0 14px;font-size:15px;font-weight:600;border-radius:16px}
.acts .btn.eye{flex:0 0 46px;padding:0;display:grid;place-items:center;background:var(--row);border-color:var(--bd);color:#22c55e}
.acts .btn.eye.off{color:var(--mut)}
.ccard.hid .gr{opacity:.55}
.grid.st{align-items:start}
.card .more{align-self:flex-start;margin-top:auto}
.card .more+.tot{margin-top:0}
.cl2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.kv b{text-align:right;overflow-wrap:anywhere}
.qwrap .ql-toolbar.ql-snow{background:var(--row);border:1px solid var(--bd);border-radius:14px 14px 0 0}
.qwrap .ql-container.ql-snow{border:1px solid var(--bd);border-top:0;border-radius:0 0 14px 14px;font:inherit;color:var(--ink)}
.qwrap .ql-editor{min-height:200px;max-height:380px;overflow:auto;font-size:15px;line-height:1.6}
.qwrap .ql-editor.ql-blank::before{color:var(--mut);font-style:normal}
.qwrap .ql-editor img{max-width:100%;height:auto}
.qwrap .ql-snow .ql-stroke{stroke:var(--ink)}.qwrap .ql-snow .ql-fill{fill:var(--ink)}
.qwrap .ql-snow .ql-picker{color:var(--ink)}
.qwrap .ql-snow .ql-picker-options{background:var(--stage);border-color:var(--bd);max-height:240px;overflow:auto}
.qwrap .ql-snow.ql-toolbar button:hover .ql-stroke,.qwrap .ql-snow.ql-toolbar button.ql-active .ql-stroke,.qwrap .ql-snow .ql-picker-label:hover .ql-stroke{stroke:var(--lc)}
.qwrap .ql-snow.ql-toolbar button.ql-active .ql-fill,.qwrap .ql-snow.ql-toolbar button:hover .ql-fill{fill:var(--lc)}
.qwrap .ql-snow .ql-tooltip{background:var(--stage);color:var(--ink);border-color:var(--bd);z-index:5}
.qwrap .ql-snow .ql-tooltip input[type=text]{color:var(--ink);background:var(--row);border:1px solid var(--bd)}
.sbar{position:relative;width:min(100%,440px);margin:0 auto}
.sbar input{width:100%;padding-left:42px;padding-right:40px}
.sbar .si{position:absolute;left:15px;top:50%;transform:translateY(-50%);font-size:15px;pointer-events:none}
.sbar .sx{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:28px;height:28px;border-radius:50%;border:0;background:var(--row);color:var(--ink);cursor:pointer;font-size:12px}
.sh{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:12px}
.sh h2{white-space:nowrap}
.sh .sl{justify-self:start}
.sh .sbar{justify-self:end;width:min(100%,360px);margin:0}
@media(max-width:860px){.sh{grid-template-columns:1fr;justify-items:center}.sh .sl{justify-self:center}.sh .sl:empty{display:none}.sh .sbar{justify-self:center;width:min(100%,440px)}.sh h2{white-space:normal}}
</style>