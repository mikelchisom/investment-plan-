"use client";

import { useActionState } from "react";
import { updatePlatformSettingAction } from "@/lib/actions/admin-settings";
import type { FormState } from "@/lib/actions/auth";
import { Label, Textarea, FieldError } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const initialState: FormState = {};

export function SettingForm({
  settingKey,
  label,
  description,
  value,
  multiline = false,
}: {
  settingKey: string;
  label: string;
  description?: string;
  value: string;
  multiline?: boolean;
}) {
  const [state, formAction, pending] = useActionState(updatePlatformSettingAction, initialState);

  return (
    <form action={formAction} className="space-y-2">
      {state.success && <Alert variant="success">Saved.</Alert>}
      <input type="hidden" name="key" value={settingKey} />
      <Label htmlFor={settingKey}>{label}</Label>
      {description && <p className="text-xs text-muted">{description}</p>}
      <Textarea id={settingKey} name="value" defaultValue={value} rows={multiline ? 4 : 1} />
      <FieldError>{state.fieldErrors?.value}</FieldError>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
