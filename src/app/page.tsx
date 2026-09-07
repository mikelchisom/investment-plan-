import Link from "next/link";
import { prisma } from "@/lib/prisma";

// This page reads live, admin-editable investment plans — never cache it statically.
export const dynamic = "force-dynamic";
import { LinkButton } from "@/components/ui/Button";
import { DemoBadge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { bpsToPercentLabel, formatCurrency } from "@/lib/format";

export default async function Home() {
  const plans = await prisma.investmentPlan.findMany({
    where: { isActive: true },
    orderBy: { minAmount: "asc" },
    take: 3,
  });

  return (
    <div className="flex-1 bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">Vantage Sim</span>
            <DemoBadge />
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-foreground hover:text-brand">
              Log in
            </Link>
            <LinkButton href="/signup" size="sm">
              Get started
            </LinkButton>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
          100% simulated platform — no real money, ever
        </span>
        <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Learn to invest with a realistic, risk-free simulation
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Vantage Sim gives you a demo portfolio, simulated market activity, and investment
          plans that behave like the real thing — without any real financial risk.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <LinkButton href="/signup" size="lg">
            Create a free demo account
          </LinkButton>
          <LinkButton href="/login" variant="outline" size="lg">
            Log in
          </LinkButton>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Simulated portfolio",
              body: "Track a demo balance, active investments, and simulated returns on a live dashboard.",
            },
            {
              title: "Simulated market activity",
              body: "Follow demo price moves and platform news generated for the simulation — clearly labeled as such.",
            },
            {
              title: "Transparent by design",
              body: "Every balance, price, and transaction on this platform is explicitly marked DEMO / SIMULATION.",
            },
          ].map((f) => (
            <Card key={f.title}>
              <CardContent>
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted">{f.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {plans.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-24">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Demo investment plans</h2>
            <DemoBadge />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id}>
                <CardContent>
                  <h3 className="font-semibold text-foreground">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted line-clamp-2">{plan.description}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-2xl font-semibold text-brand">
                      {bpsToPercentLabel(plan.returnRateBps)}
                    </span>
                    <span className="text-xs text-muted">simulated / {plan.durationDays}d</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Min {formatCurrency(plan.minAmount)} demo
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-border py-8 text-center text-xs text-muted">
        Vantage Sim is a demo / simulation platform for educational purposes only. No real
        money, brokerage execution, or financial advice is involved.
      </footer>
    </div>
  );
}
