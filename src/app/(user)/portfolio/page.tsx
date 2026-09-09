import Link from "next/link";
import { requireUser } from "@/lib/authz";
import { getPortfolioOverview } from "@/lib/portfolio";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate, toNumber } from "@/lib/format";

const statusVariant: Record<string, "success" | "info" | "neutral"> = {
  ACTIVE: "success",
  COMPLETED: "info",
  CANCELLED: "neutral",
};

export default async function PortfolioPage() {
  const user = await requireUser();
  const overview = await getPortfolioOverview(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Portfolio</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Available balance" value={formatCurrency(overview.cashBalance)} />
        <StatCard
          label="Invested (active)"
          value={formatCurrency(overview.activeInvestedValue)}
          hint={`${overview.activeInvestments.length} active`}
        />
        <StatCard
          label="Total returns"
          value={formatCurrency(overview.totalReturns)}
          deltaTone={overview.totalReturns >= 0 ? "positive" : "negative"}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {overview.investments.length === 0 ? (
            <p className="p-5 text-sm text-muted">
              You don&apos;t have any investments yet.{" "}
              <Link href="/plans" className="text-brand hover:underline">
                Browse investment plans
              </Link>
              .
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted">
                    <th className="px-5 py-3 font-medium">Plan</th>
                    <th className="px-5 py-3 font-medium">Principal</th>
                    <th className="px-5 py-3 font-medium">Current value</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Started</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {overview.investments.map((inv) => {
                    const gain = toNumber(inv.currentValue) - toNumber(inv.principal);
                    return (
                      <tr key={inv.id} className="border-b border-border last:border-0">
                        <td className="px-5 py-3 font-medium text-foreground">{inv.plan.name}</td>
                        <td className="px-5 py-3 text-muted">{formatCurrency(inv.principal)}</td>
                        <td className="px-5 py-3">
                          <span className="text-foreground">{formatCurrency(inv.currentValue)}</span>{" "}
                          <span className={gain >= 0 ? "text-success" : "text-danger"}>
                            ({gain >= 0 ? "+" : ""}
                            {formatCurrency(gain)})
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant={statusVariant[inv.status]}>{inv.status}</Badge>
                        </td>
                        <td className="px-5 py-3 text-muted">{formatDate(inv.startDate)}</td>
                        <td className="px-5 py-3 text-right">
                          <Link href={`/investment/${inv.id}`} className="text-brand hover:underline">
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
