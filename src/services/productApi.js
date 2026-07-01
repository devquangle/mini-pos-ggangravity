/**
 * Dịch vụ gọi API kết nối đến json-server giả lập database
 */

const API_URL = 'http://localhost:3000/products';

/**
 * Lấy danh sách sản phẩm từ json-server
 * @returns {Promise<Array>}
 */
export async function getProducts() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Không thể tải danh sách sản phẩm từ API');
    }
    return await response.json();
  } catch (error) {
    console.error('Lỗi API getProducts:', error);
    throw error;
  }
}

/**
 * Cập nhật tồn kho của một sản phẩm
 * @param {string|number} productId 
 * @param {number} newStock 
 * @returns {Promise<Object>}
 */
export async function updateProductStock(productId, newStock) {
  try {
    const response = await fetch(`${API_URL}/${productId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ stock: newStock })
    });
    if (!response.ok) {
      throw new Error(`Lỗi cập nhật sản phẩm ID: ${productId}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Lỗi API updateProductStock:', error);
    throw error;
  }
}
