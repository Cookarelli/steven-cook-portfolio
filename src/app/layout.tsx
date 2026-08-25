import type { Metadata } from "next";
import "./globals.css";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "Steven Cook | Digital Marketing, SEO, Product & AI",
  description: "Steven Cook is a digital marketing and SEO leader with nearly two decades of experience spanning search, paid media, digital strategy, web development, mobile products, SaaS and AI automation.",
  keywords: ["Steven Cook", "Digital Marketing", "SEO", "Search Engine Optimization", "Digital Strategy", "Paid Media", "Product Development", "AI Automation", "Web Development", "Rockford Illinois", "Orange County digital marketing"],
  alternates: siteUrl ? { canonical: "/" } : undefined,
  openGraph: {
    title: "Steven Cook | Digital Marketing, SEO, Product & AI",
    description: "Steven Cook is a digital marketing and SEO leader with nearly two decades of experience spanning search, paid media, digital strategy, web development, mobile products, SaaS and AI automation.",
    type: "website",
    siteName: "Steven Cook",
    locale: "en_US",
    url: siteUrl,
  },
  twitter: {
    card: "summary",
    title: "Steven Cook | Digital Marketing, SEO, Product & AI",
    description: "Steven Cook is a digital marketing and SEO leader with nearly two decades of experience spanning search, paid media, digital strategy, web development, mobile products, SaaS and AI automation.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Steven Cook",
    email: "optimizelocalai@gmail.com",
    sameAs: ["https://www.linkedin.com/in/stevenallencook"],
    address: { "@type": "PostalAddress", addressLocality: "Rockford", addressRegion: "IL", addressCountry: "US" },
    jobTitle: "Digital Marketing, SEO, Product & AI Professional",
    founder: { "@type": "Organization", name: "Optimize Local" },
    knowsAbout: ["Digital Marketing", "Search Engine Optimization", "Paid Media", "Digital Strategy", "Analytics", "Product Development", "Web Development", "Mobile Applications", "AI Automation"],
    alumniOf: [
      { "@type": "Organization", name: "Rareview" },
      { "@type": "Organization", name: "Spireon" },
      { "@type": "Organization", name: "Stellar Social" },
      { "@type": "Organization", name: "Poker Affiliate Listings" },
    ],
  };
  return <html lang="en"><body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />{children}</body></html>;
}
