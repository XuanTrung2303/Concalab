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
  <section v-if="tab=='overview'">
   <div class="sh"><div class="sl"></div><h2>Tổng quan</h2><span></span></div>
   <p class="empty" v-if="statsLoading&&!ov">Đang tải số liệu…</p>
   <div class="kpis">
    <div class="kpi" v-for="k in kpis" :key="k.t" :style="{'--kc':k.c}"><span class="kt">{{k.t}}</span><b class="kn">{{k.n}}</b><span class="ks">{{k.s}}</span></div>
   </div>
   <div class="card statbox">
    <div class="sthead"><div><b>Thống kê đơn hàng và doanh thu</b><small>Đơn hàng, đang giao và đã giao gồm cả đơn có sẵn và đơn theo yêu cầu (đã được khách đồng ý). Doanh thu gồm tiền hàng của đơn có sẵn đã nhận tiền (không gồm phí ship), giá đơn theo yêu cầu đã thanh toán và số tiền đã nhận của đơn Social (không gồm phí ship; đơn Social xếp theo ngày tư vấn). Đơn xếp theo ngày tạo.</small></div>
     <div class="seg" role="tablist"><button v-for="p in [['month','Tháng'],['quarter','Quý'],['year','Năm']]" :key="p[0]" :class="{on:period==p[0]}" @click="period=p[0]">{{p[1]}}</button></div></div>
    <div class="charts">
     <div class="chbox" v-for="c in charts" :key="c.title">
      <b>{{c.title}} <small>{{period=='month'?'12 tháng gần nhất':period=='quarter'?'8 quý gần nhất':'5 năm gần nhất'}}</small></b>
      <svg class="lchart" :viewBox="VB" role="img" :aria-label="'Biểu đồ '+c.title">
       <g v-for="t in c.g.ticks" :key="t.y"><line :x1="CH.L" :x2="CH.W-CH.R" :y1="t.y" :y2="t.y" class="gl"/><text :x="CH.L-8" :y="t.y+4" text-anchor="end" class="ax">{{t.text}}</text></g>
       <path :d="c.g.area" :fill="c.color" opacity=".14"/>
       <path :d="c.g.line" fill="none" :stroke="c.color" stroke-width="2.8" stroke-linejoin="round" stroke-linecap="round"/>
       <g v-for="(p,i) in c.g.pts" :key="i"><circle :cx="p.x" :cy="p.y" r="4.5" :fill="c.color" class="pt"><title>{{p.label}}: {{c.full(p.v)}}</title></circle><text :x="p.x" :y="CH.H-10" text-anchor="middle" class="ax">{{p.label}}</text></g>
      </svg>
     </div>
    </div>
    <div class="tscroll"><table class="stab">
     <thead><tr><th>{{period=='month'?'Tháng':period=='quarter'?'Quý':'Năm'}}</th><th>Đơn hàng</th><th>Đang giao</th><th>Đã giao</th><th>Doanh thu</th></tr></thead>
     <tbody>
      <template v-for="(r,i) in rowsDesc" :key="r.label">
       <tr class="tot" :class="{cur:i==0,has:r.orders>0||r.revenue>0}"><td>{{r.label}}</td><td>{{r.orders}}</td><td>{{r.shipping}}</td><td>{{r.done}}</td><td>{{vnd(r.revenue)}}</td></tr>
       <template v-if="r.orders>0||r.revenue>0">
        <tr class="sub" v-for="g in groupsOf(r)" :key="r.label+g.k"><td><i class="dot" :style="{background:g.c}"></i>{{g.name}}</td><td>{{g.orders}}</td><td>{{g.shipping}}</td><td>{{g.done}}</td><td>{{vnd(g.revenue)}}</td></tr>
       </template>
      </template>
     </tbody>
    </table></div>
   </div>
  </section>

  <section v-else-if="tab=='products'">
   <div class="sh"><div class="sl"><button class="btn s" @click="edit()">+ Thêm sản phẩm</button></div><h2>Sản phẩm</h2><div class="sbar"><span class="si">🔍</span><input type="search" v-model="search.products" placeholder="Tìm sản phẩm theo tên hoặc danh mục…" @input="onSearch('products')"><button v-if="search.products" type="button" class="sx" @click="search.products='';onSearch('products',0)" aria-label="Xóa tìm kiếm"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div></div>
   <div class="grid">
    <div class="card pcard" v-for="p in products" :key="p.id">
     <img v-if="p.image_url" :src="p.image_url" class="pimg2" alt="" loading="lazy" decoding="async"><div v-else class="pimg2 ph">3D</div>
     <div class="gr"><b>{{p.name}}</b><small>{{p.category}} · {{p.price_contact?'Giá liên hệ':vnd(p.price_vnd)}} · {{p.is_active?'Đang bán':'Đã ẩn'}}{{p.in_stock===false?' · Hết hàng':''}}</small></div>
     <div class="acts"><button class="btn s b-edit" @click="edit(p)">Sửa</button><button class="btn s b-del" @click="del=p;dd.showModal()">Xóa</button></div>
    </div>
   </div>
   <nav class="pager" v-if="pages('products')>1"><button :disabled="pg.products<=1" @click="goPg('products',pg.products-1)" aria-label="Trang trước">‹</button><button v-for="n in pages('products')" :key="n" :class="{on:n==pg.products}" @click="goPg('products',n)">{{n}}</button><button :disabled="pg.products>=pages('products')" @click="goPg('products',pg.products+1)" aria-label="Trang sau">›</button></nav>
   <p class="empty" v-if="loading&&!products.length">Đang tải…</p>
   <p class="empty" v-if="!loading&&!products.length">{{search.products?'Không tìm thấy kết quả phù hợp.':'Chưa có sản phẩm.'}}</p>
  </section>

  <section v-else-if="tab=='categories'">
   <div class="sh"><div class="sl"><button class="btn s" @click="editCat()">+ Thêm danh mục</button></div><h2>Danh mục sản phẩm</h2><div class="sbar"><span class="si">🔍</span><input type="search" v-model="search.categories" placeholder="Tìm danh mục…"><button v-if="search.categories" type="button" class="sx" @click="search.categories=''" aria-label="Xóa tìm kiếm"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div></div>
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
   <div class="sh"><div class="sl"></div><h2>Đơn hàng sản phẩm có sẵn</h2><div class="sbar"><span class="si">🔍</span><input type="search" v-model="search.orders" placeholder="Tìm theo mã đơn, tên khách, SĐT, địa chỉ, sản phẩm…" @input="onSearch('orders')"><button v-if="search.orders" type="button" class="sx" @click="search.orders='';onSearch('orders',0)" aria-label="Xóa tìm kiếm"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div></div>
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
   <div class="sh"><div class="sl"></div><h2>Đơn theo yêu cầu</h2><div class="sbar"><span class="si">🔍</span><input type="search" v-model="search.quotes" placeholder="Tìm theo tên khách, SĐT, vật liệu, mô tả…" @input="onSearch('quotes')"><button v-if="search.quotes" type="button" class="sx" @click="search.quotes='';onSearch('quotes',0)" aria-label="Xóa tìm kiếm"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div></div>
   <p class="sub">Các yêu cầu báo giá khách gửi từ trang chủ.</p>
   <div class="grid st">
   <div class="card" v-for="q in quotes" :key="q.id">
    <div class="hd"><b>{{q.customer_name}} · {{q.phone}}</b><select class="st" :style="{'--sc':SC[q.status]}" :value="q.status" :disabled="isLocked('quote',q)" @change="setS('quote.status',q,$event.target.value,$event)"><option v-for="(l,k) in QS" :key="k" :value="k" :style="{color:SC[k]}">{{l}}</option></select></div>
    <small v-if="isLocked('quote',q)">🔒 Đơn đã khóa, không thể đổi trạng thái</small>
    <small>{{dt(q.created_at)}} · {{q.material}} × {{q.quantity}} · {{q.has_file?'Có file':'Chưa có file'}}</small><div class="pricerow" v-if="q.price_vnd"><b>Giá đơn hàng: {{vnd(q.price_vnd)}}</b><button v-if="PRICE_ST.includes(q.status)&&!isLocked('quote',q)" type="button" class="btn s o" @click="askPrice(q,null)">Sửa giá</button></div><span>{{q.description}}</span>
    <div v-if="q.file_path"><button class="btn s o" @click="dlFile(q)">📎 Tải file đính kèm</button></div>
   </div>
   </div>
   <nav class="pager" v-if="pages('quotes')>1"><button :disabled="pg.quotes<=1" @click="goPg('quotes',pg.quotes-1)" aria-label="Trang trước">‹</button><button v-for="n in pages('quotes')" :key="n" :class="{on:n==pg.quotes}" @click="goPg('quotes',n)">{{n}}</button><button :disabled="pg.quotes>=pages('quotes')" @click="goPg('quotes',pg.quotes+1)" aria-label="Trang sau">›</button></nav>
   <p class="empty" v-if="loading&&!quotes.length">Đang tải…</p>
   <p class="empty" v-if="!loading&&!quotes.length">{{search.quotes?'Không tìm thấy kết quả phù hợp.':'Chưa có yêu cầu.'}}</p>
  </section>

  <section v-else-if="tab=='social'">
   <div class="sh"><div class="sl"><button class="btn s" @click="sNew()">+ Thêm đơn Social</button></div><h2>Đơn hàng Social</h2><div class="sbar"><span class="si">🔍</span><input type="search" v-model="search.social" placeholder="Tìm theo tên, SĐT, nhân viên, địa chỉ…" @input="onSearch('social')"><button v-if="search.social" type="button" class="sx" @click="search.social='';onSearch('social',0)" aria-label="Xóa tìm kiếm"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div></div>
   <p class="sub">Đơn bạn tự nhập từ các kênh tư vấn. Phí ship tính riêng, không vào doanh thu.</p>
   <div class="grid">
    <div class="card" v-for="s in social" :key="s.id">
     <div class="hd"><b>{{s.customer_name}} · {{s.phone}}</b>
      <select class="st" :style="{'--sc':SSC[s.status]}" :value="s.status" :disabled="isSLocked(s)" @change="sSetStatus(s,$event.target.value,$event)"><option v-for="o in sOptions(s)" :key="o" :value="o" :style="{color:SSC[o]}">{{SLAB[o]}}</option></select></div>
     <small v-if="isSLocked(s)">🔒 Đơn đã khóa, không thể đổi trạng thái</small>
     <div class="chline"><span class="chnl">{{SCH[s.channel]}}</span><small>{{s.staff||'Chưa ghi nhân viên'}} · Tư vấn {{dmy(s.consult_date)}}</small></div>
     <small class="cl2" v-if="s.address">📍 {{s.address}}</small>
     <div class="cthumbs" v-if="s.images&&s.images.length"><a v-for="u in s.images.slice(0,4)" :key="u" :href="u" target="_blank" rel="noopener"><img :src="u" alt="" loading="lazy" decoding="async"></a><span v-if="s.images.length>4">+{{s.images.length-4}}</span></div>
     <div class="mbox">
      <div class="mrow"><span>Cọc phí thiết kế</span><b>{{vnd(s.design_deposit_vnd)}}</b></div>
      <template v-if="stageIdx(s)>=1"><div class="mrow"><span>Phí thiết kế còn lại</span><b>{{vnd(s.design_remaining_vnd)}}</b></div><div class="mrow"><span>Phí cọc đơn hàng</span><b>{{vnd(s.order_deposit_vnd)}}</b></div></template>
      <div class="mrow" v-if="stageIdx(s)>=2"><span>Số tiền còn lại</span><b>{{vnd(s.remaining_vnd)}}</b></div>
      <div class="mrow big"><span>Tổng giá trị đơn hàng</span><b>{{vnd(sTotal(s))}}</b></div>
      <div class="mrow" v-if="stageIdx(s)>=1"><span>Phí ship (tính riêng)</span><b>{{vnd(s.ship_fee_vnd)}}</b></div>
      <small class="rv">Tính vào doanh thu: <b>{{vnd(sRevenue(s))}}</b></small>
     </div>
     <div class="acts" v-if="!isSLocked(s)"><button class="btn s b-edit" @click="sEdit(s)">Sửa thông tin</button><button v-if="canAmounts(s)" class="btn s o" @click="sAsk(s,'amounts')">Sửa số tiền</button></div>
    </div>
   </div>
   <nav class="pager" v-if="pages('social')>1"><button :disabled="pg.social<=1" @click="goPg('social',pg.social-1)" aria-label="Trang trước">‹</button><button v-for="n in pages('social')" :key="n" :class="{on:n==pg.social}" @click="goPg('social',n)">{{n}}</button><button :disabled="pg.social>=pages('social')" @click="goPg('social',pg.social+1)" aria-label="Trang sau">›</button></nav>
   <p class="empty" v-if="loading&&!social.length">Đang tải…</p>
   <p class="empty" v-if="!loading&&!social.length">{{search.social?'Không tìm thấy kết quả phù hợp.':'Chưa có đơn Social nào. Bấm “+ Thêm đơn Social” để nhập.'}}</p>
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

 <dialog ref="pf" @click.self="pf.close()"><button class="x" @click="pf.close()" aria-label="Đóng"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
  <form class="pform" v-if="f" @submit.prevent="saveP">
   <h3>{{f.id?'Sửa sản phẩm':'Thêm sản phẩm'}}</h3>
   <div class="lbl">Ảnh sản phẩm (ảnh đầu tiên là ảnh bìa, tối đa 10 ảnh, bấm vào ảnh để đặt làm ảnh bìa)</div>
   <div class="gal" v-if="f.images.length"><div class="gthumb" v-for="(u,i) in f.images" :key="u"><img :src="u" alt="" @click="makeCover(f.images,i)" :title="i?'Bấm để đặt làm ảnh bìa':'Ảnh bìa'"><span v-if="i==0" class="cvr">Ảnh bìa</span><button type="button" @click="f.images.splice(i,1)" aria-label="Xóa ảnh">×</button></div></div>
   <label class="btn s o up">+ Thêm ảnh<input type="file" accept="image/*" multiple style="display:none" @change="addImgs(f.images,$event)"></label>
   <label>Tên<input v-model="f.name" required></label>
   <div class="f2"><label>Danh mục<select v-model="f.category" required><option value="" disabled>Chọn danh mục…</option><option v-for="c in catOpts" :key="c.id" :value="c.name">{{c.name}}{{c.is_visible?'':' (đang ẩn)'}}</option></select></label><div class="pcell"><label>Giá (VNĐ)<input v-model.number="f.price_vnd" type="number" min="0" step="1000" :disabled="f.price_contact" :required="!f.price_contact" :placeholder="f.price_contact?'Giá liên hệ':''"></label><label class="chk"><input type="checkbox" v-model="f.price_contact"> Giá liên hệ (khách liên hệ fanpage hoặc Zalo)</label></div></div>
   <label>Mô tả ngắn (hiện trên thẻ sản phẩm)<textarea v-model="f.description" rows="2"></textarea></label>
   <div class="lbl">Mô tả chi tiết (chèn ảnh, đổi cỡ chữ, kiểu chữ, màu chữ… khách bấm "Xem mô tả sản phẩm" mới thấy)</div>
   <div class="qwrap"><div ref="qEl"></div></div>
   <div class="f2"><label>Kích thước (mm), ví dụ 110 × 110<input v-model="f.size_mm"></label><label>Vật liệu<input v-model="f.material"></label></div>
   <label>Nhãn (Bán chạy, Còn hàng…)<input v-model="f.badge"></label>
   <div class="lbl">Màu mặc định (dùng ảnh chính ở trên)</div>
   <div class="crow"><input v-model="f.colors[0].name" placeholder="Tên màu mặc định" required><input type="color" v-model="f.colors[0].hex"></div>
   <div class="lbl">Màu sắc phụ (ảnh không bắt buộc, không có ảnh thì dùng ảnh chính)</div>
   <template v-for="(c,i) in f.colors" :key="i"><div class="cblock" v-if="i>0">
    <div class="crow2">
     <input v-model="c.name" placeholder="Tên màu" required><input type="color" v-model="c.hex">
     <label class="btn s o up">+ Thêm ảnh<input type="file" accept="image/*" multiple style="display:none" @change="addImgs(c.images,$event)"></label>
     <button type="button" class="btn s o" @click="f.colors.splice(i,1)" aria-label="Xóa màu"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    </div>
    <div class="gal" v-if="c.images&&c.images.length"><div class="gthumb" v-for="(u,k) in c.images" :key="u"><img :src="u" alt="" @click="makeCover(c.images,k)" :title="k?'Bấm để đặt làm ảnh bìa của màu này':'Ảnh bìa của màu này'"><span v-if="k==0" class="cvr">Ảnh bìa</span><button type="button" @click="c.images.splice(k,1)" aria-label="Xóa ảnh">×</button></div></div>
   </div></template>
   <button type="button" class="btn s o" @click="f.colors.push({name:'',hex:'#00bcd4',image_url:'',images:[]})">+ Thêm màu phụ</button>
   <label class="chk"><input type="checkbox" v-model="f.in_stock"> Còn hàng (bỏ chọn khi đã hết hàng)</label>
   <label class="chk"><input type="checkbox" v-model="f.is_active"> Đang bán (hiển thị ở trang chủ)</label>
   <button class="btn c" :disabled="busy">Lưu sản phẩm</button>
  </form></dialog>

 <dialog ref="dd" style="width:min(420px,calc(100% - 24px))" @click.self="dd.close()"><div class="cd">
  <h3>Xóa sản phẩm?</h3><p>Bạn sắp xóa “{{del&&del.name}}”. Hành động này không thể hoàn tác.</p>
  <div class="mact"><button class="btn o" @click="dd.close()">Hủy</button><button class="btn" style="background:#d93b3b;color:#fff" @click="doDel">Xác nhận xóa</button></div></div></dialog>
 <dialog ref="cf" style="width:min(420px,calc(100% - 24px))" @click.self="cf.close()"><button class="x" @click="cf.close()" aria-label="Đóng"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
  <form class="pform" @submit.prevent="saveCat"><h3>{{cid?'Sửa danh mục':'Thêm danh mục'}}</h3>
   <label>Tên danh mục<input v-model="cn" maxlength="50" required></label>
   <button class="btn c" :disabled="busy">Lưu danh mục</button></form></dialog>
 <dialog ref="cdd" style="width:min(420px,calc(100% - 24px))" @click.self="cdd.close()"><div class="cd">
  <h3>Xóa danh mục?</h3><p>Bạn sắp xóa danh mục “{{cdel&&cdel.name}}”. Chỉ xóa được khi danh mục không còn sản phẩm nào.</p>
  <div class="mact"><button class="btn o" @click="cdd.close()">Hủy</button><button class="btn" style="background:#d93b3b;color:#fff" @click="doDelCat">Xác nhận xóa</button></div></div></dialog>
 <dialog ref="vd" style="width:min(560px,calc(100% - 24px))" @click.self="vd.close()"><button class="x" @click="vd.close()" aria-label="Đóng"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
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
 <dialog ref="qp" style="width:min(440px,calc(100% - 24px))" @click.self="qp.close()"><button class="x" @click="qp.close()" aria-label="Đóng"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
  <form class="pform" @submit.prevent="savePrice">
   <h3>{{qpStatus?'Nhập giá đơn hàng':'Sửa giá đơn hàng'}}</h3>
   <p class="sub" style="margin:0;text-align:left">{{qpItem&&qpItem.customer_name}} · Khách đã chuyển khoản. Giá là tiền hàng (không gồm phí ship) và được cộng vào doanh thu.</p>
   <label>Giá đơn hàng (VNĐ)<input v-model="qpPrice" inputmode="numeric" placeholder="VD: 1500000" required autocomplete="off"></label>
   <b v-if="qpNum" class="qpshow">{{vnd(qpNum)}}</b>
   <button class="btn c" :disabled="busy">{{qpStatus?'Lưu giá và đổi trạng thái':'Lưu giá'}}</button>
  </form></dialog>
 <dialog ref="sf" style="width:min(560px,calc(100% - 24px))" @click.self="sf.close()"><button class="x" @click="sf.close()" aria-label="Đóng"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
  <form class="pform" @submit.prevent="sSave">
   <h3>{{sForm.id?'Sửa thông tin đơn Social':'Thêm đơn hàng Social'}}</h3>
   <div class="f2"><label>Tên khách hàng<input v-model="sForm.customer_name" required></label><label>SĐT / Zalo<input v-model="sForm.phone" required inputmode="tel"></label></div>
   <div class="f2"><label>Kênh tư vấn<select v-model="sForm.channel"><option v-for="(l,k) in SCH" :key="k" :value="k">{{l}}</option></select></label><label>Ngày tư vấn<input type="date" v-model="sForm.consult_date" required></label></div>
   <label>Địa chỉ giao hàng<input v-model="sForm.address"></label>
   <div class="f2"><label>Nhân viên tư vấn<input v-model="sForm.staff"></label><label>Tiền cọc phí thiết kế (VNĐ)<input v-model="sForm.design_deposit" inputmode="numeric" required placeholder="VD: 500000"></label></div>
   <label>File hình ảnh (tối đa 10 ảnh)<div class="logo"><input type="file" accept="image/*" multiple @change="sPickImages"></div></label>
   <div class="thumbs" v-if="sForm.images.length"><div class="thumb" v-for="(u,i) in sForm.images" :key="u"><img :src="u" alt=""><button type="button" @click="sForm.images.splice(i,1)" aria-label="Xóa ảnh">×</button></div></div>
   <button class="btn c" :disabled="busy">{{sForm.id?'Lưu thay đổi':'Lưu đơn hàng'}}</button>
   <small v-if="!sForm.id" style="color:var(--mut)">Sau khi lưu, đơn ở trạng thái “Đã chuyển phí thiết kế”.</small>
  </form></dialog>
 <dialog ref="sd" style="width:min(480px,calc(100% - 24px))" @click.self="sd.close()"><button class="x" @click="sd.close()" aria-label="Đóng"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
  <form class="pform" v-if="sdItem" @submit.prevent="sdSubmit">
   <h3>{{SDT[sdKind]}}</h3>
   <p class="sub" style="margin:0;text-align:left">{{sdItem.customer_name}} · {{sdItem.phone}}</p>
   <p v-if="sdKind==='cancel'" style="margin:0;color:var(--mut);line-height:1.5">Hủy đơn đang ở bước “{{SLAB[sdItem.status]}}”. Khoản khách đã trả được giữ lại và tính vào doanh thu. Sau khi hủy, đơn bị khóa.</p>
   <label v-if="sdFields.includes('dr')">Phí thiết kế còn lại (VNĐ)<input v-model="sdF.dr" inputmode="numeric" required placeholder="VD: 1500000"></label>
   <label v-if="sdFields.includes('od')">Phí cọc đơn hàng (VNĐ)<input v-model="sdF.od" inputmode="numeric" required placeholder="VD: 3000000"></label>
   <label v-if="sdFields.includes('ship')">Phí ship (VNĐ, tính riêng, không vào doanh thu)<input v-model="sdF.ship" inputmode="numeric" required placeholder="VD: 40000"></label>
   <label v-if="sdFields.includes('rem')">Số tiền còn lại của đơn hàng (VNĐ)<input v-model="sdF.rem" inputmode="numeric" required placeholder="VD: 5000000"></label>
   <div class="mbox" v-if="sdEff">
    <div class="mrow big"><span>Tổng giá trị đơn hàng</span><b>{{vnd(sdEff.total)}}</b></div>
    <div class="mrow"><span>Phí ship (tính riêng)</span><b>{{vnd(sdEff.ship)}}</b></div>
    <small class="rv">Tính vào doanh thu: <b>{{vnd(sdEff.rev)}}</b></small>
   </div>
   <button class="btn c" :style="sdKind==='cancel'?{background:'#d93b3b',color:'#fff'}:null" :disabled="busy">{{sdKind==='cancel'?'Xác nhận hủy đơn':'Lưu'}}</button>
  </form></dialog>
 <div id="toast" :class="{on:tOn}" role="status">{{tMsg}}</div>
