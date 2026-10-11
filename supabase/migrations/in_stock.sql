-- trạng thái hết hàng
alter table products add column if not exists in_stock boolean not null default true;
-- sản phẩm nào đang gõ nhãn "Hết hàng" thì chuyển sang trạng thái hết hàng
update products set in_stock=false where badge ilike '%hết hàng%';