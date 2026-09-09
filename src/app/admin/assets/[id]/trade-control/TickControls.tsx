"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { pushPriceTickAction } from "@/lib/actions/admin-assets";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const steps = [
  { label: "0.1%", bps: 10 },
  { label: "0.5%", bps: 50 },
  { label: "1%", bps: 100 },
  { label: "2%", bps: 200 },
  { label: "5%", bps: 500 },
];

export function TickControls({ assetId }: { assetId: string }) {
  const [stepBps, setStepBps] = useState(50);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const tick = (direction: "UP" | "DOWN") => {
    startTransition(async () => {
      await pushPriceTickAction(assetId, direction, stepBps);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-medium text-muted">Step size</p>
        <div className="flex gap-1.5">
          {steps.map((s) => (
            <button
              key={s.bps}
              onClick={() => setStepBps(s.bps)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                stepBps === s.bps
                  ? "border-brand bg-brand-muted text-brand"
                  : "border-border bg-surface text-muted hover:text-foreground"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => tick("UP")}
          disabled={pending}
          className="flex-1 !bg-success text-white hover:opacity-90"
        >
          ▲ Push Up
        </Button>
        <Button
          onClick={() => tick("DOWN")}
          disabled={pending}
          className="flex-1 !bg-danger text-white hover:opacity-90"
        >
          ▼ Push Down
        </Button>
      </div>
    </div>
  );
}
