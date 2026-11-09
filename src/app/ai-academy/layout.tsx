import Link from "next/link";
import { MarketingNavigation } from "@/components/marketing-navigation";
import { BrandLogo } from "@/components/brand-logo";
import { consultationHref } from "@/lib/consultation";
import "./academy.css";

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return <div className="ol-site academy-site">
    <a href="#academy-main" className="academy-skip">Skip to content</a>
    <header className="ol-header"><div className="ol-container ol-header-inner">
      <BrandLogo href="/" />
      <MarketingNavigation home={false} />
      <a className="ol-button ol-button-small" href={consultationHref}>Book a call ↗</a>
    </div></header>
    {children}
    <footer className="academy-footer ol-container"><div><BrandLogo href="/" className="ol-footer-logo" /><p>Websites, apps and training. Based in Rockford, Illinois.</p></div><nav aria-label="Academy footer"><Link href="/ai-training">AI Training</Link><Link href="/#services">Apps & automation</Link><Link href="/ai-academy/contact">Contact Academy</Link><Link href="/privacy">Privacy</Link><a href="mailto:optimizelocalai@gmail.com">Get in touch ↗</a></nav></footer>
  </div>;
}
