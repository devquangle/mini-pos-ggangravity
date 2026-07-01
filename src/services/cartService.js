/**
 * Logic nghiệp vụ Giỏ hàng (Cart Service)
 * Hoàn toàn thuần logic, không dùng DOM và không gọi API để phục vụ cho Unit Test.
 */

/**
 * Kiểm tra tính hợp lệ của số lượng mua hàng.
 * @param {number} quantity - Số lượng mua mong muốn
 * @param {number} stock - Số lượng tồn kho hiện tại
 * @returns {{isValid: boolean, message: string}}
 */
export function validateQuantity(quantity, stock) {
  const qty = Number(quantity);
  
  // 1. Kiểm tra số lượng có phải số nguyên hay không
  if (isNaN(qty) || !Number.isInteger(qty)) {
    return { isValid: false, message: 'Số lượng mua phải là số nguyên' };
  }
  
  // 2. Không cho mua số lượng <= 0
  if (qty <= 0) {
    return { isValid: false, message: 'Số lượng mua phải lớn hơn 0' };
  }
  
  // 3. Không cho mua vượt quá tồn kho
  if (qty > stock) {
    return { isValid: false, message: 'Số lượng mua vượt quá tồn kho hiện tại' };
  }
  
  return { isValid: true, message: '' };
}

/**
 * Tính thành tiền của một mặt hàng
 * @param {number} price 
 * @param {number} quantity 
 * @returns {number}
 */
export function calculateLineTotal(price, quantity) {
  return price * quantity;
}

/**
 * Tính tổng tiền của giỏ hàng
 * @param {Array<{price: number, quantity: number}>} cartItems 
 * @returns {number}
 */
export function calculateCartTotal(cartItems) {
  return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Cập nhật tồn kho sản phẩm sau khi thanh toán
 * @param {Array} products - Danh sách tất cả sản phẩm
 * @param {Array} cartItems - Danh sách sản phẩm trong giỏ
 * @returns {Array} Danh sách sản phẩm mới sau khi trừ kho
 */
export function updateStockAfterCheckout(products, cartItems) {
  return products.map(product => {
    const cartItem = cartItems.find(item => item.id === product.id);
    if (cartItem) {
      return {
        ...product,
        stock: product.stock - cartItem.quantity
      };
    }
    return product;
  });
}

/**
 * Thêm sản phẩm vào giỏ hàng (Nếu trùng sản phẩm thì cộng dồn số lượng)
 * @param {Array} cartItems - Giỏ hàng hiện tại
 * @param {Object} product - Sản phẩm muốn thêm
 * @param {number} quantity - Số lượng thêm
 * @returns {Array} Giỏ hàng mới
 */
export function addItemToCart(cartItems, product, quantity) {
  const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
  
  if (existingItemIndex > -1) {
    const newCartItems = [...cartItems];
    newCartItems[existingItemIndex] = {
      ...newCartItems[existingItemIndex],
      quantity: newCartItems[existingItemIndex].quantity + quantity
    };
    return newCartItems;
  } else {
    return [
      ...cartItems,
      {
        id: product.id,
        code: product.code,
        name: product.name,
        price: product.price,
        quantity: quantity
      }
    ];
  }
}

/**
 * Xóa sản phẩm khỏi giỏ hàng
 * @param {Array} cartItems - Giỏ hàng hiện tại
 * @param {string|number} productId - ID sản phẩm muốn xóa
 * @returns {Array} Giỏ hàng mới sau khi xóa
 */
export function removeItemFromCart(cartItems, productId) {
  return cartItems.filter(item => item.id !== productId);
}

