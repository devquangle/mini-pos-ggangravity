import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

// Đảm bảo chạy script reset CSDL trước mỗi test để dữ liệu luôn đồng nhất
test.beforeEach(() => {
  try {
    execSync('npm run reset-db');
    console.log('Database reset successfully.');
  } catch (error) {
    console.error('Lỗi khi chạy npm run reset-db. Vui lòng đảm bảo script này tồn tại trong package.json:', error);
  }
});

const BASE_URL = 'http://127.0.0.1:5173';

test.describe('Dashboard E2E Tests', () => {

  test('1. Mở dashboard và kiểm tra tiêu đề', async ({ page }) => {
    // Vào trang Dashboard
    await page.goto(`${BASE_URL}/dashboard.html`);
    
    // Lấy thẻ tiêu đề bằng data-testid
    const title = page.getByTestId('dashboard-title');
    
    // Kiểm tra hiển thị và nội dung chữ
    await expect(title).toBeVisible();
    await expect(title).toHaveText('Dashboard báo cáo bán hàng');
  });

  test('2. Kiểm tra dashboard hiển thị số liệu tổng quan', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`);
    
    // Các phần tử hiển thị thống kê tổng quan
    const totalRevenue = page.getByTestId('total-revenue');
    const totalOrders = page.getByTestId('total-orders');
    const totalSoldQty = page.getByTestId('total-sold-quantity');
    const bestSelling = page.getByTestId('best-selling-product');

    // Phải hiển thị đầy đủ
    await expect(totalRevenue).toBeVisible();
    await expect(totalOrders).toBeVisible();
    await expect(totalSoldQty).toBeVisible();
    await expect(bestSelling).toBeVisible();
  });

  test('3. Kiểm tra dashboard có biểu đồ', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`);

    // Các thẻ canvas chứa biểu đồ Chart.js
    const revenueChart = page.getByTestId('revenue-chart');
    const stockChart = page.getByTestId('stock-chart');
    const soldQtyChart = page.getByTestId('sold-quantity-chart');

    // Các canvas phải tồn tại và được render
    await expect(revenueChart).toBeVisible();
    await expect(stockChart).toBeVisible();
    await expect(soldQtyChart).toBeVisible();
  });

  test('4. Kiểm tra luồng bán hàng làm thay đổi dashboard', async ({ page }) => {
    // BƯỚC A: Vào trang chủ POS (bán hàng) để thực hiện thanh toán 1 đơn hàng mới
    await page.goto(`${BASE_URL}/index.html`);
    
    // Thêm sản phẩm có id = 1 (Ví dụ: p01/Trà sữa) vào giỏ
    const addBtn = page.getByTestId('add-to-cart-1');
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // Bấm nút thanh toán
    const checkoutBtn = page.locator('#btn-checkout');
    await checkoutBtn.click();

    // Đợi thông báo thanh toán thành công (Theo main.js, alert có testid="message")
    const message = page.getByTestId('message');
    await expect(message).toBeVisible();
    await expect(message).toContainText('Thanh toán thành công và đã lưu đơn hàng');

    // BƯỚC B: Qua trang Dashboard để kiểm tra dữ liệu thay đổi
    await page.goto(`${BASE_URL}/dashboard.html`);
    
    const totalOrders = page.getByTestId('total-orders');
    const totalRevenue = page.getByTestId('total-revenue');

    // Dashboard phải tải được số liệu
    await expect(totalOrders).not.toBeEmpty();
    await expect(totalRevenue).not.toBeEmpty();
    
    // Đảm bảo số lượng đơn hàng >= 1
    const ordersText = await totalOrders.innerText();
    const ordersCount = parseInt(ordersText, 10);
    expect(ordersCount).toBeGreaterThanOrEqual(1);

    // Đảm bảo tổng doanh thu không hiển thị bằng 0
    await expect(totalRevenue).not.toHaveText('0 ₫');
  });

});
