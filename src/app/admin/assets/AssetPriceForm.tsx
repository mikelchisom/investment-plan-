"use client";

import { useActionState } from "react";
import { updateAssetPriceAction } from "@/lib/actions/admin-assets";
import type { FormState } from "@/lib/actions/auth";
import { Input, FieldError } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initialState: FormState = {};

export function AssetPriceForm({ assetId, currentPrice }: { assetId: string; currentPrice: number }) {
  const [state, formAction, pending] = useActionState(updateAssetPriceAction, initialState);

  return (
    <form action={formAction} className="flex items-start gap-2">
      <input type="hidden" name="assetId" value={assetId} />
      <div>
        <Input
          name="price"
          type="number"
          step="0.0001"
          defaultValue={currentPrice}
          className="w-32"
          required
        />
        <FieldError>{state.fieldErrors?.price}</FieldError>
        {state.error && <p className="mt-1 text-xs text-danger">{state.error}</p>}
      </div>
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "Saving…" : "Update"}
      </Button>
    </form>
  );
}
