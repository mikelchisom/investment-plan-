import type { Transaction } from "@prisma/client";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";

const typeLabel: Record<string, string> = {
  DEPOSIT: "Deposit",
  WITHDRAWAL: "Withdrawal",
  INVESTMENT: "Investment",
  RETURN: "Return",
  ADJUSTMENT: "Adjustment",
};

const statusVariant: Record<string, "success" | "warning" | "danger"> = {
  COMPLETED: "success",
  PENDING: "warning",
  FAILED: "danger",
};

const negativeTypes = new Set(["WITHDRAWAL", "INVESTMENT"]);

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return <p className="text-sm text-muted">No transactions yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted">
            <th className="py-2 pr-4 font-medium">Type</th>
            <th className="py-2 pr-4 font-medium">Description</th>
            <th className="py-2 pr-4 font-medium">Status</th>
            <th className="py-2 pr-4 font-medium">Date</th>
            <th className="py-2 pl-4 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            const isNegative = negativeTypes.has(tx.type);
            return (
              <tr key={tx.id} className="border-b border-border last:border-0">
                <td className="py-3 pr-4 font-medium text-foreground">{typeLabel[tx.type] ?? tx.type}</td>
                <td className="py-3 pr-4 text-muted">{tx.description ?? tx.reference ?? "—"}</td>
                <td className="py-3 pr-4">
                  <Badge variant={statusVariant[tx.status] ?? "neutral"}>{tx.status}</Badge>
                </td>
                <td className="py-3 pr-4 text-muted">{formatDateTime(tx.createdAt)}</td>
                <td
                  className={cn(
                    "py-3 pl-4 text-right font-medium",
                    isNegative ? "text-danger" : "text-success"
                  )}
                >
                  {isNegative ? "-" : "+"}
                  {formatCurrency(tx.amount)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
