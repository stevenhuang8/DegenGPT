import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentUpgrade: "security",
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            // Scripts and styles aren't restricted here because Next.js needs
            // inline ones without nonces. img-src is what stops image-based leaks.
            key: "Content-Security-Policy",
            value:
              "img-src 'self' data: blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
