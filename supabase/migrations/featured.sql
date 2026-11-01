-- sản phẩm nổi bật (đánh dấu sao): được xếp lên đầu danh sách ở trang chủ, kể cả mục "Tất cả"
alter table products add column if not exists is_featured boolean not null default false;