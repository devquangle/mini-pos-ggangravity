import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Lấy thông tin thư mục hiện tại khi dùng ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Định nghĩa đường dẫn file nguồn và file đích
const seedPath = path.resolve(__dirname, '../db.seed.json');
const dbPath = path.resolve(__dirname, '../db.json');

try {
  // Sao chép nội dung từ db.seed.json sang db.json để reset dữ liệu
  fs.copyFileSync(seedPath, dbPath);
  console.log('Khôi phục cơ sở dữ liệu mẫu thành công!');
} catch (error) {
  console.error('Lỗi khi khôi phục cơ sở dữ liệu:', error);
  process.exit(1);
}
