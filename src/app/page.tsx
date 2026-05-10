import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { Hero } from "@/components/sections/Hero";
import { LiveDemoStrip } from "@/components/sections/LiveDemoStrip";
import { Problem } from "@/components/sections/Problem";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { FeaturesPreview } from "@/components/sections/FeaturesPreview";
import { AddonsPreview } from "@/components/sections/AddonsPreview";
import { PricingPreview } from "@/components/sections/PricingPreview";
import { Testimonials } from "@/components/sections/Testimonials";
import { CmsCompatibility } from "@/components/sections/CmsCompatibility";
import { MadeInIndia } from "@/components/sections/MadeInIndia";
import { JsonLd } from "@/components/seo/JsonLd";

export default function Home() {
  return (
    <>
      <JsonLd />
      <AnnouncementBar />
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <LiveDemoStrip />
        <Problem />
        <HowItWorks />
        <FeaturesPreview />
        <AddonsPreview />
        <PricingPreview />
        <Testimonials />
        <CmsCompatibility />
        <MadeInIndia />
      </main>
      <Footer />
    </>
  );
}
