import { tool } from "ai";
import { z } from "zod";

/**
 * Tool for analyzing betting trends and historical patterns
 * Helps identify value and betting edges
 */
export const analyzeTrends = tool({
  description:
    "Analyze betting trends and historical patterns for teams, players, or specific bet types. Identifies situational trends (e.g., 'team X is 8-2 ATS after a loss', 'over hits 70% in division games'). Use this to find betting edges and value.",
  inputSchema: z.object({
    sport: z
      .string()
      .describe(
        "The sport (e.g., 'NFL', 'NBA', 'Soccer', 'CS2', 'LoL', 'MLB', 'NHL')"
      ),
    trendType: z
      .enum([
        "ats_trends",
        "over_under_trends",
        "situational_trends",
        "prop_trends",
        "public_betting",
        "sharp_money",
      ])
      .describe(
        "Type of trend analysis: ats_trends (against the spread), over_under_trends (totals), situational_trends (specific scenarios), prop_trends (player props), public_betting (where public money is), sharp_money (where sharp bettors are)"
      ),
    team: z
      .string()
      .optional()
      .describe(
        "Team or player to analyze trends for (optional, for general trends leave blank)"
      ),
    situation: z
      .string()
      .optional()
      .describe(
        "Specific situation to analyze (e.g., 'after a loss', 'as home underdog', 'on back-to-back', 'in primetime')"
      ),
    timeframe: z
      .string()
      .optional()
      .describe(
        "Timeframe for trend analysis (e.g., 'this_season', 'last_3_seasons', 'last_20_games')"
      ),
  }),
  execute: async ({ sport, trendType, team, situation, timeframe }) => {
    console.log(
      `📊 Analyzing ${trendType} trends for ${team || "general"} in ${sport}${situation ? ` - ${situation}` : ""}`
    );

    // In production, this would analyze real historical betting data
    // For demonstration, we'll return structured trend analysis
    const trendAnalysis = generateTrendAnalysis(
      sport,
      trendType,
      team,
      situation,
      timeframe
    );

    console.log(`✅ Trend analysis complete`);

    return {
      sport: sport,
      trendType: trendType,
      team: team,
      situation: situation,
      timeframe: timeframe || "current_season",
      analysis: trendAnalysis,
      confidence:
        trendAnalysis.record.split("-").length > 1
          ? calculateConfidence(trendAnalysis.record)
          : "Medium",
      recommendation: generateRecommendation(trendAnalysis),
    };
  },
});

function generateTrendAnalysis(
  sport: string,
  trendType: string,
  team?: string,
  situation?: string,
  timeframe?: string
) {
  const trendData: Record<string, any> = {
    ats_trends: {
      record: "18-8 ATS",
      winPercentage: "69.2%",
      breakdown: {
        asHome: "10-3 ATS",
        asAway: "8-5 ATS",
        asFavorite: "12-6 ATS",
        asUnderdog: "6-2 ATS",
      },
      streak: "Currently 5-1 ATS in last 6 games",
      notes: [
        "Strong ATS performer this season",
        "Particularly good as home favorite (8-1 ATS)",
        "Public tends to overvalue this team, creating value on opponents",
      ],
      edge: "High value on opponents when this team is heavily favored",
    },
    over_under_trends: {
      record: "15-11 Over",
      winPercentage: "57.7%",
      breakdown: {
        homeGames: "9-4 Over",
        awayGames: "6-7 Over",
        vsDivision: "8-2 Over",
        vsConference: "7-9 Over",
      },
      averageTotal: 218.5,
      averageActualScore: 222.3,
      trend: "Games averaging 3.8 points over the total",
      notes: [
        "Overs trending in home games (69% hit rate)",
        "Division games run hot due to familiarity and pace",
        "Weather not a factor (indoor venue)",
      ],
      edge: "Value on overs in divisional home games",
    },
    situational_trends: {
      record: "12-3 ATS",
      winPercentage: "80%",
      situation: situation || "After a loss",
      occurrences: 15,
      breakdown: [
        "Strong bounce-back team",
        "Coach makes adjustments well",
        "Players respond with urgency",
      ],
      historicalContext: "Team has covered in 12 of last 15 games after losses",
      recentPerformance: "5-0 ATS in last 5 post-loss games",
      notes: [
        "Elite bounce-back record",
        "Public often fades teams after losses, creating value",
        "Coach's adjustments historically effective",
      ],
      edge: "Strong play on this team after losses, especially as underdog",
    },
    prop_trends: {
      player: team || "Star Player",
      propType: "Points over/under",
      overRecord: "14-8 Over (63.6%)",
      averageLine: 25.5,
      averageActual: 27.8,
      breakdown: {
        vsTopDefenses: "8-4 Over",
        vsBottomDefenses: "6-4 Over",
        atHome: "9-3 Over",
        onRoad: "5-5 Over",
      },
      matchupFactors: [
        "Usage rate increases against zone defenses",
        "Historically performs well in primetime games",
        "Benefits from faster pace opponents",
      ],
      notes: [
        "Consistently exceeding prop lines",
        "Books may be slow to adjust",
        "Home games provide significant boost (+3.2 PPG)",
      ],
      edge: "Value on overs, especially in home games vs fast-paced teams",
    },
    public_betting: {
      publicMoney: "78% on Team A",
      sharpMoney: "65% on Team B",
      ticketCount: "82% on Team A",
      dollarAmount: "68% on Team A",
      lineMovement: "Line moved from -3.5 to -3 despite public on favorite",
      analysis:
        "Public heavily on favorite, but line moving toward underdog indicates sharp money",
      notes: [
        "Reverse line movement detected",
        "Sharp bettors taking underdog",
        "Public overreacting to last game's performance",
      ],
      edge: "Value on Team B (underdog) - fade the public",
    },
    sharp_money: {
      sharpSide: team || "Team B",
      sharpPercentage: "72%",
      openingLine: "-3.5",
      currentLine: "-4.5",
      lineMovement: "+1 point toward sharp side",
      steamMoves: [
        {
          time: "9:00 AM PT",
          movement: "-3.5 to -4",
          source: "Multiple sharp books",
        },
        {
          time: "10:30 AM PT",
          movement: "-4 to -4.5",
          source: "Offshore sharp action",
        },
      ],
      analysis:
        "Sharp money driving line movement. Steam moves indicate professional action.",
      notes: [
        "Line moving despite public on opposite side",
        "Multiple steam moves in same direction",
        "Sharp books moved first, others followed",
      ],
      edge: "Follow sharp money - significant edge when this pronounced",
    },
  };

  return (
    trendData[trendType] || {
      record: "N/A",
      notes: ["Trend data not available for this combination"],
    }
  );
}

function calculateConfidence(record: string): string {
  const [wins, losses] = record.split("-").map((n) => parseInt(n.trim()));
  const winRate = wins / (wins + losses);

  if (winRate >= 0.65) return "High";
  if (winRate >= 0.55) return "Medium";
  return "Low";
}

function generateRecommendation(analysis: any): string {
  if (analysis.edge) {
    return `${analysis.edge}. Consider this trend when making betting decisions, but always combine with current form and other factors.`;
  }
  return "Use this trend as one data point in your overall analysis. No single trend should dictate a bet.";
}
