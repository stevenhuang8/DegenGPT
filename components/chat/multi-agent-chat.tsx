"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type ToolUIPart } from "ai";
import { useState, useEffect, useRef, memo } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import {
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source,
} from "@/components/ai-elements/sources";
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai-elements/reasoning";
import { Response } from "@/components/ai-elements/response";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AgentType =
  | "orchestrator"
  | "football"
  | "basketball"
  | "soccer"
  | "csgo"
  | "lol";

interface Agent {
  id: AgentType;
  name: string;
  description: string;
  icon: string;
  api: string;
  color: string;
}

const AGENTS: Agent[] = [
  {
    id: "orchestrator",
    name: "Main Advisor",
    description: "Intelligent router for all sports and general betting advice",
    icon: "🎯",
    api: "/api/orchestrator",
    color: "bg-purple-500",
  },
  {
    id: "football",
    name: "Football Expert",
    description: "NFL and College Football specialist",
    icon: "🏈",
    api: "/api/football-agent",
    color: "bg-orange-500",
  },
  {
    id: "basketball",
    name: "Basketball Expert",
    description: "NBA and NCAA Basketball specialist",
    icon: "🏀",
    api: "/api/basketball-agent",
    color: "bg-red-500",
  },
  {
    id: "soccer",
    name: "Soccer Expert",
    description: "Global football leagues specialist",
    icon: "⚽",
    api: "/api/soccer-agent",
    color: "bg-green-500",
  },
  {
    id: "csgo",
    name: "CS2 Expert",
    description: "Counter-Strike 2 esports specialist",
    icon: "🎮",
    api: "/api/csgo-agent",
    color: "bg-blue-500",
  },
  {
    id: "lol",
    name: "LoL Expert",
    description: "League of Legends esports specialist",
    icon: "🎲",
    api: "/api/lol-agent",
    color: "bg-indigo-500",
  },
];

// RAG Tool types
type RAGToolInput = {
  query: string;
};

type RAGToolOutput = {
  context: string;
  sources: Array<{
    sourceType: "url";
    id: string;
    url: string;
    title: string;
  }>;
  chatSources?: Array<{
    url: string;
    title: string;
  }>;
};

type RAGToolUIPart = ToolUIPart<{
  retrieveKnowledgeBase: {
    input: RAGToolInput;
    output: RAGToolOutput;
  };
}>;

// Memoized components for better performance
const MemoizedToolCall = memo(
  ({
    toolPart,
    displayName,
    shouldBeExpanded,
  }: {
    toolPart: RAGToolUIPart;
    displayName: string;
    shouldBeExpanded: boolean;
  }) => (
    <Tool defaultOpen={shouldBeExpanded}>
      <ToolHeader type={displayName as any} state={toolPart.state} />
      <ToolContent>
        {toolPart.state === "input-streaming" && (
          <div className="text-sm text-muted-foreground p-2">
            🔍 {displayName}...
          </div>
        )}
        {toolPart.input && toolPart.state !== "input-streaming" && (
          <ToolInput input={toolPart.input} />
        )}
        {toolPart.output && (
          <ToolOutput output={toolPart.output} errorText={toolPart.errorText} />
        )}
      </ToolContent>
    </Tool>
  )
);

MemoizedToolCall.displayName = "MemoizedToolCall";

const MemoizedMessage = memo(
  ({
    message,
    isStreaming,
    children,
  }: {
    message: any;
    isStreaming: boolean;
    children?: React.ReactNode;
  }) => {
    const textParts =
      message.parts?.filter((p: any) => p.type === "text") || [];

    return (
      <>
        {(textParts.length > 0 || message.content) && (
          <Message from={message.role}>
            <MessageContent>
              <Response>
                {textParts.map((part: any, i: number) => part.text).join("") ||
                  message.content ||
                  ""}
              </Response>
            </MessageContent>
            {children}
          </Message>
        )}
      </>
    );
  }
);

MemoizedMessage.displayName = "MemoizedMessage";

