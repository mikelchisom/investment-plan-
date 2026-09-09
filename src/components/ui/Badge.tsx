import { cn } from "@/lib/cn";

type BadgeVariant = "neutral" | "brand" | "success" | "danger" | "warning" | "info";

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-surface-muted text-muted border-border",
  brand: "bg-brand-muted text-brand border-transparent",
  success: "bg-success-muted text-success border-transparent",
  danger: "bg-danger-muted text-danger border-transparent",
  warning: "bg-warning-muted text-warning border-transparent",
  info: "bg-info-muted text-info border-transparent",
};

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
