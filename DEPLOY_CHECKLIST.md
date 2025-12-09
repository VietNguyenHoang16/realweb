# ✅ Checklist Triển khai lên Vercel

## Bước 1: Chuẩn bị Database (Railway/Supabase/Neon)

- [ ] Đăng ký tài khoản Railway/Supabase/Neon
- [ ] Tạo PostgreSQL database
- [ ] Lấy connection string hoặc thông tin kết nối:
  - [ ] `DATABASE_URL` (connection string) HOẶC
  - [ ] `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- [ ] Chạy schema SQL (`lib/db-schema.sql`) trên production database
  - [ ] Xem hướng dẫn chi tiết: [DEPLOY_DATABASE_SETUP.md](./DEPLOY_DATABASE_SETUP.md)
  - [ ] Cách dễ nhất: Copy/paste vào SQL Editor trên Railway/Supabase/Neon
  - [ ] Hoặc dùng script: `npm run run-schema-prod` (cần set DATABASE_URL)
- [ ] Test kết nối database

## Bước 2: Chuẩn bị Code

- [ ] Code đã được commit lên GitHub
- [ ] Test build local: `npm run build` (thành công)
- [ ] Đảm bảo `.env.local` không bị commit (đã có trong `.gitignore`)

## Bước 3: Deploy lên Vercel

- [ ] Đăng ký/Đăng nhập Vercel (https://vercel.com)
- [ ] Import project từ GitHub
- [ ] Cấu hình Environment Variables trên Vercel:
  - [ ] `DATABASE_URL` HOẶC (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`)
  - [ ] `JWT_SECRET` (dùng `npm run generate-secret` để tạo)
  - [ ] `NODE_ENV=production`
- [ ] Click Deploy
- [ ] Chờ build hoàn tất (2-5 phút)

## Bước 4: Khởi tạo Production Database

- [ ] Database schema đã được chạy trên production database
- [ ] Tạo admin account trên production:
  - [ ] Cập nhật `.env.local` với production database credentials
  - [ ] Chạy: `node scripts/create-admin.js`
  - [ ] Hoặc tạo admin qua SQL trực tiếp

## Bước 5: Kiểm tra

- [ ] Truy cập website: `https://your-project.vercel.app`
- [ ] Test đăng ký tài khoản mới
- [ ] Test đăng nhập
- [ ] Test các chức năng:
  - [ ] Xem danh sách sách
  - [ ] Thêm sách (nếu là admin)
  - [ ] Mượn sách
  - [ ] Trả sách
- [ ] Đăng nhập với admin account
- [ ] Kiểm tra dashboard

## Bước 6: Bảo mật

- [ ] JWT_SECRET đã được đổi thành giá trị mạnh (32+ ký tự)
- [ ] Database connection sử dụng SSL (`?sslmode=require`)
- [ ] Không có thông tin nhạy cảm trong code/public
- [ ] Environment variables chỉ set trên Vercel (không commit)

## 🎉 Hoàn thành!

Website của bạn đã sẵn sàng: `https://your-project.vercel.app`

---

**Lưu ý:** 
- Mỗi lần push code mới, Vercel sẽ tự động deploy
- Có thể xem logs trên Vercel dashboard nếu có lỗi
- Có thể rollback về deployment cũ nếu cần

