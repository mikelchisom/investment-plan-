import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import { TransactionList } from "@/components/transactions/TransactionList";

export default async function TransactionsPage() {
  const user = await requireUser();

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Transaction History</h1>
      </div>
      <Card>
        <CardContent>
          <TransactionList transactions={transactions} />
        </CardContent>
      </Card>
    </div>
  );
}
