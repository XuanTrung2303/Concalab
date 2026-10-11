-- mô tả chi tiết (HTML từ trình soạn thảo). Cột has_content để trang chủ biết có hiện nút "Xem mô tả" hay không mà không phải tải cả nội dung
alter table products add column if not exists content_html text;
alter table products add column if not exists has_content boolean generated always as (coalesce(length(btrim(content_html)),0)>0) stored;