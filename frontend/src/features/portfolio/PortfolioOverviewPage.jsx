import { useEffect, useState } from "react";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import PageShell from "../../components/layout/PageShell";
import AllocationTable from "./components/AllocationTable";
import ConcentrationTable from "./components/ConcentrationTable";
import PortfolioMetrics from "./components/PortfolioMetrics";
import PortfolioSettingsDrawer from "./components/PortfolioSettingsDrawer";
import { usePortfolioOverview } from "./hooks/usePortfolioOverview";

export default function PortfolioOverviewPage() {
  const [showSettings, setShowSettings] = useState(false);
  const { data, loading, refresh } = usePortfolioOverview();

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
        title="Loading allocation book"
        description="Fetching holdings, P&L, concentration checks, and rebalance bands."
      />
    );
  }

  if (!data) {
    return <EmptyState actionLabel="Retry" onAction={refresh} title="Portfolio unavailable" />;
  }

  return (
    <PageShell
      eyebrow="Portfolio Overview"
      title="Allocation control room for live holdings."
      description="Monitor current exposure, unrealized P&L, target drift, and concentration risk from a single dense workspace."
    >
      <div className="space-y-6">
        <PortfolioMetrics health={data.health} />
        <AllocationTable rows={data.allocation || []} />
        <ConcentrationTable rows={data.concentration || []} />
      </div>

      {showSettings ? (
        <PortfolioSettingsDrawer
          onClose={() => setShowSettings(false)}
          onSaved={refresh}
        />
      ) : null}
    </PageShell>
  );
}
