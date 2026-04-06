const store = new Map<string, { count: number; resetAt: number }>();

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  transcribe: { max: 20, windowMs: 60 * 60 * 1000 },
  report: { max: 30, windowMs: 60 * 60 * 1000 },
};

/**
 * Returns true if the request should be rejected (rate limit exceeded).
 */
export function isRateLimited(
  ip: string,
  endpoint: "transcribe" | "report",
): boolean {
  const { max, windowMs } = LIMITS[endpoint];
  const key = `${endpoint}:${ip}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count++;
  return entry.count > max;
}
