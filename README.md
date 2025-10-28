# DegenGPT - AI Sports Betting & Gambling Advisory Platform

Multi-agent AI platform for sports betting analysis and gambling advisory, powered by Next.js 15, TypeScript, AI SDK 5, and GPT-5 with RAG integration.

## Features

### Three Specialized AI Agents

1. **Simple Agent** - Web-search-enabled betting advisor
   - Gathers customer information and bet parameters
   - Conducts real-time web research on teams, odds, and trends
   - Provides analysis with reasoning capabilities

2. **RAG Agent** - Knowledge-base-powered sports betting assistant
   - Access to comprehensive sports betting and gambling knowledge base
   - Automatic source citation from retrieved documents
   - Multi-step tool execution for complex queries

3. **Agent with MCP Tools** - Web scraping and data extraction
   - Powered by Firecrawl MCP server integration
   - Dynamic web scraping, crawling, and data extraction
   - Logged tool execution for transparency

### Core Capabilities

- Streaming responses with AI SDK 5 `streamText()`
- Vectorize RAG integration for document retrieval
- Tool execution monitoring with visual status indicators
- Source citation display with collapsible views
- Reasoning token support for extended thinking
- shadcn/ui design system with AI Elements components
- TypeScript with full type safety

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create `.env.local` file with required environment variables:

   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   VECTORIZE_ACCESS_TOKEN=your_vectorize_token
   VECTORIZE_ORG_ID=your_org_id
   VECTORIZE_PIPELINE_ID=your_pipeline_id
   FIRECRAWL_API_KEY=your_firecrawl_key  # Optional, for MCP agent
   ```

3. Start development:
   ```bash
   pnpm dev
   ```

Open [http://localhost:3001](http://localhost:3001) to access the agent selection page.

## Agent Details

### 1. Simple Agent (`/simple-agent`)
- **API Route**: `/api/chat`
- **Model**: OpenAI GPT-5 with web search tool
- **Purpose**: Betting advisory with real-time research
- **Collects**: Bet amount, bet type, sport, selection details
- **Research**: Team trends, injuries, line movements, public sentiment
- **Output**: Risk assessment with probability calculations

### 2. RAG Agent (`/rag-agent`)
- **API Route**: `/api/rag-agent`
- **Model**: OpenAI GPT-5 with Vectorize RAG
- **Purpose**: Knowledge base-powered sports betting assistant
- **Tool**: `retrieveKnowledgeBaseSimple` (2 documents per query)
- **Knowledge**: Betting terminology, strategies, odds, casino games
- **Output**: Cited answers with source URLs and responsible gambling disclaimers

### 3. Agent with MCP Tools (`/agent-with-mcp-tools`)
- **API Route**: `/api/agent-with-mcp-tools`
- **Model**: OpenAI GPT-5 with Firecrawl MCP
- **Purpose**: Web scraping and data extraction
- **Tools**: Dynamic Firecrawl tools (scrape, crawl, search, extract)
- **Output**: Structured data from websites with execution logging

## Technologies

- [Next.js 15](https://nextjs.org/) - React framework with App Router and Turbopack
- [AI SDK 5](https://ai-sdk.dev/) - AI integration toolkit (v5.0.44+)
- [AI Elements](https://ai-sdk.dev/elements/overview) - Pre-built AI components
- [Vectorize](https://vectorize.ai/) - RAG document retrieval service
- [Firecrawl MCP](https://firecrawl.dev/) - Web scraping MCP server
- [shadcn/ui](https://ui.shadcn.com/) - Component library (New York style)
- [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript

## Architecture & Data Flow

```text
+---------------------------+         +--------------------------------+         +---------------------------+
|      Browser UI           |         |    Next.js API Routes          |         |    External Services      |
| `ChatAssistant`           |         | /api/chat                      |         | - OpenAI GPT-5            |
|  - useChat() hook         |         | /api/rag-agent                 |         | - Vectorize RAG           |
|  - AI Elements UI         |         | /api/agent-with-mcp-tools      |         | - Firecrawl MCP           |
|  - Tool status display    |         |                                |         |                           |
|  - Source citations       |         | streamText() with:             |         |                           |
+---------------------------+         |  - GPT-5 model                 |         |                           |
            |                         |  - Tools (web search, RAG)     |         |                           |
            | 1) sendMessage({ text })|  - Multi-step execution        |         |                           |
            |------------------------>|  - stopWhen: stepCountIs(10)   |         |                           |
            |                         +--------------------------------+         |                           |
            |                                         |                           |                           |
            |                                         | 2) Call tools/model       |                           |
            |                                         |-------------------------->|                           |
            |                                         |                           |                           |
            |                                         |    3) Tool results/text   |                           |
            | 4) Stream response parts               |<--------------------------|                           |
            |<----------------------------------------|                           |                           |
            | - Text chunks                           |                           |                           |
            | - Tool calls (input/output)             |                           |                           |
            | - Reasoning tokens                      |                           |                           |
            | - Source URLs                           |                           |                           |
            |                                         |                           |                           |
            | 5) Render with debouncing (30ms)       |                           |                           |
            v                                         v                           v

