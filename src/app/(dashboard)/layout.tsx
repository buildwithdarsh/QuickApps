"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { apps, addons, wallet, orgs } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageLoader } from "@/components/ui/PageLoader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [hydrated, setHydrated] = useState(false);
  const [loaderDone, setLoaderDone] = useState(false);
  const isClientNav = useRef(false);

  // On mount, check if this is a full page load or a client-side navigation.
  // performance.navigation.type === 0 means a fresh load / full refresh.
  // If the component has already mounted once in this JS lifetime, it's client nav.
  const [showLoader] = useState(() => {
    if (typeof window === "undefined") return true;
    // Mark future mounts as client nav
    const w = window as unknown as Record<string, boolean>;
    if (w["__qa_mounted"]) {
      isClientNav.current = true;
      return false; // skip loader on client nav
    }
    w["__qa_mounted"] = true;
    return true; // show loader on full page load / refresh
  });

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    if (useAuthStore.persist.hasHydrated()) setHydrated(true);
    return () => unsub();
  }, []);

  // Redirect only after hydration confirms no token
  useEffect(() => {
    if (hydrated && !accessToken) {
      router.push("/login");
    }
  }, [hydrated, accessToken, router]);

  // Prefetch dashboard APIs while loader is showing
  const prefetched = useRef(false);
  useEffect(() => {
    if (!hydrated || !accessToken || prefetched.current) return;
    prefetched.current = true;
    // Fire-and-forget — these populate browser cache / React Query cache
    Promise.allSettled([
      apps.list(accessToken),
      addons.catalog(),
      wallet.balance(accessToken),
      orgs.me(accessToken),
    ]);
  }, [hydrated, accessToken]);

  const handleLoaderFinish = useCallback(() => {
    setLoaderDone(true);
  }, []);

  // Skip loader entirely on client-side nav
  useEffect(() => {
    if (!showLoader) setLoaderDone(true);
  }, [showLoader]);

  // Show loader: on full page load, always 3 seconds minimum
  if (!loaderDone) {
    return <PageLoader onFinish={handleLoaderFinish} />;
  }

  // Still waiting for hydration after loader (edge case: very slow hydration)
  if (!hydrated) {
    return <PageLoader onFinish={handleLoaderFinish} />;
  }

  if (!accessToken) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-60">
        {children}
      </main>
    </div>
  );
}
