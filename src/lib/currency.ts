const takaNumber = new Intl.NumberFormat("en-BD", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number | string): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "৳0.00";
  return "৳" + takaNumber.format(amount);
}
