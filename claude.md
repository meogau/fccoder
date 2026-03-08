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

## 4. Migration Database (MongoDB -> DynamoDB) & API Optimization
Do hiệu năng của MongoDB hiện tại đang bị chậm và thiếu Index, cũng như Next.js App Router đang bị Dynamic Rendering khiến page load chậm. Hãy tiến hành chuyển đổi toàn bộ Database sang **Amazon DynamoDB** và tối ưu lại API theo các bước sau:

### 4.1. Thiết kế lại Schema & Khởi tạo DynamoDB
- Cài đặt thư viện AWS SDK mới nhất (`@aws-sdk/client-dynamodb` & `@aws-sdk/lib-dynamodb`).
- Thiết kế lại các Models (`Match`, `Player`, `Team`, ...) từ Mongoose Schema sang cấu trúc lưu trữ phù hợp với DynamoDB (khuyến khích ưu tiên Single-Table Design với Partition Key & Sort Key hợp lý, hoặc Multi-Table nếu logic đơn giản).
- Viết file tiện ích cấu hình và kết nối đến DynamoDB (VD: `src/lib/dynamodb.ts`).

### 4.2. Viết Script Data Migration (Zero-Downtime Migration)
- Tạo một kịch bản/script chạy một lần (có thể là một API route tạm thời như `/api/admin/migrate-db` hoặc file script Node.js rời).
- Kịch bản này phải connect tới **Cả MongoDB (Source)** và **DynamoDB (Destination)**.
- Quét toàn bộ dữ liệu từ MongoDB hiện tại (Team, Players, Matches) và `putItem` (hoặc `batchWrite`) một cách an toàn sang DynamoDB.
- Console/Log ra tiến trình để theo dõi. Cần xử lý cẩn thận kiểu dữ liệu `_id` của Mongo (ObjectId) sang chuỗi (String) phù hợp trên Dynamo.

### 4.3. Viết lại tầng API Route (`src/app/api/...`)
- Thay đổi mã nguồn toàn bộ các endpoint GET, POST, PUT, DELETE đang dùng `mongoose` sang dùng DynamoDB DocumentClient.
- Ở các endpoint **GET** (ví dụ `/api/players`, `/api/matches`, `/api/team`), bắt buộc bổ sung cơ chế caching tĩnh của Next.js: `export const revalidate = 60` (hoặc 300) để API có thể được cache trên Vercel Edge/CDN thay vì query DB mỗi lần load trang.
- Đảm bảo giữ nguyên cấu trúc JSON trả về (`{ success: true, data: ... }`) để các hàm fetch phía UI (Client Component) không bị lỗi. Mọi logic Sort (Sắp xếp) hay Filter cần phải map chuẩn lại bằng DynamoDB Query.

### 4.4. Tái cấu trúc Frontend (Nguyên nhân chính gây chậm)
- **Sửa lỗi Render-blocking từ AuthProvider:** File `src/app/layout.tsx` đang sử dụng `<AuthProvider>` ('use client') khiến toàn bộ Next.js App không thể Server-Side Rendering (SSG). Hãy gỡ bỏ `AuthProvider` khỏi Root Layout và chỉ bọc nó cho nhóm thư mục `/admin/...` (bằng cách dùng Route Groups).
- **Refactor `src/app/page.tsx` thành Server Component:** Gỡ bỏ dòng `'use client'`. Loại bỏ `useEffect`/`useState` và các hàm `fetch` qua API. Thay vào đó, gọi trực tiếp các hàm truy vấn DB (từ `src/lib/dynamodb.ts`) bên trong Async Server Component để load UI ngay lập tức lúc build/request chặn.
- **Tối ưu hiển thị ảnh:** Thay thế các thẻ `<img>` đang load `coverPhoto` bằng thẻ `<Image>` của Next.js, xóa bỏ các param query chống cache ảnh như `?t=Date.now()` để Next.js Image Optimization hoạt động chính xác.

## 5. Cải thiện Logic Update Thông tin Trận đấu & Cầu thủ (Bug Fix)
Qua quá trình kiểm tra chức năng Admin, phát hiện hiện tượng cộng/trừ sai **Bàn thắng, Kiến tạo, và Số trận đã chơi**. Lỗi xuất phát từ các hàm Edit/Delete Match trong đường dẫn `src/app/api/matches/protected/[id]/route.ts`. 

Vui lòng triển khai các chỉnh sửa sau (Kết hợp lúc migrate sang DynamoDB):
- **Hủy tính năng Thẻ Phạt:** Trong thao tác CRUD Match, loại bỏ hoàn toàn logic cập nhật `yellowCards` và `redCards` trong bảng `Player`.
- **Sửa lỗi tính toán sai số (Race Condition & Delta Bug):** Để đảm bảo hiệu năng tối đa khi tải danh sách cầu thủ, **vẫn tiếp tục lưu trữ trực tiếp các trường `goals`, `assists`, `matchesPlayed`** bên trong dữ liệu của Cầu thủ (không bắt server phải tính toán Realtime aggregation mỗi lần load). Tuy nhiên:
  - Phải sử dụng cơ chế cập nhật Nguyên tử (Atomic Updates) của Database (vd `UpdateExpression: SET goals = goals + :val` trong DynamoDB hoặc `$inc` trong MongoDB).
  - Phải rà soát và viết lại thật cẩn thận logic bù trừ (Delta) trong route PUT `[id]` và DELETE `[id]` để đảm bảo mỗi khi sửa/xóa trận đấu thì chỉ số cầu thủ phải được Rollback hoặc Increment chính xác.
- **Định dạng lại kiểu dữ liệu joinDate:** Cần đồng nhất định dạnh `joinDate` (thành ISO String) ở cả file API lẫn UI Admin Config để tránh lỗi khi xem Cầu thủ.

## 6. Bổ sung Tính năng Lịch sử Đối đầu (Player Match History) ở Trang Chi tiết
Khi người dùng bấm vào xem thông tin chi tiết của một cầu thủ:
- **Hiển thị danh sách các trận đấu** mà cầu thủ đó đã tham gia.
- Trên mỗi dòng/thẻ của trận đấu, hiển thị rõ **số bàn thắng** và **số kiến tạo** của cầu thủ đó trong trận đấu tương ứng.
- **Yêu cầu UI (Giao diện):** Cần thiết kế giao diện danh sách này đồng nhất với Cyberpunk theme hiện tại của dự án (sử dụng component dạng terminal/code-block giống trang chủ hoặc grid thẻ với viền neon). Cần bọc component này bằng React Suspense hoặc xử lý Data Fetching phù hợp để tránh làm chậm lần render đầu tiên của thông tin cầu thủ.
