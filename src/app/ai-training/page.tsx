import type { Metadata } from "next";
import AcademyLanding from "@/components/academy/landing";
const description = "Learn to use ChatGPT for everyday tasks and small business work. Compare six Zoom and self-paced programs, and try three free written course lessons.";
export const metadata: Metadata = {
  title: "AI Training and Academy", description,
  alternates: { canonical: "/ai-training" },
  openGraph: { title: "Optimize Local AI Academy", description, url: "/ai-training", type: "website" },
  twitter: { card: "summary", title: "Optimize Local AI Academy", description },
};
export default AcademyLanding;
