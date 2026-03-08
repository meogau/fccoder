# Yêu cầu Update & Fix Bug

## 1. Cập nhật Upload Ảnh (Dashboard & Cầu thủ)
- Thay đổi cơ chế tải ảnh hiện tại: Cho phép upload ảnh từ trang **Dashboard** và trang **Cầu thủ** trực tiếp lên **AWS S3**.
- Sau khi upload thành công, lấy đường link S3 trả về để lưu vào database/nhúng hiển thị.

## 2. Fix lỗi `joinedDate` (Trang Cầu thủ)
- Sửa lại trường `joinedDate` ở mục xem cầu thủ để đồng bộ và hiển thị chính xác theo cấu hình (config) trong trang Admin.

## 3. Cập nhật tính năng Sắp xếp (Trang Xem Cầu thủ)
- **Xóa bỏ** mục `order` (sắp xếp mặc định/cũ) ở trang xem cầu thủ.
- **Thêm mới 3 tùy chọn sắp xếp (sort) sau:**
  1. Theo **số áo**: Từ bé đến lớn (Ascending).
  2. Theo **số bàn thắng**: Từ lớn đến bé (Descending).
  3. Theo **số kiến tạo**: Từ lớn đến bé (Descending).
