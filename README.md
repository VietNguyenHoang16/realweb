# Hệ thống Quản lý Thư viện

Ứng dụng quản lý thư viện được xây dựng với Next.js, TypeScript, PostgreSQL, và Tailwind CSS.

## Tính năng

- ✅ Đăng ký và đăng nhập người dùng
- ✅ Quản lý sách (CRUD)
- ✅ Mượn và trả sách
- ✅ Theo dõi lịch sử mượn sách
- ✅ Phân quyền người dùng (user, librarian, admin)
- ✅ Dashboard với thống kê
- ✅ Tìm kiếm sách

## Yêu cầu hệ thống

- Node.js 18+ 
- PostgreSQL 12+
- npm hoặc yarn

## Cài đặt

### 1. Clone repository và cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình PostgreSQL

Tạo database mới trong PostgreSQL:

```sql
CREATE DATABASE library_db
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LOCALE_PROVIDER = 'libc'
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;
```

### 3. Cấu hình biến môi trường

Tạo file `.env.local` trong thư mục gốc:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=library_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Secret (thay đổi trong production!)
JWT_SECRET=your-secret-key-change-in-production

# Node Environment
NODE_ENV=development
```

### 4. Khởi tạo database schema

Chạy file SQL schema để tạo các bảng:

```bash
# Kết nối với PostgreSQL và chạy file schema
psql -U postgres -d library_db -f lib/db-schema.sql
```

Hoặc sử dụng script TypeScript (cần tạo script trong package.json):

```bash
# Thêm script vào package.json:
# "init-db": "ts-node lib/init-db.ts"
npm run init-db
```

### 5. Chạy ứng dụng

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

## Cấu trúc dự án

```
realweb/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── books/         # Books management endpoints
│   │   └── loans/         # Loans management endpoints
│   ├── login/            # Login page
│   ├── register/          # Register page
│   ├── dashboard/         # Dashboard page
│   ├── books/            # Books management page
│   └── loans/            # Loans management page
├── lib/                   # Utilities
│   ├── db.ts             # PostgreSQL connection
│   ├── db-schema.sql     # Database schema
│   ├── auth.ts           # Authentication utilities
│   └── middleware.ts     # API middleware
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
└── components/           # React components
    └── Navbar.tsx        # Navigation bar
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Books
- `GET /api/books` - Lấy danh sách sách
- `GET /api/books/[id]` - Lấy thông tin sách
- `POST /api/books` - Thêm sách mới (yêu cầu đăng nhập)
- `PUT /api/books/[id]` - Cập nhật sách (yêu cầu đăng nhập)
- `DELETE /api/books/[id]` - Xóa sách (yêu cầu đăng nhập)

### Loans
- `GET /api/loans` - Lấy danh sách phiếu mượn
- `GET /api/loans/[id]` - Lấy thông tin phiếu mượn
- `POST /api/loans` - Tạo phiếu mượn mới
- `POST /api/loans/[id]/return` - Trả sách

## Vai trò người dùng

- **user**: Người dùng thông thường, có thể mượn/trả sách
- **librarian**: Thủ thư, có thể quản lý sách và mượn/trả sách
- **admin**: Quản trị viên, có đầy đủ quyền

## Sử dụng

1. Đăng ký tài khoản mới tại `/register`
2. Đăng nhập tại `/login`
3. Xem dashboard tại `/dashboard`
4. Quản lý sách tại `/books`
5. Quản lý mượn/trả sách tại `/loans`

## Công nghệ sử dụng

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **Tailwind CSS** - Styling
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **zod** - Schema validation

## Triển khai lên Production

Xem hướng dẫn chi tiết trong file [DEPLOY.md](./DEPLOY.md) để triển khai ứng dụng lên Vercel.

### Tóm tắt nhanh:

1. **Setup Database**: Tạo PostgreSQL trên Railway/Supabase/Neon
2. **Deploy lên Vercel**: Import project từ GitHub
3. **Cấu hình Environment Variables** trên Vercel
4. **Khởi tạo Database Schema** trên production database
5. **Tạo Admin Account**

Xem chi tiết: [DEPLOY.md](./DEPLOY.md)

## Scripts hữu ích

```bash
# Khởi tạo database schema
npm run init-db

# Test kết nối database
npm run test-db

# Tạo tài khoản admin
npm run create-admin

# Generate JWT secret mạnh
npm run generate-secret
```

## Lưu ý

- Đảm bảo PostgreSQL đang chạy trước khi khởi động ứng dụng
- Thay đổi `JWT_SECRET` trong file `.env.local` cho môi trường production
- Đảm bảo cấu hình database chính xác trong file `.env.local`
- Không commit file `.env*` lên git (đã có trong `.gitignore`)
