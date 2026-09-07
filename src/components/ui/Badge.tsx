import { cn } from "@/lib/cn";

type BadgeVariant = "neutral" | "brand" | "success" | "danger" | "warning" | "info" | "demo";

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-surface-muted text-muted border-border",
  brand: "bg-brand-muted text-brand border-transparent",
  success: "bg-success-muted text-success border-transparent",
  danger: "bg-danger-muted text-danger border-transparent",
  warning: "bg-warning-muted text-warning border-transparent",
  info: "bg-info-muted text-info border-transparent",
  demo: "bg-warning-muted text-warning border-warning/30",
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

export function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge variant="demo" className={className}>
      <span className="h-1.5 w-1.5 rounded-full bg-warning" />
      DEMO
    </Badge>
  );
}
