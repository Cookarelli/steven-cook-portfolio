import Link from "next/link";
import { bookingDestination, formatPrice, programPath, type AcademyProgram } from "@/config/ai-academy";
import { ProgramLink } from "./program-link";
import { paymentConfig } from "@/lib/payments/config";

export function ProgramAction({ program }: { program: AcademyProgram }) {
  const destination = bookingDestination(program);
  const checkout = !program.comingSoon && ['private', 'team', 'audit'].includes(program.format) && paymentConfig().enabled;
  return <div className="academy-action">
    {checkout && <><Link className="ol-button ol-button-primary" href={`/ai-academy/checkout/${program.slug}`}>Pay for this session ↗</Link><p>Secure PayPal checkout with Venmo when eligible. Scheduling is confirmed separately.</p></>}
    <ProgramLink program={program.slug} className="ol-button ol-button-primary" href={destination ?? "#request"} {...(destination ? { target: "_blank" as const, rel: "noopener noreferrer" } : {})}>{program.cta}<span aria-hidden="true">↗</span></ProgramLink>
    <p>{program.comingSoon ? "The interest list is free. The course is not open for enrollment." : destination ? "Choose a time on Google Calendar." : program.format === "group" ? "Interest requests only. Dates and seat registration are not yet open." : "Opens a request form. Scheduling and payment are confirmed separately."}</p>
  </div>;
}

export function CourseCard({ program, index }: { program: AcademyProgram; index: number }) {
  const checkout = !program.comingSoon && ["private", "team", "audit"].includes(program.format) && paymentConfig().enabled;
  return <article id={`offer-${program.slug}`} className={`academy-course${program.comingSoon ? " academy-course-soon" : ""}`}>
    <div className="academy-card-top"><span>{program.category}</span><span aria-hidden="true">{index + 1}</span></div>
    <h3><Link href={programPath(program)}>{program.title}</Link></h3>
    <p>{program.description}</p>
    <ul className="academy-card-includes" aria-label={`${program.title} includes`}>{program.included.map(item => <li key={item}>{item}</li>)}</ul>
    <div className="academy-card-meta"><span>{program.duration}<br />{program.delivery}</span><strong>{formatPrice(program)} <small>{program.priceBasis}</small></strong></div>
    <ProgramLink program={program.slug} className="academy-card-link" href={checkout ? programPath(program) : `${programPath(program)}#request`}>{checkout ? "View session and checkout" : program.cta}<span aria-hidden="true">↗</span></ProgramLink>
  </article>;
}

export function PricingCard({ program }: { program: AcademyProgram }) {
  return <aside className="academy-pricing" aria-label={`${program.title} pricing`}>
    <p className="ol-eyebrow">{program.comingSoon ? "COMING SOON" : "SESSION DETAILS"}</p>
    <p className="academy-price">{formatPrice(program)}</p><p>{program.priceBasis}</p>
    <div className="academy-price-duration">{program.duration}<br />{program.delivery}</div>
    <ul>{program.included.map(item => <li key={item}>{item}</li>)}</ul>
    <ProgramAction program={program} />
    <p className="academy-fine">{program.comingSoon ? "Three written samples are available. Recordings and full-course access remain pending; purchase and enrollment are not open." : "Third-party AI subscriptions are not included. Availability and arrangements are confirmed before you commit."}</p>
  </aside>;
}
