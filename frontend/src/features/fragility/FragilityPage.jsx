import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import PageShell from "../../components/layout/PageShell";
import { buildFragilityMetrics } from "./lib/fragilityMetrics";
import FragilityHero from "./components/FragilityHero";
import FragilitySummaryMetrics from "./components/FragilitySummaryMetrics";
import FragilityEnbPanel from "./components/FragilityEnbPanel";
import FragilityHeatmap from "./components/FragilityHeatmap";
import { useFragilityOverview } from "./hooks/useFragilityOverview";
import { useEffect } from "react";

export default function FragilityPage() {
  const { data, loading, refresh } = useFragilityOverview();

  useEffect(() => {
    const handleRefresh = () => refresh();
    window.addEventListener("dashboard:refresh", handleRefresh);
    return () => window.removeEventListener("dashboard:refresh", handleRefresh);
  }, [refresh]);

  if (loading) {
    return (
      <LoadingState
        title="Building fragility model"
        description="Fetching historical windows, shrinkage covariance, clusters, ENB, stress regime, and action evidence."
      />
    );
  }

  if (!data) {
    return <EmptyState actionLabel="Retry" onAction={refresh} title="Fragility analysis unavailable" />;
  }

  const summary = data.summary || {};
  const evidence = data.evidence || {};
  const metrics = buildFragilityMetrics(summary, data.why?.metrics || []);
  const alertAction = data.hero?.actions?.[0] || null;

  return (
    <PageShell
      eyebrow="Portfolio Fragility"
      title="Correlation structure, independent bets, and stress compression."
      description="Action-first diversification analysis built from Ledoit-Wolf shrinkage covariance, cluster exposure, and effective number of bets."
    >
      <div className="space-y-6">
        {alertAction ? <FragilityHero hero={data.hero || {}} summary={summary} /> : null}
        {metrics.length ? <FragilitySummaryMetrics metrics={metrics.slice(0, 4)} /> : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <FragilityEnbPanel
            gauge={evidence.gauge}
            summary={summary}
            enbRows={evidence.enb_breakdown || []}
          />
          <FragilityHeatmap heatmap={evidence.matrix || evidence.heatmap} />
        </div>
      </div>
    </PageShell>
  );
}
