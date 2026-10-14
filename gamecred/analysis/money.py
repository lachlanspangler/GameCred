"""Dollar metrics: revenue uplift per mechanic, market size, concentration, subgenre/year/price economics.

All revenue figures are gross estimates (see metrics.revenue_estimate); paid games only unless stated.
Steam keeps ~30%, so developer net ≈ 0.7 × gross (before refunds/VAT already approximated by the 0.55 factor).
"""
from __future__ import annotations

import math

import numpy as np

from ..taxonomy import load_taxonomy
from .impact import depth_strata, design_matrix

NET_SHARE = 0.70


def _gini(v: np.ndarray) -> float:
    v = np.sort(v[v > 0])
    n = len(v)
    if n < 2:
        return 0.0
    return float((2 * np.arange(1, n + 1) - n - 1) @ v / (n * v.sum()))


def _lorenz(v: np.ndarray, points: int = 40) -> list[list[float]]:
    v = np.sort(v[v > 0])
    if not len(v):
        return []
    cum = np.cumsum(v) / v.sum()
    xs = np.linspace(0, 1, points + 1)
    return [[float(x), float(np.interp(x * len(v), np.arange(1, len(v) + 1), cum)) if x > 0 else 0.0] for x in xs]


def mechanic_money(games: list[dict], min_conf: float = 0.6) -> list[dict]:
    """Per mechanic: market size, median revenue with/without, stratified multiplicative uplift, $1M+ rate."""
    paid = [g for g in games if g.get("revenue_est")]
    for g in paid:
        g["_lrev"] = math.log10(g["revenue_est"])
    d = design_matrix(paid, outcome="_lrev", min_conf=min_conf)
    strata = depth_strata(d)
    rev = 10 ** d.y
    total = rev.sum()
    out = []
    for j, mid in enumerate(d.mech_ids):
        w = d.B[:, j] == 1
        n1 = int(w.sum())
        if n1 < 15 or (~w).sum() < 15:
            continue
        num = den = 0.0
        for s in np.unique(strata):
            m = strata == s
            a, b = d.y[w & m], d.y[~w & m]
            if len(a) >= 2 and len(b) >= 2:
                wt = len(a) * len(b) / (len(a) + len(b))
                num += wt * (np.median(a) - np.median(b))
                den += wt
        if den == 0:
            continue
        log_uplift = num / den
        # Counterfactual baseline: non-users re-weighted to the users' strata mix (same source x documentation depth)
        wts = np.zeros(len(rev))
        for s_ in np.unique(strata):
            m = strata == s_
            k1, k0 = (w & m).sum(), (~w & m).sum()
            if k1 and k0:
                wts[~w & m] = k1 / k0
        base = ~w & (wts > 0)
        med_without = float(np.median(rev[~w]))
        if base.any():
            order = np.argsort(rev[base]); cw = np.cumsum(wts[base][order])
            med_without = float(rev[base][order][np.searchsorted(cw, cw[-1] / 2)])
        million_without = float((wts[base] * (rev[base] >= 1e6)).sum() / wts[base].sum()) if base.any() else float((rev[~w] >= 1e6).mean())
        out.append({
            "mechanic": mid, "n": n1, "market": float(rev[w].sum()), "market_share": float(rev[w].sum() / total),
            "median_with": float(np.median(rev[w])), "median_without": med_without,
            "uplift_x": float(10 ** log_uplift), "uplift_usd": float(med_without * (10 ** log_uplift - 1)),
            "million_rate_with": float((rev[w] >= 1e6).mean()), "million_rate_without": million_without,
        })
    for g in paid:
        g.pop("_lrev", None)
    out.sort(key=lambda r: -r["uplift_x"])
    return out


def market(games: list[dict]) -> dict:
    tax = load_taxonomy()
    paid = [g for g in games if g.get("revenue_est")]
    rev = np.array([g["revenue_est"] for g in paid])
    subs = []
    for h in tax.hybrids():
        r = np.array([g["revenue_est"] for g in paid if g["subgenre"] == h])
        if len(r) < 5:
            continue
        top = np.sort(r)[::-1]
        subs.append({"subgenre": h, "n": int(len(r)), "total": float(r.sum()), "median": float(np.median(r)),
                     "mean": float(r.mean()), "p90": float(np.percentile(r, 90)), "gini": _gini(r),
                     "top10_share": float(top[: max(1, len(top) // 10)].sum() / r.sum()),
                     "million_rate": float((r >= 1e6).mean()), "ten_million_rate": float((r >= 1e7).mean())})
    subs.sort(key=lambda s: -s["total"])
    years = sorted({g["year"] for g in paid if g.get("year") and g["year"] >= 2012})
    top_subs = [s["subgenre"] for s in subs[:7]]
    by_year = []
    for y in years:
        row = {"year": y, "n": 0}
        for g in paid:
            if g.get("year") == y:
                k = g["subgenre"] if g["subgenre"] in top_subs else "other"
                row[k] = row.get(k, 0) + g["revenue_est"]
                row["n"] += 1
        by_year.append(row)
    bands = [(0, 5), (5, 10), (10, 15), (15, 20), (20, 25), (25, 35), (35, 1000)]
    price = []
    for lo, hi in bands:
        r = np.array([g["revenue_est"] for g in paid if lo <= (g.get("price") or 0) < hi])
        if len(r) >= 5:
            price.append({"lo": lo, "hi": hi, "n": int(len(r)), "median": float(np.median(r)), "million_rate": float((r >= 1e6).mean())})
    tiers = [(0, 1e5), (1e5, 1e6), (1e6, 1e7), (1e7, 1e8), (1e8, 1e12)]
    tier_counts = [{"lo": lo, "hi": hi, "n": int(((rev >= lo) & (rev < hi)).sum()), "total": float(rev[(rev >= lo) & (rev < hi)].sum())}
                   for lo, hi in tiers]
    srt = np.sort(rev)[::-1]
    return {"n_paid": len(paid), "total": float(rev.sum()), "top1_share": float(srt[: max(1, len(srt) // 100)].sum() / rev.sum()),
            "top10_share": float(srt[: max(1, len(srt) // 10)].sum() / rev.sum()), "median": float(np.median(rev)), "gini": _gini(rev),
            "lorenz": _lorenz(rev), "subgenres": subs, "by_year": by_year, "year_series": top_subs + ["other"],
            "price_bands": price, "tiers": tier_counts, "net_share": NET_SHARE,
            "top_games": [{"id": g["appid"], "n": g["name"], "rev": g["revenue_est"], "sg": g["subgenre"]}
                          for g in sorted(paid, key=lambda g: -g["revenue_est"])[:25]]}


def heatmap(games: list[dict], top_n: int = 30) -> dict:
    """Mechanic × subgenre prevalence (curated games) for the top mechanics."""
    tax = load_taxonomy()
    cur = [g for g in games if g["source"] == "curated"]
    subs = [h for h in tax.hybrids() if sum(g["subgenre"] == h for g in cur) >= 8]
    prev = {m: sum(m in g["mechanics"] for g in cur) / len(cur) for m in tax.ids() if not m.startswith("hybrid_")}
    mechs = sorted(prev, key=lambda m: -prev[m])[:top_n]
    cells = []
    for m in mechs:
        row = []
        for h in subs:
            grp = [g for g in cur if g["subgenre"] == h]
            row.append(round(sum(m in g["mechanics"] for g in grp) / len(grp), 3))
        cells.append(row)
    return {"mechanics": mechs, "subgenres": subs, "values": cells,
            "n": [sum(g["subgenre"] == h for g in cur) for h in subs]}
