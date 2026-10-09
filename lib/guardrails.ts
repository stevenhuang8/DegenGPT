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

// In-memory store: resets on restart and is per server instance.
// Swap for Redis/Upstash if deploying to multiple serverless instances.
const requestLog = new Map<string, number[]>();

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

  return { messages: uiMessages };
}
