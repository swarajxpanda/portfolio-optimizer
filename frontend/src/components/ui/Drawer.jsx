import Button from "./Button";

export default function Drawer({ children, footer, onClose, title }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close panel"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />
      <aside className="relative flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-[var(--border)] bg-[var(--bg)]">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg)] px-4 py-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-3)]">
              Configuration
            </div>
            <h2 className="mt-1 font-mono text-sm font-semibold text-[var(--text-1)]">{title}</h2>
          </div>
          <Button onClick={onClose} variant="ghost" className="px-3">
            Close
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto p-[1px]">{children}</div>
        {footer ? (
          <footer className="sticky bottom-0 border-t border-[var(--border)] bg-[var(--bg)] px-4 py-3">
            {footer}
          </footer>
        ) : null}
      </aside>
    </div>
  );
}
