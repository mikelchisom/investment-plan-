import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MarketEventList } from "@/components/market/MarketEventList";
import { formatCurrency, toNumber } from "@/lib/format";

export default async function AdminOverviewPage() {
  const [userCount, portfolios, activeInvestmentCount, pendingDeposits, activePlans, recentEvents] =
    await Promise.all([
      prisma.user.count(),
      prisma.portfolio.findMany({ select: { cashBalance: true } }),
      prisma.userInvestment.count({ where: { status: "ACTIVE" } }),
      prisma.transaction.count({ where: { type: "DEPOSIT", status: "PENDING" } }),
      prisma.investmentPlan.count({ where: { isActive: true } }),
      prisma.marketEvent.findMany({
        include: { asset: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

  const investedValues = await prisma.userInvestment.aggregate({
    where: { status: "ACTIVE" },
    _sum: { currentValue: true },
  });

  const totalCash = portfolios.reduce((sum, p) => sum + toNumber(p.cashBalance), 0);
  const totalAum = totalCash + toNumber(investedValues._sum.currentValue ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Admin Overview</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Registered users" value={String(userCount)} />
        <StatCard label="Total AUM" value={formatCurrency(totalAum)} hint="cash + active investments" />
        <StatCard label="Active investments" value={String(activeInvestmentCount)} />
        <StatCard
          label="Pending deposits"
          value={String(pendingDeposits)}
          hint={pendingDeposits > 0 ? "needs review" : undefined}
          deltaTone={pendingDeposits > 0 ? "negative" : "neutral"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <StatCard label="Active plans" value={String(activePlans)} className="lg:col-span-1" />
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            <MarketEventList events={recentEvents} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
