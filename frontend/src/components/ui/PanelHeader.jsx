export default function PanelHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow ? (
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-3)]">
            {eyebrow}
          </div>
        ) : null}
        {title ? <h2 className="mt-1 font-mono text-sm font-semibold text-[var(--text-1)]">{title}</h2> : null}
        {description ? <p className="mt-1 font-mono text-[10px] leading-5 text-[var(--text-2)]">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
