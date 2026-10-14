# Ideas backlog

Score = value ÷ effort (each 1–5). Status: `open` · `doing` · `done` · `parked`. Newest ideas are added at the bottom with the next free ID.

## Data coverage
| ID | Idea | V | E | Status |
|---|---|---|---|---|
| I-001 | Curate 250+ games across all subgenres with ≥30% mid/low performers | 5 | 3 | doing |
| I-002 | Wiki scraper: pull item/relic/enemy/boss counts from Fandom/wiki.gg MediaWiki APIs into `stats` | 5 | 3 | done (v1: discovery, article/edit counts, category sizes) |
| I-003 | Gamalytic integration (API key) to replace review-multiplier revenue | 5 | 1 | open (needs key) |
| I-004 | IGN/OpenCritic scores: manual import CSV + OpenCritic API adapter | 3 | 2 | open |
| I-005 | Pull Steam review *text* samples, mine praise/complaint terms per mechanic ("too grindy" ↔ meta-progression) | 4 | 3 | open |
| I-006 | Time-series: monthly review velocity and CCU history (SteamDB/SteamCharts) → longevity metric | 4 | 3 | open |
| I-007 | Add console/mobile roguelikes (not on Steam) via manual profiles with alternative outcome sources | 2 | 4 | parked |
| I-008 | Profile Risk of Rain 2 and Slay the Spire 2 (curator gaps) | 4 | 1 | done |

## Taxonomy
| ID | Idea | V | E | Status |
|---|---|---|---|---|
| I-010 | Taxonomy v2: review the ~33 curator proposals in TAXONOMY_PROPOSALS.md, accept those with ≥3 example games | 5 | 2 | done (v2: +34, v3: +14) |
| I-015 | Taxonomy v3: pickup_magnet_economy, minute_spawn_schedule, adjacency_placement, skill_tags, aim_mode_options (survivors curator) | 3 | 2 | open |
| I-011 | Split `time_pressure` into real-time vs per-turn escalation | 3 | 1 | open |
| I-012 | Numeric mechanic parameters (e.g. reward choices offered per pick, run length) as continuous features | 4 | 3 | open |
| I-014 | Subgenre alignment: twin-stick/top-down shooters → one subgenre consistently (curators disagreed) | 4 | 1 | done — rule: hybrid_shooter = FPS/TPS/3D only; top-down → action roguelite (+hybrid_shooter 2) |
| I-013 | Mechanic "lineage" graph: which game introduced/popularised each mechanic (first-appearance year) | 4 | 3 | open |

## Analysis
| ID | Idea | V | E | Status |
|---|---|---|---|---|
| I-020 | Propensity-score matching per mechanic as a robustness check on ridge | 4 | 3 | done (NN matching on mechanic fingerprint) |
| I-021 | Gradient-boosted model + SHAP-style attributions for non-linear interactions | 4 | 3 | open |
| I-022 | Temporal holdout: train on ≤2021 releases, test on 2022+ → honest predictive accuracy | 5 | 2 | done |
| I-023 | Trend lines: mechanic prevalence by release year (rising/declining mechanics) | 4 | 1 | done |
| I-024 | Saturation detector: diminishing returns of a mechanic as genre prevalence rises | 3 | 2 | open |
| I-025 | Mechanic clusters (archetype discovery) via co-occurrence / NMF → "design archetypes" | 4 | 2 | done (NMF k=12) |
| I-026 | Separate quality vs commercial models in the Lab ("will it sell" vs "will players love it") | 4 | 1 | done |
| I-027 | Developer-experience covariate (prior titles count, prior success) to reduce confounding | 5 | 3 | done (within-dataset pedigree) |

## Dashboard / product
| ID | Idea | V | E | Status |
|---|---|---|---|---|
| I-030 | Shareable Lab URLs (state encoded in hash) for pitch decks | 4 | 1 | done |
| I-031 | "Compare two games" side-by-side fingerprint view | 4 | 2 | done |
| I-032 | Printable one-page PDF pitch report | 4 | 2 | done (print CSS) |
| I-033 | Trend tab (from I-023) with small multiples per family | 3 | 2 | open |
| I-034 | Publisher rubric export: per-subgenre "must have x, y, z" checklist (Markdown/PDF) | 5 | 1 | done (Markdown) |
| I-035 | AI-game rubric mode: score a design doc pasted as text via auto-tagger → Lab | 5 | 2 | done (keyword v1) |
| I-036 | Deploy dashboard via GitHub Pages | 4 | 1 | open |

## Workflow / reliability
| ID | Idea | V | E | Status |
|---|---|---|---|---|
| I-040 | GitHub Action: weekly `make fetch all`, commit data + diary line | 4 | 2 | open |
| I-041 | Doctor: flag taxonomy steam_tags not present in any game's Steam tags (dead rules) | 3 | 1 | done |
| I-042 | Inter-rater check: second agent independently re-tags 20 games; report agreement (Cohen's κ) per mechanic | 5 | 2 | done — κ=0.72 on 30 games; docs/IRR.md |
| I-043 | Baseline-checklist sweep: re-check the 13 most-forgotten mechanics across all curated profiles | 4 | 2 | open |