</div>
</template>

<script setup>
import {ref,reactive,computed,nextTick} from 'vue'
const ORD={new:'Chờ xác nhận thanh toán',paid:'Đã thanh toán',shipping:'Đang giao hàng',done:'Giao hàng thành công',cancelled:'Đã hủy'}
const QS={new:'Mới',quoted:'Đã báo giá',accepted:'Khách đồng ý',paid:'Đã thanh toán',shipping:'Đang giao hàng',done:'Giao hàng thành công',rejected:'Từ chối'}
const PER=12,pg=reactive({products:1,orders:1,quotes:1,social:1})   // mỗi trang tối đa 12 thẻ (4 hàng × 3 cột)
const total=reactive({products:0,orders:0,quotes:0,social:0}),loading=ref(false),cache=new Map()   // chỉ tải 12 dòng mỗi trang; nhớ trang đã xem để chuyển tab là hiện ngay
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
  tab.value='overview';loading.value=true;loadStats()
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
const imgsOf=o=>Array.isArray(o.images)&&o.images.length?[...o.images]:(o.image_url?[o.image_url]:[])   // dữ liệu cũ chỉ có 1 ảnh thì coi là ảnh đầu tiên
async function addImgs(list,e){   // chọn nhiều ảnh một lúc, thêm vào danh sách ảnh sản phẩm hoặc ảnh của một màu
  const files=[...e.target.files];e.target.value=''
  for(const file of files){if(list.length>=10){toast('Tối đa 10 ảnh');break}
    await run(async()=>{list.push(await uploadImg(file,900))})}
}
const makeCover=(list,i)=>{if(i>0)list.unshift(list.splice(i,1)[0])}
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
  if(q&&qEl.value&&q.container===qEl.value)f.value.content_html=(q.getText().trim()||q.root.querySelector('img'))?q.getSemanticHTML().replace(/&nbsp;/g,' '):''
}
// ---- Tổng quan: thống kê đơn hàng và doanh thu ----
// STATS-BEGIN
function periodsOf(kind,months,nowMs){   // gộp số liệu tháng thành tháng / quý / năm (giờ Việt Nam)
  const now=new Date(nowMs+7*36e5),cy=now.getUTCFullYear(),cm=now.getUTCMonth()+1
  const src={};for(const r of months||[])src[r.ym]=r
  const sum=keys=>{const a={orders:0,shipping:0,done:0,cancelled:0,pending:0,revenue:0,custom_orders:0,custom_shipping:0,custom_done:0,custom_revenue:0,social_orders:0,social_shipping:0,social_done:0,social_revenue:0};for(const k of keys){const r=src[k];if(r)for(const f in a)a[f]+=Number(r[f]||0)}return a}
  const mk=(y,m)=>y+'-'+String(m).padStart(2,'0'),out=[]
  if(kind==='month')for(let i=11;i>=0;i--){let y=cy,m=cm-i;while(m<1){m+=12;y--}out.push({label:'Tháng '+m+'/'+y,tick:m+'/'+String(y).slice(2),...sum([mk(y,m)])})}
  if(kind==='quarter'){let q=Math.ceil(cm/3),y=cy;const list=[];for(let i=0;i<8;i++){list.unshift({y,q});q--;if(q<1){q=4;y--}}
    for(const p of list)out.push({label:'Quý '+p.q+'/'+p.y,tick:'Q'+p.q+'/'+String(p.y).slice(2),...sum([0,1,2].map(i=>mk(p.y,p.q*3-2+i)))})}
  if(kind==='year')for(let y=cy-4;y<=cy;y++)out.push({label:'Năm '+y,tick:String(y),...sum(Array.from({length:12},(_,i)=>mk(y,i+1)))})
  return out
}
const CH={W:600,H:230,L:58,R:16,T:16,B:34}
const VB='0 0 '+CH.W+' '+CH.H
const niceMax=m=>{if(m<=0)return 1e6;const p=Math.pow(10,Math.floor(Math.log10(m))),f=m/p;return (f<=1?1:f<=2?2:f<=5?5:10)*p}
const dec=(x,d)=>(+x.toFixed(d)).toLocaleString('vi-VN')   // dấu phẩy thập phân kiểu Việt Nam
const short=n=>n>=1e9?dec(n/1e9,1)+' tỷ':n>=1e6?dec(n/1e6,1)+' tr':n>=1e3?dec(n/1e3,n<1e4?1:0)+'k':String(Math.round(n))
function chartGeom(vals,labels,fmt,int){   // đường + vùng tô + các điểm cho biểu đồ đường
  const n=vals.length,top=Math.max(0,...vals),mx=int?Math.max(4,Math.ceil(top/4)*4):niceMax(top)
  const iw=CH.W-CH.L-CH.R,ih=CH.H-CH.T-CH.B,base=CH.T+ih
  const px=i=>CH.L+(n>1?i*iw/(n-1):iw/2),py=v=>CH.T+ih*(1-(mx?v/mx:0))
  const pts=vals.map((v,i)=>({x:+px(i).toFixed(1),y:+py(v).toFixed(1),v,label:labels[i]}))
  const line=pts.map((p,i)=>(i?'L':'M')+p.x+' '+p.y).join(' ')
  const area=n?line+' L'+pts[n-1].x+' '+base+' L'+pts[0].x+' '+base+' Z':''
  return {pts,line,area,base,ticks:[0,1,2,3,4].map(i=>({y:+(CH.T+ih*(1-i/4)).toFixed(1),text:fmt(mx*i/4)}))}
}
function groupsOf(r){   // tách số liệu của một kỳ theo loại đơn: có sẵn / theo yêu cầu / Social
  const g=(k,name,c,o,sh,dn,rv)=>({k,name,c,orders:o,shipping:sh,done:dn,revenue:rv})
  const n=v=>Number(v)||0
  return [
    g('std','Đơn hàng có sẵn','#3b82f6',n(r.orders)-n(r.custom_orders)-n(r.social_orders),n(r.shipping)-n(r.custom_shipping)-n(r.social_shipping),n(r.done)-n(r.custom_done)-n(r.social_done),n(r.revenue)-n(r.custom_revenue)-n(r.social_revenue)),
    g('custom','Đơn theo yêu cầu','#14b8a6',n(r.custom_orders),n(r.custom_shipping),n(r.custom_done),n(r.custom_revenue)),
    g('social','Đơn Social','#ec4899',n(r.social_orders),n(r.social_shipping),n(r.social_done),n(r.social_revenue))
  ]
}
// STATS-END
const ov=ref(null),period=ref('month'),statsLoading=ref(false)
async function loadStats(){
  statsLoading.value=!ov.value
  try{ov.value=await api('stats')}catch(e){toast(e.message)}
  statsLoading.value=false
}
const rows=computed(()=>periodsOf(period.value,ov.value&&ov.value.months,Date.now()))
const rowsDesc=computed(()=>rows.value.slice().reverse())
const tot=computed(()=>{const a={orders:0,shipping:0,done:0,revenue:0,custom_orders:0,custom_shipping:0,custom_done:0,custom_revenue:0,social_orders:0,social_shipping:0,social_done:0,social_revenue:0};for(const r of (ov.value&&ov.value.months)||[])for(const f in a)a[f]+=Number(r[f]||0);return a})
const mon=computed(()=>periodsOf('month',ov.value&&ov.value.months,Date.now()).slice(-1)[0]||{orders:0,done:0,revenue:0})
const charts=computed(()=>[
  {title:'Doanh thu',color:'#a855f7',g:chartGeom(rows.value.map(r=>r.revenue),rows.value.map(r=>r.tick),short,false),full:vnd},
  {title:'Số đơn hàng',color:'#3b82f6',g:chartGeom(rows.value.map(r=>r.orders),rows.value.map(r=>r.tick),n=>String(Math.round(n)),true),full:v=>v+' đơn'}
])
const kpis=computed(()=>{const t=tot.value,m=mon.value
  const split=(all,c,so)=>'Có sẵn: '+(all-c-so)+' · Theo yêu cầu: '+c+' · Social: '+so
  return [
    {t:'Tổng đơn hàng',n:t.orders.toLocaleString('vi-VN'),s:split(t.orders,t.custom_orders,t.social_orders)+' · Tháng này: '+m.orders,c:'#3b82f6'},
    {t:'Đang giao hàng',n:t.shipping.toLocaleString('vi-VN'),s:split(t.shipping,t.custom_shipping,t.social_shipping),c:'#f59e0b'},
    {t:'Đã giao thành công',n:t.done.toLocaleString('vi-VN'),s:split(t.done,t.custom_done,t.social_done)+' · Tháng này: '+m.done,c:'#22c55e'},
    {t:'Doanh thu',n:vnd(t.revenue),s:'Có sẵn: '+vnd(t.revenue-t.custom_revenue-t.social_revenue)+' · Theo yêu cầu: '+vnd(t.custom_revenue)+' · Social: '+vnd(t.social_revenue)+' · Tháng này: '+vnd(m.revenue),c:'#a855f7'}
  ]})
