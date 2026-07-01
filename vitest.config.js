import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Chỉ tìm và chạy các file test thuộc thư mục tests/unit
    include: ['tests/unit/**/*.{test,spec}.js'],
    // Loại trừ hoàn toàn thư mục e2e của Playwright
    exclude: ['**/node_modules/**', '**/tests/e2e/**']
  }
});
