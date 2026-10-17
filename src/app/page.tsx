import { ContactForm } from "@/components/contact-form";

const bookingLink = process.env.NEXT_PUBLIC_GOOGLE_BOOKING_URL?.trim() || "";
const bookingReady = /^https:\/\/(calendar\.app\.google|calendar\.google\.com)\//i.test(bookingLink);
const callHref = bookingReady ? bookingLink : "#contact";
const callLabel = bookingReady ? "Book your free 20-minute call" : "Request a free 20-minute call";

const services = [
  { number: "01", title: "Custom Business Apps", description: "Give your customers a better way to book, shop, request service, or connect with your business.", tags: ["Branded web apps", "Customer accounts", "Mobile-first design"] },
  { number: "02", title: "Loyalty & Rewards", description: "Turn one-time visits into repeat customers with simple points, offers, and rewards programs.", tags: ["Rewards", "Member offers", "QR check-ins"] },
  { number: "03", title: "Booking & Customer Tools", description: "Make appointments, requests, and follow-ups easier for you and your customers.", tags: ["Online booking", "Client intake", "Notifications"] },
  { number: "04", title: "Automation That Saves Time", description: "Cut out repetitive work. Keep customer inquiries, updates, and internal tasks moving.", tags: ["Lead follow-up", "Workflows", "Integrations"] },
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
    <main className="ol-site" id="top">
      <header className="ol-header">
        <div className="ol-container ol-header-inner">
          <a href="#top" className="ol-brand" aria-label="Optimize Local home">
            <span className="ol-brand-symbol">O<span>.</span></span>
            <span className="ol-brand-wordmark">OPTIMIZE <strong>LOCAL</strong><small>Digital solutions for real businesses</small></span>
          </a>
          <nav className="ol-nav" aria-label="Main navigation">
            <a href="#services">Services</a><a href="#pricing">Pricing</a><a href="#work">Our work</a><a href="#about">About</a>
          </nav>
          <ConsultationButton className="ol-button ol-button-small" label={bookingReady ? "Book a call" : "Let's talk"} />
        </div>
      </header>

      <section className="ol-hero">
        <div className="ol-container ol-hero-grid">
          <div className="ol-hero-copy">
            <span className="ol-kicker"><span className="ol-kicker-dot" /> BUILT FOR LOCAL BUSINESS · ROCKFORD, IL</span>
            <h1>Big business tools.<br /><em>Local business prices.</em></h1>
            <p className="ol-lead">Custom apps, loyalty programs, booking systems, and smart automations that make running your business easier.</p>
            <p className="ol-support">No bloated software. No cookie-cutter packages. Just useful tools, built around your business and your customers.</p>
            <div className="ol-actions">
              <ConsultationButton className="ol-button ol-button-primary" />
              <a className="ol-button ol-button-outline" href="#pricing">See the packages <span aria-hidden="true">↓</span></a>
            </div>
            <p className="ol-hero-note"><span aria-hidden="true">✓</span> Free 20-minute consultation <span aria-hidden="true">·</span> Monday–Friday, 10 AM–5 PM Central</p>
          </div>
          <div className="ol-art-wrap" aria-label="Illustration of a custom business app experience">
            <div className="ol-art-glow" />
            <div className="ol-browser">
              <div className="ol-browser-chrome"><span /><span /><span /><div>yourbusiness.app</div></div>
              <div className="ol-browser-body">
                <div className="ol-app-side"><div className="ol-side-logo">YB</div><div className="ol-side-item active" /><div className="ol-side-item" /><div className="ol-side-item short" /></div>
                <div className="ol-app-main">
                  <div className="ol-app-topline">YOUR BUSINESS <span>● OPEN</span></div>
                  <h2>Good to see you.</h2><p>Everything your customers need. One place.</p>
                  <div className="ol-app-stats"><div><small>REWARDS BALANCE</small><strong>240 <span>pts</span></strong></div><div><small>YOUR NEXT VISIT</small><strong>Friday <span>2:30 PM</span></strong></div></div>
                  <div className="ol-app-action">Explore rewards <span>↗</span></div>
                  <div className="ol-app-bottom"><i /><i /><i /></div>
                </div>
              </div>
            </div>
            <div className="ol-floating-proof"><span className="ol-proof-icon">↗</span><div><strong>Built around your business</strong><small>Not the other way around</small></div></div>
            <div className="ol-example-label">ILLUSTRATIVE APP PREVIEW</div>
          </div>
        </div>
      </section>

      <div className="ol-value-bar"><div className="ol-container ol-value-grid">
        <span>YOUR BRAND. YOUR EXPERIENCE.</span><span>START SMALL. GROW SMART.</span><span>MADE FOR REAL CUSTOMERS.</span>
      </div></div>

      <section className="ol-section ol-container" id="services">
        <div className="ol-section-intro"><div><p className="ol-eyebrow">WHAT WE DO</p><h2>Better tools.<br /><em>Less busywork.</em></h2></div><p>Whether you need a customer app, a simple booking experience, or a smarter way to run the day-to-day, we build what moves your business forward.</p></div>
        <div className="ol-service-grid">{services.map((service) => (
          <article className="ol-service" key={service.title}>
            <div className="ol-service-number">{service.number} <span>↗</span></div>
            <h3>{service.title}</h3><p>{service.description}</p>
            <div className="ol-tags">{service.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          </article>
        ))}</div>
      </section>

      <section className="ol-pricing-wrap" id="pricing"><div className="ol-container ol-section">
        <div className="ol-section-intro ol-price-intro"><div><p className="ol-eyebrow">CLEAR STARTING POINTS</p><h2>Find your<br /><em>starting point.</em></h2></div><p>Good software shouldn't require a giant budget to get started. Pick the level that fits today. We'll scope the actual build together.</p></div>
        <div className="ol-pricing-grid">{packages.map((pkg) => (
          <article className={"ol-price-card" + (pkg.featured ? " ol-price-featured" : "")} key={pkg.name}>
            <div className="ol-price-card-header"><span>{pkg.name}</span>{pkg.featured && <strong>POPULAR STARTING POINT</strong>}</div>
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
        <div className="ol-section-intro"><div><p className="ol-eyebrow">SELECTED PROJECTS</p><h2>Things we've<br /><em>actually built.</em></h2></div><p>Real projects across retail, service businesses, transportation, and wellness. Each one starts with the same question: what's going to make this easier for the people using it?</p></div>
        <div className="ol-project-grid">{examples.map((item) => (
          <article className="ol-project-card" key={item.name}>
            <div className={"ol-project-art ol-theme-" + item.theme}>
              <div className="ol-project-browser"><div className="ol-project-browser-top"><span /><span /><span /></div><div className="ol-project-browser-inner"><small>{item.short}</small><div className="ol-project-visual-row"><i /><i /><i /></div><div className="ol-project-visual-line" /><div className="ol-project-visual-line short" /><div className="ol-project-visual-cta">Explore ↗</div></div></div>
              <span className="ol-project-index">{item.number} / 04</span>
            </div>
            <div className="ol-project-info"><div className="ol-project-meta">{item.industry}<span>{item.status}</span></div><h3>{item.name}</h3><p>{item.description}</p></div>
          </article>
        ))}</div>
        <p className="ol-project-note">Project previews are illustrative. Individual projects have different development and release statuses.</p>
      </section>

      <section className="ol-process-wrap" id="process"><div className="ol-container ol-section">
        <div className="ol-section-intro"><div><p className="ol-eyebrow">HOW IT WORKS</p><h2>From idea to<br /><em>something useful.</em></h2></div><p>We'll figure out what your business actually needs before you spend money on features you won't use.</p></div>
        <div className="ol-steps"><div><span>01</span><h3>Let's talk</h3><p>A free 20-minute call about your business, your customers, and what's getting in the way.</p></div><div><span>02</span><h3>Make a plan</h3><p>We agree on the features, timeline, and a clear price before work begins.</p></div><div><span>03</span><h3>Build & launch</h3><p>We develop, test, and put your new experience in front of customers.</p></div></div>
      </div></section>

      <section className="ol-about-wrap" id="about"><div className="ol-container ol-about-grid">
        <div><p className="ol-eyebrow">WHO YOU'RE WORKING WITH</p><h2>Experience matters.<br /><em>So does getting it done.</em></h2></div>
        <div className="ol-about-copy"><p>I'm Steve Cook, founder of Optimize Local. I've spent nearly 20 years working in digital marketing, business growth, and technology. Now I help local businesses get the kinds of practical tools that used to be reserved for much larger companies.</p><p>You'll work directly with the person designing and building your solution. No mystery team. No complicated sales process. Just a clear plan and a product that earns its keep.</p><a href="/portfolio" className="ol-inline-link">More about my background <span aria-hidden="true">↗</span></a></div>
      </div></section>

      <section className="ol-contact-wrap" id="contact"><div className="ol-container ol-contact-grid">
        <div><p className="ol-eyebrow">LET'S GET STARTED</p><h2>Tell me what your business <em>needs next.</em></h2><p>Book a free 20-minute consultation, Monday through Friday, between 10 AM and 5 PM Central (America/Chicago). Tell me what you have in mind, even if it's still just a rough idea.</p>
          {bookingReady ? <ConsultationButton className="ol-button ol-button-primary" /> : <div className="ol-booking-pending"><strong>Request a call</strong><span>Send an inquiry and we'll arrange a 20-minute call, Monday–Friday, 10 AM–5 PM Central.</span></div>}
          <p className="ol-email-line">Prefer email? <a href="mailto:optimizelocalai@gmail.com">optimizelocalai@gmail.com ↗</a></p>
        </div>
        <ContactForm />
      </div></section>

      <footer className="ol-footer"><div className="ol-container ol-footer-main"><a href="#top" className="ol-footer-logo">OPTIMIZE <strong>LOCAL.</strong></a><p>Custom apps and simple technology for better local business.</p><a href="mailto:optimizelocalai@gmail.com">Get in touch ↗</a></div><div className="ol-container ol-footer-bottom"><span>© {new Date().getFullYear()} Optimize Local · Rockford, Illinois</span><span><a href="#services">Services</a> · <a href="#pricing">Pricing</a> · <a href="#work">Work</a></span></div></footer>
    </main>
  );
}
