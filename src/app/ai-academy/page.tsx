import type { Metadata } from "next";
import Link from "next/link";
import { academyPrograms } from "@/config/ai-academy";
import { CourseCard } from "@/components/academy/cards";


const description = "Practical AI training for everyday life, small businesses and teams. Explore private sessions, group workshops and a coming-soon self-paced course with Optimize Local AI Academy.";
export const metadata: Metadata = {
  title: "AI Academy | Practical AI Training", description,
  alternates: { canonical: "/ai-academy" },
  openGraph: { title: "Optimize Local AI Academy", description, url: "/ai-academy", type: "website" },
  twitter: { card: "summary", title: "Optimize Local AI Academy", description },
};

export default function AcademyPage() {
  return <main id="academy-main">
    <section className="academy-hero"><div className="ol-container academy-hero-grid">
      <div><p className="academy-eyebrow">OPTIMIZE LOCAL AI ACADEMY</p><h1>Make AI useful.<br /><em>Make it your own.</em></h1><p className="academy-lead">You don’t need a technical background. Just something you’d like to make easier. Learn practical AI skills for your life, your business, or your team.</p><div className="ol-actions"><a className="ol-button ol-button-primary" href="#programs">Find your starting point <span aria-hidden="true">↓</span></a><Link className="ol-button ol-button-outline" href="/ai-academy/contact#consultation">Free 20-minute consultation ↗</Link></div><p className="academy-hero-note">Beginner-friendly · Practical examples · Human guidance</p></div>
      <aside className="academy-notebook" aria-label="Our approach to learning"><div className="academy-notebook-heading"><span>FROM “WHERE DO I START?”</span><span aria-hidden="true">↗</span></div><h2>Small steps.<br />Useful skills.</h2><ol><li><span>01</span><div><strong>Bring a real task.</strong><p>A reply, a plan, an idea. Start with your day.</p></div></li><li><span>02</span><div><strong>Learn by trying.</strong><p>Ask, refine and discover what works for you.</p></div></li><li><span>03</span><div><strong>Keep your judgment.</strong><p>Check the result. Make it your own.</p></div></li></ol><p className="academy-notebook-foot">TO “I CAN USE THIS.”</p></aside>
    </div></section>
    <div className="academy-strip"><div className="ol-container"><span>For everyday life</span><span>For small businesses</span><span>For people who learn by doing</span></div></div>
    <section className="ol-container academy-section" id="programs"><div className="academy-section-heading"><div><p className="ol-eyebrow">SIX WAYS TO GET STARTED</p><h2>A little guidance.<br />A useful next step.</h2></div><p>Choose the setting that fits you: focused private help, a shared workshop, team training, or a plan for your business.</p></div><div className="academy-grid">{academyPrograms.map((program, index) => <CourseCard key={program.slug} program={program} index={index} />)}</div><p className="academy-grid-note">Session and workshop requests are open for inquiries. Online scheduling, payment and group seat registration are not yet configured. The self-paced course is Coming Soon.</p></section>
    <section className="academy-principles"><div className="ol-container academy-principles-grid"><div><p className="academy-eyebrow">PRACTICAL. PATIENT. GROUNDED.</p><h2>Learn the tool.<br />Keep the human.</h2></div><div><p>AI can help you find a starting point, explore an idea or draft a response. You bring the context, care and judgment that make it useful.</p><p>Every program encourages reviewing results, protecting private information and recognizing AI’s limitations. No promises of guaranteed income, sales growth or time savings.</p><p>Led by Steve Cook, founder of Optimize Local, with nearly 20 years in digital marketing, business growth and technology. <Link href="/portfolio">Get to know your instructor ↗</Link></p></div></div></section>
    <section className="ol-container academy-section academy-help"><div><p className="ol-eyebrow">NOT SURE WHERE TO BEGIN?</p><h2>Start with a conversation.</h2><p>Request a free 20-minute consultation to talk through your goals and ask which program may fit. It does not reserve a paid session or workshop seat.</p></div><Link className="ol-button ol-button-primary" href="/ai-academy/contact#consultation">Request a free 20-minute consultation ↗</Link></section>
  </main>;
}
