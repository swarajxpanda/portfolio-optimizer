import { BADGE_STYLES } from "../../constants/theme";
import { cn } from "../../utils/classNames";

export default function StatusBadge({ children, tone = "neutral", className = "" }) {
  return (
    <span
      className={cn(
        "pill inline-flex items-center",
        BADGE_STYLES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
