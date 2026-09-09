import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { createPlanAction } from "@/lib/actions/admin-plans";
import { PlanForm } from "../PlanForm";

export default function NewPlanPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">New Investment Plan</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Plan details</CardTitle>
        </CardHeader>
        <CardContent>
          <PlanForm action={createPlanAction} submitLabel="Create plan" />
        </CardContent>
      </Card>
    </div>
  );
}
