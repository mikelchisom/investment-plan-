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
        Your deposit request was submitted. We&apos;ll credit your balance once it&apos;s
        confirmed.
      </Alert>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      {state.error && <Alert variant="danger">{state.error}</Alert>}
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required />
        <FieldError>{state.fieldErrors?.amount}</FieldError>
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Submitting…" : "Submit deposit request"}
      </Button>
    </form>
  );
}
