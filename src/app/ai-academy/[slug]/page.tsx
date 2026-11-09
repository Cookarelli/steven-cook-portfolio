import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { academyPrograms, getAcademyProgram, programPath } from "@/config/ai-academy";
import { PricingCard, ProgramAction } from "@/components/academy/cards";
import { AcademyInquiryForm } from "@/components/academy/inquiry-form";
import { consultationHref } from "@/lib/consultation";
import { CourseOverview } from "@/components/academy/course-preview";
import { AcademyAnalytics } from "@/components/academy/analytics";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return academyPrograms.map(({ slug }) => ({ slug })); }
export const dynamicParams = false;
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const program = getAcademyProgram((await params).slug);
  if (!program) notFound();
  const title = `${program.title} | AI Academy`;
  return { title, description: program.description, alternates: { canonical: programPath(program) },
    openGraph: { title, description: program.description, url: programPath(program), type: "website" },
    twitter: { card: "summary", title, description: program.description } };
}

export default async function ProgramPage({ params }: Props) {
  const program = getAcademyProgram((await params).slug);
  if (!program) notFound();
  return <main id="academy-main" className="academy-detail-page">
    <AcademyAnalytics program={program.slug} />
    <section className="academy-hero academy-detail-hero"><div className="ol-container">
      <nav className="academy-breadcrumb" aria-label="Breadcrumb"><Link href="/ai-training">AI Academy</Link><span aria-hidden="true">/</span><span aria-current="page">{program.title}</span></nav>
      <p className="academy-eyebrow">{program.title}{program.comingSoon ? " · COMING SOON" : ""}</p><h1>{program.headline}</h1><p className="academy-lead">{program.description}</p><ProgramAction program={program} /><p className="academy-hero-note">{program.duration}</p>
    </div></section>
    <div className="ol-container academy-detail-grid"><div>
      <section className="academy-content-section"><p className="ol-eyebrow">WHO SHOULD ATTEND</p><h2>Who this is for</h2><p>{program.audience}</p><p className="academy-reassurance">{program.reassurance}</p></section>
      <section className="academy-content-section"><h2>What you can work on</h2><ul className="academy-list">{program.problems.map(text => <li key={text}>{text}</li>)}</ul></section>
      <section className="academy-content-section"><p className="ol-eyebrow">DURING THE PROGRAM</p><h2>{program.comingSoon ? "What you’ll learn when it launches" : "What you’ll learn"}</h2><ol className="academy-learn">{program.learn.map((text, i) => <li key={text}><span aria-hidden="true">{i + 1}</span>{text}</li>)}</ol></section>
      <section className="academy-content-section"><h2>What’s included</h2><ul className="academy-list">{program.included.map(text => <li key={text}>{text}</li>)}</ul><p className="academy-fine">AI outputs can be inaccurate. Review important information before acting on it, and keep sensitive information private. Outcomes vary; income, sales growth and time savings are not guaranteed.</p></section>
    </div><PricingCard program={program} /></div>
    {program.slug === "21-day-ai-confidence" && <CourseOverview />}
    <section className="academy-faq ol-container academy-section"><div><p className="ol-eyebrow">BEFORE YOU START</p><h2>Questions about this program.</h2></div><div>{program.faq.map(item => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div></section>
    <section id="request" className="academy-request"><div className="ol-container academy-request-grid"><div><p className="ol-eyebrow">{program.comingSoon ? "COURSE UPDATES" : "ASK ABOUT THIS PROGRAM"}</p><h2>{program.comingSoon ? "Get an email when the course is available." : "Tell us what you want to work on."}</h2><p>{program.comingSoon ? "The written curriculum is complete for author review, and three samples are available above. Recordings and full-course access are still in preparation. Request availability updates with no payment or enrollment obligation." : "Use the form to ask about this program and describe what you want to learn. We’ll follow up about availability and arrangements. Your request does not reserve a session or collect payment."}</p><p><Link href="/ai-academy/contact#consultation">Request a free consultation</Link> and we’ll follow up to arrange a time. You can also choose a free-call time directly on the calendar. Booking on the calendar does not also submit this inquiry form. <a href={consultationHref}>Book a free 20-minute consultation ↗</a>. This introductory call is separate from paid training.</p></div><AcademyInquiryForm key={program.slug} slug={program.slug} title={program.title} earlyAccess={program.comingSoon} group={program.format === "group"} /></div></section>
    <div className="academy-mobile-action"><a className="ol-button ol-button-primary" href="#request">{program.cta} ↗</a><span>Request only · No payment collected</span></div>
    <div className="ol-container academy-back"><Link href="/ai-training#programs">← Explore all Academy programs</Link><Link href="/ai-academy/contact#payment">Submit an arranged payment reference ↗</Link><Link href="/#services">Need an app or automation built? ↗</Link></div>
  </main>;
}
