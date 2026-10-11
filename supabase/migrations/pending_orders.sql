-- đơn đang chờ thanh toán (chưa phải đơn thật). Khi nhận được tiền, webhook mới tạo đơn thật trong bảng orders
create table if not exists pending_orders(
 code text primary key,
 payload jsonb not null,                  -- tên, địa chỉ, ghi chú, danh sách sản phẩm (giá lấy từ database lúc đặt)
 total_vnd integer not null,
 phone text not null,
 status text not null default 'pending' check(status in('pending','paid','underpaid')),
 created_at timestamptz not null default now(),
 paid_at timestamptz);
alter table pending_orders enable row level security;   -- không có policy: chỉ server (service_role) truy cập
create index if not exists pending_orders_created_at_idx on pending_orders(created_at);