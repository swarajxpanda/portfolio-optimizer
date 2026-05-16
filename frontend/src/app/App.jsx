import { lazy, Suspense, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import AppShell from "../components/layout/AppShell";
import LoadingState from "../components/ui/LoadingState";
import { getAuthStatus } from "../services/authService";
import LoginPage from "../features/auth/LoginPage";

const PortfolioOverviewPage = lazy(() => import("../features/portfolio/PortfolioOverviewPage"));
const ExitSignalsPage = lazy(() => import("../features/exit-signals/ExitSignalsPage"));
const FragilityPage = lazy(() => import("../features/fragility/FragilityPage"));

const PAGES = {
  overview: PortfolioOverviewPage,
  exit: ExitSignalsPage,
  fragility: FragilityPage,
};

export default function App() {
  const [authenticated, setAuthenticated] = useState(null);
  const [activeView, setActiveView] = useState("overview");

  useEffect(() => {
    let cancelled = false;

    getAuthStatus()
      .then((status) => {
        if (!cancelled) setAuthenticated(status);
      })
      .catch(() => {
        if (!cancelled) setAuthenticated(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const ActivePage = PAGES[activeView] || PortfolioOverviewPage;

  if (authenticated === null) {
    return (
      <>
        <LoadingState
          title="Opening brokerage workspace"
          description="Checking Kite session state before loading the dashboard."
        />
        <Toaster position="top-right" />
      </>
    );
  }

  if (!authenticated) {
    return (
      <>
        <LoginPage />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <>
      <AppShell activeView={activeView} onViewChange={setActiveView}>
        <Suspense
          fallback={
            <LoadingState
              title="Loading analytics module"
              description="Preparing the selected workspace."
            />
          }
        >
          <ActivePage />
        </Suspense>
      </AppShell>
      <Toaster position="top-right" toastOptions={{ className: "terminal-toast" }} />
    </>
  );
}
