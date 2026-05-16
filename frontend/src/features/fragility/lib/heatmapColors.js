import { clamp } from "../../../utils/finance";

function mixColor(from, to, amount) {
  const t = clamp(amount, 0, 1);
  const parse = (hex) => [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = parse(from);
  const [r2, g2, b2] = parse(to);
  const channel = (start, end) => Math.round(start + (end - start) * t);
  return `rgb(${channel(r1, r2)}, ${channel(g1, g2)}, ${channel(b1, b2)})`;
}

export function getHeatCellBackground(value, diagonal) {
  if (diagonal) return "#1d2430";

  const numericValue = clamp(value, -1, 1);
  if (numericValue < 0) return mixColor("#111827", "#1d4ed8", Math.abs(numericValue));
  if (numericValue < 0.25) return mixColor("#111827", "#0f766e", numericValue / 0.25);
  if (numericValue < 0.55) return mixColor("#172018", "#ca8a04", (numericValue - 0.25) / 0.3);
  return mixColor("#24151a", "#be123c", (numericValue - 0.55) / 0.45);
}

export function getHeatTextColor(value, diagonal) {
  if (diagonal) return "#64748b";
  const numericValue = Number(value || 0);
  if (numericValue >= 0.7) return "#ffe4e6";
  if (numericValue >= 0.55) return "#fef3c7";
  if (numericValue >= 0.3) return "#ccfbf1";
  if (numericValue >= 0) return "#a7f3d0";
  return "#bfdbfe";
}
