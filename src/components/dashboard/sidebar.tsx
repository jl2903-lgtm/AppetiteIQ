import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/billing", label: "Billing" },
  { href: "/settings", label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-64 border-r border-border bg-muted/20 p-6 md:block">
      <div className="mb-8">
        <Link href="/dashboard" className="text-lg font-semibold">
          AppetiteIQ
        </Link>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
