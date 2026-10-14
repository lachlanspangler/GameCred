"""docs/FINDINGS.md — the living executive summary, regenerated on every export."""
from __future__ import annotations

import datetime as dt

from . import DOCS_DIR
from .taxonomy import load_taxonomy


def write(games: list[dict], analysis: dict) -> None:
    tax = load_taxonomy()
    nm = lambda m: tax.mechanics[m].name if m in tax.mechanics else m
    sc = analysis["scopes"]["all"]
    hc = analysis["scopes"]["high_conf"]
    rid = sc.get("ridge") or {}
    ho = analysis.get("holdout") or {}
    irr = analysis.get("irr") or {}
    cur = [g for g in games if g["source"] == "curated"]
    ok = [r for r in hc["mechanics"] if r.get("status") == "ok" and not r["mechanic"].startswith("hybrid_")]
    robust_pos = sorted([r for r in ok if r.get("robust") and r["diff"] > 0], key=lambda r: -r["diff"])[:10]
    flags = sorted([r for r in ok if r["verdict"] == "red flag"], key=lambda r: r["diff"])[:8]
    stakes = sorted([r for r in ok if r["verdict"] == "table stakes"], key=lambda r: -(r.get("prev_in_hits") or 0))
    L = [f"# GameCred findings", "", f"_Auto-generated {dt.date.today()} from {len(games)} roguelikes ({len(cur)} expert-curated). "
         "Associations from observational data, not causal guarantees. Method: METHODOLOGY.md._", "",
         "## Headline numbers", "",
         f"- **Model accuracy:** mechanics + subgenre + price/year/pedigree controls cut the error of predicting a game's Success Index from "
         f"{rid.get('baseline_rmse', 0):.1f} to {rid.get('cv_rmse', 0):.1f} points (5-fold CV)."]
    if ho:
        L.append(f"- **Out-of-time test:** trained on releases ≤ {ho['split_year'] - 1}, then ranked {ho['n_test']} unseen {ho['split_year']}+ games with "
                 f"Spearman ρ = {ho['spearman']:.2f}. Of the games it put in the top quartile, **{ho['top_quartile_precision']:.0%}** really were hits (chance is 25%).")
    if irr:
        L.append(f"- **Tagging reliability:** blind re-tag of {irr['n_games']} games, Cohen's κ = {irr['overall_kappa']:.2f} (substantial agreement).")
    L += ["", "## What every roguelike needs (table stakes)", ""]
    L += [f"- **{nm(r['mechanic'])}**: in {r['prev_in_hits']:.0%} of hits; games without it flop {1 / r['flop_ratio']:.1f}× as often"
          if r.get("flop_ratio") else f"- **{nm(r['mechanic'])}**" for r in stakes] or ["- (none at current sample size)"]
    L += ["", "## Robust positive signals", "",
          "These have a positive stratified Δ, and a matched comparison against the 5 most similar games without the mechanic agrees.", ""]
    L += [f"- **{nm(r['mechanic'])}**: Δ {r['diff']:+.1f} pts (CI {r['ci_lo']:+.1f}…{r['ci_hi']:+.1f}), matched {r['matched_att']:+.1f}; in {r['prevalence']:.0%} of games"
          for r in robust_pos]
    L += ["", "## Red flags", ""] + ([f"- **{nm(r['mechanic'])}**: Δ {r['diff']:+.1f} pts (CI {r['ci_lo']:+.1f}…{r['ci_hi']:+.1f})" for r in flags] or ["- none"])
    L += ["", "## Per-subgenre must-haves", ""]
    for h, s in analysis.get("subgenres", {}).items():
        st = [nm(r["mechanic"]) for r in s.get("mechanics", []) if r.get("verdict") == "table stakes" and not r["mechanic"].startswith("hybrid_")]
        df = [nm(r["mechanic"]) for r in sorted(s.get("mechanics", []), key=lambda r: -(r.get("diff") or 0))
              if r.get("verdict") == "differentiator" and not r["mechanic"].startswith("hybrid_")][:5]
        L.append(f"- **{nm(h)}** (n={s['n']}): must have {', '.join(st) or '—'}; differentiators: {', '.join(df) or '—'}. Full rubric: rubrics/{h}.md")
    arch = (analysis.get("archetypes") or {}).get("archetypes", [])
    if arch:
        L += ["", "## Design archetypes (data-driven)", ""]
        for a in sorted(arch, key=lambda a: -(a.get("median_gsi") or 0)):
            L.append(f"- **{' + '.join(nm(m['id']) for m in a['mechanics'][:3])}**: median GSI {a['median_gsi']:.0f}, ρ {a['corr_with_gsi']:+.2f}, "
                     f"n={a['n_dominant']} (e.g. {', '.join(a['games'][:3])})")
    ds = [g for g in cur if g.get("design_score") is not None and g.get("gsi") is not None]
    if ds:
        ds.sort(key=lambda g: g["gsi"] - g["design_score"])
        L += ["", "## Checklists predict the floor, not the ceiling", "",
              "Biggest **over-performers** (actual far above what their mechanics predict): " +
              ", ".join(f"{g['name']} ({g['gsi']:.0f} vs {g['design_score']:.0f})" for g in ds[::-1][:6]) + ".",
              "", "Biggest **under-performers** (ticked the boxes, missed): " +
              ", ".join(f"{g['name']} ({g['gsi']:.0f} vs {g['design_score']:.0f})" for g in ds[:6]) + ".",
              "", "So GameCred reduces downside risk: missing fundamentals and red flags are detectable. Breakout originality and execution aren't."]
    tr = (analysis.get("trends") or {}).get("mechanics", {})
    rising = sorted([(m, v["slope"]) for m, v in tr.items() if v.get("slope") is not None and not m.startswith("hybrid_")], key=lambda x: -x[1])
    if rising:
        L += ["", "## Trends", "", "Rising: " + ", ".join(f"{nm(m)} ({s * 100:+.1f} pp/yr)" for m, s in rising[:6]) + ".",
              "", "Declining: " + ", ".join(f"{nm(m)} ({s * 100:+.1f} pp/yr)" for m, s in rising[-5:][::-1]) + "."]
    (DOCS_DIR / "FINDINGS.md").write_text("\n".join(L) + "\n")
