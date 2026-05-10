"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { auth } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data: any = await auth.login(form);
      setAuth(data);
      toast.success("Logged in successfully");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="font-display text-xl font-semibold mb-6" style={{ color: "var(--text-primary)" }}>
        Sign in to your account
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            placeholder="••••••••"
          />
        </div>
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-brand-500 hover:text-brand-600">
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg font-medium text-sm text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 transition-colors"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-6 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full" style={{ borderTop: "1px solid var(--border-default)" }} />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2" style={{ background: "var(--bg-elevated)", color: "var(--text-tertiary)" }}>or</span>
        </div>
      </div>

      <a
        href={`${process.env["NEXT_PUBLIC_API_URL"] || "http://localhost:3001/api/v1"}/auth/google`}
        className="mt-4 w-full py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/><path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.166 6.656 3.58 9 3.58Z" fill="#EA4335"/></svg>
        Continue with Google
      </a>

      <p className="mt-6 text-center text-sm" style={{ color: "var(--text-tertiary)" }}>
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-brand-500 hover:text-brand-600 font-medium">
          Sign up
        </Link>
      </p>
    </>
  );
}
