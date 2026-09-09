"use client";

import { useActionState } from "react";
import { openTradeAction } from "@/lib/actions/trading";
import type { FormState } from "@/lib/actions/auth";
import { Label, Input, FieldError } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const initialState: FormState = {};

export function OrderForm({ assetId, cashBalance }: { assetId: string; cashBalance: number }) {
  const [state, formAction, pending] = useActionState(openTradeAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      {state.success && <Alert variant="success">Position opened.</Alert>}
      {state.error && <Alert variant="danger">{state.error}</Alert>}
      <input type="hidden" name="assetId" value={assetId} />
      <div>
        <Label htmlFor="amount">Amount to buy</Label>
        <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required />
        <FieldError>{state.fieldErrors?.amount}</FieldError>
        <p className="mt-1 text-xs text-muted">Available balance: {cashBalance.toLocaleString()}</p>
      </div>
      <Button type="submit" className="w-full !bg-success text-white hover:opacity-90" disabled={pending}>
        {pending ? "Placing…" : "Buy"}
      </Button>
    </form>
  );
}
