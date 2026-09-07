import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { DemoBadge } from "@/components/ui/Badge";
import { PLATFORM_SETTING_KEYS } from "@/lib/constants";
import { DepositForm } from "./DepositForm";

export default async function DepositPage() {
  await requireUser();

  const instructions = await prisma.platformSetting.findUnique({
    where: { key: PLATFORM_SETTING_KEYS.DEPOSIT_INSTRUCTIONS },
  });

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Deposit — DEMO / SIMULATION</h1>
        <DemoBadge />
      </div>

      <Alert variant="warning">
        This is a simulated deposit flow for demonstration purposes only. No real payment is
        processed, and no real money changes hands. Submitted amounts are recorded as demo
        transactions pending review.
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Deposit instructions (demo)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted whitespace-pre-line">
            {instructions?.value ?? "No deposit instructions have been configured yet."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Record a simulated deposit</CardTitle>
        </CardHeader>
        <CardContent>
          <DepositForm />
        </CardContent>
      </Card>
    </div>
  );
}
