1. Tạo project Supabase, chạy `supabase/migrations/001_init.sql` trong SQL Editor.
2. Copy `.env.example` thành `.env`, điền khóa Supabase (service_role), thông tin ngân hàng (BANK_ID theo VietQR, ví dụ MB, VCB), Telegram bot.
3. `npm i` rồi `npx vercel dev` để chạy thử; `vercel --prod` để triển khai (thêm các biến môi trường trên Vercel).
Cấu trúc: `src/` giao diện, `api/` hàm serverless (products, orders, quote), `supabase/` SQL.

## Trang admin (/admin)
1. Chạy thêm `supabase/migrations/002_admin.sql`.
2. Supabase > Authentication > Users > Add user (email + mật khẩu), rồi chạy câu lệnh `update auth.users ... role admin` ở cuối file admin với email vừa tạo.
3. Vào `https://tên-miền/admin` để đăng nhập.
