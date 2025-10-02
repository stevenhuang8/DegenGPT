import ChatAssistant from "@/components/chat/chat-assistant";

export default function SimpleAgentPage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative flex items-center justify-center p-4"
      style={{ backgroundImage: "url('/imgs/betting-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 h-[90vh] w-full max-w-4xl flex flex-col bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
        <div className="border-b border-white/20 p-4 bg-black/20 backdrop-blur-sm">
          <h1 className="text-xl font-semibold text-white">AI Chat Assistant</h1>
        </div>

        <div className="flex-1 overflow-hidden [&_.text-muted-foreground]:text-white/80 [&_h3]:text-white [&_p]:text-white/90 [&_textarea]:text-black [&_textarea::placeholder]:text-white/60 [&_.bg-secondary]:bg-white/20 [&_.text-foreground]:text-black [&_.bg-primary]:bg-white/30 [&_.is-assistant_.text-foreground]:text-black [&_.is-assistant]:text-black [&_.is-assistant_*]:text-black">
          <ChatAssistant />
        </div>
      </div>
    </div>
  );
}