"use client";

import { useTransition } from "react";
import { markAllNotificationsReadAction } from "@/lib/actions/notifications";
import { Button } from "@/components/ui/Button";

export function MarkAllReadButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => startTransition(() => markAllNotificationsReadAction())}
      disabled={pending}
    >
      Mark all read
    </Button>
  );
}