// ---- Đơn hàng Social: đơn tự nhập từ các kênh tư vấn ----
const SLAB={design_paid:'Đã chuyển phí thiết kế',ordered:'Đã đặt hàng',shipping:'Đang giao hàng',done:'Giao hàng thành công',cancelled:'Đã hủy'}
const SSC={design_paid:'#eab308',ordered:'#3b82f6',shipping:'#f59e0b',done:'#22c55e',cancelled:'#ef4444'}
const SCH={facebook:'Facebook',zalo:'Zalo',tiktok:'Tiktok',instagram:'Insta',direct:'Tư vấn trực tiếp'}
const SDT={ordered:'Đã đặt hàng',shipping:'Đang giao hàng',done:'Giao hàng thành công',cancel:'Hủy đơn hàng',amounts:'Sửa số tiền'}
const STAGE=['design_paid','ordered','shipping','done']
// SOCIAL-BEGIN
const n0=v=>Number(v)||0
const sTotal=s=>n0(s.design_deposit_vnd)+n0(s.design_remaining_vnd)+n0(s.order_deposit_vnd)+n0(s.remaining_vnd)   // tổng giá trị đơn hàng, KHÔNG gồm phí ship
function sRevenue(s){   // khoản tính vào doanh thu (không gồm phí ship); khớp với hàm stats_monthly trong SQL
  const dd=n0(s.design_deposit_vnd),paid=dd+n0(s.design_remaining_vnd)+n0(s.order_deposit_vnd)
  if(s.status==='design_paid')return dd
  if(s.status==='ordered')return paid
  if(s.status==='shipping'||s.status==='done')return paid+n0(s.remaining_vnd)
  if(s.status==='cancelled')return s.cancelled_from==='design_paid'?dd:paid   // hủy: giữ lại phần đã nhận
  return 0
}
const sOptions=s=>(s.status==='done'||s.status==='cancelled')?[s.status]:[s.status,STAGE[STAGE.indexOf(s.status)+1],'cancelled']
// SOCIAL-END
const isSLocked=s=>s.status==='done'||s.status==='cancelled'
const canAmounts=s=>s.status==='ordered'||s.status==='shipping'
const stageIdx=s=>s.status==='cancelled'?STAGE.indexOf(s.cancelled_from):STAGE.indexOf(s.status)
const dmy=d=>d?String(d).split('-').reverse().join('/'):''
const numOf=v=>Number(String(v).replace(/\D/g,''))||0
const todayVN=()=>new Date(Date.now()+7*36e5).toISOString().slice(0,10)
// biểu mẫu thêm / sửa thông tin
const sf=ref(null),sForm=reactive({id:null,customer_name:'',phone:'',channel:'facebook',address:'',staff:'',consult_date:'',design_deposit:'',images:[]})
function sNew(){Object.assign(sForm,{id:null,customer_name:'',phone:'',channel:'facebook',address:'',staff:'',consult_date:todayVN(),design_deposit:'',images:[]});sf.value.showModal()}
function sEdit(s){Object.assign(sForm,{id:s.id,customer_name:s.customer_name,phone:s.phone,channel:s.channel,address:s.address||'',staff:s.staff||'',consult_date:s.consult_date,design_deposit:String(s.design_deposit_vnd),images:[...(s.images||[])]});sf.value.showModal()}
async function sPickImages(e){
  const files=[...e.target.files];e.target.value=''
  for(const f of files){if(sForm.images.length>=10){toast('Tối đa 10 ảnh');break}
    await run(async()=>{sForm.images.push(await uploadImg(f,1200))})}
}
const sSave=()=>run(async()=>{
  const isNew=!sForm.id
  const body={customer_name:sForm.customer_name,phone:sForm.phone,channel:sForm.channel,address:sForm.address,staff:sForm.staff,consult_date:sForm.consult_date,design_deposit_vnd:numOf(sForm.design_deposit),images:sForm.images}
  if(isNew)await api('social.create',body);else await api('social.update',{id:sForm.id,...body})
  sf.value.close();cache.clear();if(isNew){pg.social=1;search.social=''}
  toast(isNew?'Đã lưu đơn, trạng thái: Đã chuyển phí thiết kế':'Đã cập nhật thông tin');go('social')
})
// hộp thoại đổi trạng thái / nhập số tiền
const sd=ref(null),sdItem=ref(null),sdKind=ref(''),sdF=reactive({dr:'',od:'',ship:'',rem:''})
const sdFields=computed(()=>{const k=sdKind.value,s=sdItem.value
  return k==='ordered'?['dr','od','ship']:(k==='shipping'||k==='done')?['rem']:k==='amounts'&&s?(s.status==='ordered'?['dr','od','ship']:['rem','ship']):[]})
