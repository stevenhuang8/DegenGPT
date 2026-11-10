import type { UIMessage } from "ai";
import type { NextRequest } from "next/server";

// Per-request generation limits shared by all agent routes
export const MAX_OUTPUT_TOKENS = 6000; // per step, includes reasoning tokens
export const MAX_STEPS = 6;

// Request limits
const MAX_REQUEST_BYTES = 200_000;
const MAX_MESSAGES = 20;
const MAX_USER_MESSAGE_CHARS = 2000;

// Rate limit: requests per IP per window
const RATE_LIMIT_MAX_REQUESTS = 20;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

// Total model requests allowed per day, across all visitors
const DAILY_MAX_REQUESTS = 200;
const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;

// In-memory stores: reset on restart and are per server instance.
// Swap for Redis/Upstash if deploying to multiple serverless instances.
const requestLog = new Map<string, number[]>();
let dailyCount = 0;
let dailyWindowStart = 0;

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function checkRateLimit(request: NextRequest): Response | null {
  const ip = getClientIp(request);
  const now = Date.now();
  const recent = (requestLog.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSec = Math.ceil(
      (recent[0] + RATE_LIMIT_WINDOW_MS - now) / 1000
    );
    console.warn(`🚫 Rate limit hit for ${ip}`);
    return new Response(
      `Too many requests. Please try again in ${Math.ceil(retryAfterSec / 60)} minute(s).`,
      { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
    );
  }

  recent.push(now);
  requestLog.set(ip, recent);

  // Opportunistically drop stale IPs so the map doesn't grow unbounded
  if (requestLog.size > 10_000) {
    for (const [key, times] of requestLog) {
      if (times.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) {
        requestLog.delete(key);
      }
    }
  }

  return null;
}

function checkDailyLimit(): Response | null {
  const now = Date.now();
  if (now - dailyWindowStart >= DAILY_WINDOW_MS) {
    dailyWindowStart = now;
    dailyCount = 0;
  }

  if (dailyCount >= DAILY_MAX_REQUESTS) {
    const retryAfterSec = Math.ceil(
      (dailyWindowStart + DAILY_WINDOW_MS - now) / 1000
    );
    console.warn("🚫 Daily request limit reached");
    return new Response(
      "This demo has reached its daily usage limit. Please try again tomorrow.",
      { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
    );
  }

  dailyCount += 1;
  return null;
}

function textLength(message: UIMessage): number {
  return (message.parts ?? []).reduce(
    (sum, part) => sum + (part.type === "text" ? part.text.length : 0),
    0
  );
}

/**
 * Rate limits the caller and validates the chat payload.
 * Returns the messages on success, or an error Response to return as-is.
 */
export async function guardChatRequest(
  request: NextRequest
): Promise<{ messages: UIMessage[] } | { response: Response }> {
  // Requiring JSON forces a CORS preflight on cross-site browser requests.
  // The routes don't answer preflights, so other sites can't trigger them.
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return {
      response: new Response("Content-Type must be application/json", {
        status: 415,
      }),
    };
  }

  const limited = checkRateLimit(request);
  if (limited) return { response: limited };

  const body = await request.text();
  if (body.length > MAX_REQUEST_BYTES) {
    return {
      response: new Response(
        "This conversation is too long. Please start a new chat.",
        { status: 413 }
      ),
    };
  }

  let messages: unknown;
  try {
    messages = JSON.parse(body).messages;
  } catch {
    return { response: new Response("Invalid JSON body", { status: 400 }) };
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return {
      response: new Response("Messages array is required", { status: 400 }),
    };
  }

  if (messages.length > MAX_MESSAGES) {
    return {
      response: new Response(
        "This conversation is too long. Please start a new chat.",
        { status: 413 }
      ),
    };
  }

  const uiMessages = messages as UIMessage[];

  // The chat UI only sends text from users and has no system messages
  const invalid = uiMessages.some(
    (m) =>
      (m.role !== "user" && m.role !== "assistant") ||
      !Array.isArray(m.parts) ||
      (m.role === "user" &&
        m.parts.some((p) => p.type !== "text" || typeof p.text !== "string"))
  );
  if (invalid) {
    return {
      response: new Response("Invalid message format", { status: 400 }),
    };
  }

  const tooLong = uiMessages.some(
    (m) => m.role === "user" && textLength(m) > MAX_USER_MESSAGE_CHARS
  );
  if (tooLong) {
    return {
      response: new Response(
        `Messages must be ${MAX_USER_MESSAGE_CHARS} characters or fewer.`,
        { status: 413 }
      ),
    };
  }

  // Checked last so rejected requests don't use up the daily budget
  const overDailyLimit = checkDailyLimit();
  if (overDailyLimit) return { response: overDailyLimit };

  return { messages: uiMessages };
}
