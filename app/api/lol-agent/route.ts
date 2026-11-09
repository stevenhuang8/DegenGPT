import { LOL_AGENT_PROMPT } from "@/components/agent/lol-prompt";
import {
  retrieveKnowledgeBaseSimple,
  compareOdds,
  getTeamStats,
  analyzeTrends,
} from "@/components/agent/tools";
import { openai } from "@ai-sdk/openai";
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
      model: openai("gpt-5.2"),
      instructions: LOL_AGENT_PROMPT,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      providerOptions: {
        openai: {
          reasoningEffort: "high",
          textVerbosity: "low",
          reasoningSummary: "detailed",
        },
      },
      messages: modelMessages,
      stopWhen: isStepCount(MAX_STEPS),
      tools: {
        retrieveKnowledgeBase: retrieveKnowledgeBaseSimple,
        compareOdds,
        getTeamStats,
        analyzeTrends,
        web_search: openai.tools.webSearch({
          searchContextSize: "medium",
        }),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("LoL Agent API error:", error);
    return new Response("Failed to generate response", { status: 500 });
  }
}
