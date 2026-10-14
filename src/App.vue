<template>
<div class="stage">
<div class="top">
  <div class="brand"><span class="lg mk" role="img" aria-label="Logo Con Cá Lab"><i class="n"></i><i class="c"></i></span><span>Con Cá <b>Lab</b></span></div>
  <div class="tr">
   <nav><a class="h" href="#shop">Sản phẩm</a><a class="h" href="#custom">In theo yêu cầu</a><a class="h" href="#quy-trinh">Quy trình</a><a href="#lien-he">Liên hệ</a></nav>
   <button id="tg" @click="toggleTheme" aria-label="Chuyển chế độ sáng / tối" title="Chuyển chế độ sáng / tối">
    <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
    <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
   </button>
  </div>
 </div>

 
<div class="hero">
  <div class="blob">
   <div class="copy">
    <span class="eyebrow">IN 3D · TỪNG LỚP MỘT</span>
    <h1>In 3D<br>theo ý bạn</h1>
    <p>Sản phẩm làm sẵn và nhận in theo yêu cầu, từ 1 chiếc đến hàng loạt.</p>
    <div class="cta"><a class="btn w" href="#shop">Mua sản phẩm có sẵn</a><a class="btn g" href="#custom">In theo yêu cầu</a></div>
    <div class="stats"><div><b>0,1mm</b>độ mịn lớp in</div><div><b>24h</b>báo giá nhanh</div><div><b>4</b>loại vật liệu</div></div>
   </div>
   <div class="plantwrap">
    <svg viewBox="0 0 160 320" aria-hidden="true">
     <g fill="#4f9d5f"><path d="M80 150C66 100 66 55 80 8C94 55 94 100 80 150Z"/><path fill="#5fb06e" d="M80 150C66 100 66 55 80 8C94 55 94 100 80 150Z" transform="rotate(-24 80 150)"/><path fill="#3f8a52" d="M80 150C66 100 66 55 80 8C94 55 94 100 80 150Z" transform="rotate(26 80 150)"/><path fill="#5fb06e" d="M80 150C66 110 66 70 80 30C94 70 94 110 80 150Z" transform="rotate(-48 80 150)"/><path fill="#4f9d5f" d="M80 150C66 110 66 70 80 30C94 70 94 110 80 150Z" transform="rotate(50 80 150)"/></g>
     <g stroke="#b9855a" stroke-width="6" stroke-linecap="round"><path d="M52 230L36 310M108 230L124 310M80 232V312"/></g>
     <rect x="38" y="138" width="84" height="94" rx="16" fill="#f6f3ec"/>
     <path d="M40 160H120M40 180H120M40 200H120M40 220H120" stroke="#ddd6c8" stroke-width="2"/>
    </svg>
   </div>
  </div>
 </div>

 
 <div class="sec" id="shop">
  <div class="shophead">
   <div><h2>Sản phẩm có sẵn</h2><p class="sub">Bấm vào ảnh để xem chi tiết, chọn màu và đặt mua. Giao nhanh, không cần chờ in.</p></div>
   <div class="chipbar">
    <button class="cnav" :disabled="cs<=0" @click="chipMove(-1)" aria-label="Danh mục trước"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>
    <div class="chipwin"><div class="chips" :style="{'--i':cs}"><button v-for="(c,i) in cats" :key="c" :class="{on:c==cat}" :tabindex="i>=cs&&i<cs+4?0:-1" @click="cat=c">{{c}}</button></div></div>
    <button class="cnav" :disabled="cs>=cats.length-4" @click="chipMove(1)" aria-label="Danh mục sau"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>
   </div>
  </div>
  <p v-if="loading" class="empty">Đang tải sản phẩm…</p>
  <p v-else-if="loadErr" class="empty">{{loadErr}}</p>
  <div class="pgrid" @touchstart.passive="ts" @touchend.passive="te">
   <article class="pc" :class="{oos:oos(x)}" v-for="x in paged" :key="x.id">
    <button class="pimg" @click="openP(x)" :aria-label="'Xem '+x.name"><span class="badge" v-if="x.badge||oos(x)">{{oos(x)?'Hết hàng':x.badge}}</span><span class="view">Xem chi tiết</span><span style="display:contents" v-html="pic(x,0)"></span></button>
    <div class="pb"><h3>{{x.name}}</h3><p class="d">{{x.description}}</p>
     <div class="sw"><i v-for="c in x.colors" :key="c.name" :style="{background:c.hex}" :title="c.name"></i></div>
     <div class="pf"><div class="price">{{vnd(x.price_vnd)}}</div><button class="btn s" @click="addTo(x,0,1)">Thêm giỏ</button></div>
    </div>
   </article>
  </div>
  <nav class="pgn" v-if="pageCount>1" aria-label="Phân trang sản phẩm">
   <button :disabled="page<=1" @click="goPage(page-1)" aria-label="Trang trước"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>
   <button v-for="n in pageCount" :key="n" :class="{on:n==page}" :aria-current="n==page?'page':null" @click="goPage(n)">{{n}}</button>
   <button :disabled="page>=pageCount" @click="goPage(page+1)" aria-label="Trang sau"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>
  </nav>
 </div>

 <div class="sec two" id="custom">
  <div>
   <h2>In theo yêu cầu</h2>
   <p class="sub">Có sẵn file 3D (STL, OBJ, 3MF) hay mới chỉ có ý tưởng đều được.</p>
   <div class="mats">
    <div class="mat"><b>PLA</b><span>Dễ in, nhiều màu, hợp mô hình</span></div>
    <div class="mat"><b>PETG</b><span>Bền, chịu nước</span></div>
    <div class="mat"><b>ABS / ASA</b><span>Chịu nhiệt, chi tiết kỹ thuật</span></div>
    <div class="mat"><b>TPU</b><span>Dẻo, ốp lưng, gioăng</span></div>
   </div>
   <ul class="perks"><li>Báo giá trong ngày</li><li>Hỗ trợ thiết kế nếu chưa có file</li><li>Mài, sơn, hoàn thiện theo yêu cầu</li><li>Nhận cả đơn lẻ và đơn số lượng lớn</li></ul>
  </div>
  <form @submit.prevent="submitQuote">
   <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
   <div class="f2"><label>Họ tên<input name="n" required autocomplete="name"></label><label>SĐT / Zalo<input name="p" required autocomplete="tel"></label></div>
   <div class="f2"><label>Bạn đã có file 3D chưa?<select name="h"><option>Đã có file (sẽ gửi kèm)</option><option>Chưa có, cần thiết kế giúp</option></select></label>
   <label>Vật liệu<select name="m"><option>PLA</option><option>PETG</option><option>ABS / ASA</option><option>TPU</option><option>Chưa biết, cần tư vấn</option></select></label></div>
   <label>Số lượng<input name="q" type="number" min="1" value="1"></label>
   <label>File 3D hoặc ảnh (không bắt buộc · .stl, .obj, .3mf, .jpg, .png · tối đa 50 MB)<input name="f" type="file" accept=".stl,.obj,.3mf,.jpg,.jpeg,.png"></label>
   <label>Mô tả (kích thước, màu sắc, mục đích)<textarea name="d" rows="3" required></textarea></label>
   <button class="btn" type="submit" :disabled="busy">Gửi yêu cầu báo giá</button>
   <p class="res" role="status">{{quoteMsg}}</p>
  </form>
 </div>
