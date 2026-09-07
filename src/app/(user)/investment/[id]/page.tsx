import { notFound } from "next/navigation";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, DemoBadge } from "@/components/ui/Badge";
import { TransactionList } from "@/components/transactions/TransactionList";
import { bpsToPercentLabel, formatCurrency, formatDate, toNumber } from "@/lib/format";

const statusVariant: Record<string, "success" | "info" | "neutral"> = {
  ACTIVE: "success",
  COMPLETED: "info",
  CANCELLED: "neutral",
};

export default async function InvestmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const investment = await prisma.userInvestment.findUnique({
    where: { id },
    include: { plan: true, transactions: { orderBy: { createdAt: "desc" } } },
  });

  // Ownership check: users must never view another user's investment.
  if (!investment || investment.userId !== user.id) notFound();

  const gain = toNumber(investment.currentValue) - toNumber(investment.principal);
  const gainPct = toNumber(investment.principal) === 0 ? 0 : (gain / toNumber(investment.principal)) * 100;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">{investment.plan.name}</h1>
        <DemoBadge />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Investment summary</CardTitle>
          <Badge variant={statusVariant[investment.status]}>{investment.status}</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <p className="text-muted">Principal (demo)</p>
              <p className="font-medium text-foreground">{formatCurrency(investment.principal)}</p>
            </div>
            <div>
              <p className="text-muted">Current value (demo)</p>
              <p className="font-medium text-foreground">{formatCurrency(investment.currentValue)}</p>
            </div>
            <div>
              <p className="text-muted">Gain / loss</p>
              <p className={`font-medium ${gain >= 0 ? "text-success" : "text-danger"}`}>
                {gain >= 0 ? "+" : ""}
                {formatCurrency(gain)} ({gainPct.toFixed(2)}%)
              </p>
            </div>
            <div>
              <p className="text-muted">Plan simulated rate</p>
              <p className="font-medium text-foreground">{bpsToPercentLabel(investment.plan.returnRateBps)}</p>
            </div>
            <div>
              <p className="text-muted">Started</p>
              <p className="font-medium text-foreground">{formatDate(investment.startDate)}</p>
            </div>
            {investment.endDate && (
              <div>
                <p className="text-muted">Matures</p>
                <p className="font-medium text-foreground">{formatDate(investment.endDate)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionList transactions={investment.transactions} />
        </CardContent>
      </Card>
    </div>
  );
}
