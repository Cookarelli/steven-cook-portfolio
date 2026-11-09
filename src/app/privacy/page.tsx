import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = {
  alternates: { canonical: "/privacy" },
  title: "Privacy & Contact Inquiries",
  description: "How Optimize Local handles information sent through our website inquiry form.",
};

export default function PrivacyPage() {
  return (
    <main className="ol-site ol-message-page">
      <div className="ol-container ol-message-card ol-privacy-content">
        <Link href="/" className="ol-footer-logo">OPTIMIZE <strong>LOCAL.</strong></Link>
        <p className="ol-eyebrow">YOUR INFORMATION</p>
        <h1>Privacy & contact inquiries</h1>
        <p>When you send an inquiry, we collect the information you enter, such as your name, email address, business name, phone number, and project description. If you follow an advertisement, the form may also include campaign labels so we can tell where the inquiry came from.</p>
        <p>We use this information to answer your inquiry, schedule consultations, and discuss services you requested. We do not sell your inquiry details or enroll you in a marketing list merely because you contacted us.</p>
        <p>Our existing business-services form uses FormSubmit to transmit submissions to <a href="mailto:optimizelocalai@gmail.com">optimizelocalai@gmail.com</a>. FormSubmit states that submissions are retained in its archive for up to 30 days. Messages may also remain in our email inbox for as long as needed to handle your request.</p>
        <p>To request access to or deletion of inquiry information we hold, email <a href="mailto:optimizelocalai@gmail.com">optimizelocalai@gmail.com</a>. We may need to retain certain records when legally required.</p>
        <p>Academy forms save your name, email, optional phone, interested program, request type, referral or campaign source, preferred contact method, notes and timestamps in our lead database. We record progress and follow-up dates so we can respond to your request. Payment-verification requests store only the transaction reference you provide, not financial credentials or proof that payment has been verified. Do not submit sensitive health information, passwords, card numbers or account credentials.</p>
        <p>We record optional promotional-email consent separately from communication needed to answer your request. Joining the 21 Days to AI Confidence list requires separate consent to course-availability updates, and does not opt you into other promotions. Consent choices and changes are recorded with timestamps. You can withdraw either type of consent by emailing us.</p>
        <p>When configured, we notify our business inbox through FormSubmit or our email provider and may send an acknowledgment through our configured email provider. Saving a lead does not mean email delivery is confirmed. We keep lead records and correspondence as needed to manage inquiries and requested services; contact us to request access or deletion. Access to the lead view is restricted to our business administrator. We use temporary, hashed rate-limit identifiers to reduce abuse.</p>
        <p>This notice covers our inquiry form, not any separate business applications or third-party booking pages.</p>
        <Link className="ol-button ol-button-primary" href="/">Back to Optimize Local ↗</Link>
      </div>
    </main>
  );
}
