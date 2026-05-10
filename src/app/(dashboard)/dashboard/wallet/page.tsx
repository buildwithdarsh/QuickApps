"use client";

import { Header } from "@/components/layout/Header";
import { useApi } from "@/hooks/useApi";
import { wallet } from "@/lib/api";
import { Wallet, Plus, IndianRupee, Loader2, ArrowUp, ArrowDown } from "lucide-react";

interface WalletData {
  balance: number;
  balanceFormatted: string;
  lastUpdated: string;
}

interface Transaction {
  id: string;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

interface TransactionsResponse {
  data: Transaction[];
  meta: { total: number };
}

export default function WalletPage() {
  const { data: walletData, loading } = useApi<WalletData>((t) => wallet.balance(t));
  const { data: txns } = useApi<TransactionsResponse>((t) => wallet.transactions(t));

  return (
    <>
      <Header title="MintWallet" />
      <div className="p-6 space-y-6">
        {/* Balance card */}
        <div className="rounded-xl p-6" style={{ background: "linear-gradient(135deg, #1E3A5F 0%, #0A1628 100%)" }}>
          <p className="text-sm text-white/60">MintWallet Balance</p>
          {loading ? (
            <Loader2 size={24} className="animate-spin text-white mt-2" />
          ) : (
            <div className="flex items-baseline gap-1 mt-2">
              <IndianRupee size={24} className="text-white" />
              <span className="text-4xl font-display font-bold text-white">
                {walletData ? (walletData.balance / 100).toLocaleString("en-IN") : "0"}
              </span>
            </div>
          )}
          <p className="text-xs text-white/40 mt-2">Use across all Darsh Gupta products</p>
          <button className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-brand-500 text-white hover:bg-brand-600 transition-colors">
            <Plus size={16} /> Top Up Wallet
          </button>
        </div>

        {/* Transactions */}
        <div>
          <h3 className="font-display font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Transaction History</h3>
          {txns?.data && txns.data.length > 0 ? (
            <div className="space-y-2">
              {txns.data.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.amount > 0 ? "bg-green-100" : "bg-red-100"}`}>
                      {tx.amount > 0 ? <ArrowDown size={14} className="text-green-600" /> : <ArrowUp size={14} className="text-red-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{tx.description}</p>
                      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{new Date(tx.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-semibold ${tx.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                    {tx.amount > 0 ? "+" : ""}₹{(tx.amount / 100).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
              <Wallet size={32} className="mx-auto mb-3 opacity-30" style={{ color: "var(--text-tertiary)" }} />
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>No transactions yet. Top up your wallet to get started.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
