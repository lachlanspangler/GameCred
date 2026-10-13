# GameCred Workflow

GameCred runs on one repeatable loop. Humans and AI agents follow the same steps, and each step leaves a written trail.

```
 ┌─► 1 IDEATE ──► 2 RECORD ──► 3 PRIORITIZE ──► 4 CHANGE ──► 5 VERIFY ──► 6 HEAL ──► 7 LOG ─┐
 └──────────────────────────────────────────────────────────────────────────────────────────┘
```

| Step | What | Where |
|---|---|---|
| 1 Ideate | Use data gaps, doctor warnings, curator feedback, user/publisher questions, dashboard friction | — |
| 2 Record | One line per idea with an ID (`I-###`), value 1–5, effort 1–5 | `docs/IDEAS.md` |
| 3 Prioritize | Pick the highest value÷effort idea that isn't blocked. Health errors in `docs/HEALTH.md` always come first | `docs/IDEAS.md` |
| 4 Change | Make the smallest change that delivers the idea. Taxonomy changes go through `docs/TAXONOMY_PROPOSALS.md` first | code / data |
| 5 Verify | `make check` (profile validation + tests), then `make all` and look at the dashboard (`make serve`) | terminal / browser |
| 6 Heal | `make heal` repairs what can be repaired automatically (see below). If something can't be repaired, record a new idea | `docs/HEALTH.md` |
| 7 Log | Write a diary entry (what changed, what was learned, what's next), add a changelog line, mark the idea done, commit with the idea ID | `docs/DIARY.md`, `CHANGELOG.md` |

`make loop` runs steps 5–7 non-interactively (`scripts/loop.sh`), so it can go in cron or CI.

## Self-healing: what `make heal` does

| Problem | Automatic repair |
|---|---|
| Mechanic id typo/alias in a profile (`deck_building`) | resolved to canonical id (`deckbuilding`) and the file is rewritten |
| Intensity out of range / not an int | clamped / coerced |
| Profile missing its own subgenre tag | added at intensity 3 |
| Corrupt JSON in the raw cache | deleted (refetched on next fetch) |
| Curated game with no raw data | fetched |
| Auto-tag rule that disagrees with curated ground truth | precision measured; < 30% → suppressed, else its confidence = measured precision (`data/taxonomy/calibration.json`) |
| Dashboard older than dataset | rebuilt |
| Network flakiness / rate limits | exponential backoff, cache-first, resumable |

Problems it reports but won't change without a human/agent decision: unknown mechanic ids that aren't close to any real one, duplicate appids, dead mechanics (0 games), non-discriminating mechanics (> 90% of games), auto-tagger blind spots.

**Two-strike rule:** if the same check fails twice in a row after healing, stop and open an idea with the failure output. Don't patch around it.

## Recipes

**Add a curated game.** Copy `data/games/curated/slay_the_spire.yaml`, verify the appid via
`https://store.steampowered.com/api/storesearch/?term=NAME&cc=us`, tag the mechanics (1 present / 2 significant / 3 core pillar), add evidence lines for non-obvious tags, run `make check`, then `make heal all`.

**Add or rename a mechanic.** Add it to `docs/TAXONOMY_PROPOSALS.md` with 2+ example games. When accepting it, edit `data/taxonomy/mechanics.yaml`, bump `version`, and add the old id to `aliases:` if it's a rename (profiles heal automatically). Re-tag the example games, then `make heal all`.

**Refresh market data.** `make fetch` reuses the cache: reviews are refreshed after 14 days, store/tag data after 30–60. Then `make all`.

**Expand the universe.** `make discover`, then `make fetch` and `make all`. The universe is every SteamSpy roguelike-tagged app with ≥ 50 reviews.

**Enable Gamalytic revenue.** `export GAMALYTIC_API_KEY=...` before `make fetch`. Revenue estimates then use Gamalytic numbers instead of the review-multiplier method (see `gamecred/sources/gamalytic.py`).

## Diary conventions

`docs/DIARY.md` is newest-first for human entries. Automated lines from the doctor and the loop are appended under **Automated log** at the bottom. A human/agent entry looks like:

```
## 2026-10-13 — <title>
**Changed:** …   **Learned:** …   **Next:** …   **Ideas:** I-012 done, I-019 added
```
