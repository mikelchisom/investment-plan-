import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge, DemoBadge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { bpsToPercentLabel, formatCurrency } from "@/lib/format";

const riskVariant: Record<string, "success" | "warning" | "danger"> = {
  LOW: "success",
  MEDIUM: "warning",
  HIGH: "danger",
};

export default async function PlansPage() {
  const plans = await prisma.investmentPlan.findMany({
    where: { isActive: true },
    orderBy: { minAmount: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Investment Plans</h1>
          <p className="text-sm text-muted">Simulated plans available to invest in with demo funds.</p>
        </div>
        <DemoBadge />
      </div>

      {plans.length === 0 ? (
        <p className="text-sm text-muted">No investment plans are currently available.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{plan.name}</h3>
                  <Badge variant={riskVariant[plan.riskLevel]}>{plan.riskLevel}</Badge>
                </div>
                <p className="flex-1 text-sm text-muted">{plan.description}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-2xl font-semibold text-brand">
                    {bpsToPercentLabel(plan.returnRateBps)}
                  </span>
                  <span className="text-xs text-muted">simulated / {plan.durationDays} days</span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {formatCurrency(plan.minAmount)} min
                  {plan.maxAmount ? ` · ${formatCurrency(plan.maxAmount)} max` : ""} demo
                </p>
                <LinkButton href={`/plans/${plan.slug}`} className="mt-4">
                  View plan
                </LinkButton>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
