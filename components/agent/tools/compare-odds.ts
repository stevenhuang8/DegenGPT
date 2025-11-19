import { tool } from "ai";
import { z } from "zod";

/**
 * Tool for comparing betting odds across multiple sportsbooks
 * Helps users find the best value for their bets
 */
export const compareOdds = tool({
  description:
    "Compare betting odds across multiple sportsbooks (DraftKings, FanDuel, BetMGM, etc.) to find the best value for a specific bet. Use this when users want to know where to get the best odds.",
  inputSchema: z.object({
    sport: z
      .string()
      .describe(
        "The sport for the bet (e.g., 'NFL', 'NBA', 'Soccer', 'CS2', 'LoL')"
      ),
    betType: z
      .string()
      .describe(
        "Type of bet (e.g., 'moneyline', 'spread', 'total', 'player_prop')"
      ),
    event: z
      .string()
      .describe(
        "The specific game or match (e.g., 'Chiefs vs. Bills', 'Lakers vs. Warriors')"
      ),
    selection: z
      .string()
      .optional()
      .describe(
        "Specific selection if needed (e.g., 'Chiefs -3', 'Over 215.5', 'LeBron over 25.5 points')"
      ),
  }),
  execute: async ({ sport, betType, event, selection }) => {
    console.log(`📊 Comparing odds for: ${event} - ${betType}`);

    // In production, this would call real sportsbook APIs
    // For now, we'll return a structured response that demonstrates the functionality
    const mockOddsData = {
      event: event,
      betType: betType,
      sport: sport,
      selection: selection,
      lastUpdated: new Date().toISOString(),
      sportsbooks: [
        {
          name: "DraftKings",
          odds: "-110",
          line: selection || "N/A",
          link: "https://sportsbook.draftkings.com",
        },
        {
          name: "FanDuel",
          odds: "-108",
          line: selection || "N/A",
          link: "https://sportsbook.fanduel.com",
        },
        {
          name: "BetMGM",
          odds: "-112",
          line: selection || "N/A",
          link: "https://sports.betmgm.com",
        },
        {
          name: "Caesars",
          odds: "-110",
          line: selection || "N/A",
          link: "https://www.caesars.com/sportsbook",
        },
      ],
      bestOdds: {
        sportsbook: "FanDuel",
        odds: "-108",
        note: "Best value for this bet",
      },
      analysis:
        "FanDuel offers the best odds at -108, which provides better value compared to other sportsbooks. Line shopping can increase your long-term profitability.",
    };

    console.log(
      `✅ Odds comparison complete. Best odds: ${mockOddsData.bestOdds.sportsbook} at ${mockOddsData.bestOdds.odds}`
    );

    return {
      oddsData: mockOddsData,
      summary: `Compared odds across 4 major sportsbooks. ${mockOddsData.bestOdds.sportsbook} has the best odds at ${mockOddsData.bestOdds.odds}.`,
      recommendation:
        "Always shop for the best odds - even small differences add up over time. The difference between -108 and -112 is significant over many bets.",
    };
  },
});
