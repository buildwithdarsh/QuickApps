"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { auth } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await auth.forgotPassword(email);
      setSent(true);
      toast.success("Reset link sent to your email");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="text-4xl mb-4">📧</div>
        <h2 className="font-display text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Check your email</h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-tertiary)" }}>
          We sent a password reset link to <span className="font-medium">{email}</span>
        </p>
        <Link href="/login" className="text-sm text-brand-500 hover:text-brand-600 font-medium">Back to sign in</Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="font-display text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Reset your password</h2>
      <p className="text-sm mb-6" style={{ color: "var(--text-tertiary)" }}>Enter your email and we&apos;ll send you a reset link.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
          placeholder="you@example.com" />
        <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg font-medium text-sm text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 transition-colors">
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm" style={{ color: "var(--text-tertiary)" }}>
        <Link href="/login" className="text-brand-500 hover:text-brand-600 font-medium">Back to sign in</Link>
      </p>
    </>
  );
}
