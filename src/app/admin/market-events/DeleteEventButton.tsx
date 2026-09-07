"use client";

import { useTransition } from "react";
import { deleteMarketEventAction } from "@/lib/actions/admin-market-events";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => deleteMarketEventAction(eventId))}
      disabled={pending}
      className="text-xs font-medium text-danger hover:underline disabled:opacity-50 cursor-pointer"
    >
      Delete
    </button>
  );
}
