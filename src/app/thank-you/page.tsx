import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import type { Metadata } from "next";
import { consultationHref, consultationReady } from "@/lib/consultation";
export const metadata: Metadata = {
  title: "Thanks for Reaching Out",
  description: "Thanks for contacting Optimize Local. Book a call or return to our services.",
  robots: { index: false, follow: true },
};

export default function ThankYouPage() {
  return (
    <main className="ol-site ol-message-page">
      <div className="ol-container ol-message-card">
        <BrandLogo href="/" className="ol-footer-logo" />
        <p className="ol-eyebrow">THANK YOU</p>
        <h1>Thanks for your message.</h1>
        <p>Thanks for telling me about your business. I’ll read your note and reply by email once it reaches the inbox. If you’d rather talk, you can book a free call below.</p>
        <p>The call takes 20 minutes. We can talk through your idea and any questions you have.</p>
        <div className="ol-actions">
          <a className="ol-button ol-button-primary" href={consultationHref} {...(consultationReady ? { target: "_blank", rel: "noopener noreferrer" } : {})}>Book your free 20-minute call ↗</a>
          <Link className="ol-button ol-button-outline" href="/">Back to the website</Link>
        </div>
      </div>
    </main>
  );
}
