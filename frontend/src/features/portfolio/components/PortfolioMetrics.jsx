import MetricCard from "../../../components/ui/MetricCard";
import { formatINR, formatPercent, formatSignedINR } from "../../../utils/formatters";
import { getSignedTone } from "../../../utils/finance";

export default function PortfolioMetrics({ health }) {
  const metrics = [
    {
      label: "Total Value",
      value: formatINR(health.total_value),
      detail: "Current marked-to-market portfolio value",
      tone: "neutral",
    },
    {
      label: "Net P&L",
      value: formatSignedINR(health.total_pnl),
      detail: "Unrealized profit and loss across holdings",
      tone: getSignedTone(health.total_pnl),
    },
    {
      label: "Return",
      value: formatPercent(health.return_pct, 1, { signed: true }),
      detail: "Return on invested capital",
      tone: getSignedTone(health.return_pct),
    },
    {
      label: "Capital At Risk",
      value: formatINR(health.capital_at_risk),
      detail: "Current value sitting in loss-making positions",
      tone: "negative",
    },
  ];

  return (
    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} compact {...metric} />
      ))}
    </div>
  );
}
