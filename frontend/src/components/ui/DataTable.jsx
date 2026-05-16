import Card from "./Card";
import PanelHeader from "./PanelHeader";
import { cn } from "../../utils/classNames";

export function TableShell({ children, className = "", description, title }) {
  return (
    <Card className={cn("overflow-hidden rounded-[20px]", className)}>
      {(title || description) ? (
        <div className="border-b border-[var(--border)] px-5 py-4">
          <PanelHeader eyebrow="Data Grid" title={title} description={description} />
        </div>
      ) : null}
      {children}
    </Card>
  );
}

export function TableHeader({ children, className = "" }) {
  return (
    <div
      className={cn(
        "grid border-b border-[var(--border)] bg-[var(--surface)] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-3)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TableRow({ children, className = "" }) {
  return (
    <div
      className={cn(
        "grid border-b border-[var(--border)] px-5 py-3.5 text-sm text-[var(--text-1)] transition-colors duration-100 hover:bg-[var(--surface-1)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SortHeader({ active, align = "left", children, direction, onClick }) {
  return (
    <button
      className={cn(
        "select-none text-left transition hover:text-slate-200",
        align === "right" && "text-right",
        align === "center" && "text-center",
        active && "text-cyan-200",
      )}
      onClick={onClick}
      type="button"
    >
      {children}
      {active ? <span className="ml-1">{direction === "asc" ? "ASC" : "DESC"}</span> : null}
    </button>
  );
}
