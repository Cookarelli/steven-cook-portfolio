import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { MarketingNavigation } from "@/components/marketing-navigation";
import { BrandLogo } from "@/components/brand-logo";
import { careerChapters, consultingEngagements, expertise, projects } from "@/data/portfolio";
import { consultationHref, consultationReady } from "@/lib/consultation";
import "../home.css";
import "./portfolio.css";

export const metadata: Metadata = {
  alternates: { canonical: "/portfolio" },
  title: "Steve Cook - Professional Portfolio",
  description: "Steve Cook's digital marketing, software, and product portfolio.",
};

const brands = ["UnitedHealthcare", "Fathead", "Wagly", "HairClub for Men", "Bosch / Sweetworxx", "ThedaCare"];
const callProps = consultationReady ? { target: "_blank", rel: "noopener noreferrer" } : {};

export default function Portfolio() {
  return (
    <div className="ol-site ol-home ol-portfolio" id="top">
      <a className="home-skip-link" href="#main-content">Skip to content</a>
      <header className="ol-header">
        <div className="ol-container ol-header-inner">
          <BrandLogo href="/" />
          <MarketingNavigation home={false} />
          <a className="ol-button ol-button-small" href={consultationHref} {...callProps}>Book a call ↗</a>
        </div>
      </header>

      <main id="main-content">
        <section className="ol-hero" aria-labelledby="portfolio-title">
          <div className="ol-container ol-hero-grid">
            <div>
              <p className="ol-kicker"><span className="ol-kicker-dot" /> THE WORK & THE PERSON BEHIND IT</p>
              <h1 id="portfolio-title">Good design starts with <em>your customers.</em></h1>
              <p className="ol-lead">I’m Steve Cook, and I build websites, apps, and tools for businesses. That might mean helping a customer find a service, request an appointment, or come back for another visit. It also means thinking about the person on your team who has to handle the request.</p>
              <div className="ol-actions">
                <a className="ol-button ol-button-primary" href="#work">See my work <span aria-hidden="true">↓</span></a>
                <a className="ol-button ol-button-outline" href={consultationHref} {...callProps}>Talk about your project ↗</a>
              </div>
              <p className="ol-hero-note">Based in Rockford, Illinois · Working in digital since 2006</p>
            </div>
            <aside className="home-start" aria-labelledby="partner-title">
              <p className="ol-eyebrow">HOW I WORK</p>
              <h2 id="partner-title">Let’s look at how<br />your business works.</h2>
              <ul className="portfolio-promises">
                <li><strong>Start with what gets in the way</strong><span>Look at the job your customer or staff member is trying to do.</span></li>
                <li><strong>Plan for people to use it</strong><span>Consider how customers will find it and what happens after they get there.</span></li>
                <li><strong>Work directly with me</strong><span>Talk to the person building it, from the first idea through the handoff.</span></li>
              </ul>
              <a href="#experience"><strong>Get to know my background</strong><span aria-hidden="true">↓</span></a>
            </aside>
          </div>
        </section>

        <section className="portfolio-brands" aria-label="Agency and consulting brand experience">
          <div className="ol-container">
            <p>Selected brands supported through agency and digital marketing work</p>
            <ul>{brands.map(brand => <li key={brand}>{brand}</li>)}</ul>
            <small>Agency and client experience · not direct employment or an endorsement</small>
          </div>
        </section>

        <section className="ol-container ol-section" id="work" aria-labelledby="work-title">
          <div className="ol-section-intro">
            <div><p className="ol-eyebrow">SELECTED WORK</p><h2 id="work-title">A few things<br />I’ve worked on.</h2></div>
            <p>The work below covers local services, sports media, and consumer apps. Each project has a different audience and a different job to do. The descriptions explain what each one is for, with its status shown where applicable.</p>
          </div>
          <div className="portfolio-projects">
            {projects.map(project => (
              <article className="portfolio-project" key={project.slug}>
                <div className="portfolio-project-image"><Image src={project.image} alt={project.imageAlt} width={1536} height={1024} unoptimized sizes="(max-width: 760px) 100vw, 50vw" /></div>
                <div className="portfolio-project-copy">
                  <div className="portfolio-project-meta"><span>{project.category}</span>{project.note && <span className="portfolio-status">{project.note}</span>}</div>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <ul aria-label={`${project.name} capabilities`}>{project.capabilities.map(capability => <li key={capability}>{capability}</li>)}</ul>
                </div>
              </article>
            ))}
          </div>
          <div className="portfolio-demo-callout"><div><h3>Want to try it yourself?</h3><p>Use sample details to request a quote or an appointment. Switch to the owner’s view to see the same request from the other side. These are demos, so nothing is sent and no real booking is made.</p></div><Link className="ol-button ol-button-primary" href="/demos">Try the interactive demos ↗</Link></div>
        </section>

        <section className="ol-process-wrap" id="expertise" aria-labelledby="expertise-title">
          <div className="ol-container ol-section">
            <div className="ol-section-intro"><div><p className="ol-eyebrow">WHAT I CAN HELP WITH</p><h2 id="expertise-title">Building it is part<br />of the job.</h2></div><p>A website also needs to be found, understood, and used. My background in marketing, strategy, and development lets me work on those questions together. We can choose the parts that matter for your business rather than buying a bit of everything.</p></div>
            <div className="portfolio-expertise">{expertise.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.description}</p><details><summary>See services</summary><ul>{item.services.map(service => <li key={service}>{service}</li>)}</ul></details></article>)}</div>
          </div>
        </section>

        <section className="portfolio-background" id="experience" aria-labelledby="experience-title">
          <div className="ol-container ol-section">
            <div className="ol-section-intro"><div><p className="ol-eyebrow">MEET STEVE</p><h2 id="experience-title">Nearly 20 years<br />working in digital.</h2></div><div className="portfolio-bio"><p>I started in search marketing and online communities in 2006. Since then, I’ve built an agency serving more than 100 clients, led digital strategy, and developed products across different industries. Today, I do that work through Optimize Local, building websites, apps, and automation for local and growing businesses.</p><a href="https://www.linkedin.com/in/stevenallencook" target="_blank" rel="noopener noreferrer">Connect on LinkedIn ↗</a></div></div>
            <details className="portfolio-career">
              <summary>See my career and agency experience</summary>
              <div className="portfolio-career-list">{careerChapters.map(chapter => <article key={chapter.company}>
                <p className="portfolio-career-date">{chapter.dates} · {chapter.role}</p><h3>{chapter.company}</h3>
                {chapter.location && <p>{chapter.location}</p>}<p>{chapter.description}</p>
                {chapter.metric && <p><strong>{chapter.metric}</strong></p>}
                {chapter.stats && <ul>{chapter.stats.map(stat => <li key={stat}>{stat}</li>)}</ul>}
                <ul className="portfolio-career-tags">{chapter.areas.map(area => <li key={area}>{area}</li>)}</ul>
                {chapter.secondary && <div><h4>{chapter.secondary.company}</h4><p>{chapter.secondary.role} · {chapter.secondary.dates}</p><p>{chapter.secondary.description}</p></div>}
              </article>)}</div>
              <h3>Selected consulting and agency engagements</h3>
              <div className="portfolio-engagements">{consultingEngagements.map(item => <article key={item.company}><h4>{item.company}</h4><p>{item.role} · {item.dates}</p><p>{item.detail}</p></article>)}</div>
              <h3>Cumulus Broadcasting</h3><p>Account Executive · 2008–2009. Worked directly with local businesses on radio marketing, commercial production, messaging, and marketing plans.</p>
            </details>
          </div>
        </section>

        <section className="ol-contact-wrap" id="contact" aria-labelledby="contact-title">
          <div className="ol-container ol-contact-grid">
            <div><p className="ol-eyebrow">LET’S TALK</p><h2 id="contact-title">What would make business easier for you?</h2><p>Tell me what’s getting in the way, even if you don’t know what to build yet. We’ll use a free 20-minute conversation to talk through the problem. You can bring a rough idea or show me the steps that keep taking up your time.</p><a className="ol-button ol-button-primary" href={consultationHref} {...callProps}>{consultationReady ? "Book your free 20-minute call" : "Request a free 20-minute call"} ↗</a><p>Monday–Friday, 10 AM–5 PM Central</p><p className="ol-email-line">Prefer email? <a href="mailto:optimizelocalai@gmail.com">optimizelocalai@gmail.com ↗</a></p><Link className="ol-inline-link" href="/#pricing">See starting prices →</Link></div>
            <ContactForm />
          </div>
        </section>
      </main>

      <footer className="ol-footer"><div className="ol-container ol-footer-main"><BrandLogo href="/" className="ol-footer-logo" /><p>Websites, apps, and automation from Rockford, Illinois.</p><a href="mailto:optimizelocalai@gmail.com">Get in touch ↗</a></div><div className="ol-container ol-footer-bottom"><span>© {new Date().getFullYear()} Optimize Local · Rockford, Illinois</span><span><Link href="/#services">Services</Link> · <Link href="/#pricing">Pricing</Link> · <Link href="/demos">Demos</Link> · <Link href="/privacy">Privacy</Link></span></div></footer>
    </div>
  );
}
