import { tool } from "ai";
import { z } from "zod";

/**
 * Tool for retrieving team and player statistics
 * Essential for making informed betting decisions
 */
export const getTeamStats = tool({
  description:
    "Retrieve comprehensive team or player statistics including recent performance, head-to-head records, home/away splits, and advanced metrics. Use this to gather data for betting analysis.",
  inputSchema: z.object({
    sport: z
      .string()
      .describe(
        "The sport (e.g., 'NFL', 'NBA', 'Soccer', 'CS2', 'LoL', 'MLB', 'NHL')"
      ),
    team: z
      .string()
      .describe(
        "Team name or player name to get statistics for (e.g., 'Kansas City Chiefs', 'LeBron James')"
      ),
    statsType: z
      .enum([
        "recent_form",
        "season_stats",
        "head_to_head",
        "home_away_splits",
        "advanced_metrics",
        "injury_report",
      ])
      .describe(
        "Type of statistics to retrieve: recent_form (last 5-7 games), season_stats (full season), head_to_head (vs specific opponent), home_away_splits, advanced_metrics (efficiency, pace, etc.), injury_report"
      ),
    opponent: z
      .string()
      .optional()
      .describe(
        "Opponent team name (required for head_to_head stats, optional for others)"
      ),
    timeframe: z
      .string()
      .optional()
      .describe(
        "Specific timeframe (e.g., 'last_10_games', '2024_season', 'last_30_days')"
      ),
  }),
  execute: async ({ sport, team, statsType, opponent, timeframe }) => {
    console.log(
      `📈 Retrieving ${statsType} stats for ${team} in ${sport}${opponent ? ` vs ${opponent}` : ""}`
    );

    // In production, this would call real sports data APIs (ESPN, TheOddsAPI, etc.)
    // For demonstration, we'll return structured mock data
    const mockStatsData = {
      sport: sport,
      team: team,
      opponent: opponent,
      statsType: statsType,
      timeframe: timeframe || "current_season",
      lastUpdated: new Date().toISOString(),
      data: generateMockStats(sport, team, statsType, opponent),
    };

    console.log(`✅ Stats retrieved for ${team}`);

    return mockStatsData;
  },
});

// Helper function to generate realistic mock stats
function generateMockStats(
  sport: string,
  team: string,
  statsType: string,
  opponent?: string
) {
  const baseStats: Record<string, any> = {
    recent_form: {
      record: "4-1",
      lastFiveGames: [
        { result: "W", opponent: "Team A", score: "110-105" },
        { result: "W", opponent: "Team B", score: "98-92" },
        { result: "L", opponent: "Team C", score: "88-95" },
        { result: "W", opponent: "Team D", score: "115-108" },
        { result: "W", opponent: "Team E", score: "102-97" },
      ],
      pointsPerGame: 102.6,
      pointsAllowed: 99.4,
      atsRecord: "3-2",
      overUnderRecord: "2-3",
      trend: "Hot - winning 4 of last 5",
    },
    season_stats: {
      wins: 28,
      losses: 15,
      winPercentage: 0.651,
      pointsPerGame: 112.3,
      pointsAllowed: 108.7,
      offensiveRating: 115.2,
      defensiveRating: 110.5,
      pace: 99.8,
      atsRecord: "25-18",
      overUnderRecord: "22-21",
      homeRecord: "16-6",
      awayRecord: "12-9",
    },
    head_to_head: {
      opponent: opponent || "Opponent",
      allTimeRecord: "15-10",
      last5Meetings: [
        { date: "2024-01-15", result: "W 108-102" },
        { date: "2023-12-10", result: "L 95-98" },
        { date: "2023-11-05", result: "W 112-105" },
        { date: "2023-10-20", result: "W 100-97" },
        { date: "2023-09-15", result: "L 88-92" },
      ],
      recentRecord: "3-2",
      averagePointDifferential: "+4.2",
      atsRecordVsOpponent: "3-2",
    },
    home_away_splits: {
      home: {
        record: "16-6",
        pointsPerGame: 115.8,
        pointsAllowed: 106.2,
        atsRecord: "14-8",
      },
      away: {
        record: "12-9",
        pointsPerGame: 108.5,
        pointsAllowed: 111.4,
        atsRecord: "11-10",
      },
      note: "Significantly better at home (+7.3 PPG)",
    },
    advanced_metrics: {
      offensiveEfficiency: 115.2,
      defensiveEfficiency: 110.5,
      netRating: "+4.7",
      pace: 99.8,
      effectiveFG: "54.2%",
      turnoverRate: "12.8%",
      reboundRate: "51.3%",
      freeThrowRate: "0.245",
      threePointRate: "38.5%",
    },
    injury_report: {
      injuries: [
        {
          player: "Star Player",
          position: "PG",
          status: "Questionable",
          injury: "Ankle sprain",
          impactLevel: "High",
        },
        {
          player: "Role Player",
          position: "SF",
          status: "Out",
          injury: "Knee injury",
          impactLevel: "Medium",
        },
      ],
      healthStatus:
        "Questionable - key player may miss game, monitor injury report",
    },
  };

  return baseStats[statsType] || { note: "Stats not available" };
}
