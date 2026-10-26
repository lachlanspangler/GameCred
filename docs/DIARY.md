# GameCred Diary

Newest entries first. Automated doctor/loop lines are appended to **Automated log** at the bottom.

## 2026-10-13 — Late night: money, color, recursive ideas
**Trigger:** the user asked for more creativity, more mechanics, more visualizations and color, and more dollar metrics.

**Changed:**
- **Mechanics:** taxonomy v4 + v5, now 195 (hybrid_narrative subgenre, projectile modifiers, proc triggers, lifesteal, companions, luck, secrets, mutators, merge upgrades, …), with a v5 retag (+257 tags).
- **Profiles:** wiki-researched curation (+49 profiles citing wiki pages) → 392 curated.
- **Money tab:**
  - KPIs, revenue treemap, Lorenz curve, revenue by year, tier counts vs tier dollars, price bands
  - Revenue survival curves, $-uplift bubbles, mechanic $ table, price-vs-revenue scatter, white space, top grossers
- **Charts elsewhere:** Genre-DNA heatmap, quality-vs-revenue quadrant, release mix by year, radar shapes (game drawer + Lab), co-occurrence network.
- **Lab dollars:** projected revenue, comps' IQR, revenue-tier odds, budget → break-even odds and ROI.
- **Recursive ideas engine** (gamecred/ideas.py → IDEAS.md auto section + Ideas tab, with a ledger), plus auto design briefs (docs/briefs/).

**Learned:**
- **Concentration:** the top 1% of roguelikes take 56% of revenue and the top 10% take 89% (Gini 0.92). The median paid roguelike grosses about $57K; 12% reach $1M.
- **Same fame confound in dollars:** the $1M+ "without" baseline must be like-for-like (strata-reweighted). The naive comparison inflated uplifts ~5×.
- **Rare stays rare:** the targeted sweep found only ~22 missing tags for 13 under-evidenced mechanics. They need new games curated, not re-tags.
- **Self-healing caught my generic v5 keywords** ("on hit", "buff", "pet", 0–17% precision) and suppressed them automatically.

## 2026-10-13 — Night: calibration, depth confound, design score
**Changed:**
- Taxonomy v3 (169).
- Baseline-checklist sweep (+113 tags) and v3 retag (+83).
- Auto-tagger calibrated on 318 curated games: 32 rules suppressed; "Perma Death" tag-name bug fixed.
- Documentation-depth stratification, with a dashboard toggle.
- Out-of-fold **design score** per game and a design-vs-actual scatter.
- Compare-two-games view, generated TEXTBOOK.md, GitHub Actions (Pages + weekly refresh).

**Learned:**
1. **A second confound inside curated data.** Raters tag famous games more thoroughly, so every mechanic looked like a +20 differentiator. Stratifying by tag-count tertile shrinks the top effects to about +13.
2. **Checklists predict the floor, not the ceiling.** The biggest over-performers vs their design score are genre-definers (FTL 95 vs 42, Into the Breach, Isaac, Brotato). The biggest under-performers tick the boxes and flop (Lone Ruin 7 vs 66, Loot River). Publisher pitch: GameCred de-risks the downside (missing table stakes, red flags); it doesn't manufacture hits.
3. SteamSpy's tag vocabulary predates "Survivors-like" / "Bullet Heaven", so survivors-likes are now inferred from auto-attack + horde mechanics.

**Next:** finish the fetch (steam_app is the bottleneck), round-3 curation of the uncurated top games, full rebuild.

## 2026-10-13 — Day 0 (evening): v2 taxonomy, confound fixes, reliability
**Changed:**
- Taxonomy v2 (155 mechanics, from ~40 curator proposals).
- 240 curated profiles, all retagged for v2 (+238 tags).
- Stratified (curated vs auto) effects and Mantel-Haenszel risk ratios, plus a tag-depth control in ridge.
- Stricter verdicts (n ≥ 15, BH q < 0.10).
- Roguelike filter: a rogue tag must rank in the top 12.
- Trends tab, temporal holdout, per-subgenre rubrics (docs/rubrics), shareable Lab links.
- Wiki discovery + community-depth metric, and an inter-rater reliability pipeline.
- Subgenre rule: hybrid_shooter means 3D only.

**Learned:**
- **Selection confound (the big one).** Curated games are both famous and richly tagged, so naive with/without effects reached +30–45 pts. Stratifying and controlling for tag depth shrinks ridge partial effects to under ±1 pt for most mechanics. Most of the naive signal was "this is a well-known game", not the mechanic.
- **Tag noise.** Many "roguelikes" on Steam carry only a stray low-ranked user tag (Hollow Knight, Flight Sim).

**Next:**
- Finish the fetch, then full rebuild and calibration.
- Round-2 curation of the top 200 uncurated roguelikes.
- IRR results → sharpen low-κ mechanic definitions.

## 2026-10-13 — Day 0: project bootstrapped
**Changed:** Created the repo from an empty folder. Taxonomy v1 (10 families / 24 subfamilies / 121 mechanics). Pipeline (discover → fetch → build → export), self-healing doctor, dashboard with 7 views, and workflow docs. Five curation agents launched in parallel (deckbuilder/puzzle, action, survivors, traditional/strategy, shooter/disappointments).
**Learned:** SteamSpy's "Roguelike"/"Roguelite"/"Bullet Heaven" tag queries return a generic top-70 list. The real tag names are "Rogue-like"/"Rogue-lite". Universe = 2,981 games with ≥ 50 reviews. Gamalytic needs a paid API key, so revenue uses the review-multiplier estimate for now. Curators proposed ~33 new mechanics (docs/TAXONOMY_PROPOSALS.md).
**Next:** Finish the fetch (~80 min), calibrate the auto-tagger against curated profiles, first full analysis, then taxonomy v2 (I-010).

## Automated log
- 2026-10-13 18:55 · doctor --fix: 0 errors, 16 fixed, 16 warnings
- 2026-10-13 19:29 · doctor --fix: 0 errors, 1 fixed, 16 warnings
- 2026-10-13 19:54 · doctor --fix: 0 errors, 1 fixed, 16 warnings
- 2026-10-13 19:54 · loop: OK — 2462 games rebuilt, tests green
- 2026-10-13 20:09 · doctor --fix: 0 errors, 8 fixed, 16 warnings
- 2026-10-13 20:10 · loop: OK — 2476 games rebuilt, tests green
- 2026-10-19 14:07 · doctor --fix: 0 errors, 2 fixed, 16 warnings
- 2026-10-19 14:08 · loop: OK — 2476 games rebuilt, tests green
- 2026-10-26 12:31 · doctor --fix: 0 errors, 2 fixed, 16 warnings
- 2026-10-26 12:32 · loop: OK — 2476 games rebuilt, tests green
