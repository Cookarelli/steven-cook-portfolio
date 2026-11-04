"use client";

import { useRef } from "react";
import { consultationHref, consultationReady } from "@/lib/consultation";

const links = [
  ["#services", "Services"],
  ["#pricing", "Pricing"],
  ["#process", "How it works"],
  ["/portfolio", "Portfolio"],
  ["/demos", "Try the demos"],
] as const;

export function MarketingNavigation({ home = true }: { home?: boolean }) {
  const navigationLinks = links.map(([href, label]) => [!home && href.startsWith("#") ? `/${href}` : href, label]);
  const disclosure = useRef<HTMLDetailsElement>(null);
  const toggle = useRef<HTMLElement>(null);

  return <>
    <nav className="ol-nav" aria-label="Main navigation">
      {navigationLinks.map(([href, label]) => <a key={href} href={href} aria-current={!home && href === "/portfolio" ? "page" : undefined}>{label}</a>)}
    </nav>
    <details className="ol-mobile-navigation" ref={disclosure} onKeyDown={event => {
      if (event.key === "Escape" && disclosure.current?.open) {
        disclosure.current.open = false;
        toggle.current?.focus();
      }
    }}>
      <summary ref={toggle}>Menu</summary>
      <nav aria-label="Mobile navigation" onClick={event => {
        if ((event.target as HTMLElement).closest("a") && disclosure.current) {
          disclosure.current.open = false;
          toggle.current?.focus();
        }
      }}>
        {navigationLinks.map(([href, label]) => <a key={href} href={href} aria-current={!home && href === "/portfolio" ? "page" : undefined}>{label}</a>)}
        <a href={consultationHref} {...(consultationReady ? { target: "_blank", rel: "noopener noreferrer" } : {})}>Book a free consultation ↗</a>
      </nav>
    </details>
  </>;
}
