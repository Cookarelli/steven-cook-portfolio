import Link from "next/link";
import { MarketingNavigation } from "@/components/marketing-navigation";
import { ContactForm } from "@/components/contact-form";

import { consultationHref as callHref, consultationReady as bookingReady } from "@/lib/consultation";
import { DemoCards } from "@/components/demos/shared";
import "./demos/demos.css";
import "./home.css";

const callLabel = bookingReady ? "Book your free 20-minute call" : "Request a free 20-minute call";

const services = [
  { number: "01", title: "Everything in one place", description: "Keep appointments, customer requests, and important details organized instead of scattered across texts, notebooks, and spreadsheets.", tags: ["Customer details", "Job status", "Simple dashboards"] },
  { number: "02", title: "More repeat customers", description: "Give people a reason to return. Make rewards, special offers, and checking in easy for your customers and staff.", tags: ["Points & rewards", "Return-visit offers", "Member perks"] },
  { number: "03", title: "Fewer calls and no-shows", description: "Let customers request appointments, submit their information, and receive reminders without constant back-and-forth.", tags: ["Booking", "Intake forms", "Reminders"] },
  { number: "04", title: "Less repetitive work", description: "Stop retyping the same information or manually sending every update. Let routine steps happen on schedule so your team can focus on customers.", tags: ["Follow-ups", "Status updates", "Task tracking"] },
];

const packages = [
  {
    name: "QuickStart",
    price: "$500",
    description: "A sharp, mobile-friendly online presence that helps people find you and reach out.",
    features: ["Focused website or landing page", "Services and calls to action", "Contact and inquiry experience", "Basic local SEO foundation"],
    callout: "A better first impression.",
    featured: false,
  },
  {
    name: "Business App",
    price: "$1,500",
    description: "A custom branded web app designed around how your customers actually use your business.",
    features: ["Mobile-friendly branded web app", "A tailored customer experience", "Core business workflow", "Launch and handoff support"],
    callout: "Your business, in their pocket.",
    featured: true,
  },
  {
    name: "App + Loyalty",
    price: "$2,500",
    description: "Add a reason to come back with a custom app and a rewards experience.",
    features: ["Everything in the Business App", "Customer rewards and offers", "Member activity and simple reporting", "Loyalty setup and launch support"],
    callout: "Make the next visit happen.",
    featured: false,
  },
];

const examples = [
  { name: "Northside Collectibles", industry: "Retail & collectibles", description: "A customer app concept connecting inventory, in-store discovery, rewards, and card services.", status: "In development", theme: "northside", short: "NORTHSIDE", number: "01" },
  { name: "Jaz It Up Beauty Lounge", industry: "Beauty & appointments", description: "A branded beauty experience focused on services, bookings, and a smoother customer journey.", status: "In development", theme: "jaz", short: "JAZ IT UP", number: "02" },
  { name: "Transporter 17", industry: "Transportation & payments", description: "A customer-facing booking and payment experience with a streamlined staff workflow.", status: "In development", theme: "transport", short: "TRANSPORTER 17", number: "03" },
  { name: "Step Outside", industry: "Consumer wellness app", description: "An original walking and outdoor habit product with streaks, progress, and daily motivation.", status: "Product project", theme: "outside", short: "STEP OUTSIDE", number: "04" },
];

