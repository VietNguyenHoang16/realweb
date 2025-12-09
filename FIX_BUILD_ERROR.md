# 🔧 Sửa lỗi Build trên Vercel

## ❌ Lỗi: "npm run build" exited with 1

Lỗi này thường do:
1. TypeScript errors
2. Missing dependencies
3. Import path issues
4. Server/Client component conflicts

## ✅ Các bước sửa

### Bước 1: Kiểm tra Build Logs trên Vercel

1. Vào Vercel Dashboard → Project → Deployments
2. Click vào deployment failed
3. Xem "Build Logs" để tìm lỗi cụ thể
4. Copy lỗi và xem phần dưới

### Bước 2: Sửa các lỗi phổ biến

#### Lỗi 1: Module not found

**Lỗi:** `Cannot find module '@/...'`

**Giải pháp:** Kiểm tra `tsconfig.json` có đúng paths:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

#### Lỗi 2: Type errors

**Lỗi:** `Type 'X' is not assignable to type 'Y'`

**Giải pháp:** 
- Kiểm tra types trong các file
- Đảm bảo imports đúng

#### Lỗi 3: Missing dependencies

**Lỗi:** `Cannot find module 'xxx'`

**Giải pháp:** 
- Kiểm tra `package.json` có đủ dependencies
- Đảm bảo không có dependencies trong `devDependencies` mà cần trong production

#### Lỗi 4: Server/Client component

**Lỗi:** `'use client' directive is required`

**Giải pháp:**
- API routes không được có `'use client'`
- Components dùng hooks cần `'use client'`

### Bước 3: Test build local

Chạy build local để tìm lỗi:

```bash
npm run build
```

Nếu build local thành công nhưng Vercel fail, có thể do:
- Environment variables
- Node version
- Build cache

### Bước 4: Fix cụ thể

#### Nếu lỗi về database connection trong build

**Vấn đề:** Code cố kết nối database trong build time

**Giải pháp:** Đảm bảo database connection chỉ chạy trong runtime, không trong build:

```typescript
// lib/db.ts - Đã đúng, không cần sửa
// Connection chỉ được tạo khi import, không chạy trong build
```

#### Nếu lỗi về missing types

Thêm vào `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["node"]
  }
}
```

### Bước 5: Clear cache và rebuild

Trên Vercel:
1. Vào Project → Settings → General
2. Scroll xuống "Clear Build Cache"
3. Click "Clear"
4. Redeploy

## 🔍 Debug Steps

### 1. Xem Build Logs chi tiết

Copy toàn bộ error message từ Vercel logs và tìm:
- `Error:` - Lỗi chính
- `at` - Vị trí lỗi
- File path - File bị lỗi

### 2. Kiểm tra từng file

Nếu logs chỉ ra file cụ thể, kiểm tra:
- Syntax errors
- Import errors
- Type errors

### 3. Test từng phần

Comment out các phần code để tìm phần gây lỗi:
- Comment API routes
- Comment pages
- Comment components

## 📝 Checklist

- [ ] Đã xem Build Logs trên Vercel
- [ ] Đã test build local: `npm run build`
- [ ] Đã kiểm tra TypeScript errors
- [ ] Đã kiểm tra imports
- [ ] Đã kiểm tra dependencies trong package.json
- [ ] Đã clear build cache trên Vercel
- [ ] Đã redeploy

## 🆘 Nếu vẫn không được

1. **Copy toàn bộ error message** từ Vercel Build Logs
2. **Chạy build local** và copy error (nếu có)
3. **Kiểm tra** các file được mention trong error
4. **Gửi error message** để được hỗ trợ cụ thể hơn

---

**Lưu ý:** Thường lỗi build là do:
- TypeScript strict mode
- Missing types
- Import paths sai
- Server/Client component conflicts

