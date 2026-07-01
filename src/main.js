import {
  validateQuantity,
  calculateLineTotal,
  calculateCartTotal,
  updateStockAfterCheckout,
  addItemToCart
} from './services/cartService.js';

import {
  getProducts,
  updateProductStock
} from './services/productApi.js';

import {
  formatMoney
} from './utils/formatMoney.js';

// Trạng thái của ứng dụng (State)
let products = [];
let cartItems = [];

// Các phần tử DOM cần tương tác
const productListEl = document.getElementById('product-list');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const btnCheckout = document.getElementById('btn-checkout');
const btnReload = document.getElementById('btn-reload');
const messageContainer = document.getElementById('message-container');

/**
 * Hiển thị thông báo thành công hoặc lỗi lên giao diện
 * @param {string} text - Nội dung thông báo
 * @param {'success'|'danger'} type - Loại thông báo (màu xanh hoặc màu đỏ)
 */
function showMessage(text, type) {
  messageContainer.className = `alert alert-${type}`;
  messageContainer.textContent = text;
  messageContainer.classList.remove('d-none');
}

/**
 * Ẩn thông báo hiện tại
 */
function hideMessage() {
  messageContainer.classList.add('d-none');
}

/**
 * Lấy danh sách sản phẩm từ API và hiển thị lên UI
 */
async function loadProducts() {
  try {
    products = await getProducts();
    renderProducts();
  } catch (error) {
    showMessage('Không thể kết nối đến API Server. Vui lòng bật json-server!', 'danger');
  }
}

/**
 * Render danh sách sản phẩm ra bảng HTML
 */
function renderProducts() {
  productListEl.innerHTML = '';
  
  if (products.length === 0) {
    productListEl.innerHTML = `<tr><td colspan="6" class="empty-text">Không có sản phẩm nào</td></tr>`;
    return;
  }

  products.forEach(product => {
    const tr = document.createElement('tr');
    tr.setAttribute('data-testid', `product-row-${product.id}`);

    tr.innerHTML = `
      <td><strong>${product.code}</strong></td>
      <td class="fw-bold">${product.name}</td>
      <td>${formatMoney(product.price)}</td>
      <td>
        <span class="badge rounded-circle px-2 py-1 stock-badge ${product.stock > 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}" data-testid="product-stock-${product.id}">${product.stock}</span>
      </td>
      <td>
        <input 
          type="number" 
          id="qty-${product.id}" 
          class="form-control form-control-sm text-center mx-auto" 
          value="1" 
          min="1" 
          data-testid="product-quantity-${product.id}"
        >
      </td>
      <td>
        <button 
          class="btn btn-add btn-sm" 
          data-id="${product.id}" 
          data-testid="add-to-cart-${product.id}"
          ${product.stock <= 0 ? 'disabled' : ''}
        >
          Thêm vào giỏ
        </button>
      </td>
    `;
    productListEl.appendChild(tr);
  });
}

/**
 * Render danh sách sản phẩm trong giỏ hàng và tổng tiền dưới dạng Card/Divs
 */
function renderCart() {
  cartItemsEl.innerHTML = '';
  
  if (cartItems.length === 0) {
    cartItemsEl.innerHTML = `<div class="empty-text py-4 text-center text-muted">Giỏ hàng đang trống</div>`;
    cartTotalEl.textContent = '0 đ';
    return;
  }

  cartItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'border rounded p-3 mb-2 bg-white shadow-sm cart-item-card';
    div.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <span class="fw-bold text-dark">${item.name}</span>
        <span class="fw-bold text-dark">${formatMoney(calculateLineTotal(item.price, item.quantity))}</span>
      </div>
      <div class="text-muted small mt-1">${item.quantity} x ${formatMoney(item.price)}</div>
    `;
    cartItemsEl.appendChild(div);
  });

  const total = calculateCartTotal(cartItems);
  cartTotalEl.textContent = formatMoney(total);
}

/**
 * Xử lý sự kiện khi bấm nút "Thêm vào giỏ"
 * @param {string} productId 
 */
function handleAddToCart(productId) {
  hideMessage();
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const qtyInput = document.getElementById(`qty-${productId}`);
  const quantity = Number(qtyInput.value);

  // Tìm sản phẩm trong giỏ để kiểm tra số lượng cộng dồn
  const existingItem = cartItems.find(item => item.id === productId);
  const currentQtyInCart = existingItem ? existingItem.quantity : 0;
  
  // 1. Validate số lượng nhập vào
  const inputValidation = validateQuantity(quantity, product.stock);
  if (!inputValidation.isValid) {
    showMessage(inputValidation.message, 'danger');
    return;
  }

  // 2. Validate số lượng cộng dồn
  const totalQty = quantity + currentQtyInCart;
  const totalValidation = validateQuantity(totalQty, product.stock);
  if (!totalValidation.isValid) {
    showMessage(`Tổng số lượng trong giỏ (${totalQty}) vượt quá tồn kho (${product.stock})`, 'danger');
    return;
  }

  // Thêm vào giỏ hàng và render lại
  cartItems = addItemToCart(cartItems, product, quantity);
  renderCart();
  
  // Reset lại ô nhập về 1
  qtyInput.value = 1;
  showMessage('Đã thêm sản phẩm vào giỏ hàng', 'success');
}

/**
 * Xử lý thanh toán đơn hàng
 */
async function handleCheckout() {
  hideMessage();
  
  // 1. Kiểm tra giỏ hàng rỗng
  if (cartItems.length === 0) {
    showMessage('Giỏ hàng đang rỗng', 'danger');
    return;
  }

  try {
    btnCheckout.disabled = true;
    
    // Tính toán tồn kho mới
    const updatedProducts = updateStockAfterCheckout(products, cartItems);
    
    // 2. Cập nhật tồn kho từng sản phẩm lên json-server
    for (const item of cartItems) {
      const updatedProduct = updatedProducts.find(p => p.id === item.id);
      await updateProductStock(item.id, updatedProduct.stock);
    }

    // 3. Thanh toán thành công: hiển thị thông báo, làm rỗng giỏ, tải lại sản phẩm
    showMessage('Thanh toán thành công', 'success');
    cartItems = [];
    renderCart();
    await loadProducts();
  } catch (error) {
    showMessage('Gặp lỗi khi thanh toán. Vui lòng thử lại!', 'danger');
  } finally {
    btnCheckout.disabled = false;
  }
}

// Lắng nghe sự kiện click trên bảng sản phẩm (Event Delegation)
productListEl.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-add')) {
    const productId = e.target.getAttribute('data-id');
    handleAddToCart(productId);
  }
});

// Lắng nghe sự kiện nút thanh toán
btnCheckout.addEventListener('click', handleCheckout);

// Lắng nghe sự kiện nút tải lại danh sách sản phẩm
btnReload.addEventListener('click', () => {
  hideMessage();
  loadProducts();
});

// Chạy lần đầu khi tải trang
window.addEventListener('DOMContentLoaded', loadProducts);
