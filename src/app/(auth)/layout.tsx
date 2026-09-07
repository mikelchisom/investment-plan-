import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="text-lg font-semibold text-foreground">
            Vantage Sim
          </Link>
          <p className="mt-1 text-xs text-muted">Investment simulation platform — demo data only</p>
        </div>
        {children}
      </div>
    </div>
  );
}
