import { WEB_SCRAPER_SYSTEM_INSTRUCTIONS } from "@/components/agent/web-scraper-prompt";
import { createScrapePage } from "@/components/agent/tools";
import { getFirecrawlMCPClient } from "@/lib/mcp";
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

    // Initialize Firecrawl MCP client
    console.log("🚀 Initializing Firecrawl MCP client...");
    const firecrawlClient = getFirecrawlMCPClient();
    await firecrawlClient.connect();

    // Expose only scraping, restricted to allowed sites
    const { firecrawl_scrape: firecrawlScrape } =
      await firecrawlClient.getTools();
    if (!firecrawlScrape) {
      throw new Error("Firecrawl scrape tool is not available");
    }

    const result = streamText({
      model: anthropic("claude-opus-5-5"),
      instructions: WEB_SCRAPER_SYSTEM_INSTRUCTIONS,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      messages: modelMessages,
      tools: { scrape_page: createScrapePage(firecrawlScrape) },
      stopWhen: isStepCount(MAX_STEPS),
      providerOptions: {
        anthropic: {
          thinking: { type: "adaptive", display: "summarized" },
          effort: "high",
          fallbacks: "default",
        },
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("💥 Agent API error:", error);
    return new Response("Failed to generate response", { status: 500 });
  }
}
