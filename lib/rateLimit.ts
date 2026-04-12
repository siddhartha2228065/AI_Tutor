// Simple in-memory rate limiter for API routes
// Tracks requests per IP within a sliding window

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Auto-cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap) {
    if (now > value.resetTime) rateLimitMap.delete(key);
  }
}, 5 * 60 * 1000);

/**
 * Check if a request should be rate limited.
 * @param ip - Client identifier (IP or fallback)
 * @param maxRequests - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns null if allowed, or a Response object if rate limited
 */
export function rateLimit(
  ip: string,
  maxRequests: number = 20,
  windowMs: number = 60_000
): Response | null {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    // First request or window expired — start fresh
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return null;
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return new Response(
      JSON.stringify({
        error: `Too many requests. Please wait ${retryAfter} seconds.`,
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
        },
      }
    );
  }

  entry.count++;
  return null;
}

/**
 * Extract client IP from request headers.
 * Works on Vercel (x-forwarded-for) and locally (fallback).
 */
export function getClientIP(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

/**
 * Get the correct referer/origin for OpenRouter.
 * Uses the request origin in production, falls back to localhost in dev.
 */
export function getReferer(req: Request): string {
  return (
    req.headers.get("origin") ||
    req.headers.get("referer") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  );
}
