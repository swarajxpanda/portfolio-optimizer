import { cn } from "../../utils/classNames";

export default function Card({ children, className = "", interactive = false }) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--surface)]",
        interactive && "transition-colors duration-150 hover:bg-[var(--surface-1)]",
        className,
      )}
    >
      {children}
    </section>
  );
}
