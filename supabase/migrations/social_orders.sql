-- ĐƠN HÀNG SOCIAL: đơn do shop tự nhập từ các kênh tư vấn (Facebook, Zalo, Tiktok, Insta, trực tiếp)
create table if not exists social_orders(
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  channel text not null check (channel in ('facebook','zalo','tiktok','instagram','direct')),
  address text,
  staff text,                                         -- nhân viên tư vấn
  consult_date date not null default ((now() at time zone 'Asia/Ho_Chi_Minh')::date),
  images jsonb not null default '[]',                 -- danh sách link ảnh khách gửi
  design_deposit_vnd   integer not null default 0 check (design_deposit_vnd   >= 0),   -- tiền cọc phí thiết kế
  design_remaining_vnd integer not null default 0 check (design_remaining_vnd >= 0),   -- phí thiết kế còn lại (nhập ở "Đã đặt hàng")
  order_deposit_vnd    integer not null default 0 check (order_deposit_vnd    >= 0),   -- phí cọc đơn hàng (nhập ở "Đã đặt hàng")
  ship_fee_vnd         integer not null default 0 check (ship_fee_vnd         >= 0),   -- phí ship: tính riêng, KHÔNG vào doanh thu
  remaining_vnd        integer not null default 0 check (remaining_vnd        >= 0),   -- số tiền còn lại của đơn hàng (nhập ở "Đang giao hàng")
  status text not null default 'design_paid' check (status in ('design_paid','ordered','shipping','done','cancelled')),
  cancelled_from text check (cancelled_from in ('design_paid','ordered','shipping')),   -- hủy khi đang ở bước nào
  created_at timestamptz not null default now()
);
alter table social_orders enable row level security;   -- không có policy: chỉ máy chủ (service_role) truy cập
create index if not exists social_orders_date_idx on social_orders (consult_date desc, created_at desc);

-- thống kê: gộp thêm đơn Social. Đơn Social được xếp vào tháng theo NGÀY TƯ VẤN.
-- Khoản tính vào doanh thu của đơn Social (không gồm phí ship):
--   Đã chuyển phí thiết kế : cọc phí thiết kế
--   Đã đặt hàng            : + phí thiết kế còn lại + phí cọc đơn hàng
--   Đang giao / Giao xong  : + số tiền còn lại  (= tổng giá trị đơn hàng)
--   Đã hủy                 : giữ lại phần đã nhận (hủy ở bước 1: cọc thiết kế; hủy ở bước sau: cọc thiết kế + thiết kế còn lại + cọc đơn hàng)
drop function if exists stats_monthly();
create function stats_monthly()
returns table(ym text, orders bigint, shipping bigint, done bigint, cancelled bigint, pending bigint, revenue bigint,
              custom_orders bigint, custom_shipping bigint, custom_done bigint, custom_revenue bigint,
              social_orders bigint, social_shipping bigint, social_done bigint, social_revenue bigint)
language sql stable as $$
  with o as (
    select to_char(created_at at time zone 'Asia/Ho_Chi_Minh','YYYY-MM') as ym,
      count(*) filter (where status <> 'cancelled') as orders,
      count(*) filter (where status = 'shipping')   as shipping,
      count(*) filter (where status = 'done')       as done,
      count(*) filter (where status = 'cancelled')  as cancelled,
      count(*) filter (where status = 'new')        as pending,
      coalesce(sum(total_vnd - shipping_fee_vnd) filter (where status in ('paid','confirmed','shipping','done')), 0) as revenue
    from orders group by 1
  ), q as (
    select to_char(created_at at time zone 'Asia/Ho_Chi_Minh','YYYY-MM') as ym,
      count(*) filter (where status in ('accepted','paid','shipping','done')) as orders,
      count(*) filter (where status = 'shipping') as shipping,
      count(*) filter (where status = 'done')     as done,
      coalesce(sum(price_vnd) filter (where status in ('paid','shipping','done')), 0) as revenue
    from quote_requests group by 1
  ), s as (
    select to_char(consult_date,'YYYY-MM') as ym,
      count(*) filter (where status <> 'cancelled') as orders,
      count(*) filter (where status = 'shipping')   as shipping,
      count(*) filter (where status = 'done')       as done,
      coalesce(sum(case status
        when 'design_paid' then design_deposit_vnd
        when 'ordered'     then design_deposit_vnd + design_remaining_vnd + order_deposit_vnd
        when 'shipping'    then design_deposit_vnd + design_remaining_vnd + order_deposit_vnd + remaining_vnd
        when 'done'        then design_deposit_vnd + design_remaining_vnd + order_deposit_vnd + remaining_vnd
        when 'cancelled'   then case when cancelled_from = 'design_paid' then design_deposit_vnd
                                     else design_deposit_vnd + design_remaining_vnd + order_deposit_vnd end
        else 0 end), 0) as revenue
    from social_orders group by 1
  )
  select coalesce(o.ym, q.ym, s.ym) as ym,
    coalesce(o.orders,0)   + coalesce(q.orders,0)   + coalesce(s.orders,0)   as orders,
    coalesce(o.shipping,0) + coalesce(q.shipping,0) + coalesce(s.shipping,0) as shipping,
    coalesce(o.done,0)     + coalesce(q.done,0)     + coalesce(s.done,0)     as done,
    coalesce(o.cancelled,0) as cancelled,
    coalesce(o.pending,0)   as pending,
    coalesce(o.revenue,0)   + coalesce(q.revenue,0) + coalesce(s.revenue,0)  as revenue,
    coalesce(q.orders,0)    as custom_orders,
    coalesce(q.shipping,0)  as custom_shipping,
    coalesce(q.done,0)      as custom_done,
    coalesce(q.revenue,0)   as custom_revenue,
    coalesce(s.orders,0)    as social_orders,
    coalesce(s.shipping,0)  as social_shipping,
    coalesce(s.done,0)      as social_done,
    coalesce(s.revenue,0)   as social_revenue
  from o
  full outer join q on o.ym = q.ym
  full outer join s on coalesce(o.ym, q.ym) = s.ym
  order by 1
$$;
revoke execute on function stats_monthly() from public, anon, authenticated;
grant execute on function stats_monthly() to service_role;