export function buildFragilityMetrics(summary, fallbackMetrics = []) {
  if (summary?.mode !== "ok") {
    const toneMap = { amber: "warning", red: "danger", blue: "info", green: "positive", slate: "neutral" };
    return fallbackMetrics.map((metric) => ({
      ...metric,
      tone: toneMap[metric.tone] || metric.tone || "neutral",
    }));
  }

  return [
    {
      id: "diversification_score",
      label: "Diversification Score",
      value: Math.round(Number(summary.diversification_score || 0)),
      suffix: "/ 100",
      detail: summary.diversification_classification || "Unavailable",
      tone:
        Number(summary.diversification_score || 0) >= 75
          ? "positive"
          : Number(summary.diversification_score || 0) >= 50
            ? "warning"
            : "danger",
    },
    {
      id: "effective_bets",
      label: "Effective Bets",
      value: Number(summary.portfolio_enb || 0).toFixed(1),
      suffix: `of ${summary.usable_holdings || 0}`,
      detail: "Independent risk buckets left after correlation compression",
      tone: "info",
    },
    {
      id: "top_cluster_exposure",
      label: "Top Cluster Exposure",
      value: Math.round(Number(summary.top_cluster_exposure || 0)),
      suffix: "%",
      detail: `Top 2 clusters together are ${Number(summary.top_two_cluster_exposure || 0).toFixed(1)}%`,
      tone: Number(summary.top_cluster_exposure || 0) >= 35 ? "danger" : "warning",
    },
    {
      id: "stress_risk_multiplier",
      label: "Stress Multiplier",
      value: Number(summary.stress_risk_multiplier || 0).toFixed(2),
      suffix: "x",
      detail: summary.stress_classification || "Unavailable",
      tone: Number(summary.stress_risk_multiplier || 0) >= 1.4 ? "danger" : "warning",
    },
    {
      id: "correlation_regime",
      label: "Regime Delta",
      value: `${Number(summary.correlation_regime_delta || 0) >= 0 ? "+" : ""}${Number(summary.correlation_regime_delta || 0).toFixed(2)}`,
      suffix: "delta",
      detail: summary.correlation_regime_classification || "Unavailable",
      tone:
        Number(summary.correlation_regime_delta || 0) >= 0.2
          ? "danger"
          : Number(summary.correlation_regime_delta || 0) >= 0.15
            ? "warning"
            : "info",
    },
  ];
}
