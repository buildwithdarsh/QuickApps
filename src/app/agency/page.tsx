import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { AgencyProgramme } from "@/components/sections/AgencyProgramme";

export const metadata: Metadata = {
  title: "Agency Programme",
  description:
    "White-label QuickApps for your agency. Your brand, your pricing, unlimited client apps. We stay invisible.",
  alternates: { canonical: "/agency" },
};

export default function AgencyPage() {
  return (
    <>
      <AnnouncementBar />
      <ScrollProgress />
      <Navbar />
      <main>
        <AgencyProgramme />
      </main>
      <Footer />
    </>
  );
}
