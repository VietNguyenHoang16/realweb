# Hướng dẫn Chi tiết: Chạy Schema SQL trên Production Database

Hướng dẫn từng bước để chạy file `lib/db-schema.sql` trên production database.

## 📋 Tổng quan

File `lib/db-schema.sql` chứa các lệnh SQL để tạo:
- Bảng `users` (người dùng)
- Bảng `books` (sách)
- Bảng `loans` (phiếu mượn)
- Bảng `loan_history` (lịch sử mượn)
- Indexes và Triggers

---

## 🚂 Cách 1: Railway (Khuyến nghị - Dễ nhất)

### Bước 1: Truy cập Railway Dashboard

1. Đăng nhập vào https://railway.app
2. Chọn project chứa PostgreSQL database của bạn
3. Click vào service **PostgreSQL**

### Bước 2: Mở Query Editor

1. Ở menu bên trái, click tab **"Data"** hoặc **"Query"**
2. Bạn sẽ thấy một text editor để nhập SQL

### Bước 3: Copy và Paste Schema SQL

1. Mở file `lib/db-schema.sql` trên máy tính của bạn
2. **Copy toàn bộ nội dung** (Ctrl+A, Ctrl+C)
3. **Paste vào Query Editor** trên Railway (Ctrl+V)

### Bước 4: Chạy Query

1. Click nút **"Run"** hoặc **"Execute"** (thường ở góc trên bên phải)
2. Đợi vài giây để query chạy xong
3. Bạn sẽ thấy thông báo thành công: "Success" hoặc "Query executed successfully"

### Bước 5: Kiểm tra kết quả

1. Vào tab **"Tables"** hoặc **"Schema"**
2. Bạn sẽ thấy 4 bảng mới:
   - `users`
   - `books`
   - `loans`
   - `loan_history`

✅ **Hoàn thành!** Database schema đã được tạo.

---

## 🔥 Cách 2: Supabase

### Bước 1: Truy cập Supabase Dashboard

1. Đăng nhập vào https://supabase.com
2. Chọn project của bạn
3. Ở menu bên trái, click **"SQL Editor"**

### Bước 2: Tạo New Query

1. Click nút **"New query"** (góc trên bên trái)
2. Một editor SQL sẽ hiện ra

### Bước 3: Copy và Paste Schema SQL

1. Mở file `lib/db-schema.sql` trên máy tính
2. **Copy toàn bộ nội dung** (Ctrl+A, Ctrl+C)
3. **Paste vào SQL Editor** trên Supabase (Ctrl+V)

### Bước 4: Chạy Query

1. Click nút **"Run"** (hoặc nhấn Ctrl+Enter)
2. Đợi query chạy xong
3. Bạn sẽ thấy thông báo: "Success. No rows returned"

### Bước 5: Kiểm tra kết quả

1. Ở menu bên trái, click **"Table Editor"**
2. Bạn sẽ thấy 4 bảng:
   - `users`
   - `books`
   - `loans`
   - `loan_history`

✅ **Hoàn thành!** Database schema đã được tạo.

---

## ⚡ Cách 3: Neon

### Bước 1: Truy cập Neon Dashboard

1. Đăng nhập vào https://neon.tech
2. Chọn project của bạn
3. Click vào database của bạn

### Bước 2: Mở SQL Editor

1. Click tab **"SQL Editor"** ở menu trên
2. Hoặc click **"Query"** trong sidebar

### Bước 3: Copy và Paste Schema SQL

1. Mở file `lib/db-schema.sql` trên máy tính
2. **Copy toàn bộ nội dung** (Ctrl+A, Ctrl+C)
3. **Paste vào SQL Editor** trên Neon (Ctrl+V)

### Bước 4: Chạy Query

1. Click nút **"Run"** hoặc nhấn **Ctrl+Enter**
2. Đợi query chạy xong
3. Bạn sẽ thấy thông báo thành công

### Bước 5: Kiểm tra kết quả

1. Vào tab **"Tables"** hoặc **"Schema"**
2. Kiểm tra các bảng đã được tạo

✅ **Hoàn thành!** Database schema đã được tạo.

---

## 💻 Cách 4: Sử dụng psql (Command Line)

Nếu bạn có `psql` được cài đặt trên máy tính:

### Bước 1: Lấy Connection String

Từ Railway/Supabase/Neon, copy connection string (DATABASE_URL)

Format: `postgresql://user:password@host:port/database`

### Bước 2: Chạy lệnh trong Terminal

```bash
# Windows (PowerShell)
psql "postgresql://user:password@host:port/database" -f lib/db-schema.sql

# Linux/Mac
psql "postgresql://user:password@host:port/database" -f lib/db-schema.sql
```

**Lưu ý:** Thay thế connection string bằng giá trị thực tế của bạn.

### Ví dụ cụ thể:

```bash
# Railway example
psql "postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway" -f lib/db-schema.sql

# Supabase example  
psql "postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres" -f lib/db-schema.sql
```

✅ **Hoàn thành!** Schema đã được chạy.

---

## 🔧 Cách 5: Sử dụng Node.js Script (Tự động)

Tạo script để chạy schema tự động:

### Bước 1: Tạo file `scripts/run-schema-production.js`

```javascript
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Lấy connection string từ environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not found in environment variables');
  console.error('Please set DATABASE_URL before running this script');
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function runSchema() {
  try {
    console.log('📖 Reading schema file...');
    const schemaPath = path.join(__dirname, '..', 'lib', 'db-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🚀 Running schema on production database...');
    await pool.query(schema);
    
    console.log('✅ Schema executed successfully!');
    console.log('📊 Tables created: users, books, loans, loan_history');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running schema:', error.message);
    console.error('Error code:', error.code);
    await pool.end();
    process.exit(1);
  }
}

runSchema();
```

### Bước 2: Chạy script

```bash
# Set DATABASE_URL từ production
# Windows PowerShell
$env:DATABASE_URL="postgresql://user:password@host:port/database"
node scripts/run-schema-production.js

# Linux/Mac
export DATABASE_URL="postgresql://user:password@host:port/database"
node scripts/run-schema-production.js
```

✅ **Hoàn thành!** Schema đã được chạy tự động.

---

## ✅ Kiểm tra Schema đã chạy thành công

Sau khi chạy schema, kiểm tra bằng cách:

### Cách 1: Kiểm tra trong Dashboard

1. Vào tab **Tables** hoặc **Schema** trong dashboard
2. Bạn sẽ thấy 4 bảng:
   - ✅ `users`
   - ✅ `books`
   - ✅ `loans`
   - ✅ `loan_history`

### Cách 2: Chạy Query kiểm tra

Trong SQL Editor, chạy query:

```sql
-- Kiểm tra các bảng đã được tạo
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Kết quả mong đợi:
```
table_name
----------
books
loan_history
loans
users
```

### Cách 3: Kiểm tra cấu trúc bảng

```sql
-- Kiểm tra cấu trúc bảng users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';
```

---

## 🐛 Troubleshooting

### Lỗi: "relation already exists"

**Nguyên nhân:** Schema đã được chạy trước đó.

**Giải pháp:** 
- Bỏ qua lỗi này (không sao, bảng đã tồn tại)
- Hoặc xóa các bảng cũ trước:
  ```sql
  DROP TABLE IF EXISTS loan_history CASCADE;
  DROP TABLE IF EXISTS loans CASCADE;
  DROP TABLE IF EXISTS books CASCADE;
  DROP TABLE IF EXISTS users CASCADE;
  ```
  Sau đó chạy lại schema.

### Lỗi: "permission denied"

**Nguyên nhân:** User không có quyền tạo bảng.

**Giải pháp:** 
- Đảm bảo bạn đang dùng user có quyền admin/owner
- Railway/Supabase/Neon thường tự động cấp quyền này

### Lỗi: "syntax error"

**Nguyên nhân:** Copy thiếu hoặc có ký tự lạ.

**Giải pháp:**
- Copy lại toàn bộ file `lib/db-schema.sql`
- Đảm bảo không có ký tự đặc biệt
- Chạy từng phần nếu cần (chia nhỏ file)

### Lỗi: "connection timeout"

**Nguyên nhân:** Database không cho phép connection từ IP của bạn.

**Giải pháp:**
- Kiểm tra firewall settings trên database service
- Railway/Supabase/Neon thường cho phép connection từ mọi nơi
- Thử lại sau vài phút

---

## 📝 Lưu ý quan trọng

1. **Chỉ chạy schema MỘT LẦN** trên production database
2. **Backup database** trước khi chạy (nếu có dữ liệu quan trọng)
3. **Kiểm tra kết quả** sau khi chạy để đảm bảo các bảng đã được tạo
4. **Không chạy lại** nếu schema đã được chạy thành công

---

## 🎯 Tóm tắt nhanh

**Railway/Supabase/Neon:**
1. Vào SQL Editor/Query tab
2. Copy toàn bộ `lib/db-schema.sql`
3. Paste vào editor
4. Click Run
5. Kiểm tra kết quả

**Command Line:**
```bash
psql "DATABASE_URL" -f lib/db-schema.sql
```

**Node.js Script:**
```bash
DATABASE_URL="..." node scripts/run-schema-production.js
```

---

**Chúc bạn thành công! 🎉**

