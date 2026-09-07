"use client";

import { useTransition } from "react";
import { approveDepositAction, rejectDepositAction } from "@/lib/actions/admin-transactions";
import { Button } from "@/components/ui/Button";

export function DepositActions({ transactionId }: { transactionId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex justify-end gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => startTransition(() => rejectDepositAction(transactionId))}
      >
        Reject
      </Button>
      <Button
        size="sm"
        disabled={pending}
        onClick={() => startTransition(() => approveDepositAction(transactionId))}
      >
        Approve
      </Button>
    </div>
  );
}
