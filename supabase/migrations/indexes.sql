-- index cho các cột khóa ngoại và sắp xếp, giúp truy vấn đơn hàng nhanh hơn khi dữ liệu nhiều
create index if not exists order_items_order_id_idx on order_items(order_id);
create index if not exists order_items_product_id_idx on order_items(product_id);
create index if not exists product_colors_product_id_idx on product_colors(product_id);
create index if not exists orders_created_at_idx on orders(created_at desc);
create index if not exists quote_requests_created_at_idx on quote_requests(created_at desc);
create index if not exists products_sort_order_idx on products(sort_order);