"use client";

import { useEffect, useState } from "react";
import { Menu, X, Moon, Sun, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 80);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 z-50 transition-all duration-400",
        scrolled &&
          "bg-[var(--glass-bg)] backdrop-blur-[20px] border-b border-[var(--glass-border)] shadow-[0_1px_0_var(--glass-border)]",
      )}
      style={{
        height: "var(--navbar-height)",
        top: "var(--announcement-height, 0px)",
      }}
    >
      <nav className="container h-full flex items-center justify-between">
        {/* Logo */}
        <a href="/" aria-label="QuickApps home">
          <Logo className="w-[140px] h-auto" />
        </a>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="relative text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-brand-500 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            <div
              className="transition-transform duration-300"
              style={{
                transform: theme === "dark" ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </div>
          </button>

          <Link
            href="/login"
            className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Sign in
          </Link>

          <Button variant="primary" size="sm" href="/dashboard/app/new">
            Build your app <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-[var(--text-primary)] cursor-pointer"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-[var(--navbar-height)] bg-[var(--bg-primary)] z-40">
          <div className="container py-8 flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
              <span className="text-sm text-[var(--text-tertiary)]">Menu</span>
              <button
                onClick={toggleTheme}
                className="p-2 text-[var(--text-secondary)] cursor-pointer"
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            </div>

            <ul className="flex flex-col gap-1 flex-1">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 text-lg font-medium text-[var(--text-primary)] hover:text-brand-500 transition-colors"
                    style={{
                      fontFamily: "var(--font-display)",
                      minHeight: "48px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 text-lg font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  style={{
                    fontFamily: "var(--font-display)",
                    minHeight: "48px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  Sign in
                </Link>
              </li>
            </ul>

            <Button
              variant="primary"
              size="default"
              href="/dashboard/app/new"
              className="w-full mt-4"
            >
              Build your app →
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
