-- thống kê theo tháng cho trang Tổng quan (giờ Việt Nam). Chỉ máy chủ (service_role) gọi được.
create or replace function stats_monthly()
returns table(ym text, orders bigint, shipping bigint, done bigint, cancelled bigint, pending bigint, revenue bigint)
language sql stable as $$
  select
    to_char(created_at at time zone 'Asia/Ho_Chi_Minh','YYYY-MM') as ym,
    count(*) filter (where status <> 'cancelled') as orders,          -- tổng đơn: không tính đơn đã hủy
    count(*) filter (where status = 'shipping')   as shipping,
    count(*) filter (where status = 'done')       as done,
    count(*) filter (where status = 'cancelled')  as cancelled,
    count(*) filter (where status = 'new')        as pending,
    -- doanh thu = tiền hàng, KHÔNG gồm phí ship, chỉ tính đơn đã nhận tiền
    coalesce(sum(total_vnd - shipping_fee_vnd) filter (where status in ('paid','confirmed','shipping','done')), 0) as revenue
  from orders
  group by 1
  order by 1
$$;
revoke execute on function stats_monthly() from public, anon, authenticated;
grant execute on function stats_monthly() to service_role;