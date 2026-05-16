import { clamp } from "../../../utils/finance";

function getScoreColor(score) {
  if (score >= 70) return "#fb7185";
  if (score >= 50) return "#fb923c";
  if (score >= 30) return "#facc15";
  return "#2a2a35";
}

export default function ExitScoreBar({ score }) {
  const pct = clamp(score, 0, 100);
  const color = getScoreColor(pct);
  const filled = Math.round(pct / 10);

  return (
    <div className="flex min-w-36 items-center gap-2">
      <div className="grid h-2 flex-1 grid-cols-10 gap-px">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className="h-2 rounded-[2px]"
            style={{
              backgroundColor: index < filled ? color : "#2a2a35",
            }}
          />
        ))}
      </div>
      <span className="w-10 text-right font-mono text-[10px] font-semibold tabular-nums text-[var(--text-1)]">
        {score}
      </span>
    </div>
  );
}
