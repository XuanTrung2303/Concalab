-- nhiều ảnh cho sản phẩm và cho từng màu phụ. image_url vẫn là ảnh bìa (ảnh đầu tiên) để thẻ sản phẩm, giỏ hàng, đơn hàng dùng như cũ.
alter table products       add column if not exists images jsonb not null default '[]';
alter table product_colors add column if not exists images jsonb not null default '[]';
-- chuyển ảnh hiện có thành ảnh đầu tiên của danh sách
update products       set images = jsonb_build_array(image_url) where image_url is not null and images = '[]'::jsonb;
update product_colors set images = jsonb_build_array(image_url) where image_url is not null and images = '[]'::jsonb;