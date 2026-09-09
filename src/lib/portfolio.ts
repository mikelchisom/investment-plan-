import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/format";

export async function getPortfolioOverview(userId: string) {
  const [portfolio, investments, openTrades] = await Promise.all([
    prisma.portfolio.findUnique({ where: { userId } }),
    prisma.userInvestment.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.paperTrade.findMany({
      where: { userId, status: "OPEN" },
      include: { asset: true },
    }),
  ]);

  const cashBalance = portfolio ? toNumber(portfolio.cashBalance) : 0;
  const totalDeposited = portfolio ? toNumber(portfolio.totalDeposited) : 0;

  const activeInvestments = investments.filter((inv) => inv.status === "ACTIVE");
  const activeInvestedValue = activeInvestments.reduce(
    (sum, inv) => sum + toNumber(inv.currentValue),
    0
  );
  const activePrincipal = activeInvestments.reduce((sum, inv) => sum + toNumber(inv.principal), 0);

  const totalReturns = investments.reduce(
    (sum, inv) => sum + (toNumber(inv.currentValue) - toNumber(inv.principal)),
    0
  );

  const openTradesValue = openTrades.reduce(
    (sum, t) => sum + toNumber(t.quantity) * toNumber(t.asset.price),
    0
  );
  const openTradesPnl = openTrades.reduce(
    (sum, t) => sum + (toNumber(t.asset.price) - toNumber(t.entryPrice)) * toNumber(t.quantity),
    0
  );

  const totalPortfolioValue = cashBalance + activeInvestedValue + openTradesValue;

  return {
    portfolio,
    investments,
    activeInvestments,
    openTrades,
    cashBalance,
    totalDeposited,
    activeInvestedValue,
    activePrincipal,
    totalReturns,
    openTradesValue,
    openTradesPnl,
    totalPortfolioValue,
  };
}

/**
 * Derives a portfolio-value-over-time series from the user's own completed
 * transaction history (no fabricated data): running balance = cash + sum of
 * currently-active investment principal contributed so far.
 */
export async function getPortfolioHistory(userId: string) {
  const [transactions, closedTrades] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, status: "COMPLETED" },
      orderBy: { createdAt: "asc" },
    }),
    prisma.paperTrade.findMany({
      where: { userId, status: "CLOSED" },
      orderBy: { closedAt: "asc" },
    }),
  ]);

  type Event = { date: Date; delta: number };
  const events: Event[] = [];

  for (const tx of transactions) {
    const amount = toNumber(tx.amount);
    switch (tx.type) {
      case "DEPOSIT":
      case "RETURN":
        events.push({ date: tx.createdAt, delta: amount });
        break;
      case "WITHDRAWAL":
        events.push({ date: tx.createdAt, delta: -amount });
        break;
      case "ADJUSTMENT":
        events.push({ date: tx.createdAt, delta: amount });
        break;
      case "INVESTMENT":
        // moves cash into an investment; total portfolio value is unchanged.
        break;
    }
  }

  // Opening a paper trade moves cash into the position (no net change).
  // Closing one realizes the gain/loss back into cash.
  for (const t of closedTrades) {
    if (!t.closedAt || t.pnl === null) continue;
    events.push({ date: t.closedAt, delta: toNumber(t.pnl) });
  }

  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  let running = 0;
  const points: { date: string; value: number }[] = [];
  for (const e of events) {
    running += e.delta;
    points.push({ date: e.date.toISOString(), value: Math.max(0, running) });
  }

  return points;
}
