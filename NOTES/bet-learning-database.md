# Bet learning database

Proposed 2026-11-09. Nothing here is built yet. Odds API details come from `NOTES/sportsbook-apis.md`.

## Recommendation

Build a graded log of the agents' picks. A database alone won't make the agents learn, because the model doesn't retrain on this data. "Learning" here means measuring which picks worked and feeding those results back into the prompt.

## Current state

- No database and no login.
- Each chat only exists in the request.
- The rate limiter in `lib/guardrails.ts` is in-memory.

## What to store

Store every recommendation as structured data:

- Sport, market and selection
- Odds at the time of the pick
- The agent's estimated probability
- Stake
- Reasoning
- Which agent made the pick
- Timestamp

Add the result and closing line once the game ends.

Use regular Postgres, not Vectorize. The useful questions are totals like "ROI on NBA unders by agent", not similarity searches.

## Key constraints

### Capturing picks

Opus 5.5 rejects forced tool calls, so a `recordPick` tool would be skipped some of the time and skew the data. Extract picks from the finished response in `onEnd` instead.

### Grading

Grading needs real scores and closing odds, because web-searched odds aren't reliable enough. The Odds API covers both for traditional sports. It doesn't list esports, so CS2 and LoL would need another source.

### Small samples

Telling a 55% bettor from a 52.4% break-even bettor at -110 takes roughly 1,500 bets (two standard errors). Without a safeguard, an agent will see an 8-2 streak and treat it as an edge.

Grade mainly on:

- Whether picks beat the closing line
- Whether stated probabilities were accurate (calibration)

Both show signal much sooner than wins and losses.

### Feedback to agents

Give agents only aggregate stats with sample sizes. Hide any category below a minimum count (say 100 picks). Raw past wins would encourage them to pattern-match on noise.

## Build order

1. Add the database and automatic pick logging.
2. Add a scheduled job that grades picks, plus a simple performance page.
3. Once there are a few hundred graded picks, add the aggregate stats to the agents' context.

Step 1 is worth doing soon because the data only starts accumulating once logging is live. Step 3 should wait, because it does more harm than good on thin data.

## Open decision

Track the agents' picks or the bets the user actually places?

Recommended: start with the agents' picks. That needs no login and directly measures whether the agents are any good.

Tracking real bets needs:

- Accounts
- A real privacy policy, since `app/privacy/page.tsx` is placeholder text
- Responsible-gambling safeguards, so that loss history doesn't fuel advice to chase losses