Message Format: parts[] array with typed parts (text, tool-*, reasoning, source-url)
Streaming: toUIMessageStreamResponse() for client compatibility
Tools: Auto-collapse on success, stay open on error
Sources: Extracted from tool results and displayed below messages
```

## Project Structure

```
DegenGPT/
├── app/
│   ├── api/
│   │   ├── chat/route.ts                    # Simple agent endpoint
│   │   ├── rag-agent/route.ts               # RAG agent endpoint
│   │   └── agent-with-mcp-tools/route.ts    # MCP agent endpoint
│   ├── page.tsx                              # Agent selection page
│   ├── simple-agent/page.tsx
│   ├── rag-agent/page.tsx
│   └── agent-with-mcp-tools/page.tsx
├── components/
│   ├── agent/
│   │   ├── prompt.ts                        # Simple agent system prompt
│   │   ├── rag-prompt.ts                    # RAG agent system prompt
│   │   ├── web-scraper-prompt.ts            # MCP agent system prompt
│   │   └── tools/
│   │       ├── retrieve-knowledge-base.ts           # Full RAG tool
│   │       ├── retrieve-knowledge-base-simple.ts    # Simplified RAG tool
│   │       └── index.ts
│   ├── chat/
│   │   └── chat-assistant.tsx               # Main chat component with useChat
│   ├── ai-elements/                         # Vercel AI Elements components
│   └── ui/                                  # shadcn/ui components
├── lib/
│   ├── retrieval/
│   │   └── vectorize.ts                     # Vectorize RAG service
│   ├── mcp/
│   │   └── client/
│   │       └── firecrawl-client.ts          # Firecrawl MCP client
│   └── utils.ts
└── types/
    ├── chat.ts
    └── vectorize.ts
```

## Development Commands

```bash
pnpm dev              # Start dev server with Turbopack (port 3001)
pnpm build            # Build production app
pnpm start            # Start production server
pnpm tsc --noEmit     # Check TypeScript errors (run after code changes)
```

## Key Implementation Details

### useChat Hook Usage
```typescript
// CORRECT: Send messages as UIMessage-compatible objects
sendMessage({ text: "What are the best betting strategies?" });

// INCORRECT: Plain strings don't work
sendMessage("This will cause runtime errors");  // ❌
```

### Message Structure
```typescript
// Messages use parts[] array, NOT simple content field
message.parts.forEach(part => {
  if (part.type === "text") console.log(part.text);
  if (part.type === "tool") console.log(part.toolName, part.result);
  if (part.type === "reasoning") console.log(part.reasoning);
});
```

### Tool Execution
- Multi-step agent loops with `stopWhen: stepCountIs(10)`
- Tools automatically stream results to frontend
- Visual status: input-streaming → input-available → output-available
- Auto-collapse on success, stay open on errors

### RAG Integration
- `VectorizeService` retrieves 2 documents per query
- Results include similarity scores and source URLs
- Sources automatically extracted and displayed
- Formatted context provided to AI model
