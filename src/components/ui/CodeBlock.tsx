"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
  children: React.ReactNode;
  copyText?: string;
}

export function CodeBlock({ children, copyText }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!copyText) return;
    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="relative bg-navy-900 border border-[rgba(255,255,255,0.08)] p-8 overflow-x-auto"
      style={{
        borderRadius: "var(--radius-lg)",
        fontFamily: "var(--font-mono), monospace",
        fontSize: "13px",
        lineHeight: 1.7,
      }}
    >
      <div
        className="text-[rgba(255,255,255,0.2)] text-[10px] tracking-[4px] mb-5"
        style={{ fontFamily: "var(--font-body)" }}
        aria-hidden="true"
      >
        ● ● ●
      </div>

      {copyText && (
        <button
          onClick={handleCopy}
          className="absolute top-4 right-4 p-2 text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.8)] transition-colors cursor-pointer"
          aria-label="Copy code"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      )}

      <pre className="code-plain">{children}</pre>
    </div>
  );
}
