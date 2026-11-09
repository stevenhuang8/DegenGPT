/**
 * Firecrawl MCP Client using SSE Transport
 * Documentation: https://docs.firecrawl.dev/mcp-server
 * AI SDK MCP Integration: https://ai-sdk.dev/cookbook/node/mcp-tools
 */

import { createMCPClient } from "@ai-sdk/mcp";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import type { MCPClientConfig } from "./types";

export class FirecrawlMCPClient {
  private client: Awaited<
    ReturnType<typeof createMCPClient>
  > | null = null;
  private apiKey: string;
  private serverUrl: string;
  private isConnected: boolean = false;

  constructor(config: MCPClientConfig) {
    this.apiKey = config.apiKey;
    this.serverUrl =
      config.serverUrl || `https://mcp.firecrawl.dev/${config.apiKey}/v2/sse`;
  }

  /**
   * Initialize the MCP client connection
   */
  async connect(): Promise<void> {
    if (this.isConnected && this.client) {
      console.log("🔗 Firecrawl MCP client already connected");
      return;
    }

    try {
      console.log("🚀 Connecting to Firecrawl MCP server via SSE...");

      const transport = new SSEClientTransport(new URL(this.serverUrl));

      this.client = await createMCPClient({
        transport,
      });

      this.isConnected = true;
      console.log("✅ Firecrawl MCP client connected successfully");
    } catch (error) {
      console.error("💥 Failed to connect to Firecrawl MCP server:", error);
      throw new Error(
        `Failed to connect to Firecrawl MCP server: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Disconnect the MCP client
   */
  async disconnect(): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      await this.client.close();
      this.client = null;
      this.isConnected = false;
      console.log("🔌 Firecrawl MCP client disconnected");
    } catch (error) {
      console.error("⚠️ Error during MCP client disconnect:", error);
    }
  }

  /**
   * Get all available Firecrawl tools
   * Returns tools that can be used with AI SDK's generateText/streamText
   */
  async getTools(): Promise<Record<string, any>> {
    if (!this.isConnected || !this.client) {
      await this.connect();
    }

    if (!this.client) {
      throw new Error("MCP client not initialized");
    }

    try {
      console.log("🔧 Retrieving Firecrawl MCP tools...");
      const tools = await this.client.tools();
      console.log(`✅ Retrieved ${Object.keys(tools).length} Firecrawl tools`);
      return tools;
    } catch (error) {
      console.error("💥 Failed to retrieve Firecrawl tools:", error);
      throw new Error(
        `Failed to retrieve Firecrawl tools: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Get the connection status
   */
  isClientConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get the underlying MCP client instance
   */
  getClient() {
    return this.client;
  }
}

/**
 * Singleton instance for Firecrawl MCP client
 */
let firecrawlClientInstance: FirecrawlMCPClient | null = null;

/**
 * Get or create a Firecrawl MCP client instance
 */
export function getFirecrawlMCPClient(apiKey?: string): FirecrawlMCPClient {
  if (!firecrawlClientInstance) {
    const key = apiKey || process.env.FIRECRAWL_API_KEY;

    if (!key) {
      throw new Error(
        "FIRECRAWL_API_KEY not found. Please set it in .env.local or pass it to getFirecrawlMCPClient()"
      );
    }

    firecrawlClientInstance = new FirecrawlMCPClient({ apiKey: key });
  }

  return firecrawlClientInstance;
}

/**
 * Reset the singleton instance (useful for testing or reconfiguration)
 */
export function resetFirecrawlMCPClient(): void {
  if (firecrawlClientInstance) {
    firecrawlClientInstance.disconnect().catch(console.error);
    firecrawlClientInstance = null;
  }
}
