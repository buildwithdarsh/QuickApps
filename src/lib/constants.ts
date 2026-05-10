export const SITE = {
  name: "QuickApps",
  tagline: "Your Website. Native App. In 15 Minutes.",
  url: "https://quickapps.in",
  email: "hello@quickapps.in",
  company: "Darsh Gupta",
  location: "Indore, Madhya Pradesh, India",
} as const;

export const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Addons", href: "/addons" },
  { label: "Pricing", href: "/pricing" },
  { label: "Agency", href: "/agency" },
  { label: "Blog", href: "/blog" },
] as const;

export const STATS = [
  { value: 200000, prefix: "", suffix: "+", label: "Apps converted worldwide" },
  { value: 1999, prefix: "\u20B9", suffix: "", label: "Starting price \u2014 one-time only" },
  { value: 15, prefix: "", suffix: " min", label: "Guaranteed build time" },
  { value: 50, prefix: "", suffix: "+", label: "Addons \u2014 buy once, keep forever" },
] as const;

export const TRUSTED_PLATFORMS = [
  "WordPress",
  "Shopify",
  "Bubble",
  "Webflow",
  "WooCommerce",
  "Wix",
] as const;

export interface Plan {
  name: string;
  price: number;
  billing: string;
  featured: boolean;
  tagline: string;
  cta: string;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    name: "Free",
    price: 0,
    billing: "forever",
    featured: false,
    tagline: "Try before you pay.",
    cta: "Start free",
    features: [
      "Watermarked demo APK",
      "25 core features",
      "1 revision",
      "Standard build queue",
      "Basic JS Bridge",
    ],
  },
  {
    name: "Starter",
    price: 1999,
    billing: "one-time",
    featured: false,
    tagline: "Your first app.",
    cta: "Get started",
    features: [
      "Full Android APK",
      "25 core features",
      "3 free revisions",
      "Standard build queue",
      "Addon store access",
      "Basic JS Bridge",
    ],
  },
  {
    name: "Pro",
    price: 3999,
    billing: "one-time",
    featured: true,
    tagline: "For serious businesses.",
    cta: "Get Pro",
    features: [
      "Android APK + iOS IPA",
      "Full addon store access",
      "Priority builds",
      "Full JS Bridge SDK",
      "3 free revisions",
      "80% of customers choose this",
    ],
  },
  {
    name: "Premium",
    price: 7999,
    billing: "one-time",
    featured: false,
    tagline: "Everything included.",
    cta: "Get Premium",
    features: [
      "Every addon unlocked",
      "Immediate build queue",
      "5 free revisions",
      "Full JS Bridge SDK",
      "Priority support",
      "Zero compromises",
    ],
  },
  {
    name: "Agency",
    price: 4999,
    billing: "per month",
    featured: false,
    tagline: "Turn your agency into an app factory.",
    cta: "Start agency account",
    features: [
      "White-label dashboard",
      "Unlimited client apps",
      "Your brand, your pricing",
      "GST invoices in your name",
      "API access",
      "We stay invisible",
    ],
  },
];

export interface Addon {
  name: string;
  description: string;
  price: number;
  category: string;
  india?: boolean;
}

export const ADDON_CATEGORIES = [
  "All",
  "Notifications",
  "Analytics",
  "Security",
  "Payments",
  "Monetization",
  "Navigation",
  "Device",
  "Performance",
  "Integrations",
  "Publishing",
  "India-exclusive",
] as const;

