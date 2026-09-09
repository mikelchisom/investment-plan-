import Link from "next/link";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { formatCurrency, toNumber } from "@/lib/format";
import { cn } from "@/lib/cn";

export default async function TradePage() {
  await requireUser();

  const assets = await prisma.asset.findMany({
    where: { isActive: true },
    orderBy: { symbol: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Paper Trading</h1>
        <p className="text-sm text-muted">Pick a market to view its chart and place a trade.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => {
          const price = toNumber(asset.price);
          const prev = toNumber(asset.previousPrice);
          const change = prev === 0 ? 0 : ((price - prev) / prev) * 100;
          const positive = change >= 0;

          return (
            <Link key={asset.id} href={`/trade/${asset.symbol}`}>
              <Card className="p-5 transition-shadow hover:shadow-card-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{asset.symbol}</p>
                    <p className="text-xs text-muted">{asset.name}</p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      positive ? "bg-success-muted text-success" : "bg-danger-muted text-danger"
                    )}
                  >
                    {positive ? "+" : ""}
                    {change.toFixed(2)}%
                  </span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-foreground">{formatCurrency(price)}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
