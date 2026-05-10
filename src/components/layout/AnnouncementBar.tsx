"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "qa-announcement-dismissed";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      setVisible(false);
      document.documentElement.style.setProperty("--announcement-height", "0px");
    }
  }, []);

  function dismiss() {
    setVisible(false);
    sessionStorage.setItem(STORAGE_KEY, "1");
    document.documentElement.style.setProperty("--announcement-height", "0px");
  }

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center bg-brand-500 text-white text-sm font-medium"
      style={{ height: "var(--announcement-height, 40px)" }}
    >
      <p className="px-10 text-center leading-tight">
        <span aria-hidden="true" className="mr-1">
          &#127470;&#127475;
        </span>
        QuickApps is India&apos;s first website-to-native-app platform. Pay with
        UPI. Get GST invoice. Launch in 15 minutes.{" "}
        <a
          href="#pricing"
          className="underline underline-offset-2 hover:no-underline font-semibold"
        >
          Try free &rarr;
        </a>
      </p>

      <button
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/20 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}