export const ADDONS: Addon[] = [
  // ── Notifications ──
  {
    name: "OneSignal Push",
    description: "Segmentation, automation, rich media. One key.",
    price: 699,
    category: "Notifications",
  },
  {
    name: "Firebase Notifications",
    description: "Send to devices, topics, or segments via FCM.",
    price: 799,
    category: "Notifications",
  },
  {
    name: "Custom Notification Sound",
    description: "Your brand tone for every alert.",
    price: 299,
    category: "Notifications",
  },
  {
    name: "In-App Messaging",
    description: "Banners, modals, and cards triggered by events.",
    price: 499,
    category: "Notifications",
  },

  // ── Analytics ──
  {
    name: "Firebase Analytics",
    description: "Track every screen, event, and user property.",
    price: 799,
    category: "Analytics",
  },
  {
    name: "Facebook App Events",
    description: "Attribution for every Facebook ad you run.",
    price: 599,
    category: "Analytics",
  },
  {
    name: "AppsFlyer",
    description: "Industry-standard attribution. LTV, ROI, retargeting.",
    price: 899,
    category: "Analytics",
  },
  {
    name: "Mixpanel",
    description: "User flows, funnels, retention cohorts.",
    price: 699,
    category: "Analytics",
  },
  {
    name: "Amplitude",
    description: "Behavioral analytics. Know what users actually do.",
    price: 699,
    category: "Analytics",
  },

  // ── Security ──
  {
    name: "Biometric Auth",
    description: "Fingerprint + Face ID + PIN. 2 minutes to set up.",
    price: 499,
    category: "Security",
  },
  {
    name: "Social Login",
    description: "Google, Facebook, Apple \u2014 native SDK. No popup.",
    price: 699,
    category: "Security",
  },
  {
    name: "Passcode Lock",
    description: "4\u20136 digit PIN with timeout. Configurable.",
    price: 399,
    category: "Security",
  },
  {
    name: "Device Lock",
    description: "Device\u2019s own PIN/pattern as app lock. Zero setup.",
    price: 299,
    category: "Security",
  },
  {
    name: "Root / Jailbreak Detection",
    description: "Block rooted and jailbroken devices.",
    price: 499,
    category: "Security",
  },

  // ── Payments (India-exclusive) ──
  {
    name: "Razorpay In-App Checkout",
    description: "UPI, cards, EMI, wallets \u2014 natively in app.",
    price: 999,
    category: "Payments",
    india: true,
  },
  {
    name: "UPI Deep Link",
    description: "GPay, PhonePe, Paytm \u2014 one tap payment.",
    price: 499,
    category: "Payments",
    india: true,
  },
  {
    name: "WhatsApp Business Bridge",
    description: "Floating chat button. Tap \u2192 customer messages you.",
    price: 299,
    category: "Payments",
    india: true,
  },

  // ── Monetization ──
  {
    name: "Google AdMob",
    description: "Banner, interstitial, rewarded video ads.",
    price: 699,
    category: "Monetization",
  },
  {
    name: "Meta Audience Network",
    description: "Facebook ads inside your app.",
    price: 699,
    category: "Monetization",
  },
  {
    name: "In-App Purchases",
    description: "Required for App Store digital goods.",
    price: 999,
    category: "Monetization",
  },
  {
    name: "RevenueCat Subscriptions",
    description: "Subscription lifecycle + paywall management.",
    price: 999,
    category: "Monetization",
  },
  {
    name: "Stripe Tap to Pay",
    description: "NFC contactless payments. For in-person businesses.",
    price: 1499,
    category: "Monetization",
  },

  // ── Navigation ──
  {
    name: "Bottom Navigation Tab",
    description: "Up to 5 tabs. Custom icons, colors, URLs.",
    price: 599,
    category: "Navigation",
  },
  {
    name: "Advanced Bottom Nav",
    description: "Sub-tabs, badges, animations, nested menus.",
    price: 799,
    category: "Navigation",
  },
  {
    name: "Side Navigation Drawer",
    description: "Multi-level hamburger menu with icons + sections.",
    price: 699,
    category: "Navigation",
  },
  {
    name: "Floating Action Button",
    description: "Persistent button \u2014 any corner, any action.",
    price: 399,
    category: "Navigation",
  },
  {
    name: "Floating Action Menu",
    description: "FAB with 3\u20135 sub-actions. Each configurable.",
    price: 499,
    category: "Navigation",
  },
  {
    name: "Onboarding Screens",
    description: "First-launch carousel. Your story, your CTA.",
    price: 599,
    category: "Navigation",
  },
  {
    name: "Offer Card",
    description: "Promotional overlay. Trigger on launch or event.",
    price: 349,
    category: "Navigation",
  },
  {
    name: "App Shortcut",
    description: "Long-press icon for quick actions (up to 4).",
    price: 299,
    category: "Navigation",
  },
  {
    name: "Dynamic App Icon",
    description: "Let users switch your app icon. Seasonal branding.",
    price: 599,
    category: "Navigation",
  },

  // ── Device ──
  {
    name: "Barcode / QR Scanner",
    description: "Native camera scan. Result to your JS. Instant.",
    price: 499,
    category: "Device",
  },
  {
    name: "Background Location",
    description: "GPS in background. For delivery and field apps.",
    price: 699,
    category: "Device",
  },
  {
    name: "Native Contacts",
    description: "Fetch contacts for autofill or invite flows.",
    price: 499,
    category: "Device",
  },
  {
    name: "Bluetooth Connectivity",
    description: "Scan and connect BLE devices. Returns to your JS.",
    price: 799,
    category: "Device",
  },
  {
    name: "NFC Tag Read",
    description: "Read NFC tags. For payments, inventory, access.",
    price: 699,
    category: "Device",
  },
  {
    name: "Haptic Feedback",
    description: "Trigger native haptics from your JavaScript.",
    price: 299,
    category: "Device",
  },
  {
    name: "Siri Shortcuts",
    description: "Voice commands that trigger in-app actions.",
    price: 599,
    category: "Device",
  },

  // ── Performance ──
  {
    name: "Background App Service",
    description: "Keep socket connections alive in background.",
    price: 699,
    category: "Performance",
  },
  {
    name: "App Auto Launch",
    description: "Start on device boot. For kiosk and delivery apps.",
    price: 499,
    category: "Performance",
  },
  {
    name: "In-App Update",
    description: "Prompt users to update without leaving the app.",
    price: 349,
    category: "Performance",
  },
  {
    name: "In-App Review Prompt",
    description: "Ask for a store rating at exactly the right moment.",
    price: 299,
    category: "Performance",
  },
  {
    name: "Offline Mode",
    description: "Pre-cache pages. Show content without internet.",
    price: 799,
    category: "Performance",
  },
  {
    name: "Native Datastore",
    description: "Persist key-value data across app restarts.",
    price: 399,
    category: "Performance",
  },
  {
    name: "Custom Media Player",
    description: "Background audio with notification controls.",
    price: 699,
    category: "Performance",
  },

  // ── Integrations ──
  {
    name: "Intercom",
    description: "Customer support chat inside your app.",
    price: 799,
    category: "Integrations",
  },
  {
    name: "Freshchat",
    description: "Live chat + ticket creation in-app.",
    price: 699,
    category: "Integrations",
  },
  {
    name: "Tawk.to Chat",
    description: "Free live chat, natively embedded.",
    price: 299,
    category: "Integrations",
  },
  {
    name: "Branch.io Deep Links",
    description: "Deferred deep linking with attribution.",
    price: 699,
    category: "Integrations",
  },
  {
    name: "AI Chatbot",
    description: "Configurable AI assistant inside your app.",
    price: 499,
    category: "Integrations",
  },

  // ── Publishing ──
  {
    name: "Google Play Publishing",
    description: "We submit your app. You just approve it.",
    price: 1999,
    category: "Publishing",
  },
  {
    name: "Apple App Store Publishing",
    description: "Full App Store submission with screenshots.",
    price: 2499,
    category: "Publishing",
  },
  {
    name: "Samsung Galaxy Store",
    description: "Get on Samsung\u2019s store with our help.",
    price: 1499,
    category: "Publishing",
  },
  {
    name: "Amazon Appstore",
    description: "Full Amazon submission support.",
    price: 1499,
    category: "Publishing",
  },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  city: string;
  stars: number;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I thought building an app was a 6-month project and a \u20B91 lakh bill. QuickApps had my Shopify store on the Play Store in 23 minutes. I cannot explain how much time and money this saved me.",
    name: "Priya Sharma",
    role: "D2C Skincare Brand",
    city: "Jaipur, Rajasthan",
    stars: 5,
  },
  {
    quote:
      "This is the best-kept secret in the Indian agency space. I white-labeled the dashboard, charged \u20B98,000 per app. Pure margin. Zero developer time. None of my clients know it\u2019s QuickApps.",
    name: "Anand Mehta",
    role: "Digital Agency Owner",
    city: "Pune, Maharashtra",
    stars: 5,
  },
  {
    quote:
      "GoNative wanted $7,200/year for what QuickApps gives me for \u20B93,999. The JS Bridge SDK is genuinely excellent. Properly documented. I\u2019ve moved every WebView project I have to QuickApps.",
    name: "Arjun Verma",
    role: "Full-Stack Freelancer",
    city: "Bengaluru, Karnataka",
    stars: 5,
  },
  {
    quote:
      "The Razorpay in-app checkout addon increased our conversion by 40%. Students pay via UPI directly inside the app \u2014 no browser redirect. No other platform offered this. That alone justified the switch.",
    name: "Ravi Agarwal",
    role: "EdTech Platform Founder",
    city: "Lucknow, Uttar Pradesh",
    stars: 5,
  },
  {
    quote:
      "I built my SaaS on Bubble. Getting it on the App Store was the missing piece. QuickApps did it in 18 minutes. I\u2019m not exaggerating \u2014 18 minutes.",
    name: "Siddharth Joshi",
    role: "No-Code SaaS Founder",
    city: "Mumbai, Maharashtra",
    stars: 5,
  },
];