// Tool display name mapping
const toolDisplayNames: Record<string, string> = {
  "tool-retrieveKnowledgeBase": "Knowledge Base Search",
  "tool-compareOdds": "Comparing Odds",
  "tool-getTeamStats": "Retrieving Team Stats",
  "tool-analyzeTrends": "Analyzing Trends",
  "tool-getInjuryReport": "Checking Injury Report",
  "tool-web_search": "Web Search",
};

// Chat instance component
function ChatInstance({ agent }: { agent: Agent }) {
  const [input, setInput] = useState("");

  const { messages: rawMessages, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({ api: agent.api }),
  });

  // Debounced messages for performance
  const [debouncedMessages, setDebouncedMessages] = useState(rawMessages);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastRawMessagesRef = useRef(rawMessages);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const needsImmediateUpdate = () => {
      if (status !== "streaming" && lastRawMessagesRef.current !== rawMessages) {
        return true;
      }

      const hasNewToolCalls = rawMessages.some(
        (msg) =>
          (msg as any).parts?.some((p: any) => p.type?.startsWith("tool-")) &&
          !lastRawMessagesRef.current.some((oldMsg) => oldMsg.id === msg.id)
      );

      if (hasNewToolCalls) {
        return true;
      }

      return false;
    };

    if (needsImmediateUpdate()) {
      setDebouncedMessages(rawMessages);
      lastRawMessagesRef.current = rawMessages;
    } else {
      debounceTimerRef.current = setTimeout(() => {
        setDebouncedMessages(rawMessages);
        lastRawMessagesRef.current = rawMessages;
      }, 30);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [rawMessages, status]);

  const messages = debouncedMessages;

  const handleSubmit = async (
    message: { text?: string; files?: any[] },
    event: React.FormEvent
  ) => {
    if (!message.text?.trim() || status === "streaming") return;

    const form = (event.target as Element)?.closest("form") as HTMLFormElement;
    if (form) {
      form.reset();
    }

    sendMessage({ text: message.text });
    setInput("");
  };

  const isLoading = status === "streaming";

  return (
    <>
      {/* Chat Messages */}
      <Conversation className="flex-1 min-h-0">
        <ConversationContent className="space-y-6 p-6 text-base leading-relaxed">
          {messages.length === 0 ? (
            <ConversationEmptyState
              title={`Chat with ${agent.name}`}
              description={`Ask about ${agent.description.toLowerCase()}. Switch agents anytime using the dropdown above.`}
            />
          ) : (
            (() => {
              const flowItems: Array<{
                type: "message" | "tool-call" | "reasoning";
                data: any;
                id: string;
                messageId?: string;
                displayName?: string;
                partIndex?: number;
              }> = [];

              messages.forEach((message) => {
                const parts = (message as any).parts || [];

                parts.forEach((part: any, partIndex: number) => {
                  if (part.type?.startsWith("tool-")) {
                    const uniqueId =
                      part.toolCallId ||
                      part.id ||
                      `${message.id}-${part.type}-${partIndex}`;

                    flowItems.push({
                      type: "tool-call",
                      data: part,
                      id: `tool-${uniqueId}`,
                      messageId: message.id,
                      displayName: toolDisplayNames[part.type] || part.type,
                      partIndex,
                    });
                  } else if (part.type === "reasoning") {
                    flowItems.push({
                      type: "reasoning",
                      data: part,
                      id: `reasoning-${message.id}-${partIndex}`,
                      messageId: message.id,
                      partIndex,
                    });
                  }
                });

                const messageWithTextOnly = {
                  ...message,
                  parts: parts.filter(
                    (part: any) => part.type === "text" || !part.type
                  ),
                };

                const hasContent =
                  messageWithTextOnly.parts.length > 0 ||
                  !!(message as any).content;
                if (hasContent) {
                  flowItems.push({
                    type: "message",
                    data: messageWithTextOnly,
                    id: `message-${message.id}`,
                  });
                }
              });

              return flowItems.map((item, itemIndex) => {
                if (item.type === "tool-call") {
                  const toolPart = item.data as RAGToolUIPart;
                  const shouldBeExpanded = false;

                  return (
                    <div key={item.id} className="w-full mb-6">
                      <MemoizedToolCall
                        toolPart={toolPart}
                        displayName={item.displayName || toolPart.type}
                        shouldBeExpanded={shouldBeExpanded}
                      />
                    </div>
                  );
                } else if (item.type === "reasoning") {
                  const reasoningPart = item.data;

                  return (
                    <div key={item.id} className="w-full mb-6">
                      <Reasoning isStreaming={isLoading} className="mb-6">
                        <ReasoningTrigger />
                        <ReasoningContent>
                          {reasoningPart.text || ""}
                        </ReasoningContent>
                      </Reasoning>
                    </div>
                  );
                } else {
                  const message = item.data;

                  const sourcesComponent =
                    message.role === "assistant" &&
                    (() => {
                      const hasRealTextContent =
                        message.parts?.some(
                          (p: any) => p.type === "text" && p.text?.trim()
                        ) || message.content?.trim();

                      if (!hasRealTextContent) {
                        return null;
                      }

                      let toolSources: any[] = [];

                      for (let i = itemIndex - 1; i >= 0; i--) {
                        const prevItem = flowItems[i];
                        if (prevItem.type === "tool-call") {
                          const toolData = prevItem.data as RAGToolUIPart;
                          if (
                            toolData.type === "tool-retrieveKnowledgeBase" &&
                            toolData.output?.sources
                          ) {
                            toolSources = toolData.output.sources;
                            break;
                          }
                        }
                      }

                      if (toolSources.length > 0) {
                        return (
                          <div className="mt-4">
                            <Sources>
                              <SourcesTrigger count={toolSources.length} />
                              <SourcesContent>
                                {toolSources.map((source: any, i: number) => (
                                  <Source
                                    key={`source-${item.id}-${i}`}
                                    href={source.url}
                                    title={source.title}
                                  />
                                ))}
                              </SourcesContent>
                            </Sources>
                          </div>
                        );
                      }
                      return null;
                    })();

                  return (
                    <div key={item.id} className="w-full">
                      <MemoizedMessage message={message} isStreaming={isLoading} />
                      {sourcesComponent}
                    </div>
                  );
                }
              });
            })()
          )}
        </ConversationContent>
      </Conversation>

      {/* Input Area */}
      <div className="p-6 flex-shrink-0">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              placeholder={`Ask ${agent.name} anything...`}
              className="min-h-[80px] text-base"
            />
            <PromptInputToolbar>
              <div />
              <PromptInputSubmit status={isLoading ? "submitted" : undefined} />
            </PromptInputToolbar>
          </PromptInputBody>
        </PromptInput>
      </div>
    </>
  );
}

