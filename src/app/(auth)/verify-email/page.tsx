"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { auth } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export default function VerifyEmailPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    setLoading(true);
    try {
      await auth.verifyEmail({ email: user.email, code });
      updateUser({ emailVerified: true });
      toast.success("Email verified!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!user?.email) return;
    try {
      await auth.resendVerification(user.email);
      toast.success("Verification code resent");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend");
    }
  };

  return (
    <>
      <h2 className="font-display text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Verify your email</h2>
      <p className="text-sm mb-6" style={{ color: "var(--text-tertiary)" }}>
        We sent a 6-digit code to <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{user?.email}</span>
      </p>
      <form onSubmit={handleVerify} className="space-y-4">
        <input
          type="text"
          required
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="w-full px-3 py-4 rounded-lg text-2xl text-center font-mono tracking-[0.5em] outline-none"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
          placeholder="000000"
        />
        <button type="submit" disabled={loading || code.length !== 6} className="w-full py-2.5 rounded-lg font-medium text-sm text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 transition-colors">
          {loading ? "Verifying..." : "Verify email"}
        </button>
      </form>
      <button onClick={handleResend} className="mt-4 w-full text-sm text-brand-500 hover:text-brand-600">
        Resend code
      </button>
    </>
  );
}
