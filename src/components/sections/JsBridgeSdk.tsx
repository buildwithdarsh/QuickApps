"use client";

import { SectionLabel } from "@/components/ui/SectionLabel";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

const codeRaw = `import QuickApps from '@quickapps/bridge';

// Is this running inside a QuickApps native wrapper?
if (QuickApps.isNative()) {

  // Scan a QR code with native camera
  const scan = await QuickApps.scanner.scan();
  // → { format: 'QR_CODE', value: 'https://...' }

  // Accept Razorpay payment natively (India-exclusive)
  const payment = await QuickApps.razorpay.checkout({
    amount: 49900,   // ₹499.00 in paise
    currency: 'INR',
    name: 'Ravi Stores'
  });

  // Listen for push notification taps
  QuickApps.on('push:tapped', (data) => {
    navigateTo(data.deepLink);
  });
}`;

export function JsBridgeSdk() {
  const { ref, isVisible } = useScrollReveal();
  const [npmCopied, setNpmCopied] = useState(false);

  async function copyNpm() {
    await navigator.clipboard.writeText("npm install @quickapps/bridge");
    setNpmCopied(true);
    setTimeout(() => setNpmCopied(false), 2000);
  }

  return (
    <section
      id="sdk"
      ref={ref}
      className="bg-[var(--bg-primary)]"
      style={{ padding: "var(--section-py) 0" }}
    >
      <div
        className="container"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(32px)",
          transition: "opacity 0.6s var(--ease-out-expo), transform 0.6s var(--ease-out-expo)",
        }}
      >
        <SectionLabel>For Developers</SectionLabel>
        <h2
          className="mt-4"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          Native APIs.
          <br />
          Your JavaScript.
          <br />
          Zero native code.
        </h2>
        <p
          className="mt-3 text-[var(--text-secondary)] text-lg leading-relaxed"
          style={{ fontFamily: "var(--font-body)", maxWidth: "560px" }}
        >
          The QuickApps JS Bridge SDK.
          <br />
          npm install and you&apos;re talking to hardware.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[55%_1fr] gap-12 items-start mt-10">
          {/* Code block */}
          <CodeBlock copyText={codeRaw}>
            <code>
              <span className="code-keyword">import</span>{" "}
              <span className="code-plain">QuickApps</span>{" "}
              <span className="code-keyword">from</span>{" "}
              <span className="code-string">&apos;@quickapps/bridge&apos;</span>
              ;{"\n\n"}
              <span className="code-comment">// Is this running inside a QuickApps native wrapper?</span>{"\n"}
              <span className="code-keyword">if</span>{" "}
              <span className="code-plain">(</span>
              <span className="code-function">QuickApps.isNative</span>
              <span className="code-plain">()) {"{"}</span>{"\n\n"}
              {"  "}
              <span className="code-comment">// Scan a QR code with native camera</span>{"\n"}
              {"  "}
              <span className="code-keyword">const</span>{" "}
              <span className="code-plain">scan =</span>{" "}
              <span className="code-keyword">await</span>{" "}
              <span className="code-function">QuickApps.scanner.scan</span>
              <span className="code-plain">();</span>{"\n"}
              {"  "}
              <span className="code-comment">{"// → { format: 'QR_CODE', value: 'https://...' }"}</span>{"\n\n"}
              {"  "}
              <span className="code-comment">// Accept Razorpay payment natively (India-exclusive)</span>{"\n"}
              {"  "}
              <span className="code-keyword">const</span>{" "}
              <span className="code-plain">payment =</span>{" "}
              <span className="code-keyword">await</span>{" "}
              <span className="code-function">QuickApps.razorpay.checkout</span>
              <span className="code-plain">({"{"}</span>{"\n"}
              {"    "}
              <span className="code-plain">amount:</span>{" "}
              <span className="code-number">49900</span>
              <span className="code-plain">,</span>{" "}
              <span className="code-comment">// ₹499.00 in paise</span>{"\n"}
              {"    "}
              <span className="code-plain">currency:</span>{" "}
              <span className="code-string">&apos;INR&apos;</span>
              <span className="code-plain">,</span>{"\n"}
              {"    "}
              <span className="code-plain">name:</span>{" "}
              <span className="code-string">&apos;Ravi Stores&apos;</span>{"\n"}
              {"  "}
              <span className="code-plain">{"}"});</span>{"\n\n"}
              {"  "}
              <span className="code-comment">// Listen for push notification taps</span>{"\n"}
              {"  "}
              <span className="code-function">QuickApps.on</span>
              <span className="code-plain">(</span>
              <span className="code-string">&apos;push:tapped&apos;</span>
              <span className="code-plain">, (data) =&gt; {"{"}</span>{"\n"}
              {"    "}
              <span className="code-function">navigateTo</span>
              <span className="code-plain">(data.deepLink);</span>{"\n"}
              {"  "}
              <span className="code-plain">{"}"});</span>{"\n"}
              <span className="code-plain">{"}"}</span>
            </code>
          </CodeBlock>

          {/* Right side */}
          <div>
            <p
              className="text-[var(--text-secondary)] text-lg leading-relaxed mb-6"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Call the device camera, biometric scanner, Razorpay checkout, UPI payment intent,
              contacts, Bluetooth, NFC, accelerometer, and 50+ native APIs &mdash; directly from
              your website&apos;s JavaScript.
            </p>
            <p
              className="text-[var(--text-secondary)] leading-relaxed mb-8"
              style={{ fontFamily: "var(--font-body)" }}
            >
              No Xcode. No Android Studio. No native code review. No Stack Overflow at 2 AM.
            </p>

            {/* Comparison callout */}
            <div
              className="mb-8 p-5"
              style={{
                borderLeft: "3px solid var(--brand-500)",
                background: "rgba(249,115,22,0.04)",
                borderRadius: "0 var(--radius-md) var(--radius-md) 0",
              }}
            >
              <p
                className="text-sm text-[var(--text-secondary)] leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                GoNative.io charges $7,200/year for a JS Bridge.
                <br />
                QuickApps includes it for ₹3,999 one-time.
                <br />
                <span className="font-semibold text-brand-500">Do the maths.</span>
              </p>
            </div>

            {/* npm badge */}
            <div
              className="bg-navy-900 border border-[rgba(255,255,255,0.08)] p-4 flex items-center justify-between gap-4"
              style={{ borderRadius: "var(--radius-md)" }}
            >
              <code className="text-sm text-[rgba(255,255,255,0.85)]" style={{ fontFamily: "var(--font-mono)" }}>
                npm install @quickapps/bridge
              </code>
              <button
                onClick={copyNpm}
                className="text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.8)] transition-colors cursor-pointer"
                aria-label="Copy install command"
              >
                {npmCopied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            {/* npm badge line */}
            <p
              className="mt-3 text-xs text-[var(--text-tertiary)]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              ★ TypeScript &nbsp;&middot;&nbsp; MIT &nbsp;&middot;&nbsp; React / Vue / Next.js / Vanilla JS
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
