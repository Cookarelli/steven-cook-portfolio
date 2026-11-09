import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonExperience } from "@/components/academy/course-preview";
import { AcademyAnalytics } from "@/components/academy/analytics";
import content from "@/data/course-preview.json";
type Props = { params: Promise<{ dayId: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return content.preview.sample_ids.map(dayId => ({ dayId })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dayId } = await params;
  const day = content.samples.find(day => day.id === dayId);
  if (!day) notFound();
  const title = `Day ${day.order} ${day.title} | AI Confidence Preview`;
  return { title, description: day.objective, alternates: { canonical: `/ai-academy/21-day-ai-confidence/lessons/${day.id}` }, robots: { index: false, follow: true } };
}
export default async function LessonPage({ params }: Props) {
  const { dayId } = await params;
  if (!content.preview.sample_ids.includes(dayId)) notFound();
  return <main id="academy-main"><AcademyAnalytics program="21-day-ai-confidence" /><LessonExperience dayId={dayId} /></main>;
}
