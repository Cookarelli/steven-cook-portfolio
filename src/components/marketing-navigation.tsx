"use client";

import { useRef } from "react";
import { consultationHref, consultationReady } from "@/lib/consultation";

const links = [
  ["#benefits", "Benefits"],
  ["#ideas", "Business ideas"],
  ["#pricing", "Pricing"],
  ["#work", "Our work"],
  ["/portfolio", "Portfolio"],
  ["/demos", "Try the demos"],
] as const;

export function MarketingNavigation() {
  const disclosure = useRef<HTMLDetailsElement>(null);
  const toggle = useRef<HTMLElement>(null);

  return <>
    <nav className="ol-nav" aria-label="Main navigation">
      {links.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
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
        {links.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
        <a href={consultationHref} {...(consultationReady ? { target: "_blank", rel: "noopener noreferrer" } : {})}>Book a free consultation ↗</a>
      </nav>
    </details>
  </>;
}