export const CMS_PLATFORMS = [
  // Row 1
  "WordPress",
  "Shopify",
  "Bubble",
  "Webflow",
  "Wix",
  "Squarespace",
  // Row 2
  "Framer",
  "Tilda",
  "Teachable",
  "Kajabi",
  "WooCommerce",
  "Magento",
  // Row 3
  "React / Next.js",
  "Vue / Nuxt",
  "Angular",
  "Laravel",
  "Django",
  "Ruby on Rails",
] as const;

export const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Addons", href: "#addons" },
    { label: "Pricing", href: "#pricing" },
    { label: "Agency", href: "#agency" },
    { label: "JS Bridge SDK", href: "#sdk" },
    { label: "Changelog", href: "/changelog" },
  ],
  Resources: [
    { label: "Blog", href: "/blog" },
    { label: "Help Center", href: "https://docs.quickapps.in" },
    { label: "Status", href: "https://status.quickapps.in" },
    { label: "Community", href: "/community" },
  ],
  Legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Refund Policy", href: "/refunds" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
} as const;

export const SOCIAL_LINKS = [
  { label: "Twitter", href: "https://twitter.com/quickapps_in", icon: "twitter" },
  { label: "LinkedIn", href: "https://linkedin.com/company/quickapps", icon: "linkedin" },
  { label: "GitHub", href: "https://github.com/quickapps", icon: "github" },
  { label: "YouTube", href: "https://youtube.com/@quickapps", icon: "youtube" },
  { label: "WhatsApp", href: "https://wa.me/917000000000", icon: "whatsapp" },
] as const;
