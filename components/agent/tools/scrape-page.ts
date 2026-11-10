import { tool } from "ai";
import { z } from "zod";
import {
  ALLOWED_RESEARCH_DOMAINS,
  isAllowedResearchUrl,
} from "@/lib/allowed-domains";

// Takes only a URL, so scraped pages can't steer the model into crawls,
// browser actions or requests to attacker-controlled sites.
export const createScrapePage = (firecrawlScrape: {
  execute: (args: { url: string }, options: unknown) => Promise<unknown>;
}) =>
  tool({
    description: `Read one sports or betting web page. Only these sites and their subdomains can be read: ${ALLOWED_RESEARCH_DOMAINS.join(", ")}`,
    inputSchema: z.object({
      url: z.string().describe("Full URL of the page to read"),
    }),
    execute: async ({ url }, options) => {
      if (!isAllowedResearchUrl(url)) {
        console.warn(`🚫 Blocked scrape of disallowed URL: ${url}`);
        return { error: "This site is not on the allowed list." };
      }

      console.log(`🔧 Scraping page: ${url}`);
      try {
        return await firecrawlScrape.execute({ url }, options);
      } catch (error) {
        console.error(`💥 Scrape error:`, error);
        return { error: "The page could not be read." };
      }
    },
  });
