import { NAV_ITEMS } from "../../constants/navigation";
import { cn } from "../../utils/classNames";

function emitDashboardEvent(name) {
  window.dispatchEvent(new CustomEvent(name));
}

export default function TopBar({ activeItem, onViewChange }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)] px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex w-full flex-wrap items-center gap-3">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-[3px] border border-[var(--border-1)] bg-[var(--surface)] font-mono text-[11px] font-bold tracking-[0.16em] text-[var(--text-1)]"
          onClick={() => onViewChange("overview")}
          type="button"
        >
          PO
        </button>
        <div className="min-w-fit">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--text-3)]">
            {activeItem.eyebrow}
          </div>
          <h2 className="mt-1 font-mono text-sm font-semibold tracking-tight text-[var(--text-1)] sm:text-base">
            {activeItem.label}
          </h2>
        </div>
        <nav className="order-3 flex w-full gap-1 overflow-x-auto border-x border-[var(--border)] px-2 lg:order-none lg:flex-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={cn(
                "min-w-fit rounded-[3px] border px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] transition",
                item.id === activeItem.id
                  ? "border-[var(--text-1)] bg-[var(--surface-1)] text-[var(--text-1)]"
                  : "border-transparent text-[var(--text-2)] hover:border-[var(--border-1)] hover:bg-[var(--surface)] hover:text-[var(--text-1)]",
              )}
              onClick={() => onViewChange(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button
            aria-label="Configure"
            className="inline-flex h-8 items-center gap-2 rounded-[3px] border border-[var(--border-1)] bg-[var(--surface)] px-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-2)] transition hover:border-[var(--text-2)] hover:text-[var(--text-1)]"
            onClick={() => emitDashboardEvent("dashboard:configure")}
            type="button"
            title="Configure"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path d="M4 21V14" />
              <path d="M4 10V3" />
              <path d="M12 21V12" />
              <path d="M12 8V3" />
              <path d="M20 21V16" />
              <path d="M20 12V3" />
              <path d="M2 14H6" />
              <path d="M10 8H14" />
              <path d="M18 16H22" />
            </svg>
          </button>
          <button
            className="inline-flex h-8 items-center rounded-[3px] border border-[var(--border-1)] bg-[var(--surface)] px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-2)] transition hover:border-[var(--text-3)] hover:text-[var(--text-1)]"
            onClick={() => emitDashboardEvent("dashboard:refresh")}
            type="button"
          >
            Refresh
          </button>
        </div>
      </div>
    </header>
  );
}
