import Card from "./Card";
import { TONE_STYLES } from "../../constants/theme";
import { cn } from "../../utils/classNames";

export default function MetricCard({
  label,
  value,
  detail,
  suffix,
  tone = "neutral",
  className = "",
  compact = false,
}) {
  return (
    <Card className={cn(compact ? "p-4 sm:p-4" : "p-5 sm:p-6", className)} interactive>
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-3)]">
        {label}
      </div>
      <div className={cn("mt-2 font-mono text-xl font-semibold tabular-nums tracking-[-0.02em] sm:text-2xl", TONE_STYLES[tone])}>
        {value}
        {suffix ? <span className="ml-1 text-sm font-medium text-[var(--text-3)]">{suffix}</span> : null}
      </div>
      {detail ? <p className="mt-1 font-mono text-[10px] leading-5 text-[var(--text-2)]">{detail}</p> : null}
    </Card>
  );
}
