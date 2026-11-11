// Sites the agents may read. Page content is untrusted and can carry prompt
// injection, so research is limited to known sports and betting sources.
// Subdomains are covered: "espn.com" also allows "www.espn.com".
// Only list sites that allow Anthropic's crawler: the API rejects the whole
// request (400) if any allowed domain blocks it (bbc.com and transfermarkt.com do).
export const ALLOWED_RESEARCH_DOMAINS = [
  // General sports news and scores
  "espn.com",
  "cbssports.com",
  "foxsports.com",
  "sports.yahoo.com",
  "skysports.com",
  "sofascore.com",
  "flashscore.com",
  "rotowire.com",

  // Leagues
  "nba.com",
  "nfl.com",
  "ncaa.com",
  "premierleague.com",
  "uefa.com",
  "fifa.com",
  "laliga.com",

  // Stats
  "basketball-reference.com",
  "pro-football-reference.com",
  "fbref.com",
  "whoscored.com",
  "understat.com",

  // Odds and betting markets
  "actionnetwork.com",
  "covers.com",
  "oddsshark.com",
  "oddsportal.com",
  "vegasinsider.com",
  "draftkings.com",
  "fanduel.com",
  "betmgm.com",
  "pinnacle.com",

  // Esports
  "hltv.org",
  "liquipedia.net",
  "gol.gg",
  "oracleselixir.com",
  "lolesports.com",
  "lol.fandom.com",
  "dotesports.com",

  // Casino rules and responsible gambling
  "wizardofodds.com",
  "ncpgambling.org",
];

export function isAllowedResearchUrl(rawUrl: string): boolean {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return false;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  if (url.username || url.password) return false;

  const host = url.hostname.toLowerCase();
  return ALLOWED_RESEARCH_DOMAINS.some(
    (domain) => host === domain || host.endsWith(`.${domain}`)
  );
}