<div class="sec" id="quy-trinh">
  <h2>Quy trình</h2><p class="sub">4 bước từ ý tưởng đến tay bạn.</p>
  <div class="steps">
   <div class="step"><i>1</i><h3>Gửi yêu cầu</h3><p>Gửi file hoặc mô tả ý tưởng.</p></div>
   <div class="step"><i>2</i><h3>Báo giá</h3><p>Giá và thời gian in rõ ràng.</p></div>
   <div class="step"><i>3</i><h3>In & hoàn thiện</h3><p>In, gỡ support, mài, sơn nếu cần.</p></div>
   <div class="step"><i>4</i><h3>Giao hàng</h3><p>Đóng gói kỹ, gửi toàn quốc.</p></div>
  </div>
 </div>

 <div class="band"><div><h2>Có ý tưởng rồi?</h2><p>Gửi cho Con Cá Lab, biến nó thành sản phẩm thật.</p></div><a class="btn w" href="#custom">Báo giá ngay</a></div>
 <div class="ct" id="lien-he"><span class="lg fl" role="img" aria-label="Con Cá Lab"><i class="n"></i><i class="c"></i></span>Zalo 09xx xxx xxx · hello@concalab.vn · Hội An, Đà Nẵng<br>© 2026 · In 3D từng lớp, làm nên ý tưởng</div>
</div>

<dialog ref="pd" aria-label="Chi tiết sản phẩm" @click.self="pd.close()">
 <button class="x" @click="pd.close()" aria-label="Đóng"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
 <div class="md" v-if="cur">
  <div class="mimg" :style="{background:'linear-gradient(135deg,'+BG[0]+','+BG[1]+')'}" v-html="pic(cur.p,cur.ci,true)"></div>
  <div class="minfo">
   <span class="tag">{{cur.p.category}}</span><h3>{{cur.p.name}}</h3><p>{{cur.p.description}}</p>
   <div class="specs"><div>Kích thước<b>{{cur.p.size_mm}} mm</b></div><div>Vật liệu<b>{{cur.p.material}}</b></div></div>
   <template v-if="cur.p.has_content">
    <button type="button" class="btn s o descbtn" @click="toggleDesc">{{cur.showDesc?'Ẩn mô tả sản phẩm ▴':'Xem mô tả sản phẩm ▾'}}</button>
    <div v-if="cur.showDesc" class="rich" v-html="cur.html"></div>
   </template>
   <div class="lbl">Màu sắc: {{cur.p.colors[cur.ci].name}}</div>
   <div class="cols"><button v-for="(c,j) in cur.p.colors" :key="c.name" :class="{on:j==cur.ci}" @click="cur.ci=j"><i :style="{background:c.hex}"></i>{{c.name}}</button></div>
   <div class="lbl">Số lượng</div>
   <div class="qty"><button @click="cur.q=Math.max(1,cur.q-1)" aria-label="Giảm">−</button><span>{{cur.q}}</span><button @click="cur.q=Math.min(99,cur.q+1)" aria-label="Tăng">+</button></div>
   <p v-if="oos(cur.p)" class="res">Sản phẩm này đã hết hàng, vui lòng chọn sản phẩm khác</p>
   <div class="buy" :class="{dim:oos(cur.p)}"><div class="mprice">{{vnd(cur.p.price_vnd*cur.q)}}</div>
    <div class="mact"><button class="btn o" @click="addTo(cur.p,cur.ci,cur.q,'Đã thêm vào giỏ')&&pd.close()">Thêm vào giỏ</button><button class="btn c" @click="addTo(cur.p,cur.ci,cur.q,'')&&(pd.close(),openCart())">Mua ngay</button></div></div>
  </div>
 </div>
