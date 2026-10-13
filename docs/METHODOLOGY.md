# Methodology

How GameCred turns design evidence into numbers. Keep this in sync with `gamecred/metrics.py` and `gamecred/analysis/impact.py`.

## 1. Universe
All Steam apps that SteamSpy tags *Rogue-like*, *Rogue-lite*, *Action Roguelike*, *Roguelike Deckbuilder*, *Traditional Roguelike* or *Roguevania*, with **≥ 50 reviews** (≈3,000 games), plus every curated profile. Non-games (DLC, soundtracks) are dropped.

## 2. Mechanics
`data/taxonomy/mechanics.yaml`: families → subfamilies → mechanics. A game has an **intensity** per mechanic: 1 present, 2 significant, 3 core pillar.

| Source | Confidence | How |
|---|---|---|
| Curated profile | 1.0 | Expert tagging from wikis/guides, with evidence lines |
| Steam user tag | 0.7 → calibrated | Taxonomy `steam_tags` mapping. Intensity from tag rank (top-5 → 3, top-12 → 2, else 1) |
| Description keyword | 0.4 → calibrated | Taxonomy `keywords` (word-boundary match). 2+ hits → intensity 2 |

**Calibration.** The doctor re-runs the auto-tagger on curated games and measures precision per mechanic × source. Sources with < 30% precision (on ≥ 8 predictions) are suppressed. The rest get their measured precision as confidence. The "High confidence" filter keeps tags with confidence ≥ 0.6.

## 3. Outcomes
- **Quality** = percentile of the SteamDB rating: `r = p − (p − 0.5)·2^(−log10(n+1))`, where p is the positive share and n the review count.
- **Commercial** = percentile of log10 estimated gross revenue: `units = reviews × M(year)`, with M = 55 (≤2016), 40 (2017–19), 33 (2020–21), 30 (2022+). `gross = units × launch price × 0.55` (discounts, regional pricing, refunds). The band runs from 0.6× to 1.6×. F2P titles use `log10(units × 8)` as a proxy. Gamalytic data replaces this when `GAMALYTIC_API_KEY` is set.
- **Critic** = percentile of Metacritic (Steam appdetails), or IGN × 10 where curated.
- **GameCred Success Index (GSI)** = weighted mean of the available percentiles: quality 0.40, commercial 0.45, critic 0.15. Missing components are re-weighted away. The dashboard lets you change the weights.
- **Hit** = top quartile of the slice. **Flop** = bottom quartile.

## 4. Statistics
For each mechanic *m* in a scope (all / high-confidence / curated / per-subgenre with n ≥ 40):

- **Stratification by tag source (important).** Curated games are disproportionately well-known *and* more completely tagged than auto-tagged games, so a naive with/without comparison confounds "has mechanic" with "was curated". Every Δ is therefore computed **within** strata of tag source × documentation depth (tag-count tertile within source; toggle in the dashboard) and combined with Mantel–Haenszel-style weights `w_s = n1·n0/(n1+n0)`. Hit lift and flop ratio are Mantel–Haenszel risk ratios. The ridge model includes a `curated_profile` covariate, and synergy, family-depth and complexity analyses use curated games only. A mechanic with no auto-tag rule is therefore estimated from curated games alone.
- **Δ (univariate):** mean outcome with *m* − without. 95% CI from 1,000 bootstrap resamples, a normal-approximation p-value from the bootstrap SE, and **Benjamini–Hochberg q-values** across mechanics. The dashboard recomputes Δ live for any filter using Welch's SE.
- **Cohen's d**, **hit lift** = P(hit | m) / P(hit | ¬m), **flop ratio** = P(flop | m) / P(flop | ¬m).
- **Ridge partial effect:** GSI regressed on every mechanic with prevalence between 3% and 97%, plus covariates (subgenre dummies, year − 2020, log10 price, F2P, Early Access, curated flag, standardized tag count `tag_depth_z` as a documentation-depth/fame control; covariates barely penalized). λ is chosen by 5-fold CV over {0.3 … 1000}, with 200 bootstrap refits for CIs. A coefficient is "points of GSI for having the mechanic, other things equal".
- **Verdicts:**
  - Directional verdicts need ≥ 15 games with the mechanic and BH q < 0.10 (or a ridge CI excluding 0)
  - *red flag:* effect CI < 0
  - *table stakes:* ≥ 50% of hits have it, Δ ≥ 0, flop ratio ≤ 0.7
  - *differentiator:* prevalence ≤ 35% and CI > 0
  - *positive:* CI > 0
  - *risk reducer:* flop ratio ≤ 0.7
  - *neutral:* otherwise
  - *insufficient data:* n < 10 on either side
- **Synergy:** `(m11 − m10) − (m01 − m00)` over the 2×2 cells of a mechanic pair (each cell ≥ 8 games), ranked by |z|. Exploratory, with no multiple-comparison correction.
- **Family depth:** partial Spearman ρ between the number of significant (≥ 2) mechanics a game has in a family and its GSI, controlling for the game's total tag count (curated games only).

## 4b. Design archetypes
NMF (multiplicative updates, k = 12) on the curated game × mechanic intensity matrix. Columns are weighted by `log(N/(1+df)) + 0.5` so near-universal mechanics don't dominate. A game's archetype share = its normalised loading. ρ = Pearson correlation of share with GSI. Data-driven groupings complement the hand-built taxonomy.

## 5. Design Lab
- **Prediction** = ridge intercept + Σ coefficients × features. It uses the subgenre's own model when that subgenre has n ≥ 40, otherwise the all-roguelike model with subgenre as a covariate. The ± band is the CV RMSE. P(hit)/P(flop) assume normal residuals with that RMSE.
- **Comps:** weighted Jaccard similarity on intensity vectors. Hybrid tags count double, and auto tags with confidence < 0.7 count 0.6. The top 25 comps give a similarity-weighted hit/flop rate.
- **Missing table stakes / red flags / highest-leverage additions** come from the same scope.

## 6. Caveats
1. Observational data, so these are **associations, not causes**. Budget, team pedigree, marketing and timing are unobserved confounders (see I-027).
2. Survivorship: the universe needs ≥ 50 reviews, so true flops are missing and downside risk is understated.
3. Revenue is a model estimate, roughly ±2×. Rankings are more reliable than dollar figures.
4. Auto-tags are noisy. Use the curated or high-confidence scopes for decisions.
5. Thresholds (table-stakes 50%, flop ratio 0.7, etc.) are conventions, chosen for interpretability. They are not fitted.
