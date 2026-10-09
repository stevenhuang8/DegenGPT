import { ORCHESTRATOR_AGENT_PROMPT } from "@/components/agent/orchestrator-prompt";
import {
  retrieveKnowledgeBaseSimple,
  compareOdds,
  getTeamStats,
  analyzeTrends,
  getInjuryReport,
} from "@/components/agent/tools";
import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, stepCountIs } from "ai";
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

    const modelMessages = convertToModelMessages(guard.messages);

    const result = streamText({
      model: openai("gpt-5.2"),
      system: ORCHESTRATOR_AGENT_PROMPT,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      providerOptions: {
        openai: {
          reasoning_effort: "low",
          textVerbosity: "low",
          reasoningSummary: "detailed",
        },
      },
      messages: modelMessages,
      stopWhen: stepCountIs(MAX_STEPS),
      tools: {
        retrieveKnowledgeBase: retrieveKnowledgeBaseSimple,
        compareOdds,
        getTeamStats,
        analyzeTrends,
        getInjuryReport,
        web_search: openai.tools.webSearch({
          searchContextSize: "low",
        }),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Orchestrator Agent API error:", error);
    return new Response("Failed to generate response", { status: 500 });
  }
}
