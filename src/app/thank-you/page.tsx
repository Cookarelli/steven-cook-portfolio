import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Thanks for Reaching Out",
  description: "Thanks for contacting Optimize Local. Book a call or return to our services.",
  robots: { index: false, follow: true },
};

export default function ThankYouPage() {
  return (
    <main className="ol-site ol-message-page">
      <div className="ol-container ol-message-card">
        <a href="/" className="ol-footer-logo">OPTIMIZE <strong>LOCAL.</strong></a>
        <p className="ol-eyebrow">THANK YOU</p>
        <h1>Your inquiry has been submitted.</h1>
        <p>Thanks for telling us a little about your business. We'll review your note and respond by email when it reaches our inbox.</p>
        <p>Want to get straight to it? You can book a free 20-minute conversation now.</p>
        <div className="ol-actions">
          <a className="ol-button ol-button-primary" href="https://calendar.app.google/FcGwkANYvFkbsy349" target="_blank" rel="noopener noreferrer">Book a free consultation ↗</a>
          <a className="ol-button ol-button-outline" href="/">Back to the website</a>
        </div>
      </div>
    </main>
  );
}
