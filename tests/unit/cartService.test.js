import { describe, test, expect } from 'vitest';
import {
  validateQuantity,
  calculateLineTotal,
  calculateCartTotal,
  updateStockAfterCheckout
} from '../../src/services/cartService.js';

describe('Kiểm thử logic nghiệp vụ Giỏ hàng (cartService)', () => {
  
  // 1. Kiểm thử hàm validateQuantity
  describe('validateQuantity', () => {
    test('số lượng hợp lệ', () => {
      const result = validateQuantity(5, 10);
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('');
    });

    test('số lượng bằng 0', () => {
      const result = validateQuantity(0, 10);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Số lượng mua phải lớn hơn 0');
    });

    test('số lượng âm', () => {
      const result = validateQuantity(-3, 10);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Số lượng mua phải lớn hơn 0');
    });

    test('số lượng vượt tồn kho', () => {
      const result = validateQuantity(11, 10);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Số lượng mua vượt quá tồn kho hiện tại');
    });

    test('số lượng không phải số nguyên', () => {
      const result = validateQuantity(1.5, 10);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Số lượng mua phải là số nguyên');
    });
  });

  // 2. Kiểm thử hàm calculateLineTotal
  describe('calculateLineTotal', () => {
    test('tính đúng thành tiền của một dòng sản phẩm', () => {
      const total = calculateLineTotal(25000, 3);
      expect(total).toBe(75000);
    });
  });

  // 3. Kiểm thử hàm calculateCartTotal
  describe('calculateCartTotal', () => {
    test('tính đúng tổng tiền của nhiều sản phẩm trong giỏ', () => {
      const cartItems = [
        { price: 25000, quantity: 2 },
        { price: 15000, quantity: 3 }
      ];
      const total = calculateCartTotal(cartItems);
      expect(total).toBe(95000); // 25000 * 2 + 15000 * 3 = 50000 + 45000 = 95000
    });

    test('giỏ hàng rỗng thì tổng tiền phải bằng 0', () => {
      const total = calculateCartTotal([]);
      expect(total).toBe(0);
    });
  });

  // 4. Kiểm thử hàm updateStockAfterCheckout
  describe('updateStockAfterCheckout', () => {
    test('mua thành công thì tồn kho giảm đúng và sản phẩm không mua giữ nguyên tồn kho', () => {
      const products = [
        { id: '1', code: 'SP001', name: 'Trà sữa', price: 25000, stock: 10 },
        { id: '2', code: 'SP002', name: 'Bánh mì', price: 15000, stock: 5 }
      ];
      const cartItems = [
        { id: '1', quantity: 3 } // Mua 3 Trà sữa
      ];

      const newProducts = updateStockAfterCheckout(products, cartItems);

      // Trà sữa mua 3 chiếc: tồn kho giảm từ 10 xuống 7
      const tea = newProducts.find(p => p.id === '1');
      expect(tea.stock).toBe(7);

      // Bánh mì không mua: tồn kho giữ nguyên là 5
      const bread = newProducts.find(p => p.id === '2');
      expect(bread.stock).toBe(5);
    });
  });

});
