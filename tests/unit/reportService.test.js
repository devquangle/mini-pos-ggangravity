import { describe, it, expect } from 'vitest';
import {
  calculateTotalRevenue,
  countTotalOrders,
  calculateTotalSoldQuantity,
  getBestSellingProduct,
  getLowStockProducts,
  groupRevenueByDate,
  groupSoldQuantityByProduct
} from '../../src/services/reportService.js';

// Dữ liệu mẫu (Mock data) đặt trực tiếp trong file để test
const mockOrders = [
  {
    id: 'o-1',
    totalAmount: 100000,
    createdAt: '2026-07-06T10:00:00.000Z',
    items: [
      { productId: 'p1', name: 'Trà sữa', quantity: 2 },
      { productId: 'p2', name: 'Cà phê', quantity: 1 }
    ]
  },
  {
    id: 'o-2',
    totalAmount: 150000,
    createdAt: '2026-07-06T14:00:00.000Z', // Cùng ngày 06 với o-1
    items: [
      { productId: 'p1', name: 'Trà sữa', quantity: 3 }
    ]
  },
  {
    id: 'o-3',
    totalAmount: 50000,
    createdAt: '2026-07-07T09:00:00.000Z', // Ngày 07
    items: [
      { productId: 'p3', name: 'Bánh mì', quantity: 2 }
    ]
  }
];

const mockProducts = [
  { id: 'p1', name: 'Trà sữa', stock: 10 },
  { id: 'p2', name: 'Cà phê', stock: 5 },  // stock <= 5
  { id: 'p3', name: 'Bánh mì', stock: 2 }, // stock <= 5
  { id: 'p4', name: 'Nước suối', stock: 20 }
];

describe('reportService', () => {

  describe('1. calculateTotalRevenue', () => {
    it('Tính đúng tổng doanh thu nhiều đơn hàng', () => {
      const total = calculateTotalRevenue(mockOrders);
      // 100000 + 150000 + 50000 = 300000
      expect(total).toBe(300000);
    });

    it('Trả về 0 nếu danh sách đơn hàng rỗng hoặc null', () => {
      expect(calculateTotalRevenue([])).toBe(0);
      expect(calculateTotalRevenue(null)).toBe(0);
    });
  });

  describe('2. countTotalOrders', () => {
    it('Đếm đúng số đơn hàng', () => {
      expect(countTotalOrders(mockOrders)).toBe(3);
    });

    it('Trả về 0 nếu mảng rỗng hoặc undefined', () => {
      expect(countTotalOrders([])).toBe(0);
      expect(countTotalOrders(undefined)).toBe(0);
    });
  });

  describe('3. calculateTotalSoldQuantity', () => {
    it('Tính đúng tổng quantity của nhiều item trong nhiều đơn', () => {
      const totalQty = calculateTotalSoldQuantity(mockOrders);
      // o-1: (2 + 1) = 3
      // o-2: (3) = 3
      // o-3: (2) = 2
      // Tổng = 8
      expect(totalQty).toBe(8);
    });

    it('Trả về 0 nếu không có đơn hàng', () => {
      expect(calculateTotalSoldQuantity([])).toBe(0);
    });
  });

  describe('4. getBestSellingProduct', () => {
    it('Tìm đúng sản phẩm bán chạy nhất', () => {
      const bestSeller = getBestSellingProduct(mockOrders);
      // p1 (Trà sữa) bán được 2 + 3 = 5 ly -> Cao nhất
      expect(bestSeller).not.toBeNull();
      expect(bestSeller.productId).toBe('p1');
      expect(bestSeller.name).toBe('Trà sữa');
      expect(bestSeller.quantity).toBe(5);
    });

    it('Trả về null nếu không có đơn hàng', () => {
      expect(getBestSellingProduct([])).toBeNull();
    });
  });

  describe('5. getLowStockProducts', () => {
    it('Lọc đúng sản phẩm có stock <= 5 (mặc định)', () => {
      const lowStock = getLowStockProducts(mockProducts);
      // Mong đợi: p2 (5) và p3 (2)
      expect(lowStock).toHaveLength(2);
      expect(lowStock.some(p => p.id === 'p2')).toBe(true);
      expect(lowStock.some(p => p.id === 'p3')).toBe(true);
    });

    it('Cho phép truyền threshold tùy chỉnh', () => {
      // Đặt threshold = 2 -> Chỉ có p3 (Bánh mì) thỏa mãn
      const lowStock = getLowStockProducts(mockProducts, 2);
      expect(lowStock).toHaveLength(1);
      expect(lowStock[0].id).toBe('p3');
    });
  });

  describe('6. groupRevenueByDate', () => {
    it('Gom đúng doanh thu theo ngày và sắp xếp tăng dần', () => {
      const grouped = groupRevenueByDate(mockOrders);
      expect(grouped).toHaveLength(2);
      
      // Ngày 2026-07-06 có 2 đơn: 100k + 150k = 250k
      expect(grouped[0].date).toBe('2026-07-06');
      expect(grouped[0].revenue).toBe(250000);

      // Ngày 2026-07-07 có 1 đơn: 50k
      expect(grouped[1].date).toBe('2026-07-07');
      expect(grouped[1].revenue).toBe(50000);
    });
  });

  describe('7. groupSoldQuantityByProduct', () => {
    it('Gom đúng số lượng bán theo sản phẩm và sắp xếp giảm dần', () => {
      const grouped = groupSoldQuantityByProduct(mockOrders);
      expect(grouped).toHaveLength(3);
      
      // Top 1: p1 (Trà sữa) - 5
      expect(grouped[0].productId).toBe('p1');
      expect(grouped[0].quantity).toBe(5);
      
      // Top 2: p3 (Bánh mì) - 2
      expect(grouped[1].productId).toBe('p3');
      expect(grouped[1].quantity).toBe(2);
      
      // Top 3: p2 (Cà phê) - 1
      expect(grouped[2].productId).toBe('p2');
      expect(grouped[2].quantity).toBe(1);
    });
  });

});
