export default function LoadingState({ title = "Loading market data", description }) {
  return (
    <div className="flex min-h-[420px] w-full items-center justify-center p-4 sm:p-6">
      <div className="w-full rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 bg-[var(--text-1)]" />
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-3)]">
            Live Analytics
          </div>
        </div>
        <h2 className="mt-4 font-mono text-sm font-semibold text-[var(--text-1)]">{title}</h2>
        {description ? <p className="mt-2 font-mono text-[10px] leading-5 text-[var(--text-2)]">{description}</p> : null}
        <div className="mt-4 grid gap-2">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-2 bg-[var(--border)]">
              <div className="h-full w-2/3 bg-[var(--border-1)]" style={{ marginLeft: `${item * 12}px` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
