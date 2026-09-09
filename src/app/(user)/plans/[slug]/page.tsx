import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { bpsToPercentLabel, formatCurrency, toNumber } from "@/lib/format";
import { InvestForm } from "./InvestForm";

const riskVariant: Record<string, "success" | "warning" | "danger"> = {
  LOW: "success",
  MEDIUM: "warning",
  HIGH: "danger",
};

export default async function PlanDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireUser();

  const [plan, portfolio] = await Promise.all([
    prisma.investmentPlan.findUnique({ where: { slug } }),
    prisma.portfolio.findUnique({ where: { userId: user.id } }),
  ]);

  if (!plan || !plan.isActive) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{plan.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan details</CardTitle>
          <Badge variant={riskVariant[plan.riskLevel]}>{plan.riskLevel} risk</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted">{plan.description}</p>
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-muted">Return rate</p>
              <p className="font-medium text-foreground">{bpsToPercentLabel(plan.returnRateBps)}</p>
            </div>
            <div>
              <p className="text-muted">Duration</p>
              <p className="font-medium text-foreground">{plan.durationDays} days</p>
            </div>
            <div>
              <p className="text-muted">Min. amount</p>
              <p className="font-medium text-foreground">{formatCurrency(plan.minAmount)}</p>
            </div>
            {plan.maxAmount && (
              <div>
                <p className="text-muted">Max. amount</p>
                <p className="font-medium text-foreground">{formatCurrency(plan.maxAmount)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invest</CardTitle>
        </CardHeader>
        <CardContent>
          <InvestForm
            planId={plan.id}
            minAmount={toNumber(plan.minAmount)}
            maxAmount={plan.maxAmount ? toNumber(plan.maxAmount) : null}
            cashBalance={portfolio ? toNumber(portfolio.cashBalance) : 0}
          />
        </CardContent>
      </Card>
    </div>
  );
}
