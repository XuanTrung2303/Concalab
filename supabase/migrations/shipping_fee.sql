-- phí vận chuyển của từng đơn (đã tính vào total_vnd)
alter table orders add column if not exists shipping_fee_vnd integer not null default 0;