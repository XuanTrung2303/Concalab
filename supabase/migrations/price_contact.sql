-- giá "liên hệ": sản phẩm không bán trực tiếp, khách liên hệ fanpage hoặc Zalo để được báo giá
alter table products add column if not exists price_contact boolean not null default false;