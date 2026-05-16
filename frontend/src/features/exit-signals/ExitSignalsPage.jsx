import { useEffect, useState } from "react";
import PageShell from "../../components/layout/PageShell";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import ExitSettingsDrawer from "./components/ExitSettingsDrawer";
import ExitSignalsTable from "./components/ExitSignalsTable";
import ExitSummaryMetrics from "./components/ExitSummaryMetrics";
import { useExitSignals } from "./hooks/useExitSignals";

export default function ExitSignalsPage() {
  const [showSettings, setShowSettings] = useState(false);
  const { data, loading, refresh } = useExitSignals();

  useEffect(() => {
    const handleRefresh = () => refresh();
    const handleConfigure = () => setShowSettings(true);

    window.addEventListener("dashboard:refresh", handleRefresh);
    window.addEventListener("dashboard:configure", handleConfigure);

    return () => {
      window.removeEventListener("dashboard:refresh", handleRefresh);
      window.removeEventListener("dashboard:configure", handleConfigure);
    };
  }, [refresh]);

  if (loading) {
    return (
      <LoadingState
        title="Analysing exit pressure"
        description="Fetching price history and scoring holdings across loss, volatility, efficiency, trend, and concentration."
      />
    );
  }

  if (!data) {
    return <EmptyState actionLabel="Retry" onAction={refresh} title="Exit signals unavailable" />;
  }

  return (
    <PageShell
      eyebrow="Exit Signals"
      title="Rule-based discipline for trim, watch, and exit decisions."
      description="A compact risk grid that turns portfolio state and price history into explainable action scores."
    >
      <div className="space-y-6">
        <ExitSummaryMetrics summary={data.summary} />
        <ExitSignalsTable signals={data.signals || []} />
      </div>

      {showSettings ? (
        <ExitSettingsDrawer onClose={() => setShowSettings(false)} onSaved={refresh} />
      ) : null}
    </PageShell>
  );
}
