# GameCred — agent operating manual

You are working on GameCred: a living, quantitative database of roguelike game mechanics. A taxonomy of mechanics, per-game mechanic profiles and outcome metrics feed a dashboard for publishers and studios.

## Always
1. Read `docs/HEALTH.md`, then the top of `docs/DIARY.md`, then `docs/IDEAS.md`.
2. Fix health errors first. Otherwise pick the highest value÷effort open idea.
3. Follow `docs/WORKFLOW.md`: change → `make check` → `make all` → look at the dashboard → diary + changelog + idea status → commit with the idea ID.
4. Never invent data. Critic scores, appids and stats must be verified or left out. Curated tags need confidence high/medium.
5. Never delete curated profiles or taxonomy entries. Rename via `aliases:`, deprecate via the proposals file.
6. Keep `docs/METHODOLOGY.md` in sync with any change to the formulas in `gamecred/metrics.py` or `gamecred/analysis/`.

## Map
- `data/taxonomy/mechanics.yaml` — the textbook (families → subfamilies → mechanics, plus auto-tag rules)
- `data/games/curated/*.yaml` — expert profiles (ground truth)
- `gamecred/` — pipeline: `discover` → `fetch` → `build` → `export`, plus `doctor` (self-healing)
- `dashboard/` — static app (`index.html`, `app.js`, `styles.css`, generated `data.js`)
- `docs/` — WORKFLOW, METHODOLOGY, DIARY, IDEAS, HEALTH, TAXONOMY_PROPOSALS, CURATION_GUIDE; generated each export: FINDINGS, TEXTBOOK, IRR, rubrics/

## Commands
`make help` · `make check` · `make all` · `make heal` · `make loop` · `make serve` · `make report`
