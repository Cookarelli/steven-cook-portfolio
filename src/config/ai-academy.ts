export type ProgramSlug = "ai-made-simple" | "ai-for-business" | "everyday-ai-workshop" | "team-training" | "21-day-ai-confidence" | "business-ai-audit";
export interface AcademyProgram {
  slug: ProgramSlug;
  title: string;
  category: string;
  headline: string;
  description: string;
  price: number;
  priceBasis: string;
  duration: string;
  format: "private" | "group" | "team" | "self-paced" | "audit";
  comingSoon: boolean;
  cta: string;
  audience: string;
  problems: string[];
  learn: string[];
  included: string[];
  reassurance: string;
  faq: { question: string; answer: string }[];
  // Null explicitly means unconfigured. Never substitute a made-up destination.
  paypalUrl: string | null;
  venmo: { handle: string; url: string | null; instructions: string | null } | null;
  googleCalendarBookingUrl: string | null;
  groupRegistrationUrl: string | null;
}
const unconfigured = { paypalUrl: null, venmo: null, googleCalendarBookingUrl: null, groupRegistrationUrl: null };
export const academyPrograms: readonly AcademyProgram[] = [
  {
    ...unconfigured, slug: "ai-made-simple", title: "AI Made Simple", category: "START HERE", headline: "Less intimidated. More capable.",
    description: "Turn curiosity into practical skills with a patient, private introduction to ChatGPT. Bring everyday tasks and learn how to approach them with AI.",
    price: 49, priceBasis: "per private session", duration: "60-minute private Google Meet session", format: "private", comingSoon: false,
    cta: "Book Your $49 AI Session", audience: "AI beginners, adults who want practical skills, and anyone who feels intimidated by technology.",
    problems: ["You are unsure where to start with ChatGPT.", "Your questions get vague or unhelpful answers.", "You want to know which answers you can trust."],
    learn: ["Navigate ChatGPT and start a useful conversation.", "Write clear prompts with context and a specific goal.", "Refine an answer with follow-up questions.", "Try everyday writing, planning and organizing tasks.", "Check accuracy and recognize when human judgment matters."],
    included: ["A private 60-minute Google Meet session", "Guided practice using everyday examples", "Time for your questions and refining results"],
    reassurance: "No technical expertise or coding experience needed. We start with the basics and move at a comfortable pace.",
    faq: [{ question: "Do I need to have used ChatGPT before?", answer: "No. This session is designed for complete beginners, including people who feel unsure about new technology." }, { question: "What should I bring?", answer: "Bring a device with internet access and a couple of everyday tasks you would like help with. We will confirm any account setup before the session; paid AI subscriptions are not included." }, { question: "Will AI always give the right answer?", answer: "No. We practice checking important facts, recognizing uncertainty and deciding when a reliable source or professional is needed." }],
  },
  {
    ...unconfigured, slug: "ai-for-business", title: "AI for Small Business Owners", category: "FOR YOUR BUSINESS", headline: "More attention for customers. Less blank-page work.",
    description: "Learn practical ways to draft replies, plan content and organize work, with examples grounded in the business you actually run.",
    price: 99, priceBasis: "per private session", duration: "90-minute private session", format: "private", comingSoon: false,
    cta: "Book Your $99 Business Session", audience: "Detailers, massage therapists, beauty businesses, contractors and independent professionals.",
    problems: ["Customer replies and follow-ups keep interrupting your day.", "Social posts and marketing drafts take too much effort to begin.", "You see repetitive work but do not know where AI could help."],
    learn: ["Draft customer replies that sound like your business.", "Develop social media ideas and marketing content.", "Prepare estimate wording for your review—not automatic pricing decisions.", "Map a workflow and identify steps AI could support.", "Review accuracy, tone and sensitive information before sharing."],
    included: ["A private 90-minute learning session", "Practice with customer replies, content and workflow planning", "Discussion of opportunities relevant to your business"],
    reassurance: "No coding or technical expertise needed. Bring your business knowledge; we will work from there.",
    faq: [{ question: "Is this a done-for-me automation service?", answer: "This is a training session. Building or connecting business software is a separate service and would require an agreed scope." }, { question: "Can we use real customer messages?", answer: "Use fictional or anonymized examples. Do not bring passwords, private customer records or sensitive health or financial information into an AI tool." }, { question: "Will this increase my sales?", answer: "The session helps you explore clearer communication and practical opportunities. Sales, revenue and time savings depend on your business and are not guaranteed." }],
  },
  {
    ...unconfigured, slug: "everyday-ai-workshop", title: "AI for Everyday Life", category: "LEARN TOGETHER", headline: "Everyday questions. A whole new set of skills.",
    description: "Join a beginner-friendly group workshop and practice using AI for planning, learning, writing and the creative projects you keep meaning to start.",
    price: 39, priceBasis: "per attendee", duration: "90-minute group Google Meet workshop", format: "group", comingSoon: false,
    cta: "Reserve Your $39 Workshop Seat", audience: "Beginners, families, adults and community groups who enjoy learning alongside others.",
    problems: ["You have heard about AI but cannot picture useful everyday applications.", "Planning, organizing or writing can feel like a blank page.", "You want guided practice without committing to private training."],
    learn: ["Ask better questions and improve a first response.", "Break everyday plans into manageable steps.", "Use AI as a learning companion and check its explanations.", "Organize ideas and draft everyday writing.", "Explore creative projects while keeping your own voice."],
    included: ["One attendee place in a 90-minute group Google Meet workshop, once confirmed", "Guided everyday exercises and examples", "Shared discussion and opportunities for questions"],
    reassurance: "No technical expertise needed. This workshop starts with approachable examples for beginners.",
    faq: [{ question: "Does submitting a request reserve a seat?", answer: "No. Workshop dates and registration are not yet configured. Send an interest request and we will follow up about a scheduled workshop. A request is not a ticket or confirmed seat." }, { question: "Can I book a private calendar slot for this workshop?", answer: "No. Group attendance is managed separately from private appointments. Only confirmed workshop registration can establish your place." }, { question: "Is the price for a family or an individual?", answer: "$39 is the price per attendee. Tell us how many people are interested so we can discuss the appropriate workshop." }],
  },
  {
    ...unconfigured, slug: "team-training", title: "AI at Work — Team Training", category: "BUILD TEAM CONFIDENCE", headline: "Give your team a shared way to work with AI.",
    description: "Bring up to five employees together to explore practical use cases, consistent prompting and responsible handling of business information.",
    price: 299, priceBasis: "per workshop · up to 5 employees", duration: "2-hour team workshop", format: "team", comingSoon: false,
    cta: "Schedule Team Training", audience: "Small business teams, office staff, customer service employees and management.",
    problems: ["Everyone approaches AI differently, making results inconsistent.", "Repetitive work is spread across the team.", "Employees are unsure what information is appropriate to share with AI."],
    learn: ["Use a shared approach to clear prompts and review.", "Identify repetitive workflows worth examining.", "Explore team-specific use cases and reusable approaches.", "Evaluate outputs before using them in customer-facing work.", "Practice responsible AI use and information privacy."],
    included: ["A 2-hour workshop for up to 5 employees", "Collaborative prompting and workflow exercises", "Discussion of responsible use and team review habits"],
    reassurance: "No coding experience needed. Team members can bring different levels of familiarity with AI.",
    faq: [{ question: "How many employees are included?", answer: "The $299 workshop includes up to five employees. For a larger team, contact us to discuss scope and pricing before scheduling." }, { question: "Can we discuss our internal workflows?", answer: "Yes. Use anonymized examples and avoid confidential documents or personal data. We will discuss what is appropriate to share." }, { question: "Does this replace an information-security policy?", answer: "No. Training introduces responsible habits, but your organization's policies and approval requirements still apply. Delivery arrangements are confirmed when scheduling." }],
  },
  {
    ...unconfigured, slug: "21-day-ai-confidence", title: "21 Days to AI Confidence", category: "COMING SOON", headline: "A little practice. A more confident you.",
    description: "A planned self-paced course with recordings, assignments and reusable prompts, designed to help beginners build practical skills one step at a time.",
    price: 79, priceBasis: "planned course price", duration: "Self-paced · 21-day learning path", format: "self-paced", comingSoon: true,
    cta: "Join the Early Access List", audience: "Beginners who want structure while learning independently, on their own schedule.",
    problems: ["You start tutorials but struggle to keep a learning routine.", "You want practice beyond watching demonstrations.", "You need a clear path from first prompt to everyday use."],
    learn: ["Build a regular prompting and review habit.", "Practice everyday AI tasks through guided assignments.", "Adapt reusable prompts to your own goals.", "Refine results and evaluate accuracy."],
    included: ["Planned recorded lessons for independent learning", "Planned practice assignments", "Planned reusable prompts"],
    reassurance: "Designed for beginners. No technical expertise needed. Lessons and access delivery are still in preparation.",
    faq: [{ question: "Can I buy or access the course now?", answer: "No. The course is Coming Soon until lessons and access delivery are complete. We are not collecting payment or promising immediate access." }, { question: "What does joining the list mean?", answer: "You request course launch and early-access updates by email. Joining is free, creates no purchase obligation and does not enroll you in the course. You can ask to leave the list at any time." }, { question: "When will the course launch?", answer: "A launch date has not been announced. We will share availability with people who explicitly request early-access updates." }, { question: "Must I finish in exactly 21 days?", answer: "The planned course is self-paced around a 21-day learning path. Final access terms and lesson details will be shared before enrollment opens." }],
  },
  {
    ...unconfigured, slug: "business-ai-audit", title: "Business AI Opportunity Audit", category: "FIND YOUR NEXT STEP", headline: "Find the work worth improving first.",
    description: "Step back from daily busywork and examine where AI or automation could help. Leave with a written summary of three recommended improvements, their estimated complexity and next steps.",
    price: 149, priceBasis: "per audit", duration: "90-minute consultation + written follow-up", format: "audit", comingSoon: false,
    cta: "Book Your Business AI Audit", audience: "Business owners looking for practical automation opportunities and a clearer way to prioritize potential ROI.",
    problems: ["You know work is repetitive but cannot decide what to improve first.", "AI options feel overwhelming or disconnected from your business.", "You need a practical next step before investing in implementation."],
    learn: ["Identify time-consuming steps in your current workflows.", "Distinguish potential AI opportunities from process improvements.", "Consider implementation complexity and business priorities.", "Understand assumptions behind potential return on investment."],
    included: ["A 90-minute business consultation", "Written follow-up identifying 3 recommended improvements", "Estimated complexity and next steps for each recommendation"],
    reassurance: "No technical expertise needed. You know your business; we will help translate its needs into practical possibilities.",
    faq: [{ question: "What will I receive?", answer: "You receive a written summary of three recommended improvements with estimated complexity and next steps, following the 90-minute consultation." }, { question: "Is implementation included?", answer: "No. This is an assessment and written follow-up. Any app development, integrations or automation implementation would be scoped separately." }, { question: "Are ROI estimates guaranteed?", answer: "No. Potential ROI depends on your process, adoption, data and implementation costs. Recommendations help prioritize exploration, not guarantee savings or revenue." }, { question: "What should I prepare?", answer: "Bring a description of your recurring tasks, existing tools and biggest bottlenecks. Use anonymized examples. We will confirm follow-up timing when arranging the consultation." }],
  },
];
export function getAcademyProgram(slug: string) { return academyPrograms.find(program => program.slug === slug); }
export function programPath(program: AcademyProgram) { return `/ai-academy/${program.slug}`; }
export function formatPrice(program: AcademyProgram) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(program.price); }
// Group workshops and unreleased courses must never use private appointment slots.
export function bookingDestination(program: AcademyProgram): string | null {
  if (program.comingSoon || program.format === "self-paced" || program.format === "group") return null;
  const value = program.googleCalendarBookingUrl;
  if (!value) return null;
  try { const url = new URL(value); return url.protocol === "https:" && ["calendar.app.google", "calendar.google.com"].includes(url.hostname) && !url.username && !url.password ? url.href : null; } catch { return null; }
}
