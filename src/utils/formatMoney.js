/**
 * Hàm định dạng tiền tệ Việt Nam (VND)
 * @param {number} value - Số tiền cần định dạng (Ví dụ: 25000)
 * @returns {string} Chuỗi tiền tệ được định dạng (Ví dụ: 25.000 đ)
 */
export function formatMoney(value) {
  if (value === undefined || value === null || isNaN(value)) {
    return '0 đ';
  }
  return new Intl.NumberFormat('vi-VN').format(value) + ' đ';
}
