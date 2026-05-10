"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Smartphone, Puzzle, Hammer, ReceiptText, Wallet, Settings, LogOut, Building2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My App", href: "/dashboard/app", icon: Smartphone },
  { label: "Addons", href: "/dashboard/addons", icon: Puzzle },
  { label: "Builds", href: "/dashboard/builds", icon: Hammer },
  { label: "Billing", href: "/dashboard/billing", icon: ReceiptText },
  { label: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  { label: "Agency", href: "/dashboard/agency", icon: Building2 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { org, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col z-40" style={{ background: "var(--sidebar-bg)" }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <Link href="/dashboard" className="font-display text-lg font-bold text-white">
          Quick<span className="text-brand-500">Apps</span>
        </Link>
        {org && (
          <p className="text-xs mt-1 truncate" style={{ color: "var(--sidebar-text)" }}>
            {org.name}
          </p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-500/15 text-brand-400"
                  : "hover:bg-white/5"
              }`}
              style={{ color: isActive ? undefined : "var(--sidebar-text)" }}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Plan badge + Logout */}
      <div className="px-3 pb-4 space-y-2">
        {org && (
          <div className="px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.05)", color: "var(--sidebar-text)" }}>
            <span className="uppercase font-semibold text-brand-400">{org.plan}</span> plan
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full hover:bg-white/5 transition-colors"
          style={{ color: "var(--sidebar-text)" }}
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
