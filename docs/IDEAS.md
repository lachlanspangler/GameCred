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
| A1 | opportunity | Trend bet: **Pick 1 of N Rewards** is rising (+1.1 pp/yr) and positive (Δ +3.7) | 4 | 1 | momentum + payoff |
| A2 | opportunity | Trend bet: **Explicit Synergies** is rising (+2.5 pp/yr) and positive (Δ +5.8) | 4 | 1 | momentum + payoff |
| A3 | opportunity | Trend bet: **Passive Relics / Trinkets** is rising (+1.2 pp/yr) and positive (Δ +7.5) | 4 | 1 | momentum + payoff |
| A4 | taxonomy | Sharpen the definition of **Permadeath** (κ -0.07); add include/exclude examples | 3 | 1 | raters disagree |
| A5 | taxonomy | Sharpen the definition of **Run Timer / Time Pressure** (κ 0.21); add include/exclude examples | 3 | 1 | raters disagree |
| A6 | taxonomy | Sharpen the definition of **Item/Card Pool Unlocks** (κ 0.33); add include/exclude examples | 3 | 1 | raters disagree |
| A7 | taxonomy | Sharpen the definition of **Pick 1 of N Rewards** (κ 0.16); add include/exclude examples | 3 | 1 | raters disagree |
| A8 | taxonomy | Sharpen the definition of **Consumables** (κ 0.32); add include/exclude examples | 3 | 1 | raters disagree |
| A9 | taxonomy | Sharpen the definition of **Grid Tactics** (κ 0.27); add include/exclude examples | 3 | 1 | raters disagree |
| A10 | taxonomy | Sharpen the definition of **Scarce Healing** (κ -0.04); add include/exclude examples | 3 | 1 | raters disagree |
| A11 | taxonomy | Sharpen the definition of **Controller / Deck Friendly** (κ 0.19); add include/exclude examples | 3 | 1 | raters disagree |
| A12 | tagging | Write auto-tag keyword rules for **Acts / Biomes** (recall < 10% vs curated) | 3 | 1 | long-tail games can't be tagged with it |
| A13 | tagging | Write auto-tag keyword rules for **Boss Gates** (recall < 10% vs curated) | 3 | 1 | long-tail games can't be tagged with it |
| A14 | tagging | Write auto-tag keyword rules for **Short Runs (<30 min)** (recall < 10% vs curated) | 3 | 1 | long-tail games can't be tagged with it |
| A15 | tagging | Write auto-tag keyword rules for **Unlockable Characters** (recall < 10% vs curated) | 3 | 1 | long-tail games can't be tagged with it |
| A16 | tagging | Write auto-tag keyword rules for **Pick 1 of N Rewards** (recall < 10% vs curated) | 3 | 1 | long-tail games can't be tagged with it |
| A17 | tagging | Write auto-tag keyword rules for **Starting Loadout Choice** (recall < 10% vs curated) | 3 | 1 | long-tail games can't be tagged with it |
| A18 | tagging | Write auto-tag keyword rules for **Item/Card Upgrading** (recall < 10% vs curated) | 3 | 1 | long-tail games can't be tagged with it |
| A19 | tagging | Write auto-tag keyword rules for **Status Effects** (recall < 10% vs curated) | 3 | 1 | long-tail games can't be tagged with it |
| A20 | tagging | Write auto-tag keyword rules for **Scarce Healing** (recall < 10% vs curated) | 3 | 1 | long-tail games can't be tagged with it |
| A21 | tagging | Write auto-tag keyword rules for **Optional Challenge Rooms** (recall < 10% vs curated) | 3 | 1 | long-tail games can't be tagged with it |
| A22 | opportunity | White space: **Pre-run Mutators / Challenge Runs** games earn 4.3× median revenue but only 18 use it; build a design brief | 5 | 2 | high $, low competition |
| A23 | opportunity | White space: **Multi-phase Bosses** games earn 3.3× median revenue but only 19 use it; build a design brief | 5 | 2 | high $, low competition |
| A24 | opportunity | White space: **In-run Clock / Day Cycle** games earn 3.3× median revenue but only 21 use it; build a design brief | 5 | 2 | high $, low competition |
| A25 | opportunity | White space: **Seeded Runs** games earn 2.6× median revenue but only 15 use it; build a design brief | 5 | 2 | high $, low competition |
| A26 | opportunity | White space: **Codex / Compendium** games earn 2.6× median revenue but only 35 use it; build a design brief | 5 | 2 | high $, low competition |
| A27 | opportunity | White space: **Companions / Pets** games earn 2.4× median revenue but only 26 use it; build a design brief | 5 | 2 | high $, low competition |
| A28 | data | Curate 15+ more games featuring **Soft Run Limit** (Δ +6.1 on only n=4) | 4 | 2 | large effect, too few games to trust it |
| A29 | data | Curate 15+ more games featuring **Heirs / Legacy Inheritance** (Δ +7.4 on only n=8) | 4 | 2 | large effect, too few games to trust it |
| A30 | data | Curate 15+ more games featuring **Weapon Mastery** (Δ -13.1 on only n=4) | 4 | 2 | large effect, too few games to trust it |
| A31 | data | Curate 15+ more games featuring **Knowledge Progression** (Δ +7.1 on only n=6) | 4 | 2 | large effect, too few games to trust it |
| A32 | data | Curate 15+ more games featuring **Banish / Skip** (Δ +7.4 on only n=10) | 4 | 2 | large effect, too few games to trust it |
| A33 | data | Curate 15+ more games featuring **On-hit / On-kill Triggers** (Δ +9.1 on only n=12) | 4 | 2 | large effect, too few games to trust it |
| A34 | data | Curate 15+ more games featuring **Temporary Buffs / Stacks** (Δ +7.2 on only n=6) | 4 | 2 | large effect, too few games to trust it |
| A35 | data | Curate 15+ more games featuring **Luck Stat** (Δ +9.9 on only n=9) | 4 | 2 | large effect, too few games to trust it |
| A36 | data | Curate 15+ more games featuring **Item Identification** (Δ -8.4 on only n=13) | 4 | 2 | large effect, too few games to trust it |
| A37 | data | Curate 15+ more games featuring **Faction Reputation** (Δ -11.2 on only n=4) | 4 | 2 | large effect, too few games to trust it |
| A38 | data | Curate 15+ more games featuring **Score-target Rounds** (Δ +8.0 on only n=6) | 4 | 2 | large effect, too few games to trust it |
| A39 | data | Curate 15+ more games featuring **Dice Manipulation** (Δ -6.0 on only n=6) | 4 | 2 | large effect, too few games to trust it |
| A40 | data | Curate 15+ more games featuring **Dice Placement** (Δ -9.6 on only n=5) | 4 | 2 | large effect, too few games to trust it |
<!-- AUTO-IDEAS:END -->
