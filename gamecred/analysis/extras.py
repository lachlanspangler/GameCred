"""Secondary analyses: trends over release years, temporal holdout validation, publisher rubrics."""
from __future__ import annotations

import math

import numpy as np

from ..taxonomy import load_taxonomy
from .impact import _ridge_fit, design_matrix, ridge


def trends(games: list[dict], min_conf: float = 0.6, start: int = 2014) -> dict:
    """Mechanic prevalence by release year (games with confidence >= min_conf tags)."""
    tax = load_taxonomy()
    years = sorted({g["year"] for g in games if g.get("year") and g["year"] >= start})
    counts = {y: sum(1 for g in games if g.get("year") == y) for y in years}
    out = {}
    for mid in tax.mechanics:
        series = []
        for y in years:
            n = counts[y]
            k = sum(1 for g in games if g.get("year") == y and mid in g["mechanics"]
                    and g["mechanics"][mid]["confidence"] >= min_conf)
            series.append(round(k / n, 4) if n else None)
        valid = [(y, v) for y, v in zip(years, series) if v is not None and counts[y] >= 15]
        slope = None
        if len(valid) >= 4:
            xs, vs = np.array([y for y, _ in valid], float), np.array([v for _, v in valid])
            slope = float(np.polyfit(xs, vs, 1)[0])  # prevalence change per year
        out[mid] = {"series": series, "slope": slope}
    return {"years": years, "n_by_year": [counts[y] for y in years], "mechanics": out}


def temporal_holdout(games: list[dict], split_year: int = 2022) -> dict | None:
    """Train ridge on releases before split_year, evaluate on split_year+ (honest out-of-time accuracy)."""
    train = [g for g in games if g.get("year") and g["year"] < split_year and g.get("gsi") is not None]
    test = [g for g in games if g.get("year") and g["year"] >= split_year and g.get("gsi") is not None]
    if len(train) < 100 or len(test) < 30:
        return None
    dtr = design_matrix(train)
    model = ridge(dtr, n_boot=1)
    dte = design_matrix(test)
    feats = model["features"]
    idx = {m: i for i, m in enumerate(dte.mech_ids)}
    from .impact import _covariates
    C, cn = _covariates(test)
    cidx = {n: i for i, n in enumerate(cn)}
    Z = np.zeros((len(test), len(feats)))
    for j, f in enumerate(feats):
        if f in idx:
            Z[:, j] = dte.B[:, idx[f]]
        elif f in cidx:
            Z[:, j] = C[:, cidx[f]]
    beta = np.array([c["coef"] for c in model["coefs"]])
    pred = model["intercept"] + Z @ beta
    y = dte.y
    rmse = float(math.sqrt(((y - pred) ** 2).mean()))
    base = float(math.sqrt(((y - np.mean(dtr.y)) ** 2).mean()))
    rho = float(np.corrcoef(np.argsort(np.argsort(pred)), np.argsort(np.argsort(y)))[0, 1])
    # top-quartile precision: of games predicted in top 25%, how many were actual hits?
    k = max(1, len(y) // 4)
    top_pred = np.argsort(-pred)[:k]
    hit_t = np.percentile(y, 75)
    precision = float((y[top_pred] >= hit_t).mean())
    return {"split_year": split_year, "n_train": len(train), "n_test": len(test), "rmse": rmse,
            "baseline_rmse": base, "spearman": rho, "top_quartile_precision": precision, "chance_precision": 0.25}


def rubric(scope: dict, subgenre_name: str) -> str:
    """Publisher-facing checklist for one scope."""
    tax = load_taxonomy()
    rows = [r for r in scope.get("mechanics", []) if r.get("status") == "ok" and not r["mechanic"].startswith("hybrid_")]
    pick = lambda v: sorted([r for r in rows if r["verdict"] == v], key=lambda r: -(r.get("ridge_coef") or r["diff"]))
    def line(r):
        m = tax.mechanics[r["mechanic"]]
        extra = f"in {r['prev_in_hits']:.0%} of hits" if r.get("prev_in_hits") is not None else ""
        rc = f", partial {r['ridge_coef']:+.1f}" if r.get("ridge_coef") is not None else ""
        return f"- **{m.name}** — Δ {r['diff']:+.1f} pts (95% CI {r['ci_lo']:+.1f}…{r['ci_hi']:+.1f}{rc}); {extra}; flop ratio {r['flop_ratio'] or float('nan'):.2f}"
    out = [f"# GameCred rubric — {subgenre_name}", "",
           f"Sample: {scope['n']} games. Hit = Success Index ≥ {scope['hit_threshold']:.1f}; flop ≤ {scope['flop_threshold']:.1f}.",
           "Associations from observational data; see docs/METHODOLOGY.md.", ""]
    for title, v, blurb in [("Must have (table stakes)", "table stakes", "Most hits have these, and lacking them raises flop risk."),
                            ("Differentiators", "differentiator", "Rare but associated with better outcomes."),
                            ("Positive signals", "positive", ""), ("Risk reducers", "risk reducer", "Lower flop rate even if the average effect is unclear."),
                            ("Red flags", "red flag", "Associated with worse outcomes in this genre.")]:
        lst = pick(v)
        out += [f"## {title}", blurb, ""] + ([line(r) for r in lst] or ["- none at current sample size"]) + [""]
    return "\n".join(out)