</dialog>

<dialog ref="cd" aria-label="Giỏ hàng" @click.self="cd.close()">
 <button class="x" @click="cd.close()" aria-label="Đóng"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
 <div class="cd">
  <template v-if="done">
   <h3>Đặt hàng thành công 🎉</h3>
   <p class="sub" style="margin:0">Mã đơn của bạn: <b>{{done.code}}</b>. {{done.auto?'Đã xác nhận thanh toán của bạn. Shop sẽ liên hệ giao hàng sớm nhất.':'Cảm ơn bạn! Shop sẽ kiểm tra thanh toán và liên hệ giao hàng sớm nhất.'}}</p>
   <div class="sum"><span>Đã thanh toán</span><span>{{vnd(done.total_vnd)}}</span></div>
   <button class="btn c" @click="done=null;cd.close()">Xong</button>
  </template>
  <template v-else-if="pay">
   <h3>Quét mã để thanh toán</h3>
   <p class="sub" style="margin:0">Mã đơn: <b>{{pay.code}}</b>. Quét mã QR bằng app ngân hàng, số tiền và nội dung đã được điền sẵn. Bạn có thể đóng giỏ hàng, sản phẩm vẫn được giữ lại.</p>
   <img class="qr" :src="pay.qr_url" alt="Mã QR thanh toán" width="320" height="320">
   <div class="sum"><span>Cần thanh toán</span><span>{{vnd(pay.total_vnd)}}</span></div>
   <p class="shipnote" style="text-align:center;margin:0">Tiền hàng {{vnd(pay.items_total)}} + phí vận chuyển {{pay.shipping_fee_vnd?vnd(pay.shipping_fee_vnd):'miễn phí'}}</p>
   <p class="res" style="text-align:center">Nội dung chuyển khoản: thanh toan don hang #{{pay.code}}</p>
   <p class="wait" v-if="(pay.auto||pay.waiting)&&!pay.underpaid&&!pay.cancelled"><span class="spin"></span><span>{{pay.waiting?'Đã ghi nhận! Shop đang kiểm tra khoản chuyển và sẽ xác nhận trong ít phút. Trang này tự cập nhật, bạn không cần bấm gì thêm.':'Đang chờ thanh toán… Hệ thống tự động xác nhận ngay khi nhận được tiền, bạn không cần bấm gì thêm.'}}</span></p>
   <p class="res" v-if="pay.cancelled">Đơn hàng này đã bị hủy. Vui lòng liên hệ shop qua Zalo {{ZALO}} để được hỗ trợ.</p>
   <p class="res" v-if="pay.underpaid">Shop đã nhận được khoản chuyển nhưng chưa đủ số tiền. Vui lòng liên hệ shop qua Zalo {{ZALO}} để được hỗ trợ.</p>
   <p class="res" v-if="orderErr">{{orderErr}}</p>
   <button v-if="!pay.auto&&!pay.waiting" class="btn c" :disabled="busy" @click="confirmOrder">{{busy?'Đang xác nhận…':'Tôi đã chuyển khoản xong'}}</button>
   <button v-if="!pay.waiting" class="btn o" :disabled="busy" @click="pay=null">← Quay lại giỏ hàng</button>
   <button v-else class="btn o" @click="pay.cancelled?(pay=null):cd.close()">Đóng</button>
  </template>
  <template v-else-if="!lines.length">
   <h3>Giỏ hàng</h3><div class="empty">Giỏ hàng đang trống.<br><br><button class="btn c" @click="cd.close();goShop()">Xem sản phẩm</button></div>
  </template>
  <template v-else>
   <h3>Giỏ hàng</h3>
   <div style="display:grid;gap:10px">
    <div class="ci" v-for="(o,k) in lines" :key="o.id+o.ci">
     <div class="t" v-html="pic(o.p,o.ci)"></div>
     <div><b>{{o.p.name}}</b><small>{{o.p.colors[o.ci].name}} · {{vnd(o.p.price_vnd)}}<template v-if="oos(o.p)"> · <b style="color:#ef4444">Hết hàng</b></template></small>
      <div class="qty"><button @click="chq(o,-1)" aria-label="Giảm">−</button><span>{{o.q}}</span><button @click="chq(o,1)" aria-label="Tăng">+</button></div>
      <div class="cswatch" v-if="o.p.colors.length>1"><button v-for="(c,j) in o.p.colors" :key="c.name" type="button" :class="{on:j==o.ci}" :style="{background:c.hex}" :title="c.name" :aria-label="'Đổi sang màu '+c.name" @click="setColor(o,j)"></button></div></div>
     <div class="rt">{{vnd(o.p.price_vnd*o.q)}}<button @click="rm(o)">Xóa</button></div>
    </div>
   </div>
   <div class="sum"><span>Tiền hàng</span><span>{{vnd(total)}}</span></div>
   <form @submit.prevent="submitOrder">
    <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <div class="f2"><label>Họ tên<input name="n" v-model="fm.n" required autocomplete="name"></label><label>SĐT / Zalo<input name="p" v-model="fm.p" required autocomplete="tel"></label></div>
    <label>Khu vực giao hàng<select name="r" v-model="fm.region"><option value="danang">Đà Nẵng</option><option value="other">Tỉnh / thành phố khác</option></select></label>
    <template v-if="fm.region==='danang'">
     <div class="f2"><label>Số nhà, tên đường<input v-model="fm.street" required autocomplete="address-line1" placeholder="VD: 25 Nguyễn Văn Linh"></label><label>Phường / Xã<input v-model="fm.ward" required autocomplete="address-level2" placeholder="VD: Hòa Thuận Nam"></label></div>
    </template>
    <template v-else>
     <div class="f2"><label>Tỉnh / Thành phố<input v-model="fm.province" required autocomplete="address-level1" placeholder="VD: Huế"></label><label>Số nhà, đường, phường/xã<input v-model="fm.street" required autocomplete="address-line1"></label></div>
    </template>
    <label>Ghi chú (không bắt buộc)<textarea name="g" v-model="fm.g" rows="2"></textarea></label>
    <div class="shipbox">
     <div class="srow"><span>Tiền hàng</span><b>{{vnd(total)}}</b></div>
     <div class="srow"><span>Phí vận chuyển</span><b>{{shipLabel}}</b></div>
     <small class="shipnote">{{shipNote}}</small>
     <div class="srow big"><span>Tổng thanh toán</span><b>{{shipInfo?vnd(grand):'—'}}</b></div>
    </div>
    <button class="btn c" type="submit" :disabled="busy||shipBusy||!shipInfo">{{busy?'Đang gửi…':'Đặt hàng & thanh toán'}}</button>
    <template v-if="orderErr"><p class="res">{{orderErr}}</p><button type="button" class="btn o" @click="copyOrder">Sao chép nội dung đơn để gửi Zalo</button></template>
   </form>
  </template>
 </div>
