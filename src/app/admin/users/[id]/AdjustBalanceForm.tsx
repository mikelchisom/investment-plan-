"use client";

import { useActionState } from "react";
import { adjustUserBalanceAction } from "@/lib/actions/admin-users";
import type { FormState } from "@/lib/actions/auth";
import { Label, Input, FieldError } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const initialState: FormState = {};

export function AdjustBalanceForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(adjustUserBalanceAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      {state.success && <Alert variant="success">Balance adjusted.</Alert>}
      {state.error && <Alert variant="danger">{state.error}</Alert>}
      <input type="hidden" name="userId" value={userId} />
      <div>
        <Label htmlFor="amount">Amount (demo, use negative to deduct)</Label>
        <Input id="amount" name="amount" type="number" step="0.01" required />
        <FieldError>{state.fieldErrors?.amount}</FieldError>
      </div>
      <div>
        <Label htmlFor="reason">Reason</Label>
        <Input id="reason" name="reason" placeholder="e.g. Support adjustment" required />
        <FieldError>{state.fieldErrors?.reason}</FieldError>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Applying…" : "Apply simulated adjustment"}
      </Button>
    </form>
  );
}
