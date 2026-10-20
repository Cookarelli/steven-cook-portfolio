"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { consultationHref } from "@/lib/consultation";

const INQUIRY_ENDPOINT = "https://formsubmit.co/ajax/optimizelocalai@gmail.com";
const EMAIL = "optimizelocalai@gmail.com";

type DeliveryStatus = "idle" | "submitting" | "error";
type DeliveryResponse = { success?: boolean | string; message?: string };

function formValue(data: FormData, field: string) {
  return String(data.get(field) || "").trim();
}

function campaignDetails() {
  const params = new URLSearchParams(window.location.search);
  const names = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
  return Object.fromEntries(
    names.map((key) => [key, (params.get(key) || "").slice(0, 120)])
  );
}

export function ContactForm() {
  const router = useRouter();
  const [status, setStatus] = useState<DeliveryStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const values = new FormData(event.currentTarget);
    const honeypot = formValue(values, "company_url");

    // A hidden field helps the delivery provider filter automated submissions.
    if (honeypot) return;

    const name = formValue(values, "name");
    const email = formValue(values, "email");
    const service = formValue(values, "service");
    const message = formValue(values, "message");

    if (!name || !email || !service || !message) {
      setErrorMessage("Please complete the required fields.");
      setStatus("error");
      return;
    }

    setErrorMessage("");
    setStatus("submitting");

    const source = campaignDetails();
    const payload = {
      name,
      email,
      business: formValue(values, "business"),
      phone: formValue(values, "phone"),
      service,
      message,
      "Page": window.location.pathname,
      "Campaign source": source.utm_source || "direct",
      "Campaign medium": source.utm_medium || "",
      "Campaign name": source.utm_campaign || "",
      "Campaign content": source.utm_content || "",
      "Campaign term": source.utm_term || "",
      _subject: "New Optimize Local inquiry: " + service,
      _template: "table",
      _honey: honeypot,
    };

    try {
      const response = await fetch(INQUIRY_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      const result: DeliveryResponse = await response.json();
      if (!response.ok || (result.success !== true && result.success !== "true")) {
        throw new Error("Submission service did not accept the request.");
      }

      // A successful service response means the submission was accepted, not that
      // mailbox delivery or first-use email activation has been independently verified.
      const win = window as Window & { dataLayer?: Array<Record<string, string>> };
      win.dataLayer?.push({ event: "optimize_local_inquiry_accepted", lead_source: source.utm_source || "direct" });
      router.push("/thank-you");
    } catch {
      setErrorMessage("We couldn't send your request right now. Please try again or email us directly.");
      setStatus("error");
    }
  }

  return (
    <form className="ol-form" aria-label="Contact Optimize Local" onSubmit={submitInquiry}>
      <div className="ol-form-heading"><strong>Start a conversation</strong><span>FREE CONSULTATION</span></div>
      <div className="ol-form-two">
        <label>Your name <input name="name" type="text" placeholder="Your name" autoComplete="name" required maxLength={120} disabled={status === "submitting"} /></label>
        <label>Business name <input name="business" type="text" placeholder="Your business" autoComplete="organization" maxLength={120} disabled={status === "submitting"} /></label>
      </div>
      <div className="ol-form-two">
        <label>Email address <input name="email" type="email" placeholder="you@business.com" autoComplete="email" required maxLength={200} disabled={status === "submitting"} /></label>
        <label>Phone (optional) <input name="phone" type="tel" placeholder="(815) 555-0123" autoComplete="tel" maxLength={40} disabled={status === "submitting"} /></label>
      </div>
      <label>What can we help with?
        <select name="service" required defaultValue="" disabled={status === "submitting"}>
          <option value="" disabled>Choose a service</option>
          <option value="QuickStart Website">QuickStart Website · from $500</option>
          <option value="Business App">Business App · from $1,500</option>
          <option value="App + Loyalty">App + Loyalty · from $2,500</option>
          <option value="Booking / Operations">Booking, scheduling or operations</option>
          <option value="Something else">Something else</option>
        </select>
      </label>
      <label>Tell me a little about your idea
        <textarea name="message" required maxLength={4000} placeholder="What does your business do, and what would you like to make easier?" rows={4} disabled={status === "submitting"} />
      </label>
      <label className="ol-contact-honeypot" aria-hidden="true">Leave this field empty <input name="company_url" tabIndex={-1} autoComplete="off" /></label>
      <button className="ol-button ol-button-primary ol-submit" disabled={status === "submitting"} type="submit">
        {status === "submitting" ? "Sending your inquiry…" : "Send my inquiry"} <span aria-hidden="true">↗</span>
      </button>
      <p className="ol-form-fine">Your information is sent securely to our form service and delivered to the Optimize Local inbox. <a href="/privacy">How we handle inquiries</a>.</p>
      {status === "error" && <div className="ol-form-error" role="alert">
        <p>{errorMessage}</p>
        <p><a href={"mailto:" + EMAIL}>Email us directly</a> or <a href={consultationHref} target="_blank" rel="noopener noreferrer">book a free 20-minute consultation</a>.</p>
      </div>}
    </form>
  );
}
