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
  durationMinutes: number | null;
  delivery: string;
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
    ...unconfigured, slug: "ai-made-simple", title: "AI Made Simple", category: "START HERE", headline: "Learn to use ChatGPT for everyday tasks.",
    description: "Get a private introduction to ChatGPT using an everyday task. We’ll practice writing a prompt and checking the answer. You’ll leave with three prompts to try again on your own.",
    price: 49, priceBasis: "per private session", duration: "60-minute private session", durationMinutes: 60, delivery: "Live Zoom", format: "private", comingSoon: false,
    cta: "Request My AI Session", audience: "People who have never used ChatGPT or want help getting started.",
    problems: ["You are unsure where to start with ChatGPT.", "Your questions get vague or unhelpful answers.", "You want to know which answers you can trust."],
    learn: ["Navigate ChatGPT and start a useful conversation.", "Write clear prompts with context and a specific goal.", "Refine an answer with follow-up questions.", "Try everyday writing, planning and organizing tasks.", "Check accuracy and recognize when human judgment matters."],
    included: ["A private 60-minute Zoom session", "3 reusable prompts", "A one-page getting-started guide"],
    reassurance: "You do not need coding experience or technical knowledge. We’ll start with the basics and work through your questions. You can ask for an explanation again whenever you need one.",
    faq: [{ question: "Do I need to have used ChatGPT before?", answer: "No. This session is designed for complete beginners, including people who feel unsure about new technology." }, { question: "What should I bring?", answer: "Bring a device with internet access and a couple of everyday tasks you would like help with. We will confirm any account setup before the session; paid AI subscriptions are not included." }, { question: "Will AI always give the right answer?", answer: "No. We practice checking important facts, recognizing uncertainty and deciding when a reliable source or professional is needed." }],
  },
  {
    ...unconfigured, slug: "ai-for-business", title: "AI for Small Business Owners", category: "FOR YOUR BUSINESS", headline: "Use AI on the work that keeps interrupting your day.",
    description: "Bring a recurring task from your business. We’ll work through a draft or a plan using fictional or anonymized examples. You’ll leave with a five-prompt toolkit and three actions to try next.",
    price: 99, priceBasis: "per private session", duration: "90-minute private session", durationMinutes: 90, delivery: "Private Zoom", format: "private", comingSoon: false,
    cta: "Request Business Training", audience: "Detailers, massage therapists, beauty businesses, contractors and independent professionals.",
    problems: ["Customer replies and follow-ups keep interrupting your day.", "Social posts and marketing drafts take too much effort to begin.", "You see repetitive work but do not know where AI could help."],
    learn: ["Draft customer replies that sound like your business.", "Develop social media ideas and marketing content.", "Draft estimate wording for you to review, with pricing decisions kept in your hands.", "Map a workflow and identify steps AI could support.", "Review accuracy, tone and sensitive information before sharing."],
    included: ["A private 90-minute Zoom session", "A custom 5-prompt business toolkit", "3 prioritized next actions"],
    reassurance: "You know the customers and the work. We’ll use that context to choose examples that fit your business. No coding experience is needed.",
    faq: [{ question: "Is this a done-for-me automation service?", answer: "This is a training session. Building or connecting business software is a separate service and would require an agreed scope." }, { question: "Can we use real customer messages?", answer: "Use fictional or anonymized examples. Do not bring passwords, private customer records or sensitive health or financial information into an AI tool." }, { question: "Will this increase my sales?", answer: "We can work on customer replies and other recurring tasks. Whether that affects sales depends on your business and how you use the work. Sales, revenue and time savings are not guaranteed." }],
  },
  {
    ...unconfigured, slug: "everyday-ai-workshop", title: "AI for Everyday Life", category: "LEARN TOGETHER", headline: "Practice using AI for the things you do every week.",
    description: "Try meal planning, trip preparation and everyday writing in a group workshop. We’ll practice prompts and review the answers together. Keep the workbook for another go at home.",
    price: 39, priceBasis: "per attendee", duration: "90-minute group workshop", durationMinutes: 90, delivery: "Live group Zoom", format: "group", comingSoon: false,
    cta: "Join the Next Workshop List", audience: "Beginners, families, adults and community groups who enjoy learning alongside others.",
    problems: ["You have heard about AI but are unsure what you would use it for.", "Planning, organizing or writing can feel like a blank page.", "You want guided practice without committing to private training."],
    learn: ["Ask better questions and improve a first response.", "Break everyday plans into manageable steps.", "Use AI as a learning companion and check its explanations.", "Organize ideas and draft everyday writing.", "Explore creative writing and ideas while keeping your own voice.", "Use CLEAR exactly: Context; Lead with goal; Examples; Add constraints; Refine.", "Practice meal planning, trip preparation and a useful weekly plan."],
    included: ["A 90-minute group Zoom workshop, once scheduled and confirmed", "A printable prompt workbook", "An independent practice challenge"],
    reassurance: "The workshop starts with examples for beginners. You do not need technical experience to take part. The practice challenge gives you something to try afterward.",
    faq: [{ question: "Does submitting a request reserve a seat?", answer: "No. Workshop dates and registration are not yet configured. Send an interest request and we will follow up about a scheduled workshop. A request is not a ticket or confirmed seat." }, { question: "Can I book a private calendar slot for this workshop?", answer: "No. Group attendance is managed separately from private appointments. Only confirmed workshop registration can establish your place." }, { question: "Is the price for a family or an individual?", answer: "$39 is the price per attendee. Tell us how many people are interested so we can discuss the appropriate workshop." }],
  },
  {
    ...unconfigured, slug: "team-training", title: "AI at Work — Team Training", category: "FOR SMALL TEAMS", headline: "Help your team use AI consistently.",
    description: "Bring up to five people from your team to a two-hour Zoom workshop. We’ll practice prompts on tasks your team recognizes and discuss what information is safe to share. Take away a team playbook and a 30-day checklist.",
    price: 299, priceBasis: "per workshop · up to 5 participants", duration: "2-hour team workshop", durationMinutes: 120, delivery: "Zoom; in-person by separate arrangement", format: "team", comingSoon: false,
    cta: "Request Team Training", audience: "Small business teams, office staff, customer service employees and management.",
    problems: ["Everyone approaches AI differently, making results inconsistent.", "Repetitive work is spread across the team.", "Employees are unsure what information is appropriate to share with AI."],
    learn: ["Use a shared approach to clear prompts and review.", "Identify repetitive workflows worth examining.", "Practice prompts for tasks your team does regularly.", "Check answers before using them in messages to customers.", "Practice responsible AI use and information privacy."],
    included: ["A 2-hour Zoom workshop for up to 5 participants", "A team prompt playbook", "A workflow opportunity list", "A 30-day adoption checklist"],
    reassurance: "Your team does not need coding experience. People can take part with different levels of AI experience. We’ll work through examples together.",
    faq: [{ question: "How many people are included?", answer: "The $299 Zoom workshop includes up to five participants. Additional people, customization and in-person arrangements are quoted separately before scheduling." }, { question: "Can we discuss our internal workflows?", answer: "Yes. Use anonymized examples and avoid confidential documents or personal data. We will discuss what is appropriate to share." }, { question: "Does this replace an information-security policy?", answer: "No. Training introduces responsible habits, but your organization's policies and approval requirements still apply. Delivery arrangements are confirmed when scheduling." }],
  },
  {
    ...unconfigured, slug: "21-day-ai-confidence", title: "21 Days to AI Confidence", category: "COMING SOON", headline: "Practice using AI one lesson at a time.",
    description: "Follow a 21-day plan with prompts and exercises to try on your own. The first three written lessons are free to read now. The $79 course is Coming Soon, with recordings, full access and enrollment still pending.",
    price: 79, priceBasis: "course price at launch", duration: "Self-paced · 21-day learning path", durationMinutes: null, delivery: "Self-paced; recordings and full access pending", format: "self-paced", comingSoon: true,
    cta: "Join the Course Interest List", audience: "Beginners who want a lesson plan they can follow at their own pace.",
    problems: ["You start tutorials but struggle to keep a learning routine.", "You want practice beyond watching demonstrations.", "You are unsure what to practice after your first prompt."],
    learn: ["Practice writing prompts and checking the answers.", "Try everyday tasks with step-by-step exercises.", "Change the sample prompts to fit your own tasks.", "Ask follow-up questions and check important facts."],
    included: ["21 written lessons, exercises and reflections prepared for review", "Reusable prompts, a participant workbook, a personal prompt library and an AI usage routine", "Recorded demonstrations and full-course delivery still pending"],
    reassurance: "The course starts with the basics. The written lessons are complete for author review. Recordings and full-course access are still pending.",
    faq: [{ question: "Can I buy or access the course now?", answer: "Three written samples are available as a free preview. The $79 course remains Coming Soon while recordings, author review and full-course access are unfinished. Joining the interest list does not buy access or enroll you." }, { question: "What does joining the list mean?", answer: "You request course launch and early-access updates by email. Joining is free, creates no purchase obligation and does not enroll you in the course. You can ask to leave the list at any time." }, { question: "When will the course launch?", answer: "A launch date has not been announced. We will share availability with people who explicitly request early-access updates." }, { question: "Must I finish in exactly 21 days?", answer: "The planned course is self-paced around a 21-day learning path. Final access terms and lesson details will be shared before enrollment opens." }],
  },
  {
    ...unconfigured, slug: "business-ai-audit", title: "Business AI Opportunity Audit", category: "BUSINESS REVIEW", headline: "Decide where AI could help your business.",
    description: "Walk through the recurring work in your business during a private Zoom audit. We’ll identify three priorities and discuss what each would involve. You’ll receive a one-page plan with estimated complexity, budget ranges and next steps.",
    price: 149, priceBasis: "per audit", duration: "90-minute private audit", durationMinutes: 90, delivery: "Private Zoom", format: "audit", comingSoon: false,
    cta: "Request My AI Opportunity Audit", audience: "Business owners who want to compare options before spending money on AI or automation.",
    problems: ["You know work is repetitive but cannot decide what to improve first.", "You hear about new AI tools but are unsure which would help your business.", "You want to understand the work and likely costs before having anything built."],
    learn: ["Identify time-consuming steps in your current workflows.", "Decide whether a task needs AI, a process change or another kind of help.", "Compare the work involved with what matters most to your business.", "Check the assumptions behind any estimated costs or benefits."],
    included: ["A private 90-minute Zoom audit", "A written one-page action plan with 3 priorities", "Qualitative implementation complexity, estimated budget ranges and next steps"],
    reassurance: "You can describe the work in everyday terms. We’ll ask questions about the steps and the tools you already use. No technical expertise is needed.",
    faq: [{ question: "What will I receive?", answer: "You receive a written one-page action plan with three priorities, qualitative implementation complexity, estimated budget ranges and next steps. The ranges retain their assumptions and source. Unknown implementation costs remain pending a quote." }, { question: "Is implementation included?", answer: "No. This is an assessment and written follow-up. Any app development, integrations or automation implementation would be scoped separately." }, { question: "Are ROI estimates guaranteed?", answer: "No. Any estimate depends on your process, data, costs and how the changes are used. We’ll keep those assumptions visible. Recommendations do not guarantee savings or revenue." }, { question: "What should I prepare?", answer: "Bring a description of your recurring tasks, existing tools and biggest bottlenecks. Use anonymized examples. We will confirm follow-up timing when arranging the consultation." }],
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
