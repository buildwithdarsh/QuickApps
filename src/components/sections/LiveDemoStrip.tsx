"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Loader2 } from "lucide-react";

export function LiveDemoStrip() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic URL validation
    let cleanUrl = url.trim();
    if (!cleanUrl) {
      setError("Please enter a URL");
      return;
    }
    // Add https:// if missing
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = "https://" + cleanUrl;
    }
    try {
      new URL(cleanUrl);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setError("");
    setLoading(true);

    // Short delay for visual feedback, then redirect to app creation
    setTimeout(() => {
      router.push(`/dashboard/app/new?url=${encodeURIComponent(cleanUrl)}`);
    }, 800);
  };

  return (
    <section
      id="demo"
      className="bg-navy-900"
      style={{ padding: "64px 0" }}
    >
      <div className="container text-center">
        <h2
          className="text-white mb-8"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          Paste your URL.
          <br />
          Get a real app.
          <br />
          <span className="text-brand-500">Right now.</span>
        </h2>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-[560px] mx-auto"
        >
          <div className="relative w-full sm:w-[380px]">
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError("");
              }}
              placeholder="yourwebsite.com — we'll convert it in 15 minutes"
              disabled={loading}
              className="w-full outline-none transition-all duration-200 text-white disabled:opacity-50"
              style={{
                background: error
                  ? "rgba(239,68,68,0.12)"
                  : "rgba(255,255,255,0.08)",
                border: error
                  ? "1.5px solid rgba(239,68,68,0.5)"
                  : "1.5px solid rgba(255,255,255,0.16)",
                fontFamily: "var(--font-body)",
                fontSize: "16px",
                padding: "16px 24px",
                borderRadius: "var(--radius-pill)",
              }}
              onFocus={(e) => {
                if (!error) {
                  e.currentTarget.style.borderColor = "var(--brand-400)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                }
              }}
              onBlur={(e) => {
                if (!error) {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                }
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-500 text-white px-7 py-4 font-medium flex items-center gap-2 hover:bg-brand-600 transition-colors cursor-pointer whitespace-nowrap w-full sm:w-auto justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              borderRadius: "var(--radius-pill)",
              fontFamily: "var(--font-body)",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Building preview...
              </>
            ) : (
              <>
                Build my demo app <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {error && (
          <p className="mt-2 text-sm text-red-400">{error}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-[rgba(255,255,255,0.5)]">
          {[
            "No account needed",
            "Watermarked APK in ~5 min",
            "Free. Always.",
          ].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <Check size={12} className="text-brand-400" />
              {item}
            </span>
          ))}
        </div>

        {/* Social proof ticker */}
        <p
          className="mt-5 text-sm italic text-[rgba(255,255,255,0.35)]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          14 businesses built their app in the last hour.
        </p>
      </div>
    </section>
  );
}
