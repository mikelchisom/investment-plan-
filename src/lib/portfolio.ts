import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/format";

export async function getPortfolioOverview(userId: string) {
  const [portfolio, investments] = await Promise.all([
    prisma.portfolio.findUnique({ where: { userId } }),
    prisma.userInvestment.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
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

  const totalPortfolioValue = cashBalance + activeInvestedValue;

  return {
    portfolio,
    investments,
    activeInvestments,
    cashBalance,
    totalDeposited,
    activeInvestedValue,
    activePrincipal,
    totalReturns,
    totalPortfolioValue,
  };
}

/**
 * Derives a portfolio-value-over-time series from the user's own completed
 * transaction history (no fabricated data): running balance = cash + sum of
 * currently-active investment principal contributed so far.
 */
export async function getPortfolioHistory(userId: string) {
  const transactions = await prisma.transaction.findMany({
    where: { userId, status: "COMPLETED" },
    orderBy: { createdAt: "asc" },
  });

  let running = 0;
  const points: { date: string; value: number }[] = [];

  for (const tx of transactions) {
    const amount = toNumber(tx.amount);
    switch (tx.type) {
      case "DEPOSIT":
      case "RETURN":
        running += amount;
        break;
      case "WITHDRAWAL":
        running -= amount;
        break;
      case "ADJUSTMENT":
        running += amount;
        break;
      case "INVESTMENT":
        // moves cash into an investment; total portfolio value is unchanged.
        break;
    }
    points.push({ date: tx.createdAt.toISOString(), value: Math.max(0, running) });
  }

  return points;
}
