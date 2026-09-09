import { requireAdmin } from "@/lib/authz";
import { AppShell, type NavItem } from "@/components/nav/AppShell";

const navItems: NavItem[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/plans", label: "Investment Plans" },
  { href: "/admin/assets", label: "Asset Prices" },
  { href: "/admin/market-events", label: "Market Activity" },
  { href: "/admin/transactions", label: "Transactions & Deposits" },
  { href: "/admin/settings", label: "Platform Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <AppShell
      navItems={navItems}
      brandLabel="Vantage Admin"
      userName={admin.name ?? admin.email ?? "Admin"}
      roleLabel="Administrator"
    >
      {children}
    </AppShell>
  );
}
