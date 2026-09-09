"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/actions/auth";
import { Label, Input, Textarea, Select, FieldError } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const initialState: FormState = {};

export type PlanFormValues = {
  name: string;
  slug: string;
  description: string;
  minAmount: number;
  maxAmount: number | null;
  returnRateBps: number;
  durationDays: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
};

export function PlanForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  defaultValues?: PlanFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert variant="danger">{state.error}</Alert>}
      {state.success && <Alert variant="success">Saved.</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={defaultValues?.name} required />
          <FieldError>{state.fieldErrors?.name}</FieldError>
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={defaultValues?.slug} placeholder="growth-plan" required />
          <FieldError>{state.fieldErrors?.slug}</FieldError>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaultValues?.description}
          required
        />
        <FieldError>{state.fieldErrors?.description}</FieldError>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="minAmount">Minimum amount</Label>
          <Input
            id="minAmount"
            name="minAmount"
            type="number"
            step="0.01"
            defaultValue={defaultValues?.minAmount}
            required
          />
          <FieldError>{state.fieldErrors?.minAmount}</FieldError>
        </div>
        <div>
          <Label htmlFor="maxAmount">Maximum amount (optional)</Label>
          <Input
            id="maxAmount"
            name="maxAmount"
            type="number"
            step="0.01"
            defaultValue={defaultValues?.maxAmount ?? undefined}
          />
          <FieldError>{state.fieldErrors?.maxAmount}</FieldError>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="returnRateBps">Return rate (bps)</Label>
          <Input
            id="returnRateBps"
            name="returnRateBps"
            type="number"
            defaultValue={defaultValues?.returnRateBps}
            placeholder="900 = 9.00%"
            required
          />
          <FieldError>{state.fieldErrors?.returnRateBps}</FieldError>
        </div>
        <div>
          <Label htmlFor="durationDays">Duration (days)</Label>
          <Input
            id="durationDays"
            name="durationDays"
            type="number"
            defaultValue={defaultValues?.durationDays}
            required
          />
          <FieldError>{state.fieldErrors?.durationDays}</FieldError>
        </div>
        <div>
          <Label htmlFor="riskLevel">Risk level</Label>
          <Select id="riskLevel" name="riskLevel" defaultValue={defaultValues?.riskLevel ?? "MEDIUM"}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </Select>
          <FieldError>{state.fieldErrors?.riskLevel}</FieldError>
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
