const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const compactInrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatINR(value, { compact = false } = {}) {
  const amount = Number(value || 0);
  return compact ? compactInrFormatter.format(amount) : inrFormatter.format(amount);
}

export function formatSignedINR(value, { compact = false } = {}) {
  const amount = Number(value || 0);
  const formatted = compact ? compactInrFormatter.format(Math.abs(amount)) : inrFormatter.format(Math.abs(amount));
  if (amount > 0) return `+${formatted}`;
  if (amount < 0) return `-${formatted}`;
  return formatted;
}

export function formatPercent(value, digits = 1, { signed = false } = {}) {
  const numericValue = Number(value || 0);
  const sign = signed && numericValue > 0 ? "+" : "";
  return `${sign}${numericValue.toFixed(digits)}%`;
}

export function formatNumber(value, digits = 0) {
  return Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

export function formatRatio(value, digits = 2) {
  return Number(value || 0).toFixed(digits);
}
