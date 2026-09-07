import { DEMO_BANNER_TEXT } from "@/lib/constants";

export function DemoBanner() {
  return (
    <div className="border-b border-warning/30 bg-warning-muted px-4 py-2 text-center text-xs font-medium text-warning">
      {DEMO_BANNER_TEXT}
    </div>
  );
}
