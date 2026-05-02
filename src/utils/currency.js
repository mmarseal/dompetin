/**
 * src/utils/currency.js
 * Formats a number as Indonesian Rupiah (IDR).
 * Example: 25520000 → "Rp 25.520.000"
 */
export const formatRupiah = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  })
    .format(amount)
    .replace('IDR', 'Rp')
    .trim();
