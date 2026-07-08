const API_URL = 'http://localhost:3000/orders';

/**
 * Lấy danh sách tất cả đơn hàng từ server
 * @returns {Promise<Array>} Danh sách đơn hàng
 */
export async function getOrders() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Lỗi khi lấy danh sách đơn hàng: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('getOrders error:', error);
    throw error;
  }
}

/**
 * Tạo một đơn hàng mới
 * @param {Object} order - Dữ liệu đơn hàng cần tạo
 * @returns {Promise<Object>} Đơn hàng vừa được tạo thành công
 */
export async function createOrder(order) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(order)
    });
    
    if (!response.ok) {
      throw new Error(`Lỗi khi tạo đơn hàng: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('createOrder error:', error);
    throw error;
  }
}

/**
 * Sinh mã đơn hàng ngẫu nhiên, đơn giản
 * @returns {string} Mã đơn hàng (ví dụ: o-1678901234567)
 */
export function generateOrderId() {
  return 'o-' + Date.now();
}
