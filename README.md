# GameCred

**A living, quantitative database of roguelike game mechanics.** Games are broken into mechanics, and each mechanic is linked to player reception, estimated revenue and critic scores. The result answers the question publishers fund on vibes: *which mechanics does a game in this genre need, and how risky is this design?*

- **The textbook.** A taxonomy of 155 mechanics in 10 families (`data/taxonomy/mechanics.yaml`): run structure, meta-progression, build & power scaling, items & economy, combat model, enemy design, risk & double-edged design, social & longevity, genre hybrids, QoL.
- **The database.** About 3,000 Steam roguelikes (≥ 50 reviews), plus 200+ expert-curated mechanic profiles with evidence lines. The long tail is auto-tagged from Steam tags and store text, and calibrated against the curated set.
- **The numbers.** For each mechanic and subgenre: its effect on a Success Index (quality + commercial + critic), bootstrap CIs, ridge partial effects that control for co-occurring mechanics, price, year and subgenre, hit lift, flop risk, synergies and trends. Verdicts: *table stakes · differentiator · positive · risk reducer · neutral · red flag*.
- **The product.** A dashboard (`dashboard/index.html`):
  - Overview, Mechanics, Families, Games and Trends views
  - **Design Lab**: tag a design and get a predicted score, risk, nearest comps, missing table stakes, red flags and the highest-leverage additions, plus a copyable pitch report and a share link
- **Publisher rubrics.** `docs/rubrics/*.md` gives per-subgenre "must have x, y, z" checklists.

## Quick start
```bash
make setup          # venv + deps
make serve          # dashboard at http://127.0.0.1:8765 (data is committed)
```
Full refresh: `make discover fetch all`. Daily maintenance: `make loop` (self-healing rebuild + tests + diary line).

## How it works
`discover` (SteamSpy tags) → `fetch` (Steam store, reviews, SteamSpy; cached + retrying) → `build` (merge curated + auto-tags, compute metrics, SQLite at `data/processed/gamecred.sqlite`) → `export` (analyses → `dashboard/data.js`, rubrics) → `doctor` (validate, repair, calibrate, report to `docs/HEALTH.md`).

See [docs/WORKFLOW.md](docs/WORKFLOW.md) for the improvement loop and self-healing, [docs/METHODOLOGY.md](docs/METHODOLOGY.md) for every formula and caveat, [docs/DIARY.md](docs/DIARY.md) for the build log, and [docs/IDEAS.md](docs/IDEAS.md) for the roadmap.

## Honest limits
These results are associations, not causes. Revenue is a review-multiplier estimate (set `GAMALYTIC_API_KEY` to use Gamalytic). Games with fewer than 50 reviews are excluded, so failure is under-sampled. Use the curated / high-confidence scopes for decisions.