function ConsultationButton({ className = "", label }: { className?: string; label?: string }) {
  return (
    <a className={className} href={callHref} {...(bookingReady ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {label || callLabel}<span aria-hidden="true"> ↗</span>
    </a>
  );
}

export default function Home() {
  return (
    <div className="ol-site ol-home" id="top">
      <a className="home-skip-link" href="#main-content">Skip to content</a>
      <header className="ol-header">
        <div className="ol-container ol-header-inner">
          <a href="#top" className="ol-brand" aria-label="Optimize Local home">
            <span className="ol-brand-symbol">O<span>.</span></span>
            <span className="ol-brand-wordmark">OPTIMIZE <strong>LOCAL</strong><small>Practical tools for local businesses</small></span>
          </a>
          <MarketingNavigation />
          <ConsultationButton className="ol-button ol-button-small" label={bookingReady ? "Book a call" : "Let’s talk"} />
        </div>
      </header>

      <main id="main-content">
      <section className="ol-hero">
        <div className="ol-container ol-hero-grid">
          <div className="ol-hero-copy">
            <span className="ol-kicker"><span className="ol-kicker-dot" /> BUILT FOR LOCAL BUSINESS · ROCKFORD, IL</span>
            <h1>Make it easier to<br /><em>do business with you.</em></h1>
            <p className="ol-lead">Websites, custom apps, and automation for local businesses. Help customers find you, book with you, and come back—while taking everyday work off your plate.</p>
            <div className="ol-actions">
              <ConsultationButton className="ol-button ol-button-primary" />
              <a className="ol-button ol-button-outline" href="#pricing">Explore pricing <span aria-hidden="true">↓</span></a>
            </div>
            <p className="ol-hero-note"><span aria-hidden="true">✓</span> Free 20-minute consultation <span aria-hidden="true">·</span> Monday–Friday, 10 AM–5 PM Central</p>
          </div>
          <aside className="home-start" aria-labelledby="home-start-title">
            <p className="ol-eyebrow">LET’S START WITH YOUR DAY</p>
            <h2 id="home-start-title">What would make<br />business easier?</h2>
            <a href="#pricing"><span><strong>“I need a better website.”</strong><small>Give customers a clear next step.</small></span><span aria-hidden="true">↗</span></a>
            <a href="#demos"><span><strong>“Booking takes too much time.”</strong><small>See a simpler customer experience.</small></span><span aria-hidden="true">↗</span></a>
            <a href="#contact"><span><strong>“We keep doing this by hand.”</strong><small>Let’s talk through your workflow.</small></span><span aria-hidden="true">↗</span></a>
            <p className="home-start-note">You don’t need a technical brief. Just a problem you’d like to solve.</p>
          </aside>
        </div>
      </section>
      <div className="home-trust"><div className="ol-container"><span>Based in Rockford, Illinois</span><span>Work directly with your builder</span><span>Scope and price agreed before work begins</span></div></div>

      <section className="ol-section ol-container" id="ai-training">
        <p className="ol-eyebrow">INTRODUCING OPTIMIZE LOCAL AI ACADEMY</p>
        <h2>Practical AI skills.<br />For real life and real work.</h2>
        <p className="ol-lead">Bring one practical task and learn how to work on it with AI. Choose private help, a group workshop or training for your team. Keep the useful prompts and your own judgment.</p>
        <div className="ol-actions"><Link className="ol-button ol-button-primary" href="/ai-training">Explore AI Training ↗</Link><ConsultationButton className="ol-button ol-button-outline" label="Book a Free 20-Minute Call" /></div>
      </section>
      <section className="ol-section ol-container" id="services">
        <div className="ol-section-intro"><div><p className="ol-eyebrow">HOW WE CAN HELP</p><h2>More time for your customers.</h2></div><p>Your app should solve a problem you face every week: missed inquiries, paperwork, confusing schedules, slow payments, or customers who forget to come back.</p></div>
        <div className="ol-service-grid">{services.map((service) => (
          <article className="ol-service" key={service.title}>
            <div className="ol-service-number">{service.number} <span>↗</span></div>
            <h3>{service.title}</h3><p>{service.description}</p>
            <div className="ol-tags">{service.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          </article>
        ))}</div>
        <p className="ol-lead">Prefer to learn the tools yourself? <Link className="ol-inline-link" href="/ai-training">Explore AI Training ↗</Link></p>
      </section>

      <section className="ol-section ol-container demo-landing-section" id="demos">
        <div className="ol-section-intro"><div><p className="ol-eyebrow">SEE IT FROM BOTH SIDES</p><h2>See how it could work for you.</h2></div><p>Request a detailing quote or a salon appointment, then switch to the owner’s view. A few taps show how an app could simplify your day.</p></div>
        <DemoCards />
        <p className="demo-landing-note">Interactive demos. Use sample information. Nothing is sent and no real appointments are created. <a href="/demos">Explore both demos →</a></p>
      </section>

      <section className="ol-pricing-wrap" id="pricing"><div className="ol-container ol-section">
        <div className="ol-section-intro ol-price-intro"><div><p className="ol-eyebrow">CLEAR STARTING POINTS</p><h2>A starting point for your budget.</h2></div><p>Start with the job you need done: a clear online presence, an easier customer experience, or a loyalty program that helps bring people back.</p></div>
        <div className="ol-pricing-grid">{packages.map((pkg) => (
          <article className={"ol-price-card" + (pkg.featured ? " ol-price-featured" : "")} key={pkg.name}>
            <div className="ol-price-card-header"><span>{pkg.name}</span>{pkg.featured && <strong>CUSTOM WORKFLOW</strong>}</div>
            <div className="ol-price-amount">{pkg.price}<small>starting at</small></div>
            <p className="ol-price-description">{pkg.description}</p>
            <ul>{pkg.features.map((feature) => <li key={feature}><span aria-hidden="true">✓</span>{feature}</li>)}</ul>
            <a href="#contact" className="ol-package-link">Discuss this package <span aria-hidden="true">↗</span></a>
            <p className="ol-price-footer">{pkg.callout}</p>
          </article>
        ))}</div>
        <p className="ol-pricing-note">Prices are starting estimates for a defined scope, not one-size-fits-all quotes. Domain, hosting, third-party subscriptions, ongoing support, payment processing, and app store publishing may cost extra. Features and integrations are confirmed during your consultation.</p>
      </div></section>

      <section className="ol-section ol-container" id="work">
        <div className="ol-section-intro"><div><p className="ol-eyebrow">SELECTED PROJECTS</p><h2>Built around real business needs.</h2></div><p>Real projects across retail, service businesses, transportation, and wellness. Each one starts with the same question: what’s going to make this easier for the people using it?</p></div>
        <div className="ol-project-grid">{examples.map((item) => (
          <article className="ol-project-card" key={item.name}>
            <div className="ol-project-info"><div className="ol-project-meta">{item.industry}<span>{item.status}</span></div><h3>{item.name}</h3><p>{item.description}</p></div>
          </article>
        ))}</div>
        <a className="ol-inline-link" href="/portfolio">Explore the portfolio <span aria-hidden="true">↗</span></a>
      </section>

      <section className="ol-process-wrap" id="process"><div className="ol-container ol-section">
        <div className="ol-section-intro"><div><p className="ol-eyebrow">HOW IT WORKS</p><h2>A clear plan. A real person.</h2></div><p>We’ll figure out what your business actually needs before you spend money on features you won’t use.</p></div>
        <div className="ol-steps"><div><span>01</span><h3>Let’s talk</h3><p>A free 20-minute call about your business, your customers, and what’s getting in the way.</p></div><div><span>02</span><h3>Make a plan</h3><p>We agree on the features, timeline, and a clear price before work begins.</p></div><div><span>03</span><h3>Build & launch</h3><p>We develop, test, and put your new experience in front of customers.</p></div></div>
      </div></section>

      <section className="home-person ol-container" id="about" aria-labelledby="about-title">
        <div className="home-monogram" aria-hidden="true">SC</div>
        <div><p className="ol-eyebrow">YOUR PARTNER IN THE PROCESS</p><h2 id="about-title">Hi, I’m Steve.</h2><p>I’m the founder of Optimize Local, with nearly 20 years in digital marketing, business growth, and technology. You’ll work directly with me to turn the problem you’re facing into a practical solution.</p><a className="ol-inline-link" href="/portfolio">Get to know your builder ↗</a></div>
      </section>

      <section className="ol-contact-wrap" id="contact"><div className="ol-container ol-contact-grid">
        <div><p className="ol-eyebrow">LET’S GET STARTED</p><h2>What’s one thing you’d like to make easier?</h2><p>Book a free 20-minute consultation, Monday through Friday, between 10 AM and 5 PM Central (America/Chicago). Tell me what you have in mind, even if it’s still just a rough idea.</p>
          {bookingReady ? <ConsultationButton className="ol-button ol-button-primary" /> : <div className="ol-booking-pending"><strong>Request a call</strong><span>Send an inquiry and we’ll arrange a 20-minute call, Monday–Friday, 10 AM–5 PM Central.</span></div>}
          <p className="ol-email-line">Prefer email? <a href="mailto:optimizelocalai@gmail.com">optimizelocalai@gmail.com ↗</a></p>
        </div>
        <ContactForm />
      </div></section>

      </main>
      <footer className="ol-footer"><div className="ol-container ol-footer-main"><a href="#top" className="ol-footer-logo">OPTIMIZE <strong>LOCAL.</strong></a><p>Easier days, happier customers, and more room to grow.</p><a href="mailto:optimizelocalai@gmail.com">Get in touch ↗</a></div><div className="ol-container ol-footer-bottom"><span>© {new Date().getFullYear()} Optimize Local · Rockford, Illinois</span><span><a href="#services">Services</a> · <a href="#pricing">Pricing</a> · <a href="#work">Work</a> · <Link href="/ai-training">AI Training</Link> · <a href="/privacy">Privacy</a> · <a href="https://connect.optimizelocalai.com" target="_blank" rel="noopener noreferrer">Connect</a></span></div></footer>
    </div>
  );
}
