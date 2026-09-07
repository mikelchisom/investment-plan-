import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge, DemoBadge } from "@/components/ui/Badge";
import { relativeTime } from "@/lib/format";
import { MarkReadButton } from "./MarkReadButton";
import { MarkAllReadButton } from "./MarkAllReadButton";

const typeVariant: Record<string, "success" | "danger" | "warning" | "info"> = {
  SUCCESS: "success",
  WARNING: "warning",
  MARKET: "info",
  INFO: "info",
};

export default async function NotificationsPage() {
  const user = await requireUser();

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>
        <div className="flex items-center gap-2">
          <DemoBadge />
          <MarkAllReadButton />
        </div>
      </div>

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {notifications.length === 0 ? (
            <p className="p-5 text-sm text-muted">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="flex items-start justify-between gap-3 px-5 py-4">
                <div className="flex gap-3">
                  <Badge variant={typeVariant[n.type] ?? "info"} className="mt-0.5 shrink-0">
                    {n.type}
                  </Badge>
                  <div>
                    <p className={`text-sm ${n.isRead ? "text-muted" : "font-medium text-foreground"}`}>
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">{n.message}</p>
                    <p className="mt-0.5 text-xs text-muted">{relativeTime(n.createdAt)}</p>
                  </div>
                </div>
                {!n.isRead && <MarkReadButton id={n.id} />}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
