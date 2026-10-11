-- trạng thái đơn hàng: thêm 'paid' (đã thanh toán)
alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check check(status in('new','paid','confirmed','shipping','done','cancelled'));
-- đơn theo yêu cầu: thêm trạng thái thanh toán / giao hàng
alter table quote_requests drop constraint if exists quote_requests_status_check;
alter table quote_requests add constraint quote_requests_status_check check(status in('new','quoted','accepted','paid','shipping','done','rejected'));
-- Tạo tài khoản admin: Supabase > Authentication > Users > Add user, rồi chạy (đổi email):
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
where email = 'email-cua-ban@gmail.com';
