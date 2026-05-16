import { clamp } from "../../utils/finance";

export default function ProgressBar({ value, color = "#67e8f9", className = "" }) {
  const pct = clamp(value, 0, 100);

  return (
    <div className={`h-2 overflow-hidden rounded-[3px] bg-[var(--border)] ${className}`.trim()}>
      <div
        className="h-full rounded-[3px] transition-all duration-500"
        style={{
          width: `${pct}%`,
          background: color,
        }}
      />
    </div>
  );
}
