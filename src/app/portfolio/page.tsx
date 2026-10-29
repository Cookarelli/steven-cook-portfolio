import type { Metadata } from "next";
export const metadata: Metadata = { alternates: { canonical: "/portfolio" }, title: "Steve Cook - Professional Portfolio", description: "Steve Cook's digital marketing, software, and product portfolio." };
import { ContactForm } from "@/components/contact-form";
import { ProjectCard } from "@/components/project-card";
import { SiteHeader } from "@/components/site-header";
import { careerChapters, consultingEngagements, expertise, projects } from "@/data/portfolio";

const Arrow = () => <span aria-hidden="true">↗</span>;
const brands = ["UnitedHealthcare", "Fathead", "Wagly", "HairClub for Men", "Bosch / Sweetworxx", "ThedaCare"];

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="hero section-shell" id="top" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="status-dot" /> Rockford, Illinois · Digital since 2006</p>
          <p className="hero-name">Steven Cook</p>
          <h1 id="hero-title">Digital growth has been my job for <em>20 years.</em></h1>
          <p className="hero-intro">SEO, digital marketing, product development, and AI-powered systems built to grow audiences, businesses, and ideas.</p>
          <p className="hero-secondary">From early search and online communities to global brand campaigns, mobile apps, SaaS platforms, and modern AI automation.</p>
          <div className="button-row">
            <a className="button button-primary" href="#work">View my work <Arrow /></a>
            <a className="button button-quiet" href="#experience">My experience <Arrow /></a>
            <a className="text-link hero-link" href="#contact">Let&apos;s talk</a>
          </div>
        </div>
        <div className="hero-system" aria-label="Steven Cook's range of digital experience">
          {["Strategy", "Search", "Content", "Paid Media", "Analytics", "Design", "Development", "Automation", "Product", "Growth"].map((item, index) => (
            <div key={item} style={{ "--step": index } as React.CSSProperties}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong></div>
          ))}
        </div>
      </section>

      <section className="credibility" aria-label="Agency client brand experience">
        <div className="section-shell credibility-inner">
          <p>Selected brands I&apos;ve supported through agency and digital marketing work</p>
          <ul>{brands.map((brand) => <li key={brand}>{brand}</li>)}</ul>
          <small>Agency and client experience · not direct employment</small>
        </div>
      </section>

      <section className="section-shell work-section" id="work" aria-labelledby="work-title">
        <div className="section-heading work-heading">
          <p className="eyebrow">01 / Selected work</p>
          <h2 id="work-title">Different industries.<br /><em>Same objective.</em></h2>
          <div>
            <p>My work spans sports media, mobile applications, intelligent business platforms, hospitality, events, and local service companies.</p>
            <p>The industry changes. The fundamentals don&apos;t: understand the audience, create the right experience, make it discoverable, and give people a reason to act.</p>
          </div>
        </div>
        <div className="growth-chain" aria-label="Growth process">
          {["Strategy", "Search", "Content", "Build", "Automate", "Grow"].map((item, index) => <span key={item}>{item}{index < 5 && <i aria-hidden="true">→</i>}</span>)}
        </div>
        <div className="project-grid">{projects.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}</div>
      </section>

      <section className="section-shell expertise-section" id="expertise" aria-labelledby="expertise-title">
        <div className="section-heading">
          <p className="eyebrow">02 / Expertise</p>
          <h2 id="expertise-title">The full digital<br /><em>growth system.</em></h2>
          <p>Search, acquisition, strategy, products, and automation — connected by one view of the customer and the objective.</p>
        </div>
        <div className="expertise-list">
          {expertise.map((item, index) => <article className="expertise-item" key={item.title}><span className="expertise-number">0{index + 1}</span><div><h3>{item.title}</h3><p>{item.description}</p></div><ul aria-label={`${item.title} services`}>{item.services.map((service) => <li key={service}>{service}</li>)}</ul></article>)}
        </div>
      </section>

      <section className="experience-section" id="experience" aria-labelledby="experience-title">
        <div className="section-shell">
          <div className="section-heading experience-heading">
            <p className="eyebrow">03 / Experience</p>
            <h2 id="experience-title">From search marketer to digital leader to <em>product builder.</em></h2>
            <p>Steven&apos;s digital career began in the formative years of SEO and online communities. Over the next two decades, that foundation expanded into paid acquisition, analytics, conversion, agency leadership, global brand strategy, product development, and AI-powered business systems.</p>
          </div>

          <ol className="career-timeline">
            {careerChapters.map((chapter, index) => (
              <li className={`career-chapter ${chapter.company === "Poker Affiliate Listings" ? "career-origin" : ""}`} key={chapter.company}>
                <div className="career-marker"><span>{chapter.year}</span><small>{chapter.label}</small></div>
                <article>
                  <div className="career-meta"><p>{chapter.role}</p><span>{chapter.dates}</span></div>
                  <h3>{chapter.company}</h3>
                  {chapter.location && <p className="career-location">{chapter.location}</p>}
                  {chapter.company === "Rareview" && <p className="career-lead">Advised marketing leaders and founders on digital roadmaps, acquisition strategy, and channel mix.</p>}
                  {chapter.company === "Poker Affiliate Listings" && <h4>SEO before SEO was a job title everywhere.</h4>}
                  <p className="career-description">{chapter.description}</p>
                  {chapter.metric && <p className="career-metric">{chapter.metric}</p>}
                  {chapter.stats && <ul className="career-stats">{chapter.stats.map((stat) => <li key={stat}>{stat}</li>)}</ul>}
                  <ul className="career-areas">{chapter.areas.map((area) => <li key={area}>{area}</li>)}</ul>
                  {chapter.brands && <div className="career-brands"><p>Selected client and brand experience across agency and consulting work</p><ul>{chapter.brands.map((brand) => <li key={brand}>{brand}</li>)}</ul></div>}
                  {chapter.secondary && <div className="secondary-role"><p>{chapter.secondary.role}</p><h4>{chapter.secondary.company}</h4><span>{chapter.secondary.dates}</span><small>{chapter.secondary.description}</small></div>}
                  {index === 2 && (
                    <details className="consulting-details">
                      <summary>Selected consulting &amp; agency work <span aria-hidden="true">+</span></summary>
                      <div>{consultingEngagements.map((engagement) => <article key={engagement.company}><p>{engagement.role}</p><h4>{engagement.company}</h4><span>{engagement.dates}</span><small>{engagement.detail}</small></article>)}</div>
                    </details>
                  )}
                </article>
              </li>
            ))}
          </ol>

          <div className="early-media">
            <span>2008 – 2009</span><div><p>Account Executive</p><h3>Cumulus Broadcasting</h3><small>Worked directly with local businesses on radio marketing, commercial production, messaging, and marketing plans.</small></div>
          </div>
        </div>
      </section>

      <section className="career-statement">
        <div className="section-shell statement-inner">
          <p className="eyebrow">The through line</p>
          <h2>The tools changed.<br /><em>The job didn&apos;t.</em></h2>
          <p>Understand the customer. Find the opportunity. Get attention. Measure what happens. Improve it.</p>
          <p>SEO became omnichannel marketing. Websites became products. Automation became AI.</p>
          <strong>The objective has always been growth.</strong>
        </div>
      </section>

      <section className="section-shell about-section" id="about" aria-labelledby="about-title">
        <div className="about-aside" aria-hidden="true"><span>20</span><small>YEARS ACROSS<br />SEARCH, STRATEGY<br />&amp; PRODUCTS</small></div>
        <div className="about-copy">
          <p className="eyebrow">04 / About Steven</p>
          <h2 id="about-title">I&apos;ve spent most of my career figuring out how people find things, why they choose them, and what makes them <em>come back.</em></h2>
          <p>I started in online poker affiliate marketing in the mid-2000s, where SEO was fiercely competitive and online communities could become businesses almost overnight.</p>
          <p>Since then, I&apos;ve built a digital agency serving more than 100 clients, managed search and acquisition programs, worked throughout Southern California&apos;s agency world, led digital strategy for global brands, and advised businesses on how to grow online.</p>
          <p>Today I&apos;m applying that experience to a new generation of products through Optimize Local — building websites, mobile apps, SaaS platforms, and AI-powered automation.</p>
          <blockquote>I&apos;m still obsessed with the same thing I&apos;ve always been obsessed with: <strong>building something useful and figuring out how to get people to care about it.</strong></blockquote>
          <p className="sports-note">Outside client work, I&apos;m a lifelong sports fan and longtime Liverpool supporter. American Scouser gives me a place to combine digital publishing, content, community, and the beautiful chaos of being a football supporter.</p>
        </div>
      </section>

      <section className="section-shell results-section" aria-labelledby="results-title">
        <div><p className="eyebrow">The measure that matters</p><h2 id="results-title">Traffic is useful.<br /><em>Results are better.</em></h2></div>
        <div className="results-copy"><p>Rankings, impressions, clicks, and engagement are valuable signals. They only matter when they contribute to an actual objective.</p><ul>{["Qualified traffic", "Customer acquisition", "Leads", "Sales", "Conversion", "Audience growth", "Retention", "Customer experience", "Operational efficiency"].map((result) => <li key={result}>{result}</li>)}</ul></div>
      </section>

      <section className="contact-section" id="contact" aria-labelledby="contact-title">
        <div className="section-shell contact-inner">
          <div><p className="eyebrow">05 / Contact</p><h2 id="contact-title">Let&apos;s build something that <em>performs.</em></h2><p>If you&apos;re looking for someone who can connect marketing strategy, search, content, technology, and execution, let&apos;s talk.</p><div className="contact-links"><a href="mailto:optimizelocalai@gmail.com">optimizelocalai@gmail.com <Arrow /></a><a href="https://www.linkedin.com/in/stevenallencook" target="_blank" rel="noreferrer">LinkedIn <Arrow /></a></div></div>
          <ContactForm />
        </div>
      </section>

      <footer className="site-footer section-shell"><p><strong>Steven Cook</strong><span>Digital Marketing • SEO • Product • AI</span></p><p>© {new Date().getFullYear()} Steven Cook</p></footer>
    </main>
  );
}