</dialog>

<div id="toast" :class="{on:toastOn}" role="status">{{toastMsg}}</div>
<div id="pill">
 <a href="#shop"><span class="e">🛍️</span>Shop</a>
 <a href="#custom"><span class="e">✏️</span>Đặt in</a>
 <button class="i" @click="openCart"><span class="e">🧺</span>Giỏ<span id="cc" :class="{z:!count}">{{count}}</span></button>
 <button class="go" @click="openCart" aria-label="Mở giỏ hàng"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
</div>
</template>

<script setup>
import {ref,reactive,computed,watch,nextTick,onMounted} from 'vue'
import {art} from './art.js'
import DOMPurify from 'dompurify'
const ZALO='09xx xxx xxx',BG=['#d6fbf4','#8fe6f2']
const vnd=n=>n.toLocaleString('vi-VN')+'đ'
const products=ref([]),loading=ref(true),loadErr=ref(''),cat=ref('Tất cả'),cart=ref([]),cur=ref(null),done=ref(null)
const pay=ref(null),fm=reactive({n:'',p:'',g:'',region:'danang',province:'',ward:'',street:''}),busy=ref(false),orderErr=ref(''),quoteMsg=ref(''),pd=ref(null),cd=ref(null),toastMsg=ref(''),toastOn=ref(false)
let tt,lastText=''
const cats=computed(()=>['Tất cả',...new Set(products.value.map(p=>p.category))])
const shown=computed(()=>products.value.filter(p=>cat.value=='Tất cả'||p.category==cat.value))
const cs=ref(0)   // vị trí danh mục đầu tiên đang hiện; mỗi lần chỉ hiện 4 danh mục
const chipMove=d=>{cs.value=Math.max(0,Math.min(cs.value+d*4,cats.value.length-4))}
watch(cats,()=>{cs.value=Math.max(0,Math.min(cs.value,cats.value.length-4))})
const PER=8,page=ref(1)   // 8 sản phẩm mỗi trang, áp dụng cho "Tất cả" và từng danh mục
const pageCount=computed(()=>Math.max(1,Math.ceil(shown.value.length/PER)))
const paged=computed(()=>{const c=Math.min(page.value,pageCount.value);return shown.value.slice((c-1)*PER,c*PER)})
function goPage(n){n=Math.max(1,Math.min(n,pageCount.value));if(n===page.value)return;page.value=n;const el=document.getElementById('shop');if(el)el.scrollIntoView({behavior:'smooth',block:'start'})}
let sx=0,sy=0   // vuốt ngang: trái = trang sau, phải = trang trước
const ts=e=>{const t=e.touches[0];sx=t.clientX;sy=t.clientY}
const te=e=>{const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)goPage(page.value+(dx<0?1:-1))}
watch(cat,()=>{page.value=1})
watch(pageCount,c=>{if(page.value>c)page.value=c})
const lines=computed(()=>cart.value.map(o=>({...o,p:products.value.find(p=>p.id==o.id)})).filter(o=>o.p&&o.p.colors[o.ci]))
const total=computed(()=>lines.value.reduce((s,o)=>s+o.p.price_vnd*o.q,0))
const count=computed(()=>lines.value.reduce((s,o)=>s+o.q,0))
const pic=(p,ci=0,meet)=>{const u=p.colors[ci]?.image_url||p.image_url   // màu không có ảnh riêng thì dùng ảnh chính
  if(u)return `<img src="${u}" alt="${p.name}" loading="lazy" decoding="async">`
  const kind=String(p.slug||'').replace(/-[a-z0-9]{4}$/,'')   // sản phẩm mẫu có hình minh họa riêng; sản phẩm mới chưa có ảnh thì hiện hình chờ
  if(KINDS.includes(kind))return art(kind,p.colors[ci]?.hex||'#00bcd4',BG,meet)
  return noImg(meet)}
