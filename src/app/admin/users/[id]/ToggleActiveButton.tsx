"use client";

import { useTransition } from "react";
import { toggleUserActiveAction } from "@/lib/actions/admin-users";
import { Button } from "@/components/ui/Button";

export function ToggleActiveButton({ userId, isActive }: { userId: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant={isActive ? "danger" : "secondary"}
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => toggleUserActiveAction(userId))}
    >
      {isActive ? "Disable account" : "Enable account"}
    </Button>
  );
}
