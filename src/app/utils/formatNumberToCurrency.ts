export const formatNumberToCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) {
    return 'N/A';
  }
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};