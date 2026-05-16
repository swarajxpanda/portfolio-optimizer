import { cn } from "../../utils/classNames";

const VARIANTS = {
  primary:
    "border-[var(--border-1)] bg-[var(--surface)] text-[var(--text-1)] hover:border-[var(--text-2)]",
  secondary:
    "border-[var(--border-1)] bg-transparent text-[var(--text-2)] hover:border-[var(--text-2)] hover:text-[var(--text-1)]",
  ghost:
    "border-transparent bg-transparent text-[var(--text-2)] hover:text-[var(--text-1)]",
  danger:
    "border-[rgba(255,69,96,0.3)] bg-[rgba(255,69,96,0.12)] text-[var(--loss)] hover:bg-[rgba(255,69,96,0.18)]",
};

export default function Button({
  children,
  className = "",
  disabled = false,
  type = "button",
  variant = "secondary",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[3px] border px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] transition duration-80",
        "focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--border-1)] disabled:cursor-not-allowed disabled:opacity-45",
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
