# Hướng dẫn Chi tiết: Deploy lên Vercel và Setup Custom Domain

## 📋 Checklist trước khi deploy

- [x] Database đã được setup trên Railway
- [x] Schema SQL đã được chạy
- [x] Admin account đã được tạo
- [ ] Code đã được commit lên GitHub
- [ ] Build local thành công
- [ ] Đã có tài khoản Vercel
- [ ] Đã có tên miền (domain) riêng (nếu muốn)

---

## 🚀 Bước 1: Chuẩn bị Code và Push lên GitHub

### 1.1. Kiểm tra code đã được commit

Mở terminal trong thư mục project và chạy:

```bash
git status
```

Nếu thấy "nothing to commit", code đã sẵn sàng. Nếu có thay đổi, commit:

```bash
git add .
git commit -m "Ready for production deployment"
```

### 1.2. Push lên GitHub

Nếu chưa có remote:

```bash
# Tạo repository mới trên GitHub trước
# Sau đó chạy:
git remote add origin https://github.com/yourusername/your-repo.git
git branch -M main
git push -u origin main
```

Nếu đã có remote:

```bash
git push origin main
```

### 1.3. Test build local

```bash
npm run build
```

Nếu build thành công (không có lỗi), bạn đã sẵn sàng deploy!

---

## 🌐 Bước 2: Deploy lên Vercel

### 2.1. Đăng ký/Đăng nhập Vercel

1. Truy cập: **https://vercel.com**
2. Click **"Sign Up"** hoặc **"Log In"**
3. Chọn **"Continue with GitHub"** (khuyến nghị)
4. Authorize Vercel truy cập GitHub của bạn

### 2.2. Import Project từ GitHub

1. Sau khi đăng nhập, bạn sẽ thấy dashboard
2. Click nút **"Add New..."** → **"Project"**
3. Bạn sẽ thấy danh sách repositories từ GitHub
4. Tìm và chọn repository của bạn
5. Click **"Import"**

### 2.3. Cấu hình Project

Trong màn hình cấu hình:

#### Framework Preset
- Vercel sẽ tự động detect **Next.js** ✅
- Không cần thay đổi

#### Root Directory
- Để mặc định: **`./`** ✅

#### Build and Output Settings
- **Build Command**: `npm run build` (mặc định) ✅
- **Output Directory**: `.next` (mặc định) ✅
- **Install Command**: `npm install` (mặc định) ✅

### 2.4. Cấu hình Environment Variables

**QUAN TRỌNG:** Đây là bước quan trọng nhất!

Click vào **"Environment Variables"** và thêm:

#### Option 1: Dùng DATABASE_URL (Khuyến nghị)

1. Click **"Add"** để thêm biến mới
2. Thêm các biến sau:

```
Name: DATABASE_URL
Value: postgresql://postgres:eHguZJntPlzHrCoceWnnWKVZCTHwARtj@containers-us-west-xxx.railway.app:5432/railway?sslmode=require
```

**Lưu ý:** 
- Thay `containers-us-west-xxx.railway.app` bằng **PGHOST** thực tế từ Railway
- Lấy từ Railway Dashboard → PostgreSQL → Variables → `PGHOST`
- Thay password nếu khác

3. Thêm JWT_SECRET:

```
Name: JWT_SECRET
Value: [Tạo secret mạnh - xem bước 2.5]
```

4. Thêm NODE_ENV:

```
Name: NODE_ENV
Value: production
```

#### Option 2: Dùng các biến riêng lẻ

Nếu không dùng DATABASE_URL, thêm từng biến:

```
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=eHguZJntPlzHrCoceWnnWKVZCTHwARtj
JWT_SECRET=[secret mạnh]
NODE_ENV=production
```

**Lưu ý:** 
- Đảm bảo chọn **"Production"** cho tất cả environment variables
- Có thể chọn thêm **"Preview"** và **"Development"** nếu muốn

### 2.5. Tạo JWT_SECRET mạnh

Chạy lệnh này để tạo secret:

```bash
node scripts/generate-jwt-secret.js
```

Hoặc online: https://randomkeygen.com (chọn CodeIgniter Encryption Keys)

Copy secret và paste vào Vercel environment variable.

### 2.6. Deploy!

1. Sau khi đã thêm tất cả environment variables
2. Click nút **"Deploy"** (góc dưới bên phải)
3. Chờ quá trình build (2-5 phút)
4. Bạn sẽ thấy progress bar và logs

### 2.7. Kiểm tra kết quả

Sau khi deploy xong:
- ✅ Bạn sẽ thấy **"Congratulations!"**
- ✅ URL của bạn: `https://your-project.vercel.app`
- ✅ Click vào URL để mở website

---

## 🧪 Bước 3: Test Website

### 3.1. Test cơ bản

1. Truy cập: `https://your-project.vercel.app`
2. Test đăng ký tài khoản mới
3. Test đăng nhập
4. Test các chức năng:
   - Xem danh sách sách
   - Thêm sách (nếu là admin)
   - Mượn sách
   - Trả sách

### 3.2. Test admin account

1. Đăng nhập với:
   - Username: `admin`
   - Password: `admin123`
2. Kiểm tra có quyền admin không (có thể thêm/sửa/xóa sách)

### 3.3. Nếu có lỗi

- Kiểm tra **Vercel Logs**: Vào project → Tab "Logs"
- Kiểm tra **Function Logs**: Vào project → Tab "Functions"
- Kiểm tra environment variables đã đúng chưa

---

