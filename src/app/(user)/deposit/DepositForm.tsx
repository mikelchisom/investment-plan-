"use client";

import { useActionState } from "react";
import { requestDepositAction } from "@/lib/actions/deposits";
import type { FormState } from "@/lib/actions/auth";
import { Label, Input, FieldError } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const initialState: FormState = {};

export function DepositForm() {
  const [state, formAction, pending] = useActionState(requestDepositAction, initialState);

  if (state.success) {
    return (
      <Alert variant="success">
        Your simulated deposit request was recorded and is pending admin confirmation. This is a
        demo flow — no real payment was processed.
      </Alert>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      {state.error && <Alert variant="danger">{state.error}</Alert>}
      <div>
        <Label htmlFor="amount">Demo deposit amount</Label>
        <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required />
        <FieldError>{state.fieldErrors?.amount}</FieldError>
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Submitting…" : "Record simulated deposit"}
      </Button>
    </form>
  );
}
