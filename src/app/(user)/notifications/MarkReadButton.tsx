"use client";

import { useTransition } from "react";
import { markNotificationReadAction } from "@/lib/actions/notifications";

export function MarkReadButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => markNotificationReadAction(id))}
      disabled={pending}
      className="shrink-0 text-xs font-medium text-brand hover:underline disabled:opacity-50 cursor-pointer"
    >
      Mark read
    </button>
  );
}
