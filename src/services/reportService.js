/**
 * Helper function để đảm bảo đầu vào luôn là mảng hợp lệ
 */
const safeArray = (arr) => (Array.isArray(arr) ? arr : []);

/**
 * 1. Tính tổng doanh thu từ các đơn hàng
 * @param {Array} orders - Danh sách đơn hàng
 * @returns {number} Tổng doanh thu
 */
export function calculateTotalRevenue(orders) {
  const safeOrders = safeArray(orders);
  if (safeOrders.length === 0) return 0;
  
  return safeOrders.reduce((total, order) => total + (order.totalAmount || 0), 0);
}

/**
 * 2. Đếm tổng số lượng đơn hàng
 * @param {Array} orders - Danh sách đơn hàng
 * @returns {number} Số lượng đơn
 */
export function countTotalOrders(orders) {
  return safeArray(orders).length;
}

/**
 * 3. Tính tổng số lượng (quantity) tất cả các sản phẩm đã bán
 * @param {Array} orders - Danh sách đơn hàng
 * @returns {number} Tổng quantity
 */
export function calculateTotalSoldQuantity(orders) {
  const safeOrders = safeArray(orders);
  if (safeOrders.length === 0) return 0;
  
  return safeOrders.reduce((total, order) => {
    const items = safeArray(order.items);
    const orderQty = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    return total + orderQty;
  }, 0);
}

/**
 * 7. Gom số lượng bán theo từng sản phẩm
 * (Đưa hàm này lên trước hàm getBestSellingProduct để tái sử dụng)
 * @param {Array} orders - Danh sách đơn hàng
 * @returns {Array} Mảng các object { productId, name, quantity } giảm dần theo quantity
 */
export function groupSoldQuantityByProduct(orders) {
  const safeOrders = safeArray(orders);
  if (safeOrders.length === 0) return [];
  
  const productMap = {};
  
  safeOrders.forEach(order => {
    const items = safeArray(order.items);
    items.forEach(item => {
      const pid = item.productId;
      if (!pid) return; // Bỏ qua nếu không có productId
      
      if (!productMap[pid]) {
        productMap[pid] = {
          productId: pid,
          name: item.name || '',
          quantity: 0
        };
      }
      productMap[pid].quantity += (item.quantity || 0);
    });
  });
  
  const result = Object.values(productMap);
  
  // Sắp xếp số lượng bán giảm dần
  result.sort((a, b) => b.quantity - a.quantity);
  
  return result;
}

/**
 * 4. Lấy sản phẩm bán chạy nhất
 * @param {Array} orders - Danh sách đơn hàng
 * @returns {Object|null} Object sản phẩm { productId, name, quantity } hoặc null
 */
export function getBestSellingProduct(orders) {
  const grouped = groupSoldQuantityByProduct(orders);
  if (grouped.length === 0) return null;
  
  // Do mảng grouped đã sắp xếp giảm dần, phần tử đầu tiên chính là best selling
  return grouped[0];
}

/**
 * 5. Lấy danh sách sản phẩm sắp hết hàng
 * @param {Array} products - Danh sách sản phẩm trong kho
 * @param {number} threshold - Ngưỡng số lượng (mặc định = 5)
 * @returns {Array} Danh sách sản phẩm có stock <= threshold
 */
export function getLowStockProducts(products, threshold = 5) {
  return safeArray(products).filter(product => {
    const stock = product.stock !== undefined ? product.stock : 0;
    return stock <= threshold;
  });
}

/**
 * 6. Gom doanh thu theo ngày dựa trên createdAt
 * @param {Array} orders - Danh sách đơn hàng
 * @returns {Array} Mảng object { date, revenue } sắp xếp tăng dần theo ngày
 */
export function groupRevenueByDate(orders) {
  const safeOrders = safeArray(orders);
  if (safeOrders.length === 0) return [];
  
  const revenueMap = {};
  
  safeOrders.forEach(order => {
    if (!order.createdAt) return;
    
    // createdAt có dạng "2026-07-06T10:15:30.000Z", cắt lấy phần ngày "2026-07-06"
    const date = order.createdAt.split('T')[0]; 
    
    if (!revenueMap[date]) {
      revenueMap[date] = 0;
    }
    revenueMap[date] += (order.totalAmount || 0);
  });
  
  const result = Object.keys(revenueMap).map(date => ({
    date,
    revenue: revenueMap[date]
  }));
  
  // Sắp xếp ngày tăng dần
  result.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return result;
}
