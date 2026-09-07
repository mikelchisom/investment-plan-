"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/lib/actions/profile";
import type { FormState } from "@/lib/actions/auth";
import { Label, Input, FieldError } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const initialState: FormState = {};

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4" key={state.success ? "reset" : "form"}>
      {state.success && <Alert variant="success">Password changed.</Alert>}
      {state.error && <Alert variant="danger">{state.error}</Alert>}
      <div>
        <Label htmlFor="currentPassword">Current password</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required />
        <FieldError>{state.fieldErrors?.currentPassword}</FieldError>
      </div>
      <div>
        <Label htmlFor="newPassword">New password</Label>
        <Input id="newPassword" name="newPassword" type="password" required />
        <FieldError>{state.fieldErrors?.newPassword}</FieldError>
      </div>
      <div>
        <Label htmlFor="confirmNewPassword">Confirm new password</Label>
        <Input id="confirmNewPassword" name="confirmNewPassword" type="password" required />
        <FieldError>{state.fieldErrors?.confirmNewPassword}</FieldError>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Updating…" : "Change password"}
      </Button>
    </form>
  );
}
