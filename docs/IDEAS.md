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
| I-016 | Taxonomy v4: add hybrid_narrative subgenre (WORLD OF HORROR, Red Lantern, Sunless Sea, Curious Expedition) + reassign; corpse_run, knowledge_progression, soft_run_limit, dice_placement | 4 | 2 | open |
| I-017 | Wiki-researched curation of the long tail (agents read MediaWiki pages, cite evidence) | 5 | 2 | doing |
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

<!-- AUTO-IDEAS:START -->
## Auto-generated ideas (rewritten every export by `gamecred/ideas.py`)

Ranked by value ÷ effort. Promote one by copying it into a table above with a new I-### id.

| # | Kind | Idea | V | E | Why |
|---|---|---|---|---|---|
| A1 | opportunity | Trend bet: **Explicit Synergies** is rising (+2.1 pp/yr) and positive (Δ +2.2) | 4 | 1 | momentum + payoff |
| A2 | opportunity | Trend bet: **Passive Relics / Trinkets** is rising (+1.0 pp/yr) and positive (Δ +3.2) | 4 | 1 | momentum + payoff |
| A3 | opportunity | Trend bet: **Roguelike Deckbuilder** is rising (+1.2 pp/yr) and positive (Δ +2.3) | 4 | 1 | momentum + payoff |
| A4 | opportunity | Saturation warning: **Survivors-like** is rising (+1.3 pp/yr) but negative (Δ -4.2) | 4 | 1 | crowding into a weak pattern |
| A5 | opportunity | White space: **Multi-phase Bosses** games earn 3.7× median revenue but only 19 use it; build a design brief | 5 | 2 | high $, low competition |
| A6 | opportunity | White space: **Pre-run Mutators / Challenge Runs** games earn 3.6× median revenue but only 19 use it; build a design brief | 5 | 2 | high $, low competition |
| A7 | opportunity | White space: **Stress / Sanity Meter** games earn 3.1× median revenue but only 16 use it; build a design brief | 5 | 2 | high $, low competition |
| A8 | opportunity | White space: **Luck Stat** games earn 2.9× median revenue but only 17 use it; build a design brief | 5 | 2 | high $, low competition |
| A9 | opportunity | White space: **In-run Clock / Day Cycle** games earn 2.8× median revenue but only 25 use it; build a design brief | 5 | 2 | high $, low competition |
| A10 | opportunity | White space: **Codex / Compendium** games earn 2.7× median revenue but only 38 use it; build a design brief | 5 | 2 | high $, low competition |
| A11 | data | Curate 15+ more games featuring **Breeding / Genetics** (Δ -13.3 on only n=4) | 4 | 2 | large effect, too few games to trust it |
| A12 | data | Curate 15+ more games featuring **Momentum Movement** (Δ +6.1 on only n=4) | 4 | 2 | large effect, too few games to trust it |
| A13 | data | Curate 15+ more games featuring **Dual Action Resources** (Δ -8.1 on only n=4) | 4 | 2 | large effect, too few games to trust it |
| A14 | data | Curate 15+ more games featuring **Unkillable Pursuer** (Δ +9.7 on only n=8) | 4 | 2 | large effect, too few games to trust it |
| A15 | data | Curate 15+ more games featuring **Speedrun Support** (Δ +8.3 on only n=10) | 4 | 2 | large effect, too few games to trust it |
| A16 | data | Curate 15+ more games featuring **Gradual Complexity Unlock** (Δ +12.9 on only n=7) | 4 | 2 | large effect, too few games to trust it |
| A17 | research | Case study: why did **The Binding of Isaac** beat its design score (96 vs 59)? Find the missing mechanic | 4 | 2 | the model misses something |
| A18 | research | Case study: why did **Content Warning** beat its design score (99 vs 64)? Find the missing mechanic | 4 | 2 | the model misses something |
| A19 | research | Case study: why did **SNKRX** beat its design score (84 vs 50)? Find the missing mechanic | 4 | 2 | the model misses something |
| A20 | data | Add a critic-score source (only 286/2476 games have one): OpenCritic API or IGN import | 4 | 2 | critic component is sparse |
| A21 | data | Tighten the estimate for **Extraction / Bank-out** (95% CI width 17 pts): curate more games | 3 | 2 | wide confidence interval |
| A22 | data | Tighten the estimate for **Per-card / Per-item Modifiers** (95% CI width 14 pts): curate more games | 3 | 2 | wide confidence interval |
| A23 | data | Tighten the estimate for **Lifesteal / Sustain on Hit** (95% CI width 18 pts): curate more games | 3 | 2 | wide confidence interval |
| A24 | data | Tighten the estimate for **Luck Stat** (95% CI width 16 pts): curate more games | 3 | 2 | wide confidence interval |
| A25 | data | Tighten the estimate for **Interest / Economy Management** (95% CI width 15 pts): curate more games | 3 | 2 | wide confidence interval |
| A26 | data | Tighten the estimate for **Item Identification** (95% CI width 21 pts): curate more games | 3 | 2 | wide confidence interval |
| A27 | data | Tighten the estimate for **Ship / Base Layout Design** (95% CI width 16 pts): curate more games | 3 | 2 | wide confidence interval |
| A28 | data | Tighten the estimate for **Rhythm Timing** (95% CI width 15 pts): curate more games | 3 | 2 | wide confidence interval |
| A29 | data | Tighten the estimate for **Dice Mechanics** (95% CI width 16 pts): curate more games | 3 | 2 | wide confidence interval |
| A30 | data | Tighten the estimate for **Large Enemy Roster** (95% CI width 16 pts): curate more games | 3 | 2 | wide confidence interval |
| A31 | data | Tighten the estimate for **Persistent Shared World** (95% CI width 14 pts): curate more games | 3 | 2 | wide confidence interval |
| A32 | data | Grow curated **Roguevania** coverage (only 7 curated) | 3 | 2 | thin subgenre |
| A33 | data | Grow curated **Auto-battler Roguelite** coverage (only 10 curated) | 3 | 2 | thin subgenre |
| A34 | data | Grow curated **Builder Roguelite** coverage (only 8 curated) | 3 | 2 | thin subgenre |
| A35 | data | Grow curated **Survival Roguelite** coverage (only 14 curated) | 3 | 2 | thin subgenre |
| A36 | data | Grow curated **Narrative / Event Roguelite** coverage (only 7 curated) | 3 | 2 | thin subgenre |
| A37 | research | Post-mortem: **Skillful Pixel Dungeon** ticked the boxes but scored 7 vs 60 | 3 | 2 | execution/marketing signal |
| A38 | research | Post-mortem: **LONE RUIN** ticked the boxes but scored 30 vs 78 | 3 | 2 | execution/marketing signal |
| A39 | research | Post-mortem: **Dragon Quest Heroes: Torneko's Mystery Dungeon -Classic HD-** ticked the boxes but scored 34 vs 79 | 3 | 2 | execution/marketing signal |
| A40 | data | Curate 30 more **Action Roguelite** games so its rubric has must-haves (n=916, none yet) | 4 | 3 | empty rubric |
| A41 | data | Curate 30 more **Strategy Roguelite** games so its rubric has must-haves (n=482, none yet) | 4 | 3 | empty rubric |
| A42 | data | Curate 30 more **Puzzle Roguelite** games so its rubric has must-haves (n=94, none yet) | 4 | 3 | empty rubric |
| A43 | taxonomy | Sharpen the definition of **Permadeath** (κ -0.07); add include/exclude examples | 1 | 1 | raters disagree · _attempted 2026-10-13_ |
| A44 | taxonomy | Sharpen the definition of **Run Timer / Time Pressure** (κ 0.21); add include/exclude examples | 1 | 1 | raters disagree · _attempted 2026-10-13_ |
| A45 | taxonomy | Sharpen the definition of **Item/Card Pool Unlocks** (κ 0.33); add include/exclude examples | 1 | 1 | raters disagree · _attempted 2026-10-13_ |
| A46 | taxonomy | Sharpen the definition of **Pick 1 of N Rewards** (κ 0.16); add include/exclude examples | 1 | 1 | raters disagree · _attempted 2026-10-13_ |
| A47 | taxonomy | Sharpen the definition of **Consumables** (κ 0.32); add include/exclude examples | 1 | 1 | raters disagree · _attempted 2026-10-13_ |
| A48 | taxonomy | Sharpen the definition of **Grid Tactics** (κ 0.27); add include/exclude examples | 1 | 1 | raters disagree · _attempted 2026-10-13_ |
| A49 | taxonomy | Sharpen the definition of **Scarce Healing** (κ -0.04); add include/exclude examples | 1 | 1 | raters disagree · _attempted 2026-10-13_ |
| A50 | taxonomy | Sharpen the definition of **Controller / Deck Friendly** (κ 0.19); add include/exclude examples | 1 | 1 | raters disagree · _attempted 2026-10-13_ |
<!-- AUTO-IDEAS:END -->
