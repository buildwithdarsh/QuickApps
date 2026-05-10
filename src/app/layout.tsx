import type { Metadata } from "next";
import Script from "next/script";
import { Sora, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://quickapps.in"),
  title: {
    default:
      "QuickApps \u2014 India\u2019s First Website to Native App Platform | \u20B91,999",
    template: "%s | QuickApps",
  },
  description:
    "Convert any website to Android & iOS in 15 minutes. India\u2019s first self-serve app platform. Razorpay, UPI, biometrics, push notifications. Starting \u20B91,999 one-time \u2014 not monthly.",
  keywords: [
    "website to app",
    "convert website to app",
    "website to android app",
    "website to ios app",
    "app builder India",
    "native app converter",
    "WebView app",
    "Shopify to app",
    "WordPress to app",
    "Bubble to app",
    "no code app builder",
    "QuickApps",
    "Darsh Gupta",
    "INR pricing",
    "Razorpay app",
    "UPI app",
    "white label app builder",
    "agency app builder",
    "india's first website to app",
    "website to apk india",
    "convert website android app india",
    "website to app \u20B91999",
    "razorpay in app checkout",
    "website to native app platform india",
  ],
  authors: [{ name: "Darsh Gupta" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://quickapps.in",
    siteName: "QuickApps",
    title: "QuickApps \u2014 Your website. Native app. 15 minutes.",
    description:
      "\u20B91,999. Not \u20B950,000. Not 6 months. India\u2019s first website to native app platform with Razorpay checkout, UPI, and 50+ addons.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@quickapps_in",
    creator: "@buildwithdarsh",
    title: "QuickApps \u2014 Your website. Native app. 15 minutes.",
    description:
      "\u20B91,999. Not \u20B950,000. Not 6 months. India\u2019s first website to native app platform with Razorpay checkout, UPI, and 50+ addons.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${dmSans.variable} ${jetbrainsMono.variable} overflow-x-clip`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches)){d.dataset.theme="dark"}if(sessionStorage.getItem("qa-announcement-dismissed")){d.style.setProperty("--announcement-height","0px")}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="overflow-x-clip w-full max-w-full">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches)){d.dataset.theme="dark"}if(sessionStorage.getItem("qa-announcement-dismissed")){d.style.setProperty("--announcement-height","0px")}}catch(e){}})()`,
          }}
        />
        <noscript>
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            <h1>QuickApps</h1>
            <p>
              This website requires JavaScript to function. Please enable
              JavaScript in your browser settings.
            </p>
          </div>
        </noscript>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "var(--bg-elevated)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-default)",
            },
          }}
        />
      </body>
    </html>
  );
}
