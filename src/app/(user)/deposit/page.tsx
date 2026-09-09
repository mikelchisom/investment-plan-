import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TransactionList } from "@/components/transactions/TransactionList";
import { PLATFORM_SETTING_KEYS } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { FundingMethods } from "./FundingMethods";

export default async function DepositPage() {
  const user = await requireUser();

  const [instructions, portfolio, recentDeposits] = await Promise.all([
    prisma.platformSetting.findUnique({ where: { key: PLATFORM_SETTING_KEYS.DEPOSIT_INSTRUCTIONS } }),
    prisma.portfolio.findUnique({ where: { userId: user.id } }),
    prisma.transaction.findMany({
      where: { userId: user.id, type: "DEPOSIT" },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Add Funds</h1>
        <p className="text-sm text-muted">Top up your balance to start investing.</p>
      </div>

      <StatCard
        label="Available balance"
        value={formatCurrency(portfolio?.cashBalance ?? 0)}
      />

      <FundingMethods
        instructions={
          instructions?.value ?? "Transfer instructions have not been configured yet. Contact support."
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Recent deposit requests</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionList transactions={recentDeposits} />
        </CardContent>
      </Card>
    </div>
  );
}
