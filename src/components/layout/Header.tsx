"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { useApi } from "@/hooks/useApi";
import { wallet } from "@/lib/api";
import { onWalletUpdate } from "@/lib/events";
import { Wallet, Bell } from "lucide-react";
import Link from "next/link";

interface WalletData {
  balance: number;
  balanceFormatted: string;
}

export function Header({ title }: { title: string }) {
  const user = useAuthStore((s) => s.user);
  const { data: walletData, refetch } = useApi<WalletData>((t) => wallet.balance(t));

  // Refetch wallet when any purchase/refund happens
  useEffect(() => {
    return onWalletUpdate(refetch);
  }, [refetch]);

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b" style={{ background: "var(--bg-elevated)", borderColor: "var(--border-default)" }}>
      <h1 className="font-display text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
        {title}
      </h1>

      <div className="flex items-center gap-4">
        {/* Wallet */}
        <Link href="/dashboard/wallet" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm" style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
          <Wallet size={16} className="text-brand-500" />
          <span className="font-medium">{walletData?.balanceFormatted ?? "₹0"}</span>
        </Link>

        {/* Notifications */}
        <button className="p-2 rounded-lg hover:opacity-80 transition-opacity" style={{ color: "var(--text-tertiary)" }}>
          <Bell size={18} />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-semibold">
          {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "?"}
        </div>
      </div>
    </header>
  );
}
