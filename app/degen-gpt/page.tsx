import MultiAgentChat from "@/components/chat/multi-agent-chat";

export default function DegenGPTPage() {
  return (
    <main className="h-screen flex flex-col overflow-hidden">
      <div className="flex-shrink-0 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
        <h1 className="text-3xl font-bold">DegenGPT 🎯</h1>
        <p className="text-sm opacity-90 mt-1">
          Multi-Agent Sports Betting Advisor - Expert analysis across all sports
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <MultiAgentChat />
      </div>
    </main>
  );
}
