import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.beforeEach(async ({ page }) => {
  // Khôi phục database db.json về dữ liệu gốc từ db.seed.json trước mỗi test case
  const seedPath = path.resolve(process.cwd(), 'db.seed.json');
  const dbPath = path.resolve(process.cwd(), 'db.json');
  fs.copyFileSync(seedPath, dbPath);

  // Đợi 500ms để đảm bảo json-server đã nhận diện được sự thay đổi của file và reload dữ liệu
  await new Promise(resolve => setTimeout(resolve, 500));

  // Truy cập trang chủ POS (Cấu hình baseURL trong playwright.config.js)
  await page.goto('/');
});

test.describe('Kiểm thử giao diện Mini POS (E2E)', () => {

  // 1. Kiểm tra hiển thị danh sách sản phẩm tải về từ API
  test('Hiển thị danh sách sản phẩm', async ({ page }) => {
    // Kiểm tra tên Trà sữa (id: 1) hiển thị
    await expect(page.getByTestId('product-row-1')).toContainText('Trà sữa');
    // Kiểm tra tên Bánh mì (id: 2) hiển thị
    await expect(page.getByTestId('product-row-2')).toContainText('Bánh mì');
    // Kiểm tra tồn kho Trà sữa ban đầu là 10
    await expect(page.getByTestId('product-stock-1')).toHaveText('10');
  });

  // 2. Kiểm tra thêm sản phẩm hợp lệ vào giỏ hàng
  test('Thêm sản phẩm vào giỏ hàng', async ({ page }) => {
    // Chọn số lượng mua Trà sữa là 2
    const qtyInput = page.getByTestId('product-quantity-1');
    await qtyInput.fill('2');

    // Click thêm vào giỏ
    await page.getByTestId('add-to-cart-1').click();

    // Giỏ hàng hiển thị Trà sữa với số lượng 2
    const cartItems = page.getByTestId('cart-items');
    await expect(cartItems).toContainText('Trà sữa');
    await expect(cartItems).toContainText('2');

    // Kiểm tra tổng tiền: 25.000 * 2 = 50.000 đ
    await expect(page.getByTestId('cart-total')).toHaveText('50.000 đ');
  });

  // 3. Kiểm tra validation số lượng bằng 0
  test('Không cho nhập số lượng bằng 0', async ({ page }) => {
    const qtyInput = page.getByTestId('product-quantity-1');
    await qtyInput.fill('0');

    await page.getByTestId('add-to-cart-1').click();

    // Hiển thị thông báo lỗi
    await expect(page.getByTestId('message')).toContainText('lớn hơn 0');
  });

  // 4. Kiểm tra validation vượt quá số lượng tồn kho
  test('Không cho mua vượt tồn kho', async ({ page }) => {
    const qtyInput = page.getByTestId('product-quantity-1');
    // Trà sữa tồn kho là 10, cố tình nhập mua 99
    await qtyInput.fill('99');

    await page.getByTestId('add-to-cart-1').click();

    // Hiển thị thông báo lỗi
    await expect(page.getByTestId('message')).toContainText('vượt quá tồn kho');
    
    // Tồn kho trên giao diện không đổi
    await expect(page.getByTestId('product-stock-1')).toHaveText('10');
  });

  // 5. Kiểm tra thanh toán thành công và trừ tồn kho
  test('Thanh toán thành công thì tồn kho giảm', async ({ page }) => {
    // Mua 3 Trà sữa
    await page.getByTestId('product-quantity-1').fill('3');
    await page.getByTestId('add-to-cart-1').click();

    // Click nút Thanh toán
    await page.getByTestId('checkout-button').click();

    // Kiểm tra tin nhắn thanh toán thành công
    await expect(page.getByTestId('message')).toContainText('Thanh toán thành công');

    // Kiểm tra tồn kho của Trà sữa giảm từ 10 xuống còn 7
    await expect(page.getByTestId('product-stock-1')).toHaveText('7');
  });

  // 6. Kiểm tra giỏ hàng được làm rỗng sau khi thanh toán thành công
  test('Thanh toán xong thì giỏ hàng rỗng', async ({ page }) => {
    // Mua 1 Trà sữa
    await page.getByTestId('product-quantity-1').fill('1');
    await page.getByTestId('add-to-cart-1').click();

    // Thanh toán
    await page.getByTestId('checkout-button').click();
    await expect(page.getByTestId('message')).toContainText('Thanh toán thành công');

    // Bảng giỏ hàng hiển thị trống và tổng tiền quay về 0 đ
    await expect(page.getByTestId('cart-items')).toContainText('Giỏ hàng đang trống');
    await expect(page.getByTestId('cart-total')).toHaveText('0 đ');
  });

  // 7. Kiểm tra chặn thanh toán khi giỏ hàng rỗng
  test('Giỏ hàng rỗng thì không cho thanh toán', async ({ page }) => {
    // Trực tiếp click Thanh toán khi chưa có gì
    await page.getByTestId('checkout-button').click();

    // Hiển thị thông báo lỗi giỏ hàng rỗng
    await expect(page.getByTestId('message')).toContainText('Giỏ hàng đang rỗng');
  });

});
