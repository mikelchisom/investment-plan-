import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { getPortfolioOverview, getPortfolioHistory } from "@/lib/portfolio";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { DemoBadge } from "@/components/ui/Badge";
import { PortfolioChart } from "@/components/charts/PortfolioChart";
import { AssetPriceList } from "@/components/market/AssetPriceList";
import { MarketEventList } from "@/components/market/MarketEventList";
import { TransactionList } from "@/components/transactions/TransactionList";
import { formatCurrency } from "@/lib/format";

export default async function DashboardPage() {
  const user = await requireUser();

  const [overview, history, assets, marketEvents, recentTransactions] = await Promise.all([
    getPortfolioOverview(user.id),
    getPortfolioHistory(user.id),
    prisma.asset.findMany({ where: { isActive: true }, orderBy: { symbol: "asc" } }),
    prisma.marketEvent.findMany({
      include: { asset: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const returnsPositive = overview.totalReturns >= 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted">Welcome back, {user.name}.</p>
        </div>
        <DemoBadge />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total portfolio value"
          value={formatCurrency(overview.totalPortfolioValue)}
          hint="demo"
        />
        <StatCard label="Available balance" value={formatCurrency(overview.cashBalance)} hint="demo cash" />
        <StatCard
          label="Active investments"
          value={String(overview.activeInvestments.length)}
          hint={formatCurrency(overview.activeInvestedValue) + " invested"}
        />
        <StatCard
          label="Returns"
          value={formatCurrency(overview.totalReturns)}
          delta={returnsPositive ? "Positive" : "Negative"}
          deltaTone={returnsPositive ? "positive" : "negative"}
          hint="simulated"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Portfolio value over time (demo)</CardTitle>
            <DemoBadge />
          </CardHeader>
          <CardContent>
            <PortfolioChart points={history} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Simulated market prices</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <AssetPriceList assets={assets} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionList transactions={recentTransactions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent platform activity</CardTitle>
          </CardHeader>
          <CardContent>
            <MarketEventList events={marketEvents} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
