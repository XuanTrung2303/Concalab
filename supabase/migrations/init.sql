create table products(
 id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, category text not null,
 description text, price_vnd integer not null check(price_vnd>=0), size_mm text, material text, badge text,
 image_url text, is_active boolean not null default true, sort_order integer not null default 0, created_at timestamptz default now());
create table product_colors(
 id uuid primary key default gen_random_uuid(), product_id uuid not null references products(id) on delete cascade, name text not null, hex text not null);
create sequence order_seq;
create or replace function next_order_code() returns text language sql as
 $$ select 'CCL-'||to_char(now() at time zone 'Asia/Ho_Chi_Minh','YYMMDD')||'-'||lpad(nextval('order_seq')::text,3,'0') $$;
create table orders(
 id uuid primary key default gen_random_uuid(), code text unique not null, customer_name text not null, phone text not null,
 address text not null, note text, total_vnd integer not null,
 status text not null default 'new' check(status in('new','confirmed','shipping','done','cancelled')), created_at timestamptz default now());
create table order_items(
 id uuid primary key default gen_random_uuid(), order_id uuid not null references orders(id) on delete cascade,
 product_id uuid references products(id) on delete set null, product_name text not null, color_name text,
 unit_price_vnd integer not null, quantity integer not null check(quantity between 1 and 99));
create table quote_requests(
 id uuid primary key default gen_random_uuid(), customer_name text not null, phone text not null, has_file boolean default false,
 material text, quantity integer, description text, file_path text,
 status text not null default 'new' check(status in('new','quoted','accepted','rejected')), created_at timestamptz default now());

-- RLS bật cho mọi bảng; anon chỉ đọc sản phẩm đang bán + màu của chúng
alter table products enable row level security; alter table product_colors enable row level security;
alter table orders enable row level security; alter table order_items enable row level security; alter table quote_requests enable row level security;
create policy "anon read active products" on products for select to anon using(is_active);
create policy "anon read active colors" on product_colors for select to anon using(exists(select 1 from products p where p.id=product_id and p.is_active));
-- orders / order_items / quote_requests: không có policy => chỉ service_role (API server) truy cập được

insert into storage.buckets(id,name,public) values('products','products',true),('models','models',false) on conflict do nothing;

insert into products(slug,name,category,description,price_vnd,size_mm,material,badge,sort_order) values
('pot','Chậu cây mini','Trang trí','Chậu in lớp mịn, có đĩa hứng nước, hợp sen đá và xương rồng.',69000,'110 × 110','PLA','Còn hàng',1),
('fish','Móc khóa Con Cá','Quà tặng','Móc khóa hình cá nhỏ xinh, bền, nhẹ, có thể khắc tên.',35000,'60 × 30','PETG','Bán chạy',2),
('stand','Giá đỡ điện thoại','Phụ kiện','Đỡ điện thoại và máy tính bảng, góc nghiêng 60°, chống trượt.',79000,'90 × 80','PETG','Còn hàng',3),
('dragon','Rồng articulated','Mô hình','Rồng khớp linh hoạt, in một lần không cần lắp ráp, uốn được nhiều tư thế.',149000,'250 × 60','PLA','Bán chạy',4),
('lamp','Đèn ngủ lithophane','Trang trí','Hình ảnh hiện lên khi bật đèn, có thể in theo ảnh của bạn.',249000,'150 × 150','PLA','Nhận in ảnh riêng',5),
('chess','Bộ cờ vua in 3D','Mô hình','Đủ 32 quân, chi tiết sắc nét, có bàn cờ gấp gọn đi kèm.',289000,'200 × 200','PLA','Còn hàng',6);

insert into product_colors(product_id,name,hex)
select p.id,c.name,c.hex from(values
('pot','Xanh cyan','#00bcd4'),('pot','Trắng','#f4f6f7'),('pot','Cam','#ff8a3d'),('pot','Hồng','#ff7eb6'),
('fish','Xanh cyan','#00bcd4'),('fish','Cam','#ff8a3d'),('fish','Hồng','#ff7eb6'),('fish','Đen','#2b3a42'),
('stand','Đen','#2b3a42'),('stand','Trắng','#f4f6f7'),('stand','Xanh cyan','#00bcd4'),('stand','Tím','#8b7bf0'),
('dragon','Xanh lá','#4fc27a'),('dragon','Cam','#ff8a3d'),('dragon','Tím','#8b7bf0'),('dragon','Xanh cyan','#00bcd4'),
('lamp','Trắng','#f4f6f7'),('lamp','Đen','#2b3a42'),('lamp','Vàng','#ffc83d'),
('chess','Đen','#2b3a42'),('chess','Trắng','#f4f6f7'),('chess','Xanh cyan','#00bcd4'),('chess','Cam','#ff8a3d')
) c(slug,name,hex) join products p on p.slug=c.slug;
