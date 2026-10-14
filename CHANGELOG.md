# Changelog

## 0.2.0 — 2026-10-13 (late)
- Taxonomy v2→v5: 121 → 195 mechanics; new subgenre hybrid_narrative
- 392 curated profiles (4 knowledge rounds + wiki-researched round); blind inter-rater κ = 0.72
- Confound controls: tag-source × documentation-depth strata, ridge controls (tag depth, curated, team pedigree), matched-comparison robustness, out-of-time validation
- Money tab (12 charts): treemaps, Lorenz, revenue survival curves, $-uplift bubbles, white space, price economics, top grossers
- New charts: genre-DNA heatmap, quality-vs-revenue quadrant, co-occurrence network, radar shapes, strip plot, design-vs-actual scatter, release mix, trends
- Design Lab: pooled model, revenue projection, tier odds, budget → ROI, team inputs, design-doc tagger, share links, print/PDF
- Recursive idea engine (Ideas tab + IDEAS.md auto section + ledger); auto design briefs; living FINDINGS/TEXTBOOK/IRR docs
- Self-healing: calibration suppresses low-precision auto-tag rules; revenue cross-check vs SteamSpy owners

## 0.1.0 — 2026-10-13
- Initial build: taxonomy v1 (10 families, 24 subfamilies, 121 mechanics)
- Pipeline: SteamSpy discovery (~3,000 roguelikes with ≥50 reviews), Steam store/review fetchers with cache + retry, auto-tagger, SQLite/JSON dataset
- Analysis: with/without bootstrap effects, ridge partial effects with bootstrap CIs, hit/flop risk metrics, BH q-values, synergy interactions, family depth, complexity curve
- Dashboard: Overview, Mechanics, Families, Games, Design Lab (predictive scorer + comps + pitch report), Synergies, Method
- Self-healing doctor with auto-tag calibration against curated ground truth; `make loop`
- Curated profiles via parallel curation agents
