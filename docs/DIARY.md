# GameCred Diary

Newest entries first. Automated doctor/loop lines are appended to **Automated log** at the bottom.

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
