import { SYSTEM_INSTRUCTIONS } from "@/components/agent/prompt";
import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages } from "ai";
import { NextRequest } from "next/server";
import {
  guardChatRequest,
  MAX_OUTPUT_TOKENS,
} from "@/lib/guardrails";

export async function POST(request: NextRequest) {
  try {
    const guard = await guardChatRequest(request);
    if ("response" in guard) return guard.response;

    const modelMessages = convertToModelMessages(guard.messages);

    const result = streamText({
      model: openai("gpt-5.2"),
      system: SYSTEM_INSTRUCTIONS,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      messages: modelMessages,
      providerOptions: {
        openai: {
          reasoning_effort: "low",
          textVerbosity: "low",
          reasoningSummary: "detailed",
        },
      },
      tools: {
        web_search: openai.tools.webSearch({
          searchContextSize: "low",
        }),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Failed to generate response", { status: 500 });
  }
}
