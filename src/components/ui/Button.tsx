"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "dark";
  size?: "default" | "sm" | "lg";
  href?: string;
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "default",
  href,
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium transition-all cursor-pointer whitespace-nowrap";

  const variantStyles = {
    primary:
      "bg-brand-500 text-white hover:bg-brand-600 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(249,115,22,0.35)] active:translate-y-0 active:scale-[0.98]",
    secondary:
      "bg-transparent border-[1.5px] border-[var(--border-default)] text-[var(--text-primary)] hover:bg-bg-secondary hover:border-[var(--border-strong)]",
    ghost:
      "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
    dark: "bg-navy-900 text-white hover:bg-navy-700 hover:-translate-y-0.5",
  };

  const sizeStyles = {
    sm: "text-sm px-4 py-2 rounded-full",
    default: "text-base px-8 py-4 rounded-full",
    lg: "text-lg px-10 py-5 rounded-full",
  };

  const classes = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    (loading || disabled) && "opacity-60 pointer-events-none",
    className,
  );

  const content = loading ? (
    <>
      <Loader2 size={size === "sm" ? 14 : 16} className="animate-spin" />
      {children}
    </>
  ) : (
    children
  );

  if (href) {
    // External links or anchor links
    if (href.startsWith("http") || href.startsWith("#")) {
      return (
        <a href={href} className={classes}>
          {content}
        </a>
      );
    }
    // Internal routes — use Next.js Link
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={loading || disabled} {...props}>
      {content}
    </button>
  );
}
