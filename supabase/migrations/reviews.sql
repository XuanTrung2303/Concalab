-- ĐÁNH GIÁ SẢN PHẨM của khách hàng (sao 1 đến 5, bước 0,5), có thể kèm nhiều ảnh
create table if not exists reviews(
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  customer_name text not null,
  content text not null,
  rating numeric(2,1) not null check (rating between 1 and 5 and rating * 2 = floor(rating * 2)),
  images jsonb not null default '[]',
  created_at timestamptz not null default now()
);
alter table reviews enable row level security;   -- không có policy: chỉ máy chủ (service_role) đọc/ghi
create index if not exists reviews_product_idx on reviews (product_id, created_at desc);
create index if not exists reviews_rating_idx on reviews (rating);

-- điểm trung bình và số lượt đánh giá của từng sản phẩm, tự cập nhật mỗi khi có đánh giá mới hoặc bị xóa
alter table products add column if not exists rating_avg   numeric(2,1) not null default 0;
alter table products add column if not exists rating_count integer      not null default 0;

create or replace function refresh_product_rating() returns trigger language plpgsql as $$
declare pid uuid;
begin
  if tg_op = 'DELETE' then pid := old.product_id; else pid := new.product_id; end if;
  update products p set
    rating_avg   = coalesce((select round(avg(rating)::numeric, 1) from reviews where product_id = pid), 0),
    rating_count = (select count(*) from reviews where product_id = pid)
  where p.id = pid;
  return null;
end $$;
drop trigger if exists reviews_rating_aid on reviews;
create trigger reviews_rating_aid after insert or delete on reviews for each row execute function refresh_product_rating();

-- kho ảnh đánh giá: công khai để hiển thị, mỗi ảnh tối đa 3 MB, chỉ nhận jpg/png/webp
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('reviews', 'reviews', true, 3145728, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 3145728, allowed_mime_types = array['image/jpeg','image/png','image/webp'];