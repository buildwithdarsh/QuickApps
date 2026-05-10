import { SITE } from "@/lib/constants";

export function JsonLd() {
  const softwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE.name,
    description:
      "Convert any website into a native Android & iOS app in 15 minutes. India-first pricing, Razorpay, UPI, 50+ addons.",
    url: SITE.url,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Android, iOS",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: "0",
      highPrice: "7999",
    },
    author: {
      "@type": "Organization",
      name: SITE.company,
      url: "https://build.withdarsh.com",
    },
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.company,
    url: "https://build.withdarsh.com",
    logo: `${SITE.url}/icon.svg`,
    sameAs: [
      "https://twitter.com/quickapps_in",
      "https://linkedin.com/company/quickapps",
      "https://github.com/quickapps",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Indore",
      addressRegion: "Madhya Pradesh",
      addressCountry: "IN",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
    </>
  );
}
