"use client";

import { useState, type FormEvent } from "react";

const ADDRESS = "optimizelocalai@gmail.com";

export function ContactForm() {
  const [opened, setOpened] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const read = (key: string) => String(data.get(key) || "").trim();
    const subject = "Optimize Local inquiry: " + (read("service") || "Project consultation");
    const body = [
      "Hi Steve,",
      "",
      "I'd like to discuss a project with Optimize Local.",
      "",
      "Name: " + read("name"),
      "Business: " + read("business"),
      "Email: " + read("email"),
      "Phone: " + (read("phone") || "Not provided"),
      "Interested in: " + read("service"),
      "",
      "About my project:",
      read("message"),
      "",
      "I'd like to arrange a free 20-minute consultation.",
    ].join("\n");
    setOpened(true);
    window.location.href = "mailto:" + ADDRESS + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  return (
    <form className="ol-form" aria-label="Contact Optimize Local" onSubmit={handleSubmit}>
      <div className="ol-form-heading"><strong>Start a conversation</strong><span>FREE CONSULTATION</span></div>
      <div className="ol-form-two">
        <label>Your name <input name="name" type="text" placeholder="Your name" autoComplete="name" required maxLength={120} /></label>
        <label>Business name <input name="business" type="text" placeholder="Your business" autoComplete="organization" maxLength={120} /></label>
      </div>
      <div className="ol-form-two">
        <label>Email address <input name="email" type="email" placeholder="you@business.com" autoComplete="email" required maxLength={200} /></label>
        <label>Phone (optional) <input name="phone" type="tel" placeholder="(815) 555-0123" autoComplete="tel" maxLength={40} /></label>
      </div>
      <label>What can we help with?
        <select name="service" required defaultValue="">
          <option value="" disabled>Choose a service</option>
          <option value="QuickStart Website">QuickStart Website · from $500</option>
          <option value="Business App">Business App · from $1,500</option>
          <option value="App + Loyalty">App + Loyalty · from $2,500</option>
          <option value="Automation / Other">Automation / Something else</option>
        </select>
      </label>
      <label>Tell me a little about your idea
        <textarea name="message" required maxLength={4000} placeholder="What does your business do, and what would you like to make easier?" rows={4} />
      </label>
      <button className="ol-button ol-button-primary ol-submit" type="submit">Open email to send inquiry <span aria-hidden="true">↗</span></button>
      <p className="ol-form-fine">This opens your email app with your details filled in. Review the message and press Send to finish. Nothing is submitted automatically.</p>
      {opened && <p role="status" className="ol-form-status">Your email app should open now. Please press Send there. If it didn't open, email us directly at <a href={"mailto:" + ADDRESS}>{ADDRESS}</a>.</p>}
    </form>
  );
}