const KINDS=['pot','fish','stand','dragon','lamp','chess']
const noImg=meet=>`<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid ${meet?'meet':'slice'}" xmlns="http://www.w3.org/2000/svg" style="background:linear-gradient(135deg,#d6fbf4,#8fe6f2)"><g fill="none" stroke="#2b8a9b" stroke-width="6" stroke-linejoin="round" opacity=".55"><path d="M200 88l64 36v72l-64 36-64-36v-72z"/><path d="M136 124l64 36 64-36M200 160v72"/></g><text x="200" y="278" text-anchor="middle" font-family="Outfit,sans-serif" font-size="20" fill="#2b8a9b" opacity=".75">Chưa có ảnh</text></svg>`
function toast(m,ms=1800){toastMsg.value=m;toastOn.value=true;clearTimeout(tt);tt=setTimeout(()=>toastOn.value=false,ms)}
const oos=p=>p.in_stock===false
const OOS_MSG='Sản phẩm này đã hết hàng, vui lòng chọn sản phẩm khác'
function addTo(p,ci,q,msg){   // hết hàng thì không thêm được, chỉ hiện thông báo
  if(oos(p)){toast(OOS_MSG,3200);return false}
  add(p,ci,q);if(msg!=='')toast(msg||'Đã thêm '+p.name);return true
}
const save=()=>{try{localStorage.setItem('cc-cart',JSON.stringify(cart.value))}catch{}}
function add(p,ci,q){const f=cart.value.find(o=>o.id==p.id&&o.ci==ci);f?f.q=Math.min(99,f.q+q):cart.value.push({id:p.id,ci,q});save()}
function setColor(o,j){   // đổi màu ngay trong giỏ; trùng với dòng cùng màu thì gộp số lượng
  if(j===o.ci)return
  const cur=cart.value.find(x=>x.id==o.id&&x.ci==o.ci);if(!cur)return
  const dup=cart.value.find(x=>x.id==o.id&&x.ci==j)
  if(dup){dup.q=Math.min(99,dup.q+cur.q);cart.value=cart.value.filter(x=>x!==cur)}else cur.ci=j
  save()
}
function chq(o,d){const r=cart.value.find(x=>x.id==o.id&&x.ci==o.ci);r.q=Math.max(1,Math.min(99,r.q+d));save()}
function rm(o){cart.value=cart.value.filter(x=>!(x.id==o.id&&x.ci==o.ci));save()}
const openP=p=>{cur.value={p,ci:0,q:1,showDesc:false,html:''};pd.value.showModal()}
DOMPurify.addHook('afterSanitizeAttributes',n=>{if(n.tagName==='A'){n.setAttribute('target','_blank');n.setAttribute('rel','noopener noreferrer')}})
const fixLists=h=>h.replace(/<ol>((?:(?!<\/ol>)[\s\S])*?)<\/ol>/g,(m,i)=>/data-list="bullet"/.test(i)?'<ul>'+i+'</ul>':m)   // Quill 2 dùng <ol> cho cả danh sách chấm
const descCache={}
async function toggleDesc(){   // mô tả chi tiết chỉ tải khi khách bấm xem
  const c=cur.value;c.showDesc=!c.showDesc
  if(!c.showDesc||c.html)return
  if(descCache[c.p.id]){c.html=descCache[c.p.id];return}
  c.html='<p>Đang tải…</p>'
  try{
    const r=await fetch('/api/product?id='+encodeURIComponent(c.p.id));const j=await r.json()
    const h=DOMPurify.sanitize(fixLists(j.content_html||''));descCache[c.p.id]=h;c.html=h||'<p>Chưa có mô tả chi tiết.</p>'
  }catch{c.html='<p>Không tải được mô tả, vui lòng thử lại.</p>';setTimeout(()=>{if(cur.value===c)c.html=''},1500)}
}
const openCart=()=>{if(!cd.value.open)cd.value.showModal()}
const goShop=()=>{location.hash='#shop'}
function toggleTheme(){
  const r=document.documentElement,a=r.getAttribute('data-theme'),dark=a?a=='dark':matchMedia('(prefers-color-scheme:dark)').matches,n=dark?'light':'dark'
  r.setAttribute('data-theme',n);try{localStorage.setItem('cc-theme',n)}catch{};toast(n=='dark'?'Chế độ tối':'Chế độ sáng')
}
async function post(url,data){
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Có lỗi xảy ra, vui lòng thử lại');return j
}
// ---- phí vận chuyển: tự tính khi khách nhập xong địa chỉ (máy chủ tính lại lần nữa lúc đặt hàng) ----
const shipInfo=ref(null),shipBusy=ref(false),shipErr=ref('');let shipT=null,shipSeq=0
const shipPayload=()=>({region:fm.region,province:fm.province.trim(),ward:fm.ward.trim(),street:fm.street.trim()})
const addrReady=()=>fm.region==='danang'?(fm.street.trim().length>=3&&fm.ward.trim().length>=2):(fm.province.trim().length>=2&&fm.street.trim().length>=3)
const addrText=()=>fm.region==='danang'?`${fm.street.trim()}, ${fm.ward.trim()}, Đà Nẵng`:`${fm.street.trim()}, ${fm.province.trim()}`
const resetFm=()=>{fm.n=fm.p=fm.g=fm.province=fm.ward=fm.street='';fm.region='danang';shipInfo.value=null;shipErr.value=''}
function calcShip(){
  clearTimeout(shipT);shipInfo.value=null;shipErr.value='';++shipSeq
  if(!addrReady()){shipBusy.value=false;return}
  shipBusy.value=true;const my=shipSeq
  shipT=setTimeout(async()=>{   // đợi khách ngừng gõ rồi mới hỏi máy chủ
    try{const r=await post('/api/ship',shipPayload());if(my===shipSeq)shipInfo.value=r}
    catch(e){if(my===shipSeq)shipErr.value=e.message||'Không tính được phí vận chuyển, vui lòng thử lại.'}
    if(my===shipSeq)shipBusy.value=false
  },700)
}
watch(()=>[fm.region,fm.province,fm.ward,fm.street],calcShip)
const shipLabel=computed(()=>shipBusy.value?'Đang tính…':shipInfo.value?(shipInfo.value.fee?vnd(shipInfo.value.fee):'Miễn phí'):'—')
const shipNote=computed(()=>shipErr.value||(shipInfo.value?shipInfo.value.note:'Nhập địa chỉ để tính phí vận chuyển'))
const grand=computed(()=>total.value+(shipInfo.value?shipInfo.value.fee:0))
const orderItems=()=>lines.value.map(o=>({product_id:o.id,color:o.p.colors[o.ci].name,quantity:o.q}))
async function submitOrder(e){   // bước 1: hiện QR, chưa lưu đơn
  const hh=lines.value.find(o=>oos(o.p))
  if(hh){orderErr.value=`Sản phẩm "${hh.p.name}" đã hết hàng, vui lòng xóa khỏi giỏ hàng hoặc chọn sản phẩm khác.`;return}
  const d=Object.fromEntries(new FormData(e.target));busy.value=true;orderErr.value=''
  lastText='ĐƠN HÀNG CON CÁ LAB\n'+lines.value.map(o=>`- ${o.p.name} (${o.p.colors[o.ci].name}) x${o.q}: ${vnd(o.p.price_vnd*o.q)}`).join('\n')+`\nTiền hàng: ${vnd(total.value)}\nPhí ship: ${shipLabel.value}\nTổng: ${shipInfo.value?vnd(grand.value):vnd(total.value)}\n\nNgười nhận: ${d.n}\nSĐT: ${d.p}\nĐịa chỉ: ${addrText()}`+(d.g?`\nGhi chú: ${d.g}`:'')
  try{pay.value=await post('/api/orders',{name:fm.n,phone:fm.p,ship:shipPayload(),note:fm.g,hp:d.website,items:orderItems(),step:'prepare'})}
  catch(err){orderErr.value=err.message+'. Bạn có thể sao chép đơn và gửi qua Zalo '+ZALO+'.'}
  busy.value=false
}
async function confirmOrder(){   // khách báo đã chuyển khoản: ghi nhận đơn "chờ shop xác nhận", chưa tính là đã thanh toán
  busy.value=true;orderErr.value=''
  try{
    await post('/api/orders',{step:'confirm',code:pay.value.code,token:pay.value.token})
    pay.value.waiting=true;cart.value=[];save();resetFm();startPoll()
  }catch(err){orderErr.value=err.message}
  busy.value=false
}
watch(cart,()=>{if(!(pay.value&&pay.value.waiting))pay.value=null},{deep:true})   // đang chờ shop xác nhận thì giữ nguyên trang chờ
let pt=null
const stopPoll=()=>{clearInterval(pt);pt=null}
function startPoll(){   // hỏi máy chủ mỗi 3 giây xem tiền đã về chưa, tối đa 45 phút
  stopPoll();const t0=Date.now()
  pt=setInterval(async()=>{
    const p=pay.value
    if(!p||!(p.auto||p.waiting)||Date.now()-t0>45*60*1000){stopPoll();return}
    try{
      const r=await post('/api/orders',{step:'status',code:p.code,token:p.token})
      if(r.paid){
        stopPoll();done.value={code:r.code,total_vnd:r.total_vnd,auto:true};pay.value=null;cart.value=[];save();resetFm()
        if(cd.value&&!cd.value.open)cd.value.showModal()   // khách đã đóng giỏ hàng thì mở lại để báo thành công
      }else if(r.cancelled&&!p.cancelled){p.cancelled=true;stopPoll()}
      else if(r.underpaid&&!p.underpaid)p.underpaid=true
    }catch{}
  },3000)
}
watch(pay,v=>{if(v&&(v.auto||v.waiting))startPoll();else stopPoll()})   // đổi giỏ hàng thì QR cũ không còn đúng số tiền
const copyOrder=()=>navigator.clipboard.writeText(lastText).then(()=>toast('Đã sao chép đơn'),()=>{orderErr.value=lastText})
async function putFile(url,file){
  const fd=new FormData();fd.append('cacheControl','3600');fd.append('',file)
  const r=await fetch(url,{method:'PUT',body:fd});if(!r.ok)throw new Error('upload')
}
async function submitQuote(e){
  const d=Object.fromEntries(new FormData(e.target));busy.value=true;quoteMsg.value=''
  const file=d.f&&d.f.size?d.f:null
  const ext=file?file.name.split('.').pop().toLowerCase():''
  if(file&&(!['stl','obj','3mf','jpg','jpeg','png'].includes(ext)||file.size>50*1024*1024)){
    quoteMsg.value='Chỉ nhận file .stl, .obj, .3mf, .jpg, .png và tối đa 50 MB.';busy.value=false;return
  }
  let sent=false
  try{
    const j=await post('/api/quote',{name:d.n,phone:d.p,has_file:!!file,file_name:file?file.name:'',file_size:file?file.size:0,material:d.m,quantity:+d.q,description:d.d,hp:d.website})
    sent=true
    if(j.upload){quoteMsg.value='Đang tải file lên…';await putFile(j.upload.url,file)}
    quoteMsg.value='Đã gửi yêu cầu! Shop sẽ báo giá trong ngày.';e.target.reset()
  }catch(err){
    if(sent){quoteMsg.value='Đã nhận yêu cầu nhưng tải file thất bại. Bạn gửi file qua Zalo '+ZALO+' giúp shop nhé.';e.target.reset()}
    else{
      const t=`Yêu cầu in 3D:\nTên: ${d.n}\nSĐT: ${d.p}\nFile: ${file?file.name+' (gửi kèm qua Zalo)':d.h}\nVật liệu: ${d.m}\nSố lượng: ${d.q}\nMô tả: ${d.d}`
      try{await navigator.clipboard.writeText(t)}catch{}
      quoteMsg.value=err.message+'. Nội dung đã được sao chép, bạn dán vào Zalo '+ZALO+' để nhận báo giá.'
    }
  }
  busy.value=false
}
onMounted(async()=>{
  try{cart.value=JSON.parse(localStorage.getItem('cc-cart')||'[]')}catch{}
  let had=false
  try{const c=JSON.parse(localStorage.getItem('cc-products')||'null');if(c&&Array.isArray(c.d)&&c.d.length&&Date.now()-c.t<864e5){products.value=c.d;loading.value=false;had=true}}catch{}   // lần sau vào trang hiện ngay
  try{const r=await fetch('/api/products');if(!r.ok)throw 0;const d=await r.json();products.value=d;try{localStorage.setItem('cc-products',JSON.stringify({t:Date.now(),d}))}catch{}}
  catch{if(!had)loadErr.value='Không tải được sản phẩm, vui lòng tải lại trang.'}
  loading.value=false
})
</script>

