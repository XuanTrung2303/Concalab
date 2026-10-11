-- ảnh riêng cho từng màu + thứ tự màu (position 0 = màu mặc định, dùng ảnh chính của sản phẩm)
alter table product_colors add column if not exists image_url text;
alter table product_colors add column if not exists position integer not null default 0;
update product_colors pc set position = t.rn - 1
from (select id, row_number() over (partition by product_id order by ctid) rn from product_colors) t
where pc.id = t.id;