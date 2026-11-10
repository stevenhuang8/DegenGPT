import { RAG_SYSTEM_INSTRUCTIONS } from "@/components/agent/rag-prompt";
import { retrieveKnowledgeBaseSimple } from "@/components/agent/tools";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText, convertToModelMessages, isStepCount } from "ai";
import { NextRequest } from "next/server";
import {
  guardChatRequest,
  MAX_OUTPUT_TOKENS,
  MAX_STEPS,
} from "@/lib/guardrails";

export async function POST(request: NextRequest) {
  try {
    const guard = await guardChatRequest(request);
    if ("response" in guard) return guard.response;

    const modelMessages = await convertToModelMessages(guard.messages);

    const result = streamText({
      model: anthropic("claude-opus-5-5"),
      instructions: RAG_SYSTEM_INSTRUCTIONS,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      providerOptions: {
        anthropic: {
          thinking: { type: "adaptive", display: "summarized" },
          effort: "high",
          fallbacks: "default",
        },
      },
      messages: modelMessages,
      stopWhen: isStepCount(MAX_STEPS),
      tools: {
        retrieveKnowledgeBase: retrieveKnowledgeBaseSimple,
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Failed to generate response", { status: 500 });
  }
}
