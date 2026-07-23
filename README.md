# QLHS NTD

Website quản lý hồ sơ viết bằng React, TypeScript, styled-components và SCSS.

## Chạy trên máy

Yêu cầu Node.js 22 trở lên.

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`.

## Kết nối Google Sheets

Xem hướng dẫn và mã mẫu trong thư mục `google-apps-script/`.

Tạo file `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
```

## Xuất bản lên GitHub Pages

GitHub Pages chỉ nhận file tĩnh. Dự án đã được cấu hình để `npm run build` tạo toàn bộ website trong thư mục `out/`.

### Repository dạng `username.github.io`

```bash
NEXT_PUBLIC_SITE_URL=https://username.github.io npm run build
```

### Repository thông thường, ví dụ `username.github.io/qlhs-ntd`

```bash
NEXT_PUBLIC_BASE_PATH=/qlhs-ntd \
NEXT_PUBLIC_SITE_URL=https://username.github.io/qlhs-ntd \
npm run build
```

Sau khi build, đưa toàn bộ nội dung bên trong `out/` lên nhánh mà GitHub Pages sử dụng.

Nếu dùng Google Apps Script trên GitHub Pages, hãy đặt thêm `NEXT_PUBLIC_GOOGLE_SCRIPT_URL` trong môi trường build.
