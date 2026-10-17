-- giá của đơn theo yêu cầu: nhập khi chuyển sang "Khách đồng ý", được cộng vào doanh thu
alter table quote_requests add column if not exists price_vnd integer check (price_vnd is null or price_vnd >= 0);

-- thống kê: doanh thu gộp tiền hàng của đơn có sẵn (không gồm phí ship) và giá đơn theo yêu cầu đã được khách đồng ý
drop function if exists stats_monthly();
create function stats_monthly()
returns table(ym text, orders bigint, shipping bigint, done bigint, cancelled bigint, pending bigint, revenue bigint,
              custom_orders bigint, custom_shipping bigint, custom_done bigint, custom_revenue bigint)
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
      coalesce(sum(price_vnd) filter (where status in ('accepted','paid','shipping','done')), 0) as revenue
    from quote_requests group by 1
  )
  select coalesce(o.ym, q.ym) as ym,
    coalesce(o.orders,0)   + coalesce(q.orders,0)   as orders,
    coalesce(o.shipping,0) + coalesce(q.shipping,0) as shipping,
    coalesce(o.done,0)     + coalesce(q.done,0)     as done,
    coalesce(o.cancelled,0) as cancelled,
    coalesce(o.pending,0)   as pending,
    coalesce(o.revenue,0)   + coalesce(q.revenue,0) as revenue,
    coalesce(q.orders,0)    as custom_orders,
    coalesce(q.shipping,0)  as custom_shipping,
    coalesce(q.done,0)      as custom_done,
    coalesce(q.revenue,0)   as custom_revenue
  from o full outer join q on o.ym = q.ym
  order by 1
$$;
revoke execute on function stats_monthly() from public, anon, authenticated;
grant execute on function stats_monthly() to service_role;