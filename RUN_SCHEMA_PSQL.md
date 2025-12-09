# Hướng dẫn Chạy Schema SQL bằng psql

## ⚠️ Lưu ý quan trọng

DATABASE_URL bạn cung cấp có `postgres.railway.internal` - đây là **internal hostname** chỉ hoạt động trong Railway network, **KHÔNG thể kết nối từ máy tính local**.

Bạn cần lấy **public hostname** từ Railway.

---

## 🔍 Bước 1: Lấy Public Connection String từ Railway

### Cách 1: Từ Railway Dashboard

1. Đăng nhập vào https://railway.app
2. Chọn project của bạn
3. Click vào **PostgreSQL** service
4. Vào tab **"Variables"**
5. Tìm biến **`DATABASE_URL`** hoặc **`PGHOST`**
6. Copy connection string hoặc các giá trị:
   - `PGHOST` - sẽ có dạng: `containers-us-west-xxx.railway.app` (KHÔNG phải `postgres.railway.internal`)
   - `PGPORT` - thường là `5432`
   - `PGDATABASE` - thường là `railway`
   - `PGUSER` - thường là `postgres`
   - `PGPASSWORD` - password của bạn

### Cách 2: Tạo Connection String từ các biến

Nếu bạn có các biến riêng lẻ, tạo connection string như sau:

```
postgresql://PGUSER:PGPASSWORD@PGHOST:PGPORT/PGDATABASE
```

**Ví dụ:**
```
postgresql://postgres:eHguZJntPlzHrCoceWnnWKVZCTHwARtj@containers-us-west-123.railway.app:5432/railway
```

**Lưu ý:** Thay `containers-us-west-123.railway.app` bằng giá trị `PGHOST` thực tế của bạn.

---

## 💻 Bước 2: Kiểm tra psql đã được cài đặt

### Windows:

```powershell
psql --version
```

Nếu không có, bạn có 2 lựa chọn:

#### Lựa chọn A: Cài đặt PostgreSQL (bao gồm psql)

1. Tải PostgreSQL: https://www.postgresql.org/download/windows/
2. Cài đặt (chọn "Command Line Tools")
3. Thêm vào PATH: `C:\Program Files\PostgreSQL\15\bin` (số version có thể khác)

#### Lựa chọn B: Dùng script Node.js (Dễ hơn - Khuyến nghị)

Không cần cài psql, dùng script Node.js:

```bash
# Thêm DATABASE_URL vào .env.local (với public hostname)
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway

# Chạy script
npm run run-schema-prod
```

---

## 🚀 Bước 3: Chạy Schema với psql

### Nếu đã có psql:

```powershell
# Windows PowerShell
psql "postgresql://postgres:eHguZJntPlzHrCoceWnnWKVZCTHwARtj@containers-us-west-xxx.railway.app:5432/railway" -f lib/db-schema.sql
```

**Thay thế:**
- `containers-us-west-xxx.railway.app` → giá trị `PGHOST` thực tế của bạn
- `eHguZJntPlzHrCoceWnnWKVZCTHwARtj` → password của bạn (nếu khác)

### Nếu gặp lỗi SSL:

Thêm `?sslmode=require` vào cuối connection string:

```powershell
psql "postgresql://postgres:password@host:5432/railway?sslmode=require" -f lib/db-schema.sql
```

---

## ✅ Bước 4: Kiểm tra kết quả

Sau khi chạy, bạn sẽ thấy các thông báo:
- `CREATE TABLE`
- `CREATE INDEX`
- `CREATE TRIGGER`

Nếu thấy lỗi "relation already exists" - không sao, bảng đã tồn tại.

---

## 🔧 Cách Dễ Hơn: Dùng Script Node.js

Thay vì cài psql, bạn có thể dùng script Node.js:

### Bước 1: Cập nhật .env.local

Thêm DATABASE_URL với **public hostname**:

```env
DATABASE_URL=postgresql://postgres:eHguZJntPlzHrCoceWnnWKVZCTHwARtj@containers-us-west-xxx.railway.app:5432/railway?sslmode=require
```

**Quan trọng:** Thay `containers-us-west-xxx.railway.app` bằng `PGHOST` thực tế từ Railway.

### Bước 2: Chạy script

```bash
npm run run-schema-prod
```

Script sẽ:
- ✅ Đọc file `lib/db-schema.sql`
- ✅ Kết nối với database
- ✅ Chạy schema
- ✅ Kiểm tra và hiển thị kết quả

---

## 🐛 Troubleshooting

### Lỗi: "psql: command not found"

**Giải pháp:** 
- Cài PostgreSQL hoặc dùng script Node.js

### Lỗi: "could not connect to server"

**Nguyên nhân:** 
- Đang dùng internal hostname (`postgres.railway.internal`)
- Hoặc hostname không đúng

**Giải pháp:**
- Lấy public hostname từ Railway Variables (`PGHOST`)
- Đảm bảo connection string có public hostname

### Lỗi: "SSL connection required"

**Giải pháp:**
- Thêm `?sslmode=require` vào cuối connection string

### Lỗi: "password authentication failed"

**Giải pháp:**
- Kiểm tra lại password trong Railway Variables
- Đảm bảo copy đúng password (không có khoảng trắng)

---

## 📝 Tóm tắt

1. **Lấy public hostname** từ Railway (KHÔNG dùng `postgres.railway.internal`)
2. **Tạo connection string** với public hostname
3. **Cài psql** (nếu chưa có) hoặc **dùng script Node.js**
4. **Chạy lệnh** với connection string đúng

**Khuyến nghị:** Dùng script Node.js (`npm run run-schema-prod`) - dễ hơn và không cần cài thêm phần mềm.