function sAsk(s,kind){
  sdItem.value=s;sdKind.value=kind
  const keep=kind==='done'||kind==='amounts',p=v=>keep?String(n0(v)):(n0(v)>0?String(n0(v)):'')
  sdF.dr=p(s.design_remaining_vnd);sdF.od=p(s.order_deposit_vnd);sdF.ship=p(s.ship_fee_vnd);sdF.rem=p(s.remaining_vnd)
  sd.value.showModal()
}
function sSetStatus(s,to,ev){ev.target.value=s.status;if(to!==s.status)sAsk(s,to==='cancelled'?'cancel':to)}   // ô chọn luôn quay về trạng thái hiện tại, đổi thật sau khi bấm Lưu
const sdEff=computed(()=>{const s=sdItem.value;if(!s)return null
  const f=sdFields.value,g=(k,cur)=>f.includes(k)?numOf(sdF[k]):n0(cur)
  const v={...s,design_remaining_vnd:g('dr',s.design_remaining_vnd),order_deposit_vnd:g('od',s.order_deposit_vnd),ship_fee_vnd:g('ship',s.ship_fee_vnd),remaining_vnd:g('rem',s.remaining_vnd)}
  const k=sdKind.value
  return {total:sTotal(v),ship:v.ship_fee_vnd,rev:k==='cancel'?sRevenue({...v,status:'cancelled',cancelled_from:s.status}):sRevenue({...v,status:k==='amounts'?s.status:k})}})
