# GameCred: Status & Roadmap

_Snapshot: 2026-10-13, end of the first build session (≈4 hours, built from an empty folder)._

## 1. What GameCred is

GameCred is a living, quantitative database of roguelike game mechanics. Every game is broken into mechanics, and each mechanic is linked to measurable outcomes: player reception, estimated revenue, critic scores and community depth. The point is to replace vibes-based game funding with evidence. A publisher can see what a genre must have, what sets hits apart and how risky a design is. A studio, including an AI-assisted one, gets a design rubric backed by data.

Founder: **William Spangler**.

## 2. Where we are (by the numbers)

| Area | Now |
|---|---|
| Games in database | **2,462** Steam roguelikes (≥50 reviews, rogue tag in the top 12 Steam tags) |
| Expert-curated profiles | **392**: 4 knowledge-based rounds plus 1 wiki-researched round; about 35–50% mid/low performers to fight survivorship bias |
| Mechanic taxonomy | **195 mechanics**, 10 families, 25+ subfamilies, 12 subgenres (taxonomy v5) |
| Tagging reliability | Blind second-rater **Cohen's κ = 0.71** (substantial agreement) |
| Market covered | **$2.9B** estimated gross revenue across 2,302 paid games |
| Model accuracy | Cuts Success-Index prediction error from 23.3 to 18.0 points (5-fold CV) |
| Out-of-time validation | Trained on releases ≤2021 and tested on 1,465 unseen 2022+ games: ρ = 0.47; **50% of predicted top-quartile games were hits (chance 25%)** |
| Revenue model sanity check | Review-multiplier units vs SteamSpy owners: r = 0.81 (log-log) |
| Wikis discovered | 411 (Fandom / wiki.gg / self-hosted) |
| Commits | about 30, local, ready to push |

### Headline findings (details in [FINDINGS.md](FINDINGS.md))

1. **Winner-take-most market.** The top 1% of roguelikes take 56% of revenue and the top 10% take 90% (Gini 0.92). The median paid roguelike grosses about $57K. 12% reach $1M.
2. **Checklists predict the floor, not the ceiling.** Genre-definers (FTL, Into the Breach, Isaac, Brotato) far out-perform their "design score". Checklist-complete games like Lone Ruin and Loot River under-deliver. GameCred de-risks the downside (missing fundamentals, red flags); it doesn't manufacture hits.
3. **Fame confounds everything.** Famous games get tagged more thoroughly, so naive "mechanic X → +20 points" claims are mostly fame. All effects are therefore stratified by tag source × documentation depth, and the ridge model controls for tag depth, team pedigree, price, year, Early Access, F2P and subgenre. Matched comparisons check robustness.
4. **Subgenre economics.** Roguevanias (22%) and deckbuilders (18%) have the best odds of a $1M+ game. Survivors-likes run about −9 Success-Index points after controls, consistent with a clone flood.
5. **Data-driven archetypes** (NMF, 12 found). The Risk-of-Rain pattern (item stacking + gambling + multiplicative scaling) and auto-battler placement designs have the highest median success.
6. **Rising and paying off:** Explicit Synergies, Passive Relics and Pick-1-of-N.

## 3. What was built

### Pipeline (`gamecred/`)
`discover` (SteamSpy tags) → `fetch` (Steam store, reviews, SteamSpy; cached, rate-limited, retrying, resumable) → `wikis` (MediaWiki discovery + stats) → `build` (merge curated + calibrated auto-tags, metrics, SQLite + JSON) → `export` (analyses, dashboard data, generated docs) → `doctor` (self-healing).

### Analysis (`gamecred/analysis/`)
- **impact.py:** stratified with/without effects (bootstrap CIs, BH q-values, Mantel–Haenszel hit/flop risk ratios); ridge with CV and bootstrap; matched-comparison robustness; synergy interactions; partial family correlations; out-of-fold **design score** per game.
- **money.py:** like-for-like revenue multiples per mechanic, market size, $1M+ odds, subgenre/year/price economics, Lorenz curve and Gini.
- **archetypes.py** (NMF), **extras.py** (trends, temporal holdout, rubrics), **irr.py** (inter-rater κ).

### Dashboard (`dashboard/`, static, no dependencies, light/dark)
11 views:
- **Overview:** key "what a roguelike needs" card, effect bars, distribution, strip plot, design-vs-actual scatter
- **Mechanics:** live impact table, quality-vs-revenue quadrant, prevalence-vs-impact scatter
- **Families:** textbook grid, genre-DNA heatmap, archetypes
- **Games:** explorer, game drawer (fingerprint, radar, comps), compare view
- **Money $:** 12 charts, including treemaps, Lorenz curve, revenue survival curves, $-uplift bubbles and white space
- **Design Lab:** predicted score, players-vs-sales, revenue projection, tier odds, budget → ROI, comps, missing must-haves, red flags, radar, design-doc tagger, share link, PDF, pitch report
- **Trends**
- **Synergies:** co-occurrence network, pairs
- **Ideas:** auto-generated
- **Method**
- **About:** founder

