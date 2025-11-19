import { tool } from "ai";
import { z } from "zod";

/**
 * Tool for retrieving current injury reports and player availability
 * Critical for accurate betting analysis
 */
export const getInjuryReport = tool({
  description:
    "Get the latest injury report and player availability status for a team or game. Essential for betting decisions as injuries significantly impact outcomes. Use this before making any betting recommendations.",
  inputSchema: z.object({
    sport: z
      .string()
      .describe(
        "The sport (e.g., 'NFL', 'NBA', 'Soccer', 'NHL', 'MLB', 'CS2', 'LoL')"
      ),
    team: z
      .string()
      .describe(
        "Team name to get injury report for (e.g., 'Kansas City Chiefs', 'Los Angeles Lakers')"
      ),
    event: z
      .string()
      .optional()
      .describe(
        "Specific upcoming game/match (e.g., 'Chiefs vs Bills on Sunday') for game-specific injury status"
      ),
  }),
  execute: async ({ sport, team, event }) => {
    console.log(
      `🏥 Retrieving injury report for ${team} in ${sport}${event ? ` for ${event}` : ""}`
    );

    // In production, this would call real injury report APIs (ESPN, official league APIs, etc.)
    // For demonstration, we'll return structured mock injury data
    const injuryReport = generateInjuryReport(sport, team, event);

    console.log(
      `✅ Injury report retrieved. ${injuryReport.injuries.length} players on report.`
    );

    return {
      sport: sport,
      team: team,
      event: event,
      lastUpdated: new Date().toISOString(),
      injuryReport: injuryReport,
      impactAnalysis: analyzeInjuryImpact(injuryReport),
      bettingImplications: generateBettingImplications(injuryReport),
    };
  },
});

function generateInjuryReport(sport: string, team: string, event?: string) {
  // Mock injury data - in production this would come from real APIs
  const mockInjuries = [
    {
      player: "Star Quarterback",
      position: "QB",
      injury: "Shoulder injury",
      status: "Questionable",
      practiceParticipation: ["DNP", "Limited", "Limited"],
      impactLevel: "Critical",
      replacementPlayer: "Backup QB",
      notes:
        "Game-time decision. Monitor warm-ups. Has played through similar injury before.",
      lastGameMissed: null,
      expectedReturn: "This week (uncertain)",
    },
    {
      player: "Top Wide Receiver",
      position: "WR1",
      injury: "Hamstring strain",
      status: "Doubtful",
      practiceParticipation: ["DNP", "DNP", "DNP"],
      impactLevel: "High",
      replacementPlayer: "WR2",
      notes:
        "Unlikely to play. Hamstrings often linger. Team hasn't ruled him out but outlook is poor.",
      lastGameMissed: "Week 10",
      expectedReturn: "Week 12-13",
    },
    {
      player: "Starting Left Tackle",
      position: "LT",
      injury: "Ankle sprain",
      status: "Out",
      practiceParticipation: ["DNP", "DNP", "DNP"],
      impactLevel: "High",
      replacementPlayer: "Backup OL",
      notes:
        "Will miss this game. Significant downgrade in pass protection. QB may face more pressure.",
      lastGameMissed: "Week 10",
      expectedReturn: "Week 12",
    },
    {
      player: "Backup Running Back",
      position: "RB2",
      injury: "Illness",
      status: "Probable",
      practiceParticipation: ["Limited", "Full", "Full"],
      impactLevel: "Low",
      replacementPlayer: "RB3",
      notes: "Expected to play. Minor impact on game plan.",
      lastGameMissed: null,
      expectedReturn: "Available",
    },
  ];

  return {
    team: team,
    sport: sport,
    event: event,
    reportDate: new Date().toISOString(),
    injuries: mockInjuries,
    totalInjuries: mockInjuries.length,
    criticalInjuries: mockInjuries.filter((i) => i.impactLevel === "Critical")
      .length,
    highImpactInjuries: mockInjuries.filter((i) => i.impactLevel === "High")
      .length,
    healthStatus: determineHealthStatus(mockInjuries),
  };
}

function determineHealthStatus(injuries: any[]): string {
  const critical = injuries.filter((i) => i.impactLevel === "Critical").length;
  const high = injuries.filter((i) => i.impactLevel === "High").length;

  if (critical > 0) return "Critical - Key player status uncertain";
  if (high >= 2) return "Compromised - Multiple important players injured";
  if (high === 1) return "Manageable - One key injury to monitor";
  return "Healthy - No significant injury concerns";
}

function analyzeInjuryImpact(injuryReport: any) {
  const critical = injuryReport.injuries.filter(
    (i: any) => i.impactLevel === "Critical"
  );
  const high = injuryReport.injuries.filter(
    (i: any) => i.impactLevel === "High"
  );

  return {
    overallImpact: injuryReport.healthStatus,
    keyInjuries: [...critical, ...high].map((i: any) => ({
      player: i.player,
      position: i.position,
      status: i.status,
      impact: i.impactLevel,
    })),
    offensiveImpact:
      critical.length > 0 || high.length >= 2 ? "Significant" : "Minimal",
    defensiveImpact: "Minimal", // Would be calculated based on defensive injuries
    specialTeamsImpact: "None",
    summary:
      critical.length > 0
        ? `Critical injury concern with ${critical[0].player} (${critical[0].status}). This significantly impacts the team's outlook.`
        : high.length >= 2
          ? `Multiple high-impact injuries could affect performance. Monitor status closely.`
          : `No critical injuries. Team relatively healthy.`,
  };
}

function generateBettingImplications(injuryReport: any) {
  const critical = injuryReport.injuries.filter(
    (i: any) => i.impactLevel === "Critical"
  );
  const questionable = injuryReport.injuries.filter(
    (i: any) => i.status === "Questionable"
  );

  const implications = [];

  if (critical.length > 0) {
    implications.push({
      type: "Line Movement Risk",
      description: `${critical[0].player}'s status (${critical[0].status}) could cause significant line movement. If ruled out, expect line to move 2-3 points.`,
      recommendation:
        "Wait for official injury report before betting, or bet early if you believe they'll play.",
    });
  }

  if (questionable.length > 0) {
    implications.push({
      type: "Game-Time Decision",
      description: `${questionable.length} player(s) listed as questionable. Final status announced ~90 minutes before game.`,
      recommendation:
        "For player props, wait for confirmation. For game bets, factor in both scenarios.",
    });
  }

  implications.push({
    type: "Totals Impact",
    description:
      injuryReport.injuries.filter(
        (i: any) =>
          i.impactLevel === "High" &&
          (i.position === "QB" || i.position === "WR1")
      ).length > 0
        ? "Offensive injuries may lower scoring potential. Consider under."
        : "No significant impact on scoring expected.",
    recommendation:
      "Injuries to skill position players typically lower totals. Defensive injuries can increase totals.",
  });

  return {
    implications: implications,
    riskLevel:
      critical.length > 0
        ? "High"
        : questionable.length >= 2
          ? "Medium"
          : "Low",
    recommendation:
      critical.length > 0 || questionable.length >= 2
        ? "Exercise caution. Consider waiting for injury updates or reducing bet size due to uncertainty."
        : "Injury situation is relatively stable. Proceed with normal bet sizing.",
  };
}
