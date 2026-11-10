import Link from "next/link";
import { MarketingNavigation } from "@/components/marketing-navigation";
import { ContactForm } from "@/components/contact-form";
import { BrandLogo } from "@/components/brand-logo";

import { consultationHref as callHref, consultationReady as bookingReady } from "@/lib/consultation";
import { DemoCards } from "@/components/demos/shared";
import "./demos/demos.css";
import "./home.css";

const callLabel = bookingReady ? "Book your free 20-minute call" : "Request a free 20-minute call";

const services = [
  { number: "1", title: "Everything in one place", description: "Keep appointments, customer requests, and job details together so your team can find what it needs. Texts and notebooks have their place. Running the whole business from them gets tiring.", tags: ["Customer details", "Job status", "Simple dashboards"] },
  { number: "2", title: "More repeat customers", description: "Make rewards and return-visit offers easy to understand and use. Customers should know what they have earned and how to use it. Staff should not need a separate explanation every time.", tags: ["Points & rewards", "Return-visit offers", "Member perks"] },
  { number: "3", title: "Fewer calls and no-shows", description: "Let customers request appointments and supply the details up front. Reminders can help them keep track of when to come in. That leaves less back-and-forth for you and the person trying to book.", tags: ["Booking", "Intake forms", "Reminders"] },
  { number: "4", title: "Less repetitive work", description: "Set up routine follow-ups and status updates around the way your business works. Your team should be able to see what happened and what still needs attention. The goal is less copying and chasing.", tags: ["Follow-ups", "Status updates", "Task tracking"] },
];

const packages = [
  {
    name: "QuickStart",
    price: "$500",
    description: "A mobile-friendly website or landing page that helps people find your business and get in touch.",
    features: ["Focused website or landing page", "Services and ways to get in touch", "A clear way to send an inquiry", "Basic local SEO setup"],
    callout: "Show customers what you offer and how to reach you.",
    featured: false,
  },
  {
    name: "Business App",
    price: "$1,500",
    description: "A web app with your branding, built for the things your customers need to do.",
    features: ["Mobile-friendly branded web app", "Customer pages built for your business", "One main business process", "Launch and handoff support"],
    callout: "Built for the way your business works.",
    featured: true,
  },
  {
    name: "App + Loyalty",
    price: "$2,500",
    description: "A custom app with rewards and offers that give customers a reason to return.",
    features: ["Everything in the Business App", "Customer rewards and offers", "Member activity and simple reporting", "Loyalty setup and launch support"],
    callout: "Keep rewards easy to use.",
    featured: false,
  },
];

const examples = [
  { name: "Northside Collectibles", industry: "Retail & collectibles", description: "A customer app concept for browsing inventory, finding things in store, using rewards, and accessing card services.", status: "In development", theme: "northside", short: "NORTHSIDE", number: "1" },
  { name: "Jaz It Up Beauty Lounge", industry: "Beauty & appointments", description: "A branded app for browsing beauty services and requesting an appointment.", status: "In development", theme: "jaz", short: "JAZ IT UP", number: "2" },
  { name: "Transporter 17", industry: "Transportation & payments", description: "Booking and payment tools for customers, with a staff view for handling the work.", status: "In development", theme: "transport", short: "TRANSPORTER 17", number: "3" },
  { name: "Step Outside", industry: "Consumer wellness app", description: "A walking app with streaks and progress tracking to help people build a daily outdoor habit.", status: "Product project", theme: "outside", short: "STEP OUTSIDE", number: "4" },
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
          <BrandLogo href="#top" />
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
            <p className="ol-lead">I build websites, custom apps, and automation for local businesses. Customers should be able to find you, book with you, and come back without a lot of chasing. Behind the counter, your team needs fewer details to retype and fewer loose ends to track.</p>
            <div className="ol-actions">
              <ConsultationButton className="ol-button ol-button-primary" />
              <a className="ol-button ol-button-outline" href="#pricing">See prices <span aria-hidden="true">↓</span></a>
            </div>
            <p className="ol-hero-note"><span aria-hidden="true">✓</span> Free 20-minute consultation <span aria-hidden="true">·</span> Monday–Friday, 10 AM–5 PM Central</p>
          </div>
          <aside className="home-start" aria-labelledby="home-start-title">
            <p className="ol-eyebrow">LET’S START WITH YOUR DAY</p>
            <h2 id="home-start-title">What would make<br />business easier?</h2>
            <a href="#pricing"><span><strong>“I need a better website.”</strong><small>Show your services and contact details.</small></span><span aria-hidden="true">↗</span></a>
            <a href="#demos"><span><strong>“Booking takes too much time.”</strong><small>Try a sample appointment request.</small></span><span aria-hidden="true">↗</span></a>
            <a href="#contact"><span><strong>“We keep doing this by hand.”</strong><small>Show me the steps that take up your time.</small></span><span aria-hidden="true">↗</span></a>
            <p className="home-start-note">No technical brief needed. Tell me what keeps getting in the way.</p>
          </aside>
        </div>
      </section>
      <div className="home-trust"><div className="ol-container"><span>Based in Rockford, Illinois</span><span>Work directly with your builder</span><span>Scope and price agreed before work begins</span></div></div>

      <section className="ol-section ol-container" id="ai-training">
        <p className="ol-eyebrow">INTRODUCING OPTIMIZE LOCAL AI ACADEMY</p>
        <h2>Learn AI with a task<br />you actually need to do.</h2>
        <p className="ol-lead">Bring something you want help with, whether it’s a meal plan, a customer reply, or the notes from a meeting. We’ll work through how to ask, check the answer, and make a useful revision. Choose private help, a group workshop, or training for your team.</p>
        <div className="ol-actions"><Link className="ol-button ol-button-primary" href="/ai-training">Explore AI Training ↗</Link><ConsultationButton className="ol-button ol-button-outline" label="Book a Free 20-Minute Call" /></div>
      </section>
      <section className="ol-section ol-container" id="services">
        <div className="ol-section-intro"><div><p className="ol-eyebrow">HOW I CAN HELP</p><h2>What keeps taking<br />up your time?</h2></div><p>Start with a problem that comes up every week. It might be missed inquiries, paperwork, confusing schedules, slow payments, or customers who forget to come back. We can work out whether a website, an app, or a simpler routine would help.</p></div>
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
        <div className="ol-section-intro"><div><p className="ol-eyebrow">SEE IT FROM BOTH SIDES</p><h2>Try it as a customer.<br />Then as the owner.</h2></div><p>Request a detailing quote or a salon appointment using sample information. Then switch to the owner’s view to see how the request is handled. You can try both sides before we talk about what your business needs.</p></div>
        <DemoCards />
        <p className="demo-landing-note">Interactive demos. Use sample information. Nothing is sent and no real appointments are created. <a href="/demos">Explore both demos →</a></p>
      </section>

      <section className="ol-pricing-wrap" id="pricing"><div className="ol-container ol-section">
        <div className="ol-section-intro ol-price-intro"><div><p className="ol-eyebrow">STARTING PRICES</p><h2>What would you<br />like to build?</h2></div><p>A website, a customer app, and a loyalty program solve different problems. These packages give us a place to start the conversation about what you need and what you want to spend. We’ll agree on the scope and price before work begins.</p></div>
        <div className="ol-pricing-grid">{packages.map((pkg) => (
          <article className={"ol-price-card" + (pkg.featured ? " ol-price-featured" : "")} key={pkg.name}>
            <div className="ol-price-card-header"><span>{pkg.name}</span>{pkg.featured && <strong>CUSTOM APP</strong>}</div>
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
        <div className="ol-section-intro"><div><p className="ol-eyebrow">SELECTED PROJECTS</p><h2>A look at the work.</h2></div><p>These projects cover retail, beauty services, transportation, and getting outdoors. Some are in development; the status is shown on each card. Each starts with the same question: what would make this easier for the people using it?</p></div>
        <div className="ol-project-grid">{examples.map((item) => (
          <article className="ol-project-card" key={item.name}>
            <div className="ol-project-info"><div className="ol-project-meta">{item.industry}<span>{item.status}</span></div><h3>{item.name}</h3><p>{item.description}</p></div>
          </article>
        ))}</div>
        <a className="ol-inline-link" href="/portfolio">See the portfolio <span aria-hidden="true">↗</span></a>
      </section>

      <section className="ol-process-wrap" id="process"><div className="ol-container ol-section">
        <div className="ol-section-intro"><div><p className="ol-eyebrow">HOW IT WORKS</p><h2>Start with a conversation.</h2></div><p>You don’t have to arrive with a list of features. Tell me how the work gets done now and where it gets frustrating. We’ll figure out what is worth building before you spend money on it.</p></div>
        <div className="ol-steps"><div><span>1</span><h3>Let’s talk</h3><p>A free 20-minute call about your business, your customers, and what’s getting in the way.</p></div><div><span>2</span><h3>Make a plan</h3><p>We agree on the features, timeline, and price before work begins.</p></div><div><span>3</span><h3>Build & launch</h3><p>I build and test the site or app, then help you put it in front of customers.</p></div></div>
      </div></section>

      <section className="home-person ol-container" id="about" aria-labelledby="about-title">
        <div className="home-monogram" aria-hidden="true">SC</div>
        <div><p className="ol-eyebrow">WORK WITH STEVE</p><h2 id="about-title">Hi, I’m Steve.</h2><p>I’m the founder of Optimize Local. I’ve spent nearly 20 years working in digital marketing, business growth, and technology. You’ll work directly with me, from talking through the problem to building something you can use.</p><a className="ol-inline-link" href="/portfolio">More about me and my work ↗</a></div>
      </section>

      <section className="ol-contact-wrap" id="contact"><div className="ol-container ol-contact-grid">
        <div><p className="ol-eyebrow">LET’S TALK</p><h2>What’s one thing you’d like to make easier?</h2><p>Tell me what you have in mind, even if it’s still a rough idea. A free 20-minute consultation gives us time to talk it through and work out a next step. Calls are available Monday through Friday, between 10 AM and 5 PM Central (America/Chicago).</p>
          {bookingReady ? <ConsultationButton className="ol-button ol-button-primary" /> : <div className="ol-booking-pending"><strong>Request a call</strong><span>Send an inquiry and we’ll arrange a 20-minute call, Monday–Friday, 10 AM–5 PM Central.</span></div>}
          <p className="ol-email-line">Prefer email? <a href="mailto:optimizelocalai@gmail.com">optimizelocalai@gmail.com ↗</a></p>
        </div>
        <ContactForm />
      </div></section>

      </main>
      <footer className="ol-footer"><div className="ol-container ol-footer-main"><BrandLogo href="#top" className="ol-footer-logo" /><p>Websites, apps, and automation from Rockford, Illinois.</p><a href="mailto:optimizelocalai@gmail.com">Get in touch ↗</a></div><div className="ol-container ol-footer-bottom"><span>© {new Date().getFullYear()} Optimize Local · Rockford, Illinois</span><span><a href="#services">Services</a> · <a href="#pricing">Pricing</a> · <a href="#work">Work</a> · <Link href="/ai-training">AI Training</Link> · <a href="/privacy">Privacy</a> · <Link href="/refund-policy">Cancellation & refunds</Link> · <a href="https://connect.optimizelocalai.com" target="_blank" rel="noopener noreferrer">Connect</a></span></div></footer>
    </div>
  );
}
