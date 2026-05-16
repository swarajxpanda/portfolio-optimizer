export default function FragilityHero({ hero, summary }) {
  const action = hero?.actions?.[0];
  const passiveMessage =
    summary?.mode === "ok"
      ? "No rebalance trigger is active right now."
      : summary?.status_message || "Fragility analysis is currently limited.";

  if (!action) {
    return (
      <div className="border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-3)]">
          Alert
        </div>
        <div className="mt-1 font-mono text-sm text-[var(--text-1)]">
          {hero?.title || summary?.status_message || "Fragility engine ready"}
        </div>
        <div className="mt-1 font-mono text-[10px] text-[var(--text-2)]">{passiveMessage}</div>
      </div>
    );
  }

  return (
    <div className="border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--warning)]">
        {action.type.replace("_", " ")}
      </div>
      <div className="mt-1 font-mono text-sm text-[var(--text-1)]">{action.title}</div>
      <div className="mt-1 font-mono text-[10px] text-[var(--text-2)]">{action.detail}</div>
    </div>
  );
}
