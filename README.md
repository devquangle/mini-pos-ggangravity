# Mini POS - Bán hàng & Trừ kho

Dự án thực hành môn **Kiểm thử tự động với AI và CI/CD**.

## Công nghệ sử dụng
- **HTML, CSS, JavaScript thuần** (Vanilla JS).
- **json-server**: Giả lập database API ở port `3000`.
- **Vitest**: Unit test logic nghiệp vụ giỏ hàng.
- **Playwright**: Kiểm thử tự động giao diện người dùng (E2E Test).

---

## Hướng dẫn cài đặt & Chạy ứng dụng

### 1. Cài đặt các package phụ thuộc:
```bash
npm install
```

### 2. Cài đặt môi trường trình duyệt cho Playwright (chỉ cần chạy lần đầu):
```bash
npm run install:browsers
```

### 3. Khôi phục dữ liệu ban đầu (Reset DB):
```bash
npm run reset-db
```

### 4. Chạy toàn bộ ứng dụng (Cả Frontend và API Server):
```bash
npm start
```
*(Chỉ cần chạy duy nhất lệnh này, hệ thống sẽ tự động bật đồng thời cả giao diện web ở `http://localhost:5173` và máy chủ API ở `http://localhost:3000`)*

---

## Các script lệnh trong dự án (`npm run <script>` hoặc `npm <script>`)

| Lệnh | Chức năng | Port / Chi tiết |
| :--- | :--- | :--- |
| `npm start` | **Khởi chạy đồng thời cả Frontend và API Server** | `http://localhost:5173` & `3000` |
| `npm run dev` | Chỉ chạy giao diện Frontend (Vite) | `http://localhost:5173` |
| `npm run api` | Chỉ chạy Mock API Server (json-server) | `http://localhost:3000` |
| `npm run reset-db` | Reset dữ liệu file `db.json` từ `db.seed.json` | Khôi phục tồn kho ban đầu |
| `npm run test:unit` | **Chạy Unit Test với Vitest** (Chạy một lần) | Kiểm thử hàm logic (cart) |
| `npm run test:unit:watch` | **Chạy Unit Test ở chế độ Watch** (Tự chạy lại khi sửa code) | Tiện ích khi viết code |
| `npm run test:e2e` | Chạy kiểm thử giao diện với Playwright | Chạy ngầm (headless mode) |
| `npm run test:e2e:ui` | Chạy kiểm thử Playwright với chế độ UI | Có giao diện tương tác |
| `npm run install:browsers` | Cài đặt các trình duyệt Chromium, Firefox, Webkit | Cần thiết để chạy Playwright |
