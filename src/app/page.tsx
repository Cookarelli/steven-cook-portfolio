import { MarketingNavigation } from "@/components/marketing-navigation";
import { ContactForm } from "@/components/contact-form";

import { consultationHref as callHref, consultationReady as bookingReady } from "@/lib/consultation";
import { DemoCards } from "@/components/demos/shared";
import "./demos/demos.css";

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
    <main className="ol-site" id="top">
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

      <section className="ol-hero">
        <div className="ol-container ol-hero-grid">
          <div className="ol-hero-copy">
            <span className="ol-kicker"><span className="ol-kicker-dot" /> BUILT FOR LOCAL BUSINESS · ROCKFORD, IL</span>
            <h1>Less busywork.<br /><em>More business.</em></h1>
            <p className="ol-lead">Spend less time juggling appointments, chasing paperwork, and following up with customers. Give your business one simple place to stay organized and keep customers coming back.</p>
            <p className="ol-support">From booking a job to rewarding a regular customer, we build practical apps that take work off your plate and make it easier for people to do business with you.</p>
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
        <span>FEWER MISSED OPPORTUNITIES.</span><span>MORE TIME BACK EVERY WEEK.</span><span>HAPPIER REPEAT CUSTOMERS.</span>
      </div></div>

      <section className="ol-section ol-container" id="services">
        <div className="ol-section-intro"><div><p className="ol-eyebrow">A BETTER WAY TO WORK</p><h2>Your day, only<br /><em>less hectic.</em></h2></div><p>Your app should solve a problem you face every week: missed inquiries, paperwork, confusing schedules, slow payments, or customers who forget to come back.</p></div>
        <div className="ol-service-grid">{services.map((service) => (
          <article className="ol-service" key={service.title}>
            <div className="ol-service-number">{service.number} <span>↗</span></div>
            <h3>{service.title}</h3><p>{service.description}</p>
            <div className="ol-tags">{service.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          </article>
        ))}</div>
      </section>

      <section className="ol-benefits-wrap" id="benefits"><div className="ol-container ol-section">
        <div className="ol-section-intro"><div><p className="ol-eyebrow">WHAT CHANGES FOR YOUR BUSINESS?</p><h2>Get your time back.<br /><em>Keep more of what you earn.</em></h2></div><p>Small problems add up: missed calls, double entry, no-shows, forgotten follow-ups, and one-time customers. We build the tools to make everyday work simpler.</p></div>
        <div className="ol-benefits-grid">
          {[
            { icon: "◷", title: "Save hours on routine tasks", body: "Appointment requests, intake forms, reminders, and status updates can be handled in one place instead of one at a time." },
            { icon: "☷", title: "Stay organized", body: "Keep customer details, requests, scheduled work, and next steps together so you and your staff know what comes next." },
            { icon: "$", title: "Cut avoidable costs", body: "Reduce repeat data entry, paperwork, and time spent chasing information. Spend more of your day on paying work." },
            { icon: "↗", title: "Win more business", body: "Make it easy to book, request a quote, reorder, or get an answer—even when you're serving another customer." },
            { icon: "★", title: "Bring customers back", body: "Give regulars rewards, timely offers, simple rebooking, and a reason to choose you again." },
            { icon: "✓", title: "Know what’s happening", body: "Track requests, appointments, completed jobs, and customer activity without digging through messages." },
          ].map((b) => <article className="ol-benefit" key={b.title}><span aria-hidden="true" className="ol-benefit-icon">{b.icon}</span><h3>{b.title}</h3><p>{b.body}</p></article>)}
        </div>
        <p className="ol-benefits-footnote">Actual time and cost savings depend on your current workflow and which features you choose. We’ll focus on the biggest opportunities first.</p>
      </div></section>

      <section className="ol-ideas-wrap" id="ideas"><div className="ol-container ol-section">
        <div className="ol-section-intro"><div><p className="ol-eyebrow">HOW CAN AN APP HELP MY BUSINESS?</p><h2>Picture what<br /><em>your business could do.</em></h2></div><p>An app doesn’t have to be complicated. It can solve one annoying problem or connect everything your customers and staff do every day. Here are a few ideas.</p></div>
        <div className="ol-ideas-grid">
          {[
            {kind:"Salons & barbershops",impact:"Fill your schedule",examples:["Let clients choose services and book anytime","Send appointment reminders","Offer rewards for repeat visits"]},
            {kind:"Contractors & home services",impact:"Keep jobs moving",examples:["Collect quote requests and job photos","Show customers progress updates","Track jobs and follow-up tasks"]},
            {kind:"Retail stores",impact:"Give shoppers a reason to return",examples:["Show products and special offers","Add rewards and customer accounts","Let shoppers check availability or reserve items"]},
            {kind:"Restaurants & cafés",impact:"Turn visits into regulars",examples:["Run a simple loyalty program","Share menus and weekly specials","Make ordering or pickup easier"]},
            {kind:"Transportation services",impact:"Simplify the whole trip",examples:["Accept ride and service requests","Send confirmations and updates","Keep payment instructions and records together"]},
            {kind:"Gyms, clubs & studios",impact:"Build a stronger community",examples:["Manage memberships and class bookings","Share schedules and announcements","Reward attendance and referrals"]},
          ].map((idea)=><article className="ol-idea" key={idea.kind}><p className="ol-idea-category">{idea.kind}</p><h3>{idea.impact}</h3><ul>{idea.examples.map((ex)=><li key={ex}><span aria-hidden="true">✓</span>{ex}</li>)}</ul></article>)}
        </div>
        <div className="ol-idea-cta"><div><strong>Don’t see your type of business?</strong><p>Tell us what eats up your time. That’s usually where the best app idea starts.</p></div><ConsultationButton className="ol-button ol-button-primary" label="Talk about my business" /></div>
      </div></section>

      <section className="ol-section ol-container demo-landing-section" id="demos">
        <div className="ol-section-intro"><div><p className="ol-eyebrow">SEE IT FROM BOTH SIDES</p><h2>Try the demos.<br /><em>Picture your business.</em></h2></div><p>Request a detailing quote or a salon appointment, then switch to the owner’s view. A few taps show how an app could simplify your day.</p></div>
        <DemoCards />
        <p className="demo-landing-note">Interactive demos. Use sample information. Nothing is sent and no real appointments are created. <a href="/demos">Explore both demos →</a></p>
      </section>

      <section className="ol-pricing-wrap" id="pricing"><div className="ol-container ol-section">
        <div className="ol-section-intro ol-price-intro"><div><p className="ol-eyebrow">CLEAR STARTING POINTS</p><h2>Find your<br /><em>starting point.</em></h2></div><p>Start with the job you need done: a clear online presence, an easier customer experience, or a loyalty program that helps bring people back.</p></div>
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
        <div className="ol-section-intro"><div><p className="ol-eyebrow">SELECTED PROJECTS</p><h2>Real businesses.<br /><em>Practical ideas.</em></h2></div><p>Real projects across retail, service businesses, transportation, and wellness. Each one starts with the same question: what’s going to make this easier for the people using it?</p></div>
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
        <div className="ol-section-intro"><div><p className="ol-eyebrow">HOW IT WORKS</p><h2>From idea to<br /><em>something useful.</em></h2></div><p>We’ll figure out what your business actually needs before you spend money on features you won’t use.</p></div>
        <div className="ol-steps"><div><span>01</span><h3>Let’s talk</h3><p>A free 20-minute call about your business, your customers, and what’s getting in the way.</p></div><div><span>02</span><h3>Make a plan</h3><p>We agree on the features, timeline, and a clear price before work begins.</p></div><div><span>03</span><h3>Build & launch</h3><p>We develop, test, and put your new experience in front of customers.</p></div></div>
      </div></section>

      <section className="ol-about-wrap" id="about"><div className="ol-container ol-about-grid">
        <div><p className="ol-eyebrow">WHO YOU’RE WORKING WITH</p><h2>Experience matters.<br /><em>So does getting it done.</em></h2></div>
        <div className="ol-about-copy"><p>I’m Steve Cook, founder of Optimize Local. I’ve spent nearly 20 years working in digital marketing, business growth, and technology. Now I help local businesses get the kinds of practical tools that used to be reserved for much larger companies.</p><p>You’ll work directly with the person designing and building your solution. No mystery team. No complicated sales process. Just a clear plan and a product that earns its keep.</p><a href="/portfolio" className="ol-inline-link">More about my background <span aria-hidden="true">↗</span></a></div>
      </div></section>

      <section className="ol-contact-wrap" id="contact"><div className="ol-container ol-contact-grid">
        <div><p className="ol-eyebrow">LET’S GET STARTED</p><h2>Tell me what your business <em>needs next.</em></h2><p>Book a free 20-minute consultation, Monday through Friday, between 10 AM and 5 PM Central (America/Chicago). Tell me what you have in mind, even if it’s still just a rough idea.</p>
          {bookingReady ? <ConsultationButton className="ol-button ol-button-primary" /> : <div className="ol-booking-pending"><strong>Request a call</strong><span>Send an inquiry and we’ll arrange a 20-minute call, Monday–Friday, 10 AM–5 PM Central.</span></div>}
          <p className="ol-email-line">Prefer email? <a href="mailto:optimizelocalai@gmail.com">optimizelocalai@gmail.com ↗</a></p>
        </div>
        <ContactForm />
      </div></section>

      <footer className="ol-footer"><div className="ol-container ol-footer-main"><a href="#top" className="ol-footer-logo">OPTIMIZE <strong>LOCAL.</strong></a><p>Easier days, happier customers, and more room to grow.</p><a href="mailto:optimizelocalai@gmail.com">Get in touch ↗</a></div><div className="ol-container ol-footer-bottom"><span>© {new Date().getFullYear()} Optimize Local · Rockford, Illinois</span><span><a href="#services">Services</a> · <a href="#pricing">Pricing</a> · <a href="#work">Work</a> · <a href="/privacy">Privacy</a> · <a href="https://connect.optimizelocalai.com" target="_blank" rel="noopener noreferrer">Connect</a></span></div></footer>
    </main>
  );
}
