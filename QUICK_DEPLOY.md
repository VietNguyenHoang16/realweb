# 🚀 Quick Deploy Guide - Triển khai nhanh lên Vercel

## Checklist nhanh (5 phút)

### ✅ Đã hoàn thành:
- [x] Database Railway đã setup
- [x] Schema SQL đã chạy
- [x] Admin account đã tạo

### 📝 Cần làm:

#### 1. Push code lên GitHub (2 phút)

```bash
# Kiểm tra status
git status

# Nếu có thay đổi, commit
git add .
git commit -m "Ready for production"

# Push lên GitHub
git push origin main
```

#### 2. Deploy lên Vercel (3 phút)

1. **Đăng nhập Vercel**: https://vercel.com
2. **Import project** từ GitHub
3. **Thêm Environment Variables**:
   ```
   DATABASE_URL=postgresql://postgres:password@host:port/database?sslmode=require
   JWT_SECRET=[chạy: node scripts/generate-jwt-secret.js]
   NODE_ENV=production
   ```
4. **Click Deploy**
5. **Đợi 2-5 phút** → Xong! 🎉

#### 3. Test website

- Truy cập: `https://your-project.vercel.app`
- Đăng nhập với: `admin` / `admin123`
- Test các chức năng

---

## 🔑 Lấy thông tin Database từ Railway

1. Vào Railway Dashboard
2. Click PostgreSQL service
3. Tab "Variables"
4. Copy:
   - `PGHOST` → dùng trong DATABASE_URL
   - `PGPORT` → thường là 5432
   - `PGDATABASE` → thường là railway
   - `PGUSER` → thường là postgres
   - `PGPASSWORD` → password của bạn

**Tạo DATABASE_URL:**
```
postgresql://PGUSER:PGPASSWORD@PGHOST:PGPORT/PGDATABASE?sslmode=require
```

---

## 🌐 Setup Custom Domain (Optional)

1. Vào Vercel → Project → Settings → Domains
2. Thêm domain của bạn
3. Cấu hình DNS theo hướng dẫn
4. Đợi verify (5-60 phút)

---

**Xem hướng dẫn chi tiết:** [DEPLOY_VERCEL_STEP_BY_STEP.md](./DEPLOY_VERCEL_STEP_BY_STEP.md)

