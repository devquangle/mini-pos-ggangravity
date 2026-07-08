import { getProducts } from './services/productApi.js';
import { getOrders } from './services/orderApi.js';
import {
  calculateTotalRevenue,
  countTotalOrders,
  calculateTotalSoldQuantity,
  getBestSellingProduct,
  getLowStockProducts,
  groupRevenueByDate,
  groupSoldQuantityByProduct
} from './services/reportService.js';
import { formatMoney } from './utils/formatMoney.js';

// Lấy các phần tử DOM
const messageContainer = document.getElementById('dashboard-message');
const totalRevenueEl = document.getElementById('total-revenue');
const totalOrdersEl = document.getElementById('total-orders');
const totalSoldQtyEl = document.getElementById('total-sold-quantity');
const bestSellingEl = document.getElementById('best-selling-product');
const lowStockListEl = document.getElementById('low-stock-list');

/**
 * Hiển thị thông báo lỗi lên giao diện
 */
function showError(message) {
  if (messageContainer) {
    messageContainer.textContent = message;
    messageContainer.classList.remove('d-none');
    messageContainer.classList.add('alert-danger');
  }
}

/**
 * Cập nhật giao diện 4 thẻ thống kê tổng quan
 */
function updateSummaryCards(orders) {
  // 1. Tổng doanh thu
  const revenue = calculateTotalRevenue(orders);
  totalRevenueEl.textContent = formatMoney(revenue);

  // 2. Tổng số đơn hàng
  const ordersCount = countTotalOrders(orders);
  totalOrdersEl.textContent = ordersCount.toString();

  // 3. Số sản phẩm đã bán
  const soldQty = calculateTotalSoldQuantity(orders);
  totalSoldQtyEl.textContent = soldQty.toString();

  // 4. Bán chạy nhất
  const bestSeller = getBestSellingProduct(orders);
  if (bestSeller) {
    bestSellingEl.textContent = `${bestSeller.name} (${bestSeller.quantity})`;
  } else {
    bestSellingEl.textContent = 'Chưa có đơn hàng';
  }
}

/**
 * Cập nhật danh sách sản phẩm sắp hết hàng (tồn kho <= 5)
 */
function updateLowStockList(products) {
  const lowStockProducts = getLowStockProducts(products, 5);
  lowStockListEl.innerHTML = '';

  if (lowStockProducts.length === 0) {
    lowStockListEl.innerHTML = '<div class="text-success small fw-medium">Tốt! Không có sản phẩm nào sắp hết hàng.</div>';
    return;
  }

  // Render HTML cho từng thẻ sản phẩm
  lowStockProducts.forEach(product => {
    const div = document.createElement('div');
    div.className = 'col-sm-6 col-md-4 col-lg-3';
    div.innerHTML = `
      <div class="low-stock-item p-3 shadow-sm bg-danger-subtle border-danger-subtle rounded-3">
        <div class="fw-bold text-dark">${product.name}</div>
        <div class="small text-muted mb-1">Mã: ${product.code}</div>
        <p class="warning-text text-danger m-0 fw-bold">Còn lại: ${product.stock}</p>
      </div>
    `;
    lowStockListEl.appendChild(div);
  });
}

/**
 * Vẽ biểu đồ doanh thu theo ngày
 */
function renderRevenueChart(orders) {
  const ctx = document.getElementById('revenue-chart');
  if (!ctx) return;

  const revenueData = groupRevenueByDate(orders);
  if (revenueData.length === 0) return; // Bỏ qua nếu không có đơn hàng

  const labels = revenueData.map(item => item.date);
  const data = revenueData.map(item => item.revenue);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Doanh thu (₫)',
        data: data,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

/**
 * Vẽ biểu đồ tồn kho hiện tại
 */
function renderStockChart(products) {
  const ctx = document.getElementById('stock-chart');
  if (!ctx) return;

  const labels = products.map(p => p.name);
  const data = products.map(p => p.stock);

  new Chart(ctx, {
    type: 'bar', // Có thể đổi thành 'pie' nếu muốn đa dạng
    data: {
      labels: labels,
      datasets: [{
        label: 'Tồn kho',
        data: data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

/**
 * Vẽ biểu đồ số lượng bán ra theo từng sản phẩm
 */
function renderSoldQuantityChart(orders) {
  const ctx = document.getElementById('sold-quantity-chart');
  if (!ctx) return;

  const soldData = groupSoldQuantityByProduct(orders);
  if (soldData.length === 0) return;

  const labels = soldData.map(item => item.name);
  const data = soldData.map(item => item.quantity);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Số lượng bán',
        data: data,
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

/**
 * Hàm chính để lấy dữ liệu và khởi tạo toàn bộ giao diện Dashboard
 */
async function initDashboard() {
  try {
    // Dùng Promise.all để fetch API song song (tối ưu hiệu năng)
    const [orders, products] = await Promise.all([
      getOrders(),
      getProducts()
    ]);

    // 1. Cập nhật số liệu chữ
    updateSummaryCards(orders);
    updateLowStockList(products);

    // 2. Vẽ 3 biểu đồ
    renderRevenueChart(orders);
    renderStockChart(products);
    renderSoldQuantityChart(orders);

  } catch (error) {
    console.error('Lỗi khi tải dữ liệu dashboard:', error);
    showError('Không thể kết nối máy chủ để tải dữ liệu. Vui lòng đảm bảo json-server đang chạy.');
  }
}

// Khởi chạy khi DOM đã load xong
window.addEventListener('DOMContentLoaded', initDashboard);
