import type { Metadata } from "next";
import AcademyLanding from "@/components/academy/landing";
const description = "Practical Zoom AI training for everyday life, independent professionals and small teams. Explore six offers and try three written lessons from 21 Days to AI Confidence.";
export const metadata: Metadata = {
  title: "AI Training and Academy", description,
  alternates: { canonical: "/ai-training" },
  openGraph: { title: "Optimize Local AI Academy", description, url: "/ai-training", type: "website" },
  twitter: { card: "summary", title: "Optimize Local AI Academy", description },
};
export default AcademyLanding;