<style>
.pc.oos .pimg,.pc.oos .pb{opacity:.5;filter:grayscale(.7)}
.pc.oos .btn{cursor:not-allowed}
.buy.dim .mact .btn{opacity:.5;cursor:not-allowed}
#shop{scroll-margin-top:90px}
.pgn{display:flex;justify-content:center;flex-wrap:wrap;gap:8px;margin:26px 0 4px}
.pgn button{min-width:42px;height:42px;padding:0 14px;border-radius:999px;border:1px solid var(--bd);background:transparent;color:var(--ink);font:600 15px Outfit,system-ui,sans-serif;cursor:pointer}
.pgn button.on{background:var(--ink);color:var(--stage);border-color:var(--ink)}
.pgn button:disabled{opacity:.4;cursor:default}
.chipbar{display:flex;align-items:center;gap:8px;min-width:0;max-width:100%}
.chipwin{flex:0 1 470px;width:min(100%,470px);min-width:0;overflow:hidden;padding:3px 0;margin:-3px 0}
.chipbar .chips{display:flex;flex-wrap:nowrap;gap:8px;width:100%;transition:transform .45s cubic-bezier(.4,0,.2,1);transform:translateX(calc(var(--i,0) * -1 * (25% + 2px)))}
.chipbar .chips button{flex:0 0 calc(25% - 6px);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-left:6px;padding-right:6px}
.cnav{flex:none;width:38px;height:38px;border-radius:50%;border:1px solid var(--bd);background:transparent;color:var(--ink);font:600 20px/1 Outfit,system-ui,sans-serif;cursor:pointer;display:grid;place-items:center;padding:0 0 3px}
.cnav:disabled{opacity:.3;cursor:default}
.cswatch{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
.cswatch button{width:22px;height:22px;border-radius:50%;border:1px solid var(--bd);padding:0;cursor:pointer;transition:transform .15s}
.cswatch button:hover{transform:scale(1.15)}
.cswatch button.on{box-shadow:0 0 0 2px var(--stage),0 0 0 4px var(--lc)}
.wait{display:flex;gap:10px;align-items:center;justify-content:center;text-align:center;color:var(--mut);font-size:14px;margin:0}
.spin{width:16px;height:16px;border-radius:50%;border:2px solid var(--bd);border-top-color:var(--lc);animation:ccspin 1s linear infinite;flex:none}
@keyframes ccspin{to{transform:rotate(360deg)}}
.descbtn{margin-top:12px;align-self:flex-start}
.rich{margin-top:10px;padding:14px 16px;border-radius:16px;background:var(--row);max-height:280px;overflow:auto;font-size:15px;line-height:1.6;text-align:left;overflow-wrap:anywhere}
.rich img{max-width:100%;height:auto;border-radius:10px;display:block;margin:8px 0}
.rich p{margin:0 0 .6em}.rich ul,.rich ol{padding-left:22px;margin:0 0 .6em}
.rich a{color:var(--lc);text-decoration:underline}
.shipbox{display:grid;gap:6px;padding:12px 14px;border-radius:16px;background:var(--row)}
.shipbox .srow{display:flex;justify-content:space-between;gap:10px;font-size:15px}
.shipbox .big{font-size:17px;font-weight:700;border-top:1px dashed var(--bd);padding-top:8px;margin-top:2px}
.shipnote{color:var(--mut);font-size:13px;line-height:1.4}
/* ---- màn hình cảm ứng: bỏ hiệu ứng hover (trên điện thoại hover bị "dính" sau khi chạm) ---- */
@media (hover:none){
 html .pc:hover{transform:none;box-shadow:none}
 html .pc:hover .pimg svg,html .pc:hover .pimg img{transform:none}
 html .pc:hover .view{opacity:0}
 html .btn:hover{transform:none;box-shadow:none}
 html .step:hover{transform:none}
 html #tg:hover{transform:none}
 html #pill a:hover,html #pill .i:hover,html .top nav a:hover{background:none}
 html dialog .x:focus,html dialog .x:focus-visible{outline:none}
}
/* iPhone tự phóng to trang khi chạm vào ô nhập có chữ nhỏ hơn 16px, làm lệch giao diện */
@media (pointer:coarse){html body input,html body select,html body textarea{font-size:16px!important}}
/* điện thoại: danh mục là dải cuộn ngang (vuốt), hiện đủ tên, không cắt chữ */
@media (max-width:600px){
 .chipbar{width:100%}
 .chipbar .cnav{display:none}
 .chipwin{flex:1 1 100%;width:100%;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}
 .chipwin::-webkit-scrollbar{display:none}
 .chipbar .chips{width:max-content;transform:none!important;transition:none}
 .chipbar .chips button{flex:0 0 auto;overflow:visible;text-overflow:clip;padding-left:14px;padding-right:14px}
}
/* ---- điện thoại: các lỗi còn sót ---- */
html{-webkit-tap-highlight-color:transparent}
@media (hover:none){
 html .pimg:focus-visible .view{opacity:0}              /* đóng cửa sổ xong, trình duyệt trả tiêu điểm về thẻ làm nhãn "Xem chi tiết" hiện lại */
 html body button:focus-visible,html body a:focus-visible{outline:none}
}
@media (max-width:860px){
 .md .mimg{aspect-ratio:auto;height:34vh;min-height:190px}   /* ảnh không chiếm quá nửa màn hình */
 .md .buy{position:sticky;bottom:0;z-index:3;background:var(--stage);padding:12px 0 calc(12px + env(safe-area-inset-bottom,0px));margin-top:8px;border-top:1px solid var(--bd)}   /* giá và nút Thêm giỏ luôn nằm sát đáy, khỏi phải cuộn */
 .cd{padding:22px 16px}
}
/* ---- biểu tượng ✕ → ‹ › vẽ bằng SVG: nằm đúng giữa nút, giống nhau trên mọi thiết bị ---- */
.x{display:grid;place-items:center;padding:0;line-height:0}
.x svg{width:18px;height:18px}
#pill .go{display:grid;place-items:center;padding:0;line-height:0}
#pill .go svg{width:30px;height:30px}
.cnav{padding:0}
.cnav svg,.pgn button svg{width:18px;height:18px;display:block}
.pgn button{display:inline-grid;place-items:center}
@media(max-width:420px){#pill .go svg{width:26px;height:26px}}
</style>