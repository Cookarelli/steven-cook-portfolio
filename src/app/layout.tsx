import type { Metadata } from "next";
import "./globals.css";
import "./optimize-local.css";

import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: "Optimize Local | Business Apps, Booking & Loyalty", template: "%s | Optimize Local" },
  description: "Spend less time on paperwork, booking, and follow-ups. Optimize Local builds affordable business apps, loyalty programs, and customer tools for local businesses.",
  keywords: ["Optimize Local", "business apps", "custom web apps", "customer loyalty programs", "small business booking", "Rockford app development", "business automation", "local business websites"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Optimize Local",
    title: "Optimize Local | Big business tools. Local business prices.",
    description: "Custom apps, loyalty programs, booking, and automation for local businesses. Packages start at $500.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Optimize Local | Apps That Save Time for Local Business",
    description: "Save time, stay organized, and help customers come back with practical business apps, booking, and rewards.",
  },
};

const businessSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Optimize Local",
  url: siteUrl.toString(),
  email: "optimizelocalai@gmail.com",
  description: "Custom business apps, websites, customer loyalty, booking and automation for local businesses.",
  founder: { "@type": "Person", name: "Steve Cook" },
  address: { "@type": "PostalAddress", addressLocality: "Rockford", addressRegion: "IL", addressCountry: "US" },
  areaServed: ["Rockford, Illinois", "Northern Illinois", "United States"],
  makesOffer: [
    { "@type": "Offer", name: "QuickStart", price: "500", priceCurrency: "USD", description: "Starting project price; final scope quoted." },
    { "@type": "Offer", name: "Business App", price: "1500", priceCurrency: "USD", description: "Starting project price; final scope quoted." },
    { "@type": "Offer", name: "App + Loyalty", price: "2500", priceCurrency: "USD", description: "Starting project price; final scope quoted." },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }} />{children}</body></html>;
}
