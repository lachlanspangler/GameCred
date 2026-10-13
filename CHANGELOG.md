# Changelog

## 0.1.0 — 2026-10-13
- Initial build: taxonomy v1 (10 families, 24 subfamilies, 121 mechanics)
- Pipeline: SteamSpy discovery (~3,000 roguelikes with ≥50 reviews), Steam store/review fetchers with cache + retry, auto-tagger, SQLite/JSON dataset
- Analysis: with/without bootstrap effects, ridge partial effects with bootstrap CIs, hit/flop risk metrics, BH q-values, synergy interactions, family depth, complexity curve
- Dashboard: Overview, Mechanics, Families, Games, Design Lab (predictive scorer + comps + pitch report), Synergies, Method
- Self-healing doctor with auto-tag calibration against curated ground truth; `make loop`
- Curated profiles via parallel curation agents
