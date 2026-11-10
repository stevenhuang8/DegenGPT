import { SYSTEM_INSTRUCTIONS } from "@/components/agent/prompt";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText, convertToModelMessages } from "ai";
import { NextRequest } from "next/server";
import { ALLOWED_RESEARCH_DOMAINS } from "@/lib/allowed-domains";
import {
  guardChatRequest,
  MAX_OUTPUT_TOKENS,
} from "@/lib/guardrails";

export async function POST(request: NextRequest) {
  try {
    const guard = await guardChatRequest(request);
    if ("response" in guard) return guard.response;

    const modelMessages = await convertToModelMessages(guard.messages);

    const result = streamText({
      model: anthropic("claude-opus-5-5"),
      instructions: SYSTEM_INSTRUCTIONS,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      messages: modelMessages,
      providerOptions: {
        anthropic: {
          thinking: { type: "adaptive", display: "summarized" },
          effort: "high",
          fallbacks: "default",
        },
      },
      tools: {
        web_search: anthropic.tools.webSearch_20260209({
          maxUses: 3,
          allowedDomains: ALLOWED_RESEARCH_DOMAINS,
        }),
        web_fetch: anthropic.tools.webFetch_20260209({
          maxUses: 3,
          allowedDomains: ALLOWED_RESEARCH_DOMAINS,
        }),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Failed to generate response", { status: 500 });
  }
}
