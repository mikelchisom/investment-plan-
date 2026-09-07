"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { togglePlanActiveAction, deletePlanAction } from "@/lib/actions/admin-plans";
import { Button } from "@/components/ui/Button";

export function PlanRowActions({ planId, isActive }: { planId: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => startTransition(() => togglePlanActiveAction(planId))}
      >
        {isActive ? "Disable" : "Enable"}
      </Button>
      <Button
        variant="danger"
        size="sm"
        disabled={pending}
        onClick={() => {
          if (!confirm("Delete this plan? This cannot be undone.")) return;
          startTransition(async () => {
            try {
              await deletePlanAction(planId);
            } catch (err) {
              alert(err instanceof Error ? err.message : "Failed to delete plan.");
            }
            router.refresh();
          });
        }}
      >
        Delete
      </Button>
    </div>
  );
}
