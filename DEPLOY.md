# Hướng dẫn Triển khai lên Vercel

Hướng dẫn chi tiết để triển khai ứng dụng Quản lý Thư viện lên Vercel với PostgreSQL.

## 📋 Yêu cầu

- Tài khoản GitHub/GitLab/Bitbucket
- Tài khoản Vercel (miễn phí)
- Tài khoản database service (Railway, Supabase, hoặc Neon - miễn phí)

## 🗄️ Bước 1: Thiết lập PostgreSQL Database

Vercel không hỗ trợ PostgreSQL trực tiếp, bạn cần sử dụng service bên thứ 3. Có 3 lựa chọn:

### Lựa chọn A: Railway (Khuyến nghị - Dễ nhất)

1. **Đăng ký tài khoản**
   - Truy cập: https://railway.app
   - Đăng nhập bằng GitHub

2. **Tạo PostgreSQL Database**
   - Click "New Project"
   - Chọn "Add Service" → "Database" → "PostgreSQL"
   - Railway sẽ tự động tạo database

3. **Lấy thông tin kết nối**
   - Click vào PostgreSQL service
   - Vào tab "Variables"
   - Copy các giá trị:
     - `PGHOST`
     - `PGPORT`
     - `PGDATABASE`
     - `PGUSER`
     - `PGPASSWORD`
   - Hoặc copy `DATABASE_URL` (connection string đầy đủ)

4. **Khởi tạo Schema**
   - Vào tab "Data" → "Query"
   - Copy nội dung file `lib/db-schema.sql`
   - Paste và chạy query
   - Hoặc sử dụng Railway CLI để chạy script

### Lựa chọn B: Supabase (Miễn phí, có dashboard)

1. **Đăng ký**: https://supabase.com
2. **Tạo project mới**
3. **Lấy connection string** từ Settings → Database
4. **Chạy schema SQL** trong SQL Editor

### Lựa chọn C: Neon (Serverless PostgreSQL)

1. **Đăng ký**: https://neon.tech
2. **Tạo project mới**
3. **Lấy connection string**
4. **Chạy schema SQL**

## 🚀 Bước 2: Chuẩn bị Code

### 2.1. Đảm bảo code đã được commit lên GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### 2.2. Kiểm tra build local

```bash
npm run build
```

Nếu build thành công, bạn đã sẵn sàng deploy!

## 🔧 Bước 3: Triển khai lên Vercel

### 3.1. Đăng ký/Đăng nhập Vercel

1. Truy cập: https://vercel.com
2. Đăng nhập bằng GitHub/GitLab/Bitbucket

### 3.2. Import Project

1. Click "Add New..." → "Project"
2. Import repository từ GitHub
3. Chọn repository của bạn
4. Click "Import"

### 3.3. Cấu hình Environment Variables

Trong màn hình cấu hình project, thêm các biến môi trường:

#### Nếu dùng DATABASE_URL (connection string):

```
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
JWT_SECRET=your-very-strong-secret-key-minimum-32-characters-long
NODE_ENV=production
```

#### Nếu dùng các biến riêng lẻ:

```
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
JWT_SECRET=your-very-strong-secret-key-minimum-32-characters-long
NODE_ENV=production
```

**Lưu ý quan trọng:**
- `JWT_SECRET`: Tạo một chuỗi ngẫu nhiên mạnh (ít nhất 32 ký tự)
  - Có thể dùng: `openssl rand -base64 32`
  - Hoặc online: https://randomkeygen.com
- `DATABASE_URL`: Nếu database yêu cầu SSL, thêm `?sslmode=require` vào cuối

### 3.4. Cấu hình Build Settings

Vercel sẽ tự động detect Next.js, nhưng đảm bảo:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (mặc định)
- **Output Directory**: `.next` (mặc định)
- **Install Command**: `npm install` (mặc định)

### 3.5. Deploy

1. Click "Deploy"
2. Chờ quá trình build hoàn tất (2-5 phút)
3. Vercel sẽ cung cấp URL: `https://your-project.vercel.app`

## 🗄️ Bước 4: Khởi tạo Database Schema

Sau khi deploy, bạn cần chạy schema SQL trên production database.

**📖 Xem hướng dẫn chi tiết:** [DEPLOY_DATABASE_SETUP.md](./DEPLOY_DATABASE_SETUP.md)

### Tóm tắt nhanh:

#### Cách 1: Sử dụng Dashboard (Dễ nhất - Khuyến nghị)

**Railway:**
1. Vào project → PostgreSQL service → Tab "Data" hoặc "Query"
2. Copy toàn bộ nội dung file `lib/db-schema.sql`
3. Paste vào editor và click "Run"

**Supabase:**
1. Vào project → SQL Editor
2. Copy toàn bộ nội dung file `lib/db-schema.sql`
3. Paste và click "Run"

**Neon:**
1. Vào project → SQL Editor
2. Copy toàn bộ nội dung file `lib/db-schema.sql`
3. Paste và click "Run"

#### Cách 2: Sử dụng Node.js Script

```bash
# Thêm DATABASE_URL vào .env.local
DATABASE_URL=postgresql://user:password@host:port/database

# Chạy script
npm run run-schema-prod
```

#### Cách 3: Sử dụng psql (local)

```bash
psql "your-database-connection-string" -f lib/db-schema.sql
```

