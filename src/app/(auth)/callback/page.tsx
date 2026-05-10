"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { users } from "@/lib/api";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (accessToken && refreshToken) {
      users.me(accessToken).then((data: any) => {
        setAuth({
          user: data.user || data,
          organisation: data.organisation,
          accessToken,
          refreshToken,
        });
        router.push("/dashboard");
      }).catch(() => {
        router.push("/login");
      });
    } else {
      router.push("/login");
    }
  }, [searchParams, setAuth, router]);

  return (
    <div className="text-center">
      <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-4" />
      <p style={{ color: "var(--text-tertiary)" }}>Signing you in...</p>
    </div>
  );
}
