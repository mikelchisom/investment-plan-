import { cn } from "@/lib/cn";

type AlertVariant = "info" | "success" | "danger" | "warning";

const variantClasses: Record<AlertVariant, string> = {
  info: "bg-info-muted text-info border-info/20",
  success: "bg-success-muted text-success border-success/20",
  danger: "bg-danger-muted text-danger border-danger/20",
  warning: "bg-warning-muted text-warning border-warning/20",
};

export function Alert({
  children,
  variant = "info",
  className,
}: {
  children: React.ReactNode;
  variant?: AlertVariant;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
