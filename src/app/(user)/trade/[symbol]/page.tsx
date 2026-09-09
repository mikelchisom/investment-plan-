import { notFound } from "next/navigation";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { getCandles } from "@/lib/candles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CandlestickChart } from "@/components/charts/CandlestickChart";
import { formatCurrency, formatDateTime, toNumber } from "@/lib/format";
import { OrderForm } from "./OrderForm";
import { CloseButton } from "./CloseButton";
import { TradeNotesForm } from "./TradeNotesForm";

export default async function TradeAssetPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const user = await requireUser();

  const asset = await prisma.asset.findUnique({ where: { symbol: symbol.toUpperCase() } });
  if (!asset || !asset.isActive) notFound();

  const [candles, portfolio, openTrades, closedTrades] = await Promise.all([
    getCandles(asset.id, 80),
    prisma.portfolio.findUnique({ where: { userId: user.id } }),
    prisma.paperTrade.findMany({
      where: { userId: user.id, assetId: asset.id, status: "OPEN" },
      orderBy: { openedAt: "desc" },
    }),
    prisma.paperTrade.findMany({
      where: { userId: user.id, assetId: asset.id, status: "CLOSED" },
      orderBy: { closedAt: "desc" },
      take: 20,
    }),
  ]);

  const price = toNumber(asset.price);
  const prev = toNumber(asset.previousPrice);
  const changePct = prev === 0 ? 0 : ((price - prev) / prev) * 100;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {asset.symbol} <span className="text-base font-normal text-muted">{asset.name}</span>
          </h1>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-foreground">{formatCurrency(price)}</p>
          <p className={`text-sm font-medium ${changePct >= 0 ? "text-success" : "text-danger"}`}>
            {changePct >= 0 ? "+" : ""}
            {changePct.toFixed(2)}%
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <CandlestickChart candles={candles} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Open positions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {openTrades.length === 0 ? (
              <p className="p-5 text-sm text-muted">No open positions on {asset.symbol}.</p>
            ) : (
              <div className="divide-y divide-border">
                {openTrades.map((t) => {
                  const qty = toNumber(t.quantity);
                  const entry = toNumber(t.entryPrice);
                  const value = qty * price;
                  const pnl = (price - entry) * qty;
                  return (
                    <div key={t.id} className="space-y-2 px-5 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-1 items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {qty.toFixed(4)} @ {formatCurrency(entry)}
                            </p>
                            <p className="text-xs text-muted">Opened {formatDateTime(t.openedAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">{formatCurrency(value)}</p>
                            <p className={`text-xs font-medium ${pnl >= 0 ? "text-success" : "text-danger"}`}>
                              {pnl >= 0 ? "+" : ""}
                              {formatCurrency(pnl)}
                            </p>
                          </div>
                        </div>
                        <CloseButton tradeId={t.id} />
                      </div>
                      <TradeNotesForm tradeId={t.id} notes={t.notes ?? ""} />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Place a trade</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderForm assetId={asset.id} cashBalance={portfolio ? toNumber(portfolio.cashBalance) : 0} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trade journal</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {closedTrades.length === 0 ? (
            <p className="p-5 text-sm text-muted">No closed trades on {asset.symbol} yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted">
                    <th className="px-5 py-3 font-medium">Entry</th>
                    <th className="px-5 py-3 font-medium">Exit</th>
                    <th className="px-5 py-3 font-medium">Qty</th>
                    <th className="px-5 py-3 font-medium">P&L</th>
                    <th className="px-5 py-3 font-medium">Closed</th>
                    <th className="px-5 py-3 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {closedTrades.map((t) => {
                    const pnl = toNumber(t.pnl ?? 0);
                    return (
                      <tr key={t.id} className="border-b border-border last:border-0 align-top">
                        <td className="px-5 py-3 text-muted">{formatCurrency(t.entryPrice)}</td>
                        <td className="px-5 py-3 text-muted">{t.exitPrice ? formatCurrency(t.exitPrice) : "—"}</td>
                        <td className="px-5 py-3 text-muted">{toNumber(t.quantity).toFixed(4)}</td>
                        <td className={`px-5 py-3 font-medium ${pnl >= 0 ? "text-success" : "text-danger"}`}>
                          {pnl >= 0 ? "+" : ""}
                          {formatCurrency(pnl)}
                        </td>
                        <td className="px-5 py-3 text-muted">{t.closedAt ? formatDateTime(t.closedAt) : "—"}</td>
                        <td className="px-5 py-3 text-muted">{t.notes || "—"}</td>
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
