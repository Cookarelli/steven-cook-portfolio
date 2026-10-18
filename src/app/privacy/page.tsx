import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Privacy & Contact Inquiries",
  description: "How Optimize Local handles information sent through our website inquiry form.",
};

export default function PrivacyPage() {
  return (
    <main className="ol-site ol-message-page">
      <div className="ol-container ol-message-card ol-privacy-content">
        <a href="/" className="ol-footer-logo">OPTIMIZE <strong>LOCAL.</strong></a>
        <p className="ol-eyebrow">YOUR INFORMATION</p>
        <h1>Privacy & contact inquiries</h1>
        <p>When you send an inquiry, we collect the information you enter, such as your name, email address, business name, phone number, and project description. If you follow an advertisement, the form may also include campaign labels so we can tell where the inquiry came from.</p>
        <p>We use this information to answer your inquiry, schedule consultations, and discuss services you requested. We do not sell your inquiry details or enroll you in a marketing list merely because you contacted us.</p>
        <p>Our form uses FormSubmit to transmit submissions to <a href="mailto:optimizelocalai@gmail.com">optimizelocalai@gmail.com</a>. FormSubmit states that submissions are retained in its archive for up to 30 days. Messages may also remain in our email inbox for as long as needed to handle your request.</p>
        <p>To request access to or deletion of inquiry information we hold, email <a href="mailto:optimizelocalai@gmail.com">optimizelocalai@gmail.com</a>. We may need to retain certain records when legally required.</p>
        <p>This notice covers our inquiry form, not any separate business applications or third-party booking pages.</p>
        <a className="ol-button ol-button-primary" href="/">Back to Optimize Local ↗</a>
      </div>
    </main>
  );
}
