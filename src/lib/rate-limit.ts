const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 1;

export function rateLimit(identifier: string): { success: boolean } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now - record.lastReset > WINDOW_MS) {
    rateLimitMap.set(identifier, { count: 1, lastReset: now });
    return { success: true };
  }

  if (record.count >= MAX_REQUESTS) {
    return { success: false };
  }

  record.count++;
  return { success: true };
}
