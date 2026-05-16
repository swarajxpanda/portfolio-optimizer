import { NAV_ITEMS } from "../../constants/navigation";
import TopBar from "./TopBar";

export default function AppShell({ activeView, children, onViewChange }) {
  const activeItem = NAV_ITEMS.find((item) => item.id === activeView) || NAV_ITEMS[0];

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-dashboard text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,rgba(10,10,11,0.98),rgba(10,10,11,1))]" />
      <div className="relative flex min-h-screen flex-col overflow-hidden">
        <TopBar activeItem={activeItem} onViewChange={onViewChange} />
        <main className="mx-auto flex min-h-0 w-full max-w-[1680px] flex-1 overflow-x-hidden overflow-y-auto px-4 py-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
