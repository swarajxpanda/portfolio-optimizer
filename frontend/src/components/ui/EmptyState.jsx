import Button from "./Button";

export default function EmptyState({
  title = "No data available",
  description = "Try refreshing the analytics engine.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="w-full rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-5 text-center shadow-sm shadow-black/20">
      <div className="mx-auto h-8 w-8 border border-[var(--border-1)] bg-[var(--surface-1)]" />
      <h3 className="mt-3 font-mono text-sm font-semibold text-[var(--text-1)]">{title}</h3>
      <p className="mx-auto mt-2 max-w-lg font-mono text-[10px] leading-5 text-[var(--text-2)]">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-4" onClick={onAction} variant="secondary">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
