"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/lib/actions/profile";
import type { FormState } from "@/lib/actions/auth";
import { Label, Input, FieldError } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const initialState: FormState = {};

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.success && <Alert variant="success">Profile updated.</Alert>}
      <div>
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" defaultValue={name} required />
        <FieldError>{state.fieldErrors?.name}</FieldError>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled />
        <p className="mt-1 text-xs text-muted">Email cannot be changed.</p>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