Every filter (subgenre, year, reviews, tag confidence, outcome, GSI weights, depth control) re-scopes everything live.

### Workflow & self-healing
- **[WORKFLOW.md](WORKFLOW.md):** ideate → record → prioritize → change → verify → heal → log.
- **`make loop`:** heal, rebuild, test, retry once on failure, write a diary line.
- **Doctor:** validates and repairs profiles (aliases, typos, intensities), deletes corrupt cache, fetches missing data, **calibrates the auto-tagger against curated ground truth and suppresses rules under 30% precision** (it caught my own bad v5 keywords), flags dead rules and cross-checks the revenue model.
- **Recursive ideas engine** (`gamecred/ideas.py`): mines the data every export for evidence gaps, fuzzy definitions, tagger blind spots, thin subgenres, white space, trend bets and outlier case studies. It writes them into [IDEAS.md](IDEAS.md) and the Ideas tab, with a ledger so attempted ideas don't repeat. Three loop iterations were executed by agents this session.
- **GitHub Actions:** `pages.yml` deploys the dashboard; `refresh.yml` runs a weekly fetch + heal + commit.

### Generated docs (rebuilt every export)
[FINDINGS.md](FINDINGS.md) · [TEXTBOOK.md](TEXTBOOK.md) (every mechanic: definition, examples, evidence, effect, κ, trend) · [IRR.md](IRR.md) · [rubrics/](rubrics/) (per-subgenre must-haves) · [briefs/](briefs/) (white-space design briefs) · [HEALTH.md](HEALTH.md)

## 4. Known limitations (be upfront with publishers)
- **Observational data:** associations, not causes. Budget, marketing and team quality are only partly controlled (pedigree proxy).
- **Revenue is a review-multiplier estimate (±~2×).** Rankings are reliable; dollar amounts are approximate. Gamalytic integration is ready but needs an API key.
- **Survivorship:** games under 50 reviews are excluded, so true flop rates are understated.
- **Auto-tags for the 2,070 non-curated games are noisy** (calibrated, but low recall for many mechanics). Decisions should lean on the curated / high-confidence scopes.
- **Per-subgenre models are small.** Mechanic coefficients shrink to ~0 within single subgenres, so the Lab scores with the pooled model.
- **Critic scores are sparse** (Metacritic via Steam, about 10% of games). IGN is curated only.
- **Some definitions have low κ** (permadeath, scarce healing, pick-1-of-N); raters omit "obvious" tags. These were sharpened this session; a re-rate is needed to confirm.

## 5. What's next (prioritized)

**Next session (high value, low effort)**
1. **Push to GitHub, enable Pages** (Settings → Pages → Source: GitHub Actions) and Actions write permission. The dashboard then goes live at `https://lachlanspangler.github.io/GameCred/`.
2. **Gamalytic API key** (`GAMALYTIC_API_KEY`), to replace estimated revenue with better numbers for the dollar story.
3. **Re-run the blind inter-rater study** on 30 new games to confirm the sharpened definitions raise κ.
4. **Execute the top auto-ideas** (Ideas tab): curate games for rare high-effect mechanics; write keyword rules for tagger blind spots.

**Data**
5. Critic coverage: OpenCritic API adapter + IGN CSV import.
6. Review-text mining (Steam reviews) to link complaints and praise to mechanics ("too grindy" ↔ meta-progression).
7. Time series: CCU / review velocity for longevity and "long tail" revenue metrics.
8. Curation to 600–800 profiles, prioritizing thin subgenres (narrative, puzzle, auto-battler, city-builder, metroidvania).

**Analysis**
9. Non-linear model (gradient boosting + SHAP) to catch interactions the ridge misses.
10. Budget/team-size covariates (studio size via LinkedIn/Mobygames) for stronger confound control.
11. Launch-timing and competition effects (how crowded the subgenre was in the release month).

**Product**
12. Publisher accounts: saved designs, portfolio view (score a slate of pitches), PDF branding.
13. A design-doc parser that uses an LLM instead of keywords, for "score my pitch deck".
14. Expansion beyond roguelikes: the same pipeline works for any genre with wikis (survivors, extraction shooters, cozy sims).

## 6. How to run it
```bash
cd ~/Desktop/GameCred
make setup        # first time on a new machine
make serve        # dashboard at http://127.0.0.1:8765
make loop         # self-healing rebuild + tests + diary line
make fetch all    # refresh market data (≈1.5 h cold, minutes when cached)
```
New agent sessions: read [CLAUDE.md](../CLAUDE.md), then [HEALTH.md](HEALTH.md), [DIARY.md](DIARY.md) and [IDEAS.md](IDEAS.md).
