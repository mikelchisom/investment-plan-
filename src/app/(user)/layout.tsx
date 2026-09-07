import { requireUser } from "@/lib/authz";
import { AppShell, type NavItem } from "@/components/nav/AppShell";

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/plans", label: "Investment Plans" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/transactions", label: "Transactions" },
  { href: "/deposit", label: "Deposit (Demo)" },
  { href: "/notifications", label: "Notifications" },
  { href: "/profile", label: "Profile" },
];

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <AppShell
      navItems={navItems}
      brandLabel="Vantage Sim"
      userName={user.name ?? user.email ?? "User"}
      roleLabel="Investor account"
    >
      {children}
    </AppShell>
  );
}
