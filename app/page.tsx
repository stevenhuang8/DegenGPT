import Link from "next/link";

export default function Home() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/imgs/betting-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="flex flex-col gap-6 relative z-10">
        <Link
          href="/simple-agent"
          className="px-16 py-6 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-2xl shadow-2xl hover:bg-white/20 hover:border-white/50 hover:scale-105 hover:shadow-white/20 transition-all duration-300 text-center"
        >
          <div className="text-2xl font-bold">Simple Agent</div>
          <div className="text-sm text-white/70 mt-1">Basic AI assistant</div>
        </Link>
        <Link
          href="/rag-agent"
          className="px-16 py-6 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-2xl shadow-2xl hover:bg-white/20 hover:border-white/50 hover:scale-105 hover:shadow-white/20 transition-all duration-300 text-center"
        >
          <div className="text-2xl font-bold">RAG Agent</div>
          <div className="text-sm text-white/70 mt-1">Knowledge base powered assistant</div>
        </Link>
        <Link
          href="/agent-with-mcp-tools"
          className="px-16 py-6 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-2xl shadow-2xl hover:bg-white/20 hover:border-white/50 hover:scale-105 hover:shadow-white/20 transition-all duration-300 text-center"
        >
          <div className="text-2xl font-bold">Agent with MCP Tools</div>
          <div className="text-sm text-white/70 mt-1">Advanced assistant with extended capabilities</div>
        </Link>
      </div>
    </div>
  );
}
