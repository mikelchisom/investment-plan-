"use client";

import { useActionState } from "react";
import { investInPlanAction } from "@/lib/actions/investments";
import type { FormState } from "@/lib/actions/auth";
import { Label, Input, FieldError } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const initialState: FormState = {};

export function InvestForm({
  planId,
  minAmount,
  maxAmount,
  cashBalance,
}: {
  planId: string;
  minAmount: number;
  maxAmount: number | null;
  cashBalance: number;
}) {
  const [state, formAction, pending] = useActionState(investInPlanAction, initialState);

  if (state.success) {
    return <Alert variant="success">Investment created. Check your portfolio for details.</Alert>;
  }

  return (
    <form action={formAction} className="space-y-3">
      {state.error && <Alert variant="danger">{state.error}</Alert>}
      <input type="hidden" name="planId" value={planId} />
      <div>
        <Label htmlFor="amount">Amount to invest</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min={minAmount}
          max={maxAmount ?? undefined}
          placeholder={minAmount.toString()}
          required
        />
        <FieldError>{state.fieldErrors?.amount}</FieldError>
        <p className="mt-1 text-xs text-muted">Available balance: ${cashBalance.toLocaleString()}</p>
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Processing…" : "Invest"}
      </Button>
    </form>
  );
}
