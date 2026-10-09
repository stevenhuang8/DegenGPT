import { WEB_SCRAPER_SYSTEM_INSTRUCTIONS } from "@/components/agent/web-scraper-prompt";
import { getFirecrawlMCPClient } from "@/lib/mcp";
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

    // Initialize Firecrawl MCP client
    console.log("🚀 Initializing Firecrawl MCP client...");
    const firecrawlClient = getFirecrawlMCPClient();
    await firecrawlClient.connect();

    // Retrieve Firecrawl tools
    const tools = await firecrawlClient.getTools();

    console.log(
      `🔧 Agent has access to ${Object.keys(tools).length} Firecrawl MCP tools`
    );

    // Wrap tools to log when they are called
    const wrappedTools = Object.fromEntries(
      Object.entries(tools).map(([toolName, toolDef]) => [
        toolName,
        {
          ...toolDef,
          execute: async (args: any) => {
            console.log(`\n🔧 Tool called: ${toolName}`);
            console.log(`   Input:`, JSON.stringify(args, null, 2));
            const result = await toolDef.execute(args);
            console.log(`   Output:`, JSON.stringify(result, null, 2));
            return result;
          },
        },
      ])
    );

    const result = streamText({
      model: openai("gpt-5.2"),
      system: WEB_SCRAPER_SYSTEM_INSTRUCTIONS,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      messages: modelMessages,
      tools: wrappedTools,
      stopWhen: stepCountIs(MAX_STEPS),
      providerOptions: {
        openai: {
          reasoning_effort: "low",
          textVerbosity: "low",
          reasoningSummary: "detailed",
        },
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("💥 Agent API error:", error);
    return new Response("Failed to generate response", { status: 500 });
  }
}
