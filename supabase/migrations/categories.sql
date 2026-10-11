-- danh mục sản phẩm (sản phẩm vẫn lưu tên danh mục ở cột products.category)
create table if not exists categories(
 id uuid primary key default gen_random_uuid(), name text unique not null,
 is_visible boolean not null default true, sort_order integer not null default 0, created_at timestamptz default now());
alter table categories enable row level security;   -- không có policy: chỉ server (service_role) truy cập
-- tạo sẵn các danh mục từ sản phẩm hiện có
insert into categories(name,sort_order)
select category, (row_number() over(order by min(sort_order)))::int from products where category is not null and category<>'' group by category
on conflict (name) do nothing;