"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { closeTradeAction } from "@/lib/actions/trading";
import { Button } from "@/components/ui/Button";

export function CloseButton({ tradeId }: { tradeId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await closeTradeAction(tradeId);
          router.refresh();
        })
      }
    >
      {pending ? "Closing…" : "Close"}
    </Button>
  );
}
