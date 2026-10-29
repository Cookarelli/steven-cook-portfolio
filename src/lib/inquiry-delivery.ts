const INQUIRY_ENDPOINT = "https://formsubmit.co/ajax/optimizelocalai@gmail.com";

export class InquiryTimeoutError extends Error {
  constructor() { super("Inquiry delivery timed out; receipt is unknown."); }
}

export async function deliverInquiry(
  payload: Record<string, string>,
  { fetchImpl = fetch, timeoutMs = 15_000 }: { fetchImpl?: typeof fetch; timeoutMs?: number } = {},
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(INQUIRY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const result: { success?: boolean | string } = await response.json();
    if (!response.ok || (result.success !== true && result.success !== "true")) {
      throw new Error("Submission service did not accept the request.");
    }
  } catch (error) {
    if (controller.signal.aborted) throw new InquiryTimeoutError();
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
