"use client";

import { useTransition } from "react";
import { toggleAssetActiveAction } from "@/lib/actions/admin-assets";
import { Button } from "@/components/ui/Button";

export function ToggleAssetButton({ assetId, isActive }: { assetId: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => toggleAssetActiveAction(assetId))}
    >
      {isActive ? "Disable" : "Enable"}
    </Button>
  );
}
