# Mini POS - Hệ thống Bán Hàng và Báo Cáo

## 1. Giới thiệu
**Mini POS** là một ứng dụng quản lý bán hàng đơn giản, hỗ trợ các chức năng cốt lõi từ thêm sản phẩm vào giỏ hàng, thanh toán, tự động trừ số lượng tồn kho, lưu trữ lịch sử đơn hàng cho đến việc hiển thị số liệu phân tích trực quan thông qua Dashboard báo cáo.

## 2. Công nghệ sử dụng
Dự án được xây dựng dựa trên các công nghệ tiêu chuẩn, dễ hiểu và phù hợp cho việc học tập:
- **Frontend**: HTML5, CSS3, JavaScript (Thuần/ES6 Modules).
- **Thư viện biểu đồ**: Chart.js.
- **Database (Mock API)**: `json-server` để giả lập RESTful API.
- **Build Tool / Dev Server**: Vite.
- **Kiểm thử tự động (Automation Testing)**:
  - Unit Test: `Vitest`.
  - End-to-End (E2E) Test: `Playwright`.

## 3. Cấu trúc thư mục
```text
mini-pos/
├── db.json                 # File dữ liệu chính cho json-server
├── db.seed.json            # File dữ liệu gốc dùng để reset DB
├── index.html              # Trang giao diện bán hàng (POS)
├── dashboard.html          # Trang giao diện báo cáo (Dashboard)
├── package.json            # Quản lý dependencies và scripts
├── src/
│   ├── main.js             # Logic xử lý giao diện bán hàng
│   ├── dashboard.js        # Logic xử lý giao diện báo cáo và biểu đồ
│   ├── styles.css          # File CSS dùng chung
│   ├── services/           # Các module API và tính toán logic thuần
│   │   ├── cartService.js  # Logic giỏ hàng
│   │   ├── orderApi.js     # Gọi API lấy/tạo đơn hàng
│   │   ├── productApi.js   # Gọi API lấy/sửa sản phẩm
│   │   └── reportService.js# Logic tính toán thống kê báo cáo
│   └── utils/
│       └── formatMoney.js  # Hàm định dạng tiền tệ
└── tests/
    ├── unit/               # Chứa các file Unit test (Vitest)
    └── e2e/                # Chứa các file Playwright test
```

## 4. Hướng dẫn cài đặt và chạy dự án

### Cài đặt thư viện
Mở terminal tại thư mục gốc của project và chạy lệnh:
```bash
npm install
```

### Chạy máy chủ cơ sở dữ liệu (json-server)
Mở một terminal **thứ nhất** và chạy lệnh:
```bash
npm run api
```
*(API sẽ chạy tại http://127.0.0.1:3000)*

### Chạy giao diện Web (Vite)
Mở một terminal **thứ hai** và chạy lệnh:
```bash
npm run dev
```
*(Giao diện web sẽ chạy tại http://127.0.0.1:5173)*

### Khôi phục dữ liệu gốc (Reset Database)
Nếu bạn đã thao tác mua hàng quá nhiều và muốn trả dữ liệu (tồn kho, lịch sử đơn hàng) về trạng thái ban đầu để test lại từ đầu:
```bash
npm run reset-db
```

---

## 5. Hướng dẫn Kiểm thử tự động (Automation Testing)

### Chạy Unit Test (Vitest)
Kiểm thử các hàm xử lý logic (thuần toán học, xử lý mảng, không phụ thuộc vào giao diện DOM hay API):
```bash
npm test
```

### Chạy End-to-End Test (Playwright)
> **Ghi chú quan trọng:** Trước khi chạy test E2E, bạn **bắt buộc** phải đảm bảo cả `json-server` và máy chủ giao diện `Vite` đều đang được chạy (ở cổng 3000 và 5173).
```bash
npm run test:e2e
```
*(Hoặc chạy lệnh `npm run test:e2e:ui` nếu muốn xem Playwright thao tác tự động trên giao diện đồ họa).*

---

## 6. Danh sách chức năng đã thực hiện
- [x] **Bán hàng (POS)**: 
  - Lấy và hiển thị danh sách sản phẩm thực tế từ API.
  - Thêm sản phẩm vào giỏ hàng (Tự động cộng dồn số lượng).
  - Ràng buộc dữ liệu: Không cho nhập số lượng mua `<= 0` hoặc mua vượt quá số lượng `tồn kho` hiện có.
  - Tự động tính tổng tiền toàn bộ giỏ hàng.
- [x] **Thanh toán**:
  - Tự động trừ tồn kho của sản phẩm và cập nhật lên server.
  - Khởi tạo và lưu thông tin đơn hàng vừa thanh toán vào bảng `orders`.
  - Làm sạch giỏ hàng và hiển thị popup báo thành công.
- [x] **Dashboard Báo Cáo**:
  - Thống kê 4 chỉ số tổng quan: Tổng doanh thu, Tổng đơn hàng, Sản lượng đã bán, Sản phẩm bán chạy nhất.
  - Hệ thống cảnh báo: Liệt kê các sản phẩm sắp hết hàng (khi tồn kho <= 5).
  - Trực quan hóa dữ liệu bằng 3 biểu đồ: Doanh thu theo ngày, Tồn kho hiện tại, Sản lượng theo mặt hàng.

## 7. Danh sách Test Case đã thực hiện

### Unit Test 
- Tính đúng tổng tiền toàn bộ giỏ hàng nhiều sản phẩm.
- Kiểm tra tính hợp lệ của số lượng (chặn số âm, chặn mua lố kho).
- Tính tổng doanh thu từ danh sách đơn hàng.
- Đếm tổng số đơn hàng đã bán.
- Đếm tổng số lượng (quantity) tất cả mặt hàng đã bán.
- Lọc đúng và tìm ra sản phẩm bán chạy nhất.
- Lọc ra mảng các sản phẩm sắp hết hàng dựa trên ngưỡng (threshold) cho trước.
- Gom nhóm (Group by) doanh thu chính xác theo từng ngày.
- Gom nhóm (Group by) sản lượng đã bán ra theo từng sản phẩm.

### Playwright E2E Test
- Đảm bảo hiển thị đúng cảnh báo "Mua vượt tồn kho" trên UI khi thao tác sai.
- Luồng Bán hàng hoàn chỉnh: Thêm hàng -> Bấm Thanh toán -> Xác nhận UI báo "Thanh toán thành công" -> Giao diện tự làm sạch giỏ hàng.
- Truy cập sang Dashboard: Xác nhận Tiêu đề trang load đúng.
- Load dữ liệu Dashboard: Xác nhận 4 thẻ số liệu không rỗng và các thẻ vẽ Biểu đồ (Canvas) xuất hiện trên DOM.
- **Kịch bản Hồi quy**: Kết hợp giữa Bán hàng và Dashboard (Thực hiện mua 1 đơn hàng ở POS -> Qua Dashboard xác thực số lượng đơn hàng tự động tăng lên 1 và tổng doanh thu thay đổi).