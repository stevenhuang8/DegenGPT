"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bot, Database, Wrench, Target } from "lucide-react";

export default function AgentNavbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/simple-agent", label: "Simple", icon: Bot },
    { href: "/rag-agent", label: "RAG", icon: Database },
    { href: "/agent-with-mcp-tools", label: "MCP", icon: Wrench },
    { href: "/degen-gpt", label: "DegenGPT", icon: Target },
  ];

  return (
    <nav className="border-b border-white/20 bg-black/30 backdrop-blur-sm">
      <div className="flex items-center gap-1 p-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                ${
                  isActive
                    ? "bg-white/20 text-white font-semibold"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
