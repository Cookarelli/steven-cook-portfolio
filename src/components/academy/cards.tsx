import Link from "next/link";
import { bookingDestination, formatPrice, programPath, type AcademyProgram } from "@/config/ai-academy";

export function ProgramAction({ program }: { program: AcademyProgram }) {
  const destination = bookingDestination(program);
  return <div className="academy-action">
    <a className="ol-button ol-button-primary" href={destination ?? "#request"} {...(destination ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{program.cta}<span aria-hidden="true">↗</span></a>
    <p>{program.comingSoon ? "Coming soon · Free list signup · No payment collected" : destination ? "Choose a time on Google Calendar." : program.format === "group" ? "Interest requests only. Dates and seat registration are not yet open." : "Opens a request form. Scheduling and payment are confirmed separately."}</p>
  </div>;
}

export function CourseCard({ program, index }: { program: AcademyProgram; index: number }) {
  return <article className={`academy-course${program.comingSoon ? " academy-course-soon" : ""}`}>
    <div className="academy-card-top"><span>{program.category}</span><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span></div>
    <h3><Link href={programPath(program)}>{program.title}</Link></h3>
    <p>{program.description}</p>
    <div className="academy-card-meta"><span>{program.duration}</span><strong>{formatPrice(program)} <small>{program.priceBasis}</small></strong></div>
    <Link className="academy-card-link" href={programPath(program)}>{program.comingSoon ? "Explore early access" : "Explore this program"}<span aria-hidden="true">↗</span></Link>
  </article>;
}

export function PricingCard({ program }: { program: AcademyProgram }) {
  return <aside className="academy-pricing" aria-label={`${program.title} pricing`}>
    <p className="ol-eyebrow">{program.comingSoon ? "COMING SOON" : "YOUR NEXT STEP"}</p>
    <p className="academy-price">{formatPrice(program)}</p><p>{program.priceBasis}</p>
    <div className="academy-price-duration">{program.duration}</div>
    <ul>{program.included.map(item => <li key={item}>{item}</li>)}</ul>
    <ProgramAction program={program} />
    <p className="academy-fine">{program.comingSoon ? "Course lessons and access delivery are in preparation. No immediate access or purchase is available." : "Third-party AI subscriptions are not included. Availability and arrangements are confirmed before you commit."}</p>
  </aside>;
}
