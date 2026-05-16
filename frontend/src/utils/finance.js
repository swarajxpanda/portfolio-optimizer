export function getSignedTone(value) {
  return Number(value || 0) >= 0 ? "positive" : "negative";
}

export function getRiskTone(value, thresholds = { high: 70, medium: 30 }) {
  const score = Number(value || 0);
  if (score >= thresholds.high) return "danger";
  if (score >= thresholds.medium) return "warning";
  return "positive";
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value || 0)));
}