## 🌍 Bước 4: Setup Custom Domain (Tên miền riêng)

### 4.1. Yêu cầu

- Đã có tên miền (mua từ Namecheap, GoDaddy, Cloudflare, etc.)
- Domain đã được verify ownership

### 4.2. Thêm Domain vào Vercel

1. Vào **Vercel Dashboard** → Chọn project của bạn
2. Click tab **"Settings"**
3. Click **"Domains"** ở menu bên trái
4. Nhập domain của bạn (ví dụ: `library.example.com` hoặc `example.com`)
5. Click **"Add"**

### 4.3. Cấu hình DNS

Vercel sẽ hiển thị hướng dẫn cấu hình DNS. Có 2 cách:

#### Cách 1: A Record (cho root domain)

Thêm A record trong DNS provider của bạn:

```
Type: A
Name: @ (hoặc để trống)
Value: 76.76.21.21
TTL: Auto (hoặc 3600)
```

#### Cách 2: CNAME Record (cho subdomain - Khuyến nghị)

Thêm CNAME record:

```
Type: CNAME
Name: www (hoặc subdomain khác)
Value: cname.vercel-dns.com
TTL: Auto (hoặc 3600)
```

#### Cách 3: Nameservers (cho toàn bộ domain)

Nếu dùng Cloudflare hoặc muốn quản lý DNS qua Vercel:

1. Thay đổi nameservers tại domain registrar
2. Dùng nameservers của Vercel (sẽ được cung cấp)

### 4.4. Verify Domain

1. Sau khi thêm DNS records, đợi 5-60 phút để DNS propagate
2. Vercel sẽ tự động verify domain
3. Khi thấy status **"Valid Configuration"** → Domain đã sẵn sàng!

### 4.5. SSL Certificate

- Vercel tự động cung cấp **SSL certificate miễn phí** (Let's Encrypt)
- HTTPS sẽ tự động được bật sau khi domain được verify
- Không cần cấu hình thêm

---

## 🔒 Bước 5: Bảo mật và Tối ưu

### 5.1. Kiểm tra HTTPS

- Đảm bảo website chạy trên HTTPS
- Vercel tự động redirect HTTP → HTTPS

### 5.2. Cập nhật JWT_SECRET

- Đảm bảo JWT_SECRET đã được đổi thành giá trị mạnh
- Không dùng secret mặc định

### 5.3. Database Security

- Đảm bảo database connection sử dụng SSL (`?sslmode=require`)
- Không expose database credentials

### 5.4. Environment Variables

- Không commit `.env*` files
- Chỉ set env vars trên Vercel dashboard
- Sử dụng Vercel Secrets cho sensitive data

---

## 📊 Bước 6: Monitoring và Analytics

### 6.1. Vercel Analytics

1. Vào project → Tab **"Analytics"**
2. Bật **"Web Analytics"** (miễn phí)
3. Xem traffic, performance metrics

### 6.2. Logs

- Xem logs real-time: Project → Tab **"Logs"**
- Function logs: Project → Tab **"Functions"**
- Debug errors từ logs

### 6.3. Deployments

- Xem lịch sử deployments: Project → Tab **"Deployments"**
- Rollback về version cũ nếu cần
- Preview deployments cho mỗi commit

---

## 🔄 Bước 7: Continuous Deployment

### 7.1. Tự động Deploy

- Mỗi khi push code lên GitHub → Vercel tự động deploy
- Preview URL cho mỗi Pull Request
- Production URL cập nhật khi merge vào main branch

### 7.2. Workflow

1. Code locally
2. Commit và push lên GitHub
3. Vercel tự động build và deploy
4. Website tự động cập nhật

---

## ✅ Checklist Hoàn thành

- [ ] Code đã được push lên GitHub
- [ ] Build local thành công
- [ ] Đã tạo tài khoản Vercel
- [ ] Đã import project từ GitHub
- [ ] Đã cấu hình environment variables (DATABASE_URL, JWT_SECRET, NODE_ENV)
- [ ] Đã deploy thành công
- [ ] Website hoạt động: `https://your-project.vercel.app`
- [ ] Test đăng ký/đăng nhập thành công
- [ ] Test admin account thành công
- [ ] (Optional) Đã thêm custom domain
- [ ] (Optional) Domain đã được verify và có SSL

---

## 🎉 Hoàn thành!

Website của bạn đã sẵn sàng:
- **URL mặc định**: `https://your-project.vercel.app`
- **Custom domain** (nếu đã setup): `https://your-domain.com`

---

## 🐛 Troubleshooting

### Lỗi: Build failed

**Nguyên nhân:** TypeScript errors, missing dependencies
**Giải pháp:** 
- Test build local: `npm run build`
- Fix errors và push lại

### Lỗi: Database connection failed

**Nguyên nhân:** Environment variables sai
**Giải pháp:**
- Kiểm tra DATABASE_URL trên Vercel
- Đảm bảo dùng public hostname (không phải `postgres.railway.internal`)
- Kiểm tra password đúng

### Lỗi: 500 Internal Server Error

**Nguyên nhân:** Database chưa có schema, JWT_SECRET sai
**Giải pháp:**
- Chạy schema SQL trên production database
- Kiểm tra JWT_SECRET đã được set

### Domain không hoạt động

**Nguyên nhân:** DNS chưa propagate
**Giải pháp:**
- Đợi 5-60 phút
- Kiểm tra DNS records đúng chưa
- Dùng tool: https://dnschecker.org

---

**Chúc bạn deploy thành công! 🚀**

