# NOT HERE

> Seven years after you drowned, you walk back into the town that never stopped
> grieving you.

A branching narrative mystery set in Port Lorn — a fog-locked ferry town on a
tidal causeway, British coast, spring 1971. Playable in the browser and in the
terminal from one shared engine. The score is one broken six-bar song, and the
game is, musically, the act of reassembling it.

**Content note:** grief, memory loss, death of a sibling, ambiguous
self-dissolution.

## Status

Phase 0 — foundations. See [design/PLAN.md](design/PLAN.md) for the build plan,
[design/game-bible.md](design/game-bible.md) for the canonical design reference,
and [design/decisions.md](design/decisions.md) for locked decisions and spike
outcomes.

## Repository layout

```
design/            the game bible, twist recontext table, decision log, research
packages/engine    pure deterministic core: advance(state, input) → {state', output, events}
packages/memory    witnessed-facts ledger, derived relationship axes, salience dialogue rules
packages/music     score-as-data: JSON songs → one synth engine, both platforms
packages/story     scene graph + ink prose fragments
packages/ai        AIAdapter: none | bring-your-own-key | proxy
apps/web           browser build (Vite; CRT ledger aesthetic)
apps/cli           terminal build (the same town heard through a thinner wall)
apps/proxy         spend-capped edge function for LLM touchpoints
auditions/         rendered WAVs of the score, for listening (gitignored)
```

## Development

```sh
pnpm install
pnpm typecheck
pnpm test

# render the score to auditions/*.wav
node packages/music/scripts/render-audition.ts
```

Music is text: every cue is data (`packages/music/scores/`) rendered by the same
engine in the browser, the terminal, and the audition pipeline.