const sdSubmit=()=>run(async()=>{
  const s=sdItem.value,k=sdKind.value,amt={design_remaining_vnd:numOf(sdF.dr),order_deposit_vnd:numOf(sdF.od),ship_fee_vnd:numOf(sdF.ship),remaining_vnd:numOf(sdF.rem)}
  if(k==='amounts'){const b={id:s.id};for(const x of(s.status==='ordered'?['design_remaining_vnd','order_deposit_vnd','ship_fee_vnd']:['remaining_vnd','ship_fee_vnd']))b[x]=amt[x];await api('social.amounts',b)}
  else{
    const b={id:s.id,to:k==='cancel'?'cancelled':k}
    if(k==='ordered')Object.assign(b,{design_remaining_vnd:amt.design_remaining_vnd,order_deposit_vnd:amt.order_deposit_vnd,ship_fee_vnd:amt.ship_fee_vnd})
    if(k==='shipping'||k==='done')b.remaining_vnd=amt.remaining_vnd
    await api('social.status',b)
  }
  sd.value.close();cache.clear();toast('Đã cập nhật đơn hàng');go('social')
})
const tabs=[['overview','Tổng quan'],['products','Sản phẩm'],['categories','Danh mục'],['orders','Đơn hàng'],['quotes','Đơn theo yêu cầu'],['social','Đơn hàng Social']]
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
const social=ref([])
const L={products,orders,quotes,social}
const search=reactive({products:'',orders:'',quotes:'',social:'',categories:''})
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
async function go(t){tab.value=t;if(!tok.value)return;if(L[t])load(t,pg[t]);if(t=='categories')loadCats();if(t=='overview')loadStats()}
function edit(p){f.value=p?{...p,images:imgsOf(p),colors:[...p.product_colors].sort((a,b)=>a.position-b.position).map(c=>({name:c.name,hex:c.hex,image_url:c.image_url||'',images:imgsOf(c)}))}:{name:'',category:'',description:'',price_vnd:0,size_mm:'',material:'PLA',badge:'',image_url:'',images:[],is_active:true,in_stock:true,price_contact:false,sort_order:total.products+1,colors:[{name:'Xanh cyan',hex:'#00bcd4',image_url:'',images:[]}]};if(!f.value.colors.length)f.value.colors.push({name:'',hex:'#00bcd4',image_url:'',images:[]});pf.value.showModal();mountEditor(f.value.content_html)}
const saveP=()=>run(async()=>{syncContent();if(f.value.price_contact)f.value.price_vnd=0;f.value.image_url=(f.value.images&&f.value.images[0])||'';f.value.colors.forEach(c=>{c.image_url=(c.images&&c.images[0])||''});const isNew=!f.value.id;await api('product.save',{product:f.value});pf.value.close();toast('Đã lưu sản phẩm');cache.clear();if(isNew){pg.products=1;search.products=''}go('products')})   // sản phẩm mới nằm ở trang 1
const doDel=()=>run(async()=>{await api('product.delete',{id:del.value.id});dd.value.close();toast('Đã xóa');cache.clear();go('products')})
const LOCK={order:['done','cancelled'],quote:['done','rejected']}   // trạng thái cuối: khóa đơn
const isLocked=(k,o)=>LOCK[k].includes(o.status)
async function setS(a,o,status,ev){
  const ord=a=='order.status'
  if(LOCK[ord?'order':'quote'].includes(status)&&!confirm(`Chuyển sang "${(ord?ORD:QS)[status]}"? Sau đó đơn sẽ bị khóa và không thể đổi trạng thái nữa.`)){ev.target.value=o.status;return}
  if(!ord&&PRICE_ST.includes(status)&&!o.price_vnd){ev.target.value=o.status;askPrice(o,status);return}   // chưa có giá thì hỏi giá trước
  busy.value=true
  try{await api(a,{id:o.id,status});o.status=status;toast('Đã cập nhật trạng thái')}catch(e){ev.target.value=o.status;toast(e.message)}
  busy.value=false
}
// ---- nhập giá cho đơn theo yêu cầu (cộng vào doanh thu) ----
const PRICE_ST=['paid','shipping','done']   // đổi sang các trạng thái này thì hỏi giá (cộng vào doanh thu)
const qp=ref(null),qpItem=ref(null),qpStatus=ref(null),qpPrice=ref('')
const qpNum=computed(()=>Number(String(qpPrice.value).replace(/\D/g,''))||0)
function askPrice(o,status){qpItem.value=o;qpStatus.value=status;qpPrice.value=o.price_vnd?String(o.price_vnd):'';qp.value.showModal()}
async function savePrice(){
  const o=qpItem.value,st=qpStatus.value,v=qpNum.value
  if(!(v>0)){toast('Vui lòng nhập giá đơn hàng lớn hơn 0');return}
  busy.value=true
  try{
    if(st){await api('quote.status',{id:o.id,status:st,price_vnd:v});o.status=st}else await api('quote.price',{id:o.id,price_vnd:v})
    o.price_vnd=v;qp.value.close();toast(st?'Đã lưu giá và cập nhật trạng thái':'Đã sửa giá đơn hàng')
  }catch(e){toast(e.message)}
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
.qwrap{display:block;min-width:0}
.qwrap .ql-container.ql-snow{height:auto;border:1px solid var(--bd);border-top:0;border-radius:0 0 14px 14px;font:inherit;color:var(--ink)}   /* height:auto: không để khung soạn thảo tràn xuống đè các ô bên dưới */
.qwrap .ql-editor{height:auto;min-height:200px;max-height:380px;overflow:auto;font-size:15px;line-height:1.6}
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
@media (hover:none){html .btn:hover{transform:none;box-shadow:none}}
@media (pointer:coarse){html body input,html body select,html body textarea{font-size:16px!important}}
.x{display:grid;place-items:center;padding:0;line-height:0}
.x svg{width:18px;height:18px}
.sbar .sx{display:grid;place-items:center;padding:0;line-height:0}
.kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.kpi{position:relative;overflow:hidden;display:grid;gap:6px;padding:18px 18px 16px 22px;border-radius:22px;background:var(--stage);border:1px solid var(--bd)}
.kpi::before{content:'';position:absolute;inset:0 auto 0 0;width:5px;background:var(--kc)}
.kpi .kt{color:var(--mut);font-size:14px;font-weight:600}
.kpi .kn{font-size:28px;font-weight:800;letter-spacing:-.02em;overflow-wrap:anywhere}
.kpi .ks{color:var(--mut);font-size:13px;line-height:1.4}
.statbox{gap:18px;padding:20px}
.sthead{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap}
.sthead>div:first-child{display:grid;gap:4px;max-width:560px}.sthead small{color:var(--mut);line-height:1.4}
.seg{display:inline-flex;gap:4px;padding:4px;border-radius:999px;background:var(--row)}
.seg button{border:0;background:none;color:var(--ink);font:600 14px Outfit,system-ui,sans-serif;padding:8px 20px;border-radius:999px;cursor:pointer}
.seg button.on{background:var(--ink);color:var(--stage)}
.charts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.chbox{display:grid;gap:8px;padding:14px;border-radius:18px;background:var(--row);min-width:0}
.chbox small{color:var(--mut);font-weight:500;margin-left:6px}
.lchart{width:100%;height:auto;display:block}
.lchart .gl{stroke:var(--bd);stroke-width:1}
.lchart .ax{fill:var(--mut);font-size:11px;font-family:Outfit,system-ui,sans-serif}
.lchart .pt{stroke:var(--stage);stroke-width:2}
.tscroll{overflow-x:auto}
.stab{width:100%;border-collapse:collapse;font-size:14px;min-width:520px}
.stab th{text-align:left;color:var(--mut);font-weight:600;padding:10px 12px;border-bottom:1px solid var(--bd)}
.stab td{padding:11px 12px;border-bottom:1px dashed var(--bd)}
.stab th:not(:first-child),.stab td:not(:first-child){text-align:right}
.stab tr.cur td{font-weight:700;background:var(--row)}
@media(max-width:1000px){.kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.charts{grid-template-columns:1fr}}
@media(max-width:520px){.kpis{grid-template-columns:1fr}}
.pricerow{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:8px 12px;border-radius:12px;background:var(--row)}
.pricerow b{color:#a855f7}
.qpshow{font-size:22px;color:#a855f7}
.pcell{display:grid;gap:10px;align-content:start}
.pform>*{min-width:0}
.chline{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.chnl{display:inline-block;padding:3px 10px;border-radius:99px;background:var(--row);font-size:12px;font-weight:700}
.cthumbs{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.cthumbs img{width:44px;height:44px;border-radius:10px;object-fit:cover;display:block}
.mbox{display:grid;gap:6px;padding:12px;border-radius:14px;background:var(--row)}
.mrow{display:flex;justify-content:space-between;gap:10px;font-size:14px}
.mrow.big{font-size:16px;font-weight:700;border-top:1px dashed var(--bd);padding-top:8px;margin-top:2px}
.mbox .rv{color:var(--mut)}.mbox .rv b{color:#a855f7}
.thumbs{display:flex;gap:8px;flex-wrap:wrap}
.thumb{position:relative;width:64px;height:64px}
.thumb img{width:100%;height:100%;object-fit:cover;border-radius:12px;display:block}
.thumb button{position:absolute;top:-6px;right:-6px;width:22px;height:22px;border-radius:50%;border:0;background:#d93b3b;color:#fff;font-size:15px;line-height:1;cursor:pointer;padding:0}
.stab tr.tot.has td{font-weight:700}
.stab tr.sub td{font-size:13px;color:var(--mut);padding:7px 12px}
.stab tr.sub td:first-child{padding-left:26px;white-space:nowrap}
.stab tr.sub:last-of-type td,.stab tr.sub+tr.tot td{border-top:0}
.stab .dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:8px}
.gal{display:flex;gap:10px;flex-wrap:wrap;margin:4px 0}
.gthumb{position:relative;width:86px;height:66px}
.gthumb img{width:100%;height:100%;object-fit:cover;border-radius:12px;display:block;cursor:pointer;border:2px solid var(--bd)}
.gthumb .cvr{position:absolute;left:4px;bottom:4px;padding:1px 7px;border-radius:99px;background:var(--lc);color:#fff;font-size:11px;font-weight:700;pointer-events:none}
.gthumb button{position:absolute;top:-7px;right:-7px;width:22px;height:22px;border-radius:50%;border:0;background:#d93b3b;color:#fff;font-size:15px;line-height:1;cursor:pointer;padding:0}
.cblock{display:grid;gap:8px;padding:10px;border-radius:14px;background:var(--row)}
</style>