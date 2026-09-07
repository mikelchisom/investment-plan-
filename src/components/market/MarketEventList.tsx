import type { MarketEvent, Asset } from "@prisma/client";
import { Badge } from "@/components/ui/Badge";
import { relativeTime } from "@/lib/format";

const categoryLabel: Record<string, string> = {
  RATE_CHANGE: "Rate change",
  PRICE_MOVE: "Price move",
  ACCOUNT_ACTIVITY: "Account activity",
  PLATFORM_NEWS: "Platform news",
};

const categoryVariant: Record<string, "info" | "success" | "warning" | "brand"> = {
  RATE_CHANGE: "warning",
  PRICE_MOVE: "success",
  ACCOUNT_ACTIVITY: "info",
  PLATFORM_NEWS: "brand",
};

export function MarketEventList({
  events,
}: {
  events: (MarketEvent & { asset: Asset | null })[];
}) {
  if (events.length === 0) {
    return <p className="text-sm text-muted">No simulated market activity yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {events.map((event) => (
        <li key={event.id} className="flex gap-3">
          <Badge variant={categoryVariant[event.category] ?? "neutral"} className="mt-0.5 shrink-0">
            {categoryLabel[event.category] ?? event.category}
          </Badge>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{event.headline}</p>
            {event.description && (
              <p className="mt-0.5 text-xs text-muted">{event.description}</p>
            )}
            <p className="mt-0.5 text-xs text-muted">
              {relativeTime(event.createdAt)} · simulated event
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
