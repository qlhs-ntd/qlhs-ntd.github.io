# Kết nối Google Sheets

1. Mở bảng tính đã cấu hình:
   `https://docs.google.com/spreadsheets/d/19dqKPEW439W6R1FvjQNte54yV5wwZQ7LJqHxf30vGFc/edit`
2. Vào **Tiện ích mở rộng → Apps Script**.
3. Dán toàn bộ nội dung `Code.gs` vào trình soạn thảo và lưu lại.
4. Chọn **Triển khai → Lần triển khai mới → Ứng dụng web**.
5. Chọn **Thực thi với tư cách: Tôi** và quyền truy cập phù hợp với người dùng website.
6. Sao chép URL kết thúc bằng `/exec`.
7. Tạo file `.env.local` ở thư mục gốc website:

```env
NEXT_PUBLIC_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
```

8. Khởi động lại website. Tab `HoSo` cùng hàng tiêu đề sẽ được tạo tự động trong đúng bảng tính trên ở lần gọi đầu tiên.

Mỗi khi sửa mã Apps Script, hãy tạo một phiên bản triển khai mới hoặc cập nhật lần triển khai hiện tại để website nhận mã mới.
