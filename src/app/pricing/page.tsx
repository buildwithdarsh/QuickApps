import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { Pricing } from "@/components/sections/Pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, honest pricing in Indian Rupees. Free, Starter ₹1,999, Pro ₹3,999, Premium ₹7,999 — all one-time. Agency from ₹4,999/month.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <AnnouncementBar />
      <ScrollProgress />
      <Navbar />
      <main>
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
