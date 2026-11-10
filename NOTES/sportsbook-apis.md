# Sportsbook and sports data APIs

Researched 2026-11-09. Prices come from each provider's own site on that date and change often, so re-check before buying. No provider was signed up for or called.

## Current decision

The agents use Claude's web search and web fetch for odds, injuries and stats. The four mock tools are no longer connected to any route, because they returned hardcoded sample numbers:

- `components/agent/tools/compare-odds.ts`
- `components/agent/tools/get-team-stats.ts`
- `components/agent/tools/get-injury-report.ts`
- `components/agent/tools/analyze-trends.ts`

The files are kept as a starting point. Each one should say plainly when it has no data instead of returning sample numbers.

## Recommended setup when connecting real data

Roughly $110 a month for NFL and NBA.

### Odds (`compareOdds`): The Odds API

https://the-odds-api.com/

- Covers NFL, NBA, MLB, NHL and major soccer leagues, with DraftKings, FanDuel, BetMGM, Caesars and others. No esports listed.
- Plans: free 500 credits/month, $30 for 20,000, $59 for 100,000, $119 for 5M, $249 for 15M.
- `/odds` cost is markets x regions. Moneyline, spread and total for one region is 3 credits. `/events` is free. `/scores` is 1, or 2 with `daysFrom`.
- Player props use the event-specific odds endpoint, for selected sports and bookmakers.
- Historical snapshots go back to 2020 through a separate endpoint.
- Terms allow displaying data in a commercial app and storing it. Reselling it as a raw data product is not allowed.
- Cache results and fetch on demand. Polling every league every few minutes would use more than 100,000 credits a month.
- Set `ODDS_API_KEY` in `.env.local`.

### Stats and injuries (`getTeamStats`, `getInjuryReport`): BALLDONTLIE

https://www.balldontlie.io/ (NBA docs: https://docs.balldontlie.io/, NFL docs: https://nfl.balldontlie.io/)

- Priced per league: All-Star $9.99, GOAT $39.99. All-Access is $299.99 for 20+ leagues. A note on its pricing says NBA, EuroLeague and Liga ACB need separate paid subscriptions, so confirm what All-Access includes.
- NBA: injuries from All-Star. Standings, team season averages, odds and props need GOAT.
- NFL: standings, team season stats and injuries from All-Star. Odds and props need GOAT.
- The free tier has teams and games only, so testing needs a paid plan.
- MLB, NHL and soccer tier tables were not checked. They can differ by league.
- Terms allow commercial use and lawful gambling-industry use, and forbid relying on the data as the sole source for settling a wager.

## Harder parts

### Trends (`analyzeTrends`)

No clean API for against-the-spread records was found. They can be computed from closing lines (Odds API historical snapshots) and final scores. No source was found for public betting or sharp money percentages, so remove those trend types rather than fake them. SportsDataIO has a historical betting archive through sales, and Betalytics lists NFL and NBA historical endpoints, but neither was evaluated.

### Esports (CS2, League of Legends)

- BALLDONTLIE has CS2 (https://cs.balldontlie.io/) and LoL (https://lol.balldontlie.io/) match stats, on GOAT at $39.99 per game. No odds.
- PandaScore (https://www.pandascore.co/pricing) has a free fixtures tier and stats from EUR 400 per game per month. Its stats plans are not available for betting use without contacting sales.
- Odds-api.io (https://odds-api.io/pricing) starts at GBP 49 for 2 bookmakers. CS2 and LoL coverage is stated in its marketing pages but not on its pricing page.
- OddsPapi and OpticOdds also claim esports odds. Their claims are self-reported.

## Alternatives considered

- SportsGameOdds (https://sportsgameodds.com/pricing/): free tier of 2,500 objects, $99 Rookie with 3-minute updates, $299 Pro with sub-minute updates and historical data. Props on every plan, billed per game. No esports. Worth a look if props become the priority.
- OpticOdds: sales-quoted, aimed at operators.
- Sportradar: enterprise, sales-quoted. One vendor puts it at $10,000+ a month, which is unconfirmed.
- DraftKings and FanDuel: no public API found, so access goes through an aggregator.
- Pinnacle: one vendor says public API access ended in July 2025, which is unconfirmed.

## Not verified

- API-Sports pricing (its site returned 403).
- SportsDataIO pricing (its pricing page returned 404).
- Odds update frequency on The Odds API.

## Suggested build order

1. `compareOdds`, since it is the most valuable and free to try.
2. `getInjuryReport` and `getTeamStats`.
3. `analyzeTrends`, computed from closing lines and final scores.
