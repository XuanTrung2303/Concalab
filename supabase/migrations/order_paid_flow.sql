-- đơn chỉ được lưu sau khi khách báo đã chuyển khoản => mặc định là "đã thanh toán"
update orders set status='paid' where status in('new','confirmed');
alter table orders alter column status set default 'paid';