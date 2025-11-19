import { LOL_AGENT_PROMPT } from "@/components/agent/lol-prompt";
import {
  retrieveKnowledgeBaseSimple,
  compareOdds,
  getTeamStats,
  analyzeTrends,
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
      model: openai("gpt-5.1"),
      system: LOL_AGENT_PROMPT,
      providerOptions: {
        openai: {
          reasoning_effort: "medium",
          textVerbosity: "low",
          reasoningSummary: "detailed",
        },
      },
      messages: modelMessages,
      stopWhen: stepCountIs(15), // Allow more steps for complex analysis
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
