import MetricCard from "../../../components/ui/MetricCard";

export default function FragilitySummaryMetrics({ metrics }) {
  return (
    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.id} compact {...metric} />
      ))}
    </div>
  );
}
