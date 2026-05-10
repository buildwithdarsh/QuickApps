"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { auth } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "", orgName: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data: any = await auth.register(form);
      setAuth(data);
      toast.success("Account created! Check your email to verify.");
      router.push("/verify-email");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const inputStyle = { background: "var(--bg-secondary)", border: "1px solid var(--border-default)", color: "var(--text-primary)" };

  return (
    <>
      <h2 className="font-display text-xl font-semibold mb-6" style={{ color: "var(--text-primary)" }}>
        Create your account
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Your name</label>
          <input type="text" value={form.name} onChange={set("name")} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} placeholder="Ravi Kumar" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Business / Organisation name</label>
          <input type="text" required value={form.orgName} onChange={set("orgName")} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} placeholder="Ravi Stores" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Email</label>
          <input type="email" required value={form.email} onChange={set("email")} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Password</label>
          <input type="password" required minLength={8} value={form.password} onChange={set("password")} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} placeholder="Min 8 characters" />
          <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>Must contain uppercase, lowercase, and a number</p>
        </div>
        <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg font-medium text-sm text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 transition-colors">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm" style={{ color: "var(--text-tertiary)" }}>
        Already have an account?{" "}
        <Link href="/login" className="text-brand-500 hover:text-brand-600 font-medium">Sign in</Link>
      </p>
    </>
  );
}
