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

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("Messages array is required", { status: 400 });
    }

    const modelMessages = convertToModelMessages(messages);

    const result = streamText({
      model: openai("gpt-5"),
      system: ORCHESTRATOR_AGENT_PROMPT,
      providerOptions: {
        openai: {
          reasoning_effort: "low",
          textVerbosity: "low",
          reasoningSummary: "detailed",
        },
      },
      messages: modelMessages,
      stopWhen: stepCountIs(10),
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
