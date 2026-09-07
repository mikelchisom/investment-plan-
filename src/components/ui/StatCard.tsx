import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";

export function StatCard({
  label,
  value,
  hint,
  delta,
  deltaTone = "neutral",
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  delta?: string;
  deltaTone?: "positive" | "negative" | "neutral";
  className?: string;
}) {
  return (
    <Card className={cn("p-5", className)}>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      {(delta || hint) && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          {delta && (
            <span
              className={cn(
                "font-medium",
                deltaTone === "positive" && "text-success",
                deltaTone === "negative" && "text-danger",
                deltaTone === "neutral" && "text-muted"
              )}
            >
              {delta}
            </span>
          )}
          {hint && <span className="text-muted">{hint}</span>}
        </div>
      )}
    </Card>
  );
}
