"use client";

import { useActionState } from "react";
import { updateTradeNotesAction } from "@/lib/actions/trading";
import type { FormState } from "@/lib/actions/auth";

const initialState: FormState = {};

export function TradeNotesForm({ tradeId, notes }: { tradeId: string; notes: string }) {
  const [, formAction, pending] = useActionState(updateTradeNotesAction, initialState);

  return (
    <form action={formAction} className="flex gap-2">
      <input type="hidden" name="tradeId" value={tradeId} />
      <input
        name="notes"
        defaultValue={notes}
        placeholder="Journal note (why you took this trade)…"
        className="h-8 flex-1 rounded-lg border border-border bg-surface px-2 text-xs text-foreground outline-none focus:border-brand"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-border px-2 text-xs text-muted hover:text-foreground cursor-pointer disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
