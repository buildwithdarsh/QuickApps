import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { FeatureShowcase } from "@/components/sections/FeatureShowcase";
import { JsBridgeSdk } from "@/components/sections/JsBridgeSdk";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Push notifications, Razorpay checkout, biometrics, WhatsApp, UPI deep links, and 50+ more features. Everything an Indian app needs.",
  alternates: { canonical: "/features" },
};

export default function FeaturesPage() {
  return (
    <>
      <AnnouncementBar />
      <ScrollProgress />
      <Navbar />
      <main>
        <FeatureShowcase />
        <JsBridgeSdk />
      </main>
      <Footer />
    </>
  );
}
