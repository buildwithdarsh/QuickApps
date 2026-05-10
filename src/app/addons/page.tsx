import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { AddonMarketplace } from "@/components/sections/AddonMarketplace";

export const metadata: Metadata = {
  title: "Addons",
  description:
    "50+ addons for your native app. Push notifications, analytics, payments, security, navigation, and more. Buy once, keep forever.",
  alternates: { canonical: "/addons" },
};

export default function AddonsPage() {
  return (
    <>
      <AnnouncementBar />
      <ScrollProgress />
      <Navbar />
      <main>
        <AddonMarketplace />
      </main>
      <Footer />
    </>
  );
}
