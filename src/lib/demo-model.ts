export type Photo = { name: string; url: string };
export const detailStatuses = ["New", "Reviewing", "Quote Sent", "Booked", "Completed"] as const;
export type DetailStatus = (typeof detailStatuses)[number];
export const detailServices = [
  { name: "Interior", description: "Seats, carpets, trim, and the little details." },
  { name: "Exterior", description: "A fresh start for paint, wheels, and glass." },
  { name: "Full detail", description: "A complete refresh, inside and out." },
  { name: "Ceramic coating inquiry", description: "Talk through protection options for your paint." },
];
export type DetailDraft = {
  type: string; year: string; make: string; model: string; services: string[];
  condition: string; concerns: string; photos: Photo[]; name: string;
  contactMethod: string; contact: string;
};
export type DetailRequest = DetailDraft & { id: string; status: DetailStatus; estimate: string; internalNotes: string };
export type DetailState = { requests: DetailRequest[]; latestId: string | null; draft: DetailDraft; step: number };
export const emptyDetail = (): DetailDraft => ({ type: "", year: "", make: "", model: "", services: [], condition: "", concerns: "", photos: [], name: "", contactMethod: "Email", contact: "" });
export function seedDetails(): DetailState {
  const sample = (id: string, name: string, year: string, make: string, model: string, status: DetailStatus, services: string[], condition: string, estimate = ""): DetailRequest => ({ ...emptyDetail(), id, name, year, make, model, status, services, condition, estimate, type: "SUV / crossover", contact: `${name.split(" ")[0].toLowerCase()}@example.com`, internalNotes: "Sample request for demonstration.", concerns: "Please pay extra attention to the floor mats." });
  return { requests: [
    sample("DT-1042", "Jamie Parker", "2022", "Subaru", "Outback", "New", ["Full detail"], "Daily driver with pet hair in the rear seats."),
    sample("DT-1041", "Morgan Lee", "2024", "Toyota", "RAV4", "Reviewing", ["Ceramic coating inquiry"], "Light swirl marks; interested in long-term protection."),
    sample("DT-1040", "Alex Rivera", "2020", "Honda", "CR-V", "Quote Sent", ["Interior"], "Coffee stain on the front passenger seat.", "175"),
    sample("DT-1039", "Sam Taylor", "2023", "Ford", "Bronco", "Booked", ["Exterior"], "Mud on wheels after a weekend trip.", "125"),
    sample("DT-1038", "Casey Brooks", "2021", "Mazda", "CX-5", "Completed", ["Full detail"], "Seasonal refresh inside and out.", "250"),
  ], latestId: null, draft: emptyDetail(), step: 0 };
}
export const salonServices = [
  { id: "cut", name: "Cut & finish", duration: 60, price: 65, description: "A fresh shape, wash, and a style to go." },
  { id: "blowout", name: "Signature blowout", duration: 30, price: 40, description: "A wash and polished finish for your day." },
  { id: "color", name: "Color refresh", duration: 90, price: 110, description: "A single-process color and smooth finish." },
];
export const staffMembers = [{ id: "ava", name: "Ava", role: "Cuts & color", initials: "AV" }, { id: "jordan", name: "Jordan", role: "Cuts & styling", initials: "JO" }];
export type AppointmentStatus = "Pending" | "Confirmed" | "Declined" | "Completed";
export type BookingDraft = { serviceId: string; preference: string; date: string; time: string; name: string; email: string; phone: string; notes: string };
export type Appointment = BookingDraft & { id: string; staffId: string; status: AppointmentStatus; rescheduled?: boolean };
export type BookingState = { dates: string[]; appointments: Appointment[]; latestId: string | null; draft: BookingDraft; step: number };
export const emptyBooking = (): BookingDraft => ({ serviceId: "", preference: "any", date: "", time: "", name: "", email: "", phone: "", notes: "" });
export function localDate(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
export function sampleDates(now = new Date()) { return Array.from({ length: 7 }, (_, i) => { const d = new Date(now); d.setDate(d.getDate() + i + 1); return localDate(d); }); }
export function formatDate(date: string, short = false) { return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", short ? { weekday: "short", month: "short", day: "numeric" } : { weekday: "long", month: "long", day: "numeric", year: "numeric" }); }
export function formatTime(time: string) { const [h, m] = time.split(":").map(Number); return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`; }
export const timeSlots = Array.from({ length: 16 }, (_, i) => `${String(9 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`);
export function serviceFor(id: string) { return salonServices.find(s => s.id === id) || salonServices[0]; }
const minutes = (time: string) => { const [h, m] = time.split(":").map(Number); return h * 60 + m; };
export function conflictFor(candidate: Pick<Appointment, "date" | "time" | "staffId" | "serviceId">, appointments: Appointment[], excludeId?: string): Appointment | undefined {
  const start = minutes(candidate.time), end = start + serviceFor(candidate.serviceId).duration;
  return appointments.find(a => a.id !== excludeId && a.status === "Confirmed" && a.date === candidate.date && a.staffId === candidate.staffId && start < minutes(a.time) + serviceFor(a.serviceId).duration && end > minutes(a.time));
}
export function availableStaff(draft: Pick<BookingDraft, "date" | "time" | "serviceId" | "preference">, appointments: Appointment[], excludeId?: string) {
  if (!draft.date || !timeSlots.includes(draft.time) || !salonServices.some(s => s.id === draft.serviceId) || minutes(draft.time) + serviceFor(draft.serviceId).duration > 17 * 60) return [];
  return staffMembers.filter(s => (draft.preference === "any" || draft.preference === s.id) && !conflictFor({ ...draft, staffId: s.id }, appointments, excludeId));
}
export function seedBookings(now = new Date()): BookingState {
  const dates = sampleDates(now);
  const sample = (id: string, name: string, serviceId: string, staffId: string, date: string, time: string, status: AppointmentStatus): Appointment => ({ ...emptyBooking(), id, name, serviceId, staffId, preference: staffId, date, time, status, email: `${name.split(" ")[0].toLowerCase()}@example.com`, notes: "Sample appointment for demonstration." });
  return { dates, appointments: [
    sample("AP-2042", "Jamie Parker", "cut", "ava", dates[0], "10:00", "Pending"),
    sample("AP-2041", "Morgan Lee", "color", "ava", dates[0], "10:00", "Confirmed"),
    sample("AP-2040", "Alex Rivera", "cut", "jordan", dates[0], "13:00", "Confirmed"),
    sample("AP-2039", "Sam Taylor", "blowout", "ava", localDate(now), "09:00", "Completed"),
    sample("AP-2038", "Casey Brooks", "blowout", "jordan", dates[1], "11:00", "Pending"),
  ], latestId: null, draft: emptyBooking(), step: 0 };
}
export function nextRequestId(prefix: string, ids: string[]) { return `${prefix}-${Math.max(0, ...ids.map(id => Number(id.split("-")[1]) || 0)) + 1}`; }
export function validateContact(method: string, value: string) { return method === "Email" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) : value.replace(/\D/g, "").length >= 10; }
export function detailError(d: DetailDraft, step: number) {
  if (step === 0 && (!d.type || !/^\d{4}$/.test(d.year) || +d.year < 1900 || +d.year > new Date().getFullYear() + 1 || !d.make.trim() || !d.model.trim())) return "Select a vehicle type and enter a valid year, make, and model.";
  if (step === 1 && (!d.services.length || !d.condition.trim())) return "Choose at least one service and describe the vehicle’s condition.";
  if (step === 2 && (!d.name.trim() || !validateContact(d.contactMethod, d.contact))) return `Enter a fictional name and a valid sample ${d.contactMethod === "Email" ? "email address" : "phone number (at least 10 digits)"}.`;
  return "";
}
export function bookingError(d: BookingDraft, step: number) {
  if (step === 0 && !d.serviceId) return "Choose a service to continue.";
  if (step === 1 && (!d.date || !d.time)) return "Choose a preferred date and time.";
  if (step === 2 && (!d.name.trim() || !validateContact("Email", d.email) || (d.phone && !validateContact("Phone", d.phone)))) return "Enter a fictional name and valid sample email. If provided, use a phone number with at least 10 digits.";
  return "";
}