**Xem hướng dẫn chi tiết từng bước:** [DEPLOY_DATABASE_SETUP.md](./DEPLOY_DATABASE_SETUP.md)

### Cách 4: Tạo API endpoint tạm thời (chỉ dùng 1 lần)

Tạo file `app/api/admin/init-db/route.ts` (sẽ xóa sau):

```typescript
import { initDatabase } from '@/lib/init-db';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Bảo vệ bằng secret key
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.INIT_DB_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initDatabase();
    return NextResponse.json({ message: 'Database initialized' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

Thêm `INIT_DB_SECRET` vào Vercel env vars, gọi API một lần, sau đó xóa endpoint.

## 👤 Bước 5: Tạo Admin Account

Sau khi database đã có schema, tạo admin account:

### Cách 1: Sử dụng script local (kết nối production DB)

1. Tạo file `.env.production.local`:
```env
DB_HOST=your-production-host
DB_PORT=5432
DB_NAME=your-production-db
DB_USER=your-production-user
DB_PASSWORD=your-production-password
```

2. Chạy script:
```bash
node scripts/create-admin.js
```

### Cách 2: Sử dụng SQL trực tiếp

```sql
-- Hash password 'admin123' trước (hoặc dùng script)
INSERT INTO users (username, email, password_hash, full_name, role)
VALUES (
  'admin',
  'admin@library.com',
  '$2a$10$...', -- Hash của 'admin123'
  'Administrator',
  'admin'
);
```

Hoặc đơn giản hơn: Đăng ký tài khoản bình thường, sau đó update role:

```sql
UPDATE users SET role = 'admin' WHERE username = 'your-username';
```

## ✅ Bước 6: Kiểm tra và Test

1. **Truy cập website**: `https://your-project.vercel.app`
2. **Test đăng ký**: Tạo tài khoản mới
3. **Test đăng nhập**: Đăng nhập với tài khoản vừa tạo
4. **Test các chức năng**:
   - Xem danh sách sách
   - Thêm sách (nếu là admin)
   - Mượn sách
   - Trả sách

## 🔒 Bước 7: Bảo mật Production

### 7.1. Tạo JWT Secret mạnh

```bash
# Trên Linux/Mac
openssl rand -base64 32

# Hoặc online
# https://randomkeygen.com
```

### 7.2. Kiểm tra Environment Variables

Đảm bảo các biến nhạy cảm không bị commit:
- ✅ `.env.local` đã có trong `.gitignore`
- ✅ Không commit `.env*` files
- ✅ Chỉ set env vars trên Vercel dashboard

### 7.3. Database Security

- ✅ Sử dụng SSL connection (`sslmode=require`)
- ✅ Không expose database credentials
- ✅ Sử dụng connection pooling
- ✅ Giới hạn IP access nếu có thể (Railway/Supabase có sẵn)

## 🔄 Bước 8: Cập nhật và Redeploy

Mỗi khi push code mới lên GitHub:

1. Vercel tự động detect changes
2. Tự động build và deploy
3. Preview URL cho mỗi commit
4. Production URL cập nhật sau khi merge

## 🐛 Troubleshooting

### Lỗi: Database connection failed

**Nguyên nhân:**
- Environment variables chưa được set đúng
- Database chưa cho phép connection từ Vercel IP
- SSL mode chưa được cấu hình

**Giải pháp:**
1. Kiểm tra env vars trên Vercel dashboard
2. Kiểm tra database firewall settings
3. Thêm `?sslmode=require` vào DATABASE_URL

### Lỗi: Build failed

**Nguyên nhân:**
- TypeScript errors
- Missing dependencies
- Build command sai

**Giải pháp:**
1. Test build local: `npm run build`
2. Kiểm tra logs trên Vercel
3. Fix errors và push lại

### Lỗi: 500 Internal Server Error

**Nguyên nhân:**
- Database chưa được khởi tạo
- Environment variables thiếu
- JWT secret không hợp lệ

**Giải pháp:**
1. Kiểm tra Vercel function logs
2. Đảm bảo database schema đã chạy
3. Kiểm tra tất cả env vars

## 📊 Monitoring

Vercel cung cấp:
- **Analytics**: Traffic, performance
- **Logs**: Function logs, errors
- **Deployments**: History, rollback

## 💰 Chi phí

- **Vercel**: Miễn phí cho personal projects
  - 100GB bandwidth/month
  - Unlimited deployments
  - Custom domains
  
- **Railway**: $5/month sau free trial
  - Hoặc $0.20/GB storage + $0.01/GB transfer

- **Supabase**: Miễn phí tier tốt
  - 500MB database
  - 2GB bandwidth

## 🔗 Tài liệu tham khảo

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Railway Docs: https://docs.railway.app
- Supabase Docs: https://supabase.com/docs

## 📝 Checklist Triển khai

- [ ] Database service đã được tạo (Railway/Supabase/Neon)
- [ ] Database schema đã được chạy
- [ ] Code đã được push lên GitHub
- [ ] Vercel project đã được tạo
- [ ] Environment variables đã được set
- [ ] Build thành công trên Vercel
- [ ] Database schema đã chạy trên production
- [ ] Admin account đã được tạo
- [ ] Website hoạt động bình thường
- [ ] JWT_SECRET đã được đổi thành giá trị mạnh
- [ ] SSL connection đã được bật

---

**Chúc bạn triển khai thành công! 🎉**

