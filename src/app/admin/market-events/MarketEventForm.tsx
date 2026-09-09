"use client";

import { useActionState } from "react";
import { createMarketEventAction } from "@/lib/actions/admin-market-events";
import type { FormState } from "@/lib/actions/auth";
import { Label, Input, Textarea, Select, FieldError } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const initialState: FormState = {};

type AssetOption = { id: string; symbol: string; name: string };

export function MarketEventForm({ assets }: { assets: AssetOption[] }) {
  const [state, formAction, pending] = useActionState(createMarketEventAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.success && <Alert variant="success">Market event posted.</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select id="category" name="category" defaultValue="PLATFORM_NEWS">
            <option value="RATE_CHANGE">Rate change</option>
            <option value="PRICE_MOVE">Price move</option>
            <option value="ACCOUNT_ACTIVITY">Account activity</option>
            <option value="PLATFORM_NEWS">Platform news</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="assetId">Related asset (optional)</Label>
          <Select id="assetId" name="assetId" defaultValue="">
            <option value="">None</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.symbol} — {a.name}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="headline">Headline</Label>
        <Input id="headline" name="headline" placeholder="e.g. ABC shares increased 4.2%" required />
        <FieldError>{state.fieldErrors?.headline}</FieldError>
      </div>
      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Posting…" : "Post update"}
      </Button>
    </form>
  );
}