// Main component with agent selection
export default function MultiAgentChat({
  selectedAgent: controlledAgent,
}: {
  selectedAgent?: Agent;
} = {}) {
  const [internalAgent, setInternalAgent] = useState<Agent>(AGENTS[0]);
  const selectedAgent = controlledAgent || internalAgent;

  return (
    <div className="flex flex-col h-full">
      {/* Chat Instance - keyed by agent ID to force remount on agent change */}
      <ChatInstance key={selectedAgent.id} agent={selectedAgent} />
    </div>
  );
}

// Export agent selection components for use in page header
export function AgentSelector({
  selectedAgent,
  onAgentChange,
}: {
  selectedAgent: Agent;
  onAgentChange: (agentId: string) => void;
}) {
  return (
    <Select value={selectedAgent.id} onValueChange={onAgentChange}>
      <SelectTrigger className="w-[280px] bg-white/10 border-white/20 text-white">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {AGENTS.map((agent) => (
          <SelectItem key={agent.id} value={agent.id}>
            <div className="flex items-center gap-2">
              <span>{agent.icon}</span>
              <div>
                <div className="font-medium">{agent.name}</div>
                <div className="text-xs text-muted-foreground">
                  {agent.description}
                </div>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { AGENTS, type Agent, type AgentType };
