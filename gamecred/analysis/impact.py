"""Mechanic -> outcome analysis.

Univariate:   with/without mean difference, bootstrap 95% CI, Cohen's d, hit lift, flop-rate ratio, BH q-values.
Multivariate: ridge regression of GSI on all mechanics + covariates (subgenre, price, year, EA, F2P),
              lambda via 5-fold CV, bootstrap CIs on coefficients.
Synergy:      2x2 interaction contrasts for mechanic pairs.
See docs/METHODOLOGY.md for interpretation and caveats.
"""
from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np

from ..taxonomy import load_taxonomy

RNG = np.random.default_rng(1337)
MIN_SUPPORT = 10


@dataclass
class Design:
    games: list[dict]
    mech_ids: list[str]
    X: np.ndarray       # intensity 0-3
    B: np.ndarray       # presence 0/1
    y: np.ndarray       # outcome


def design_matrix(games: list[dict], outcome: str = "gsi", min_conf: float = 0.0, min_intensity: int = 1) -> Design:
    tax = load_taxonomy()
    mech_ids = tax.ids()
    keep = [g for g in games if g.get(outcome) is not None]
    X = np.zeros((len(keep), len(mech_ids)))
    idx = {m: i for i, m in enumerate(mech_ids)}
    for r, g in enumerate(keep):
        for mid, v in g["mechanics"].items():
            if mid in idx and v["confidence"] >= min_conf:
                X[r, idx[mid]] = v["intensity"]
    B = (X >= min_intensity).astype(float)
    y = np.array([g[outcome] for g in keep], dtype=float)
    return Design(keep, mech_ids, X, B, y)


def _bh(p: np.ndarray) -> np.ndarray:
    """Benjamini-Hochberg q-values (NaN-safe)."""
    q = np.full_like(p, np.nan)
    m = ~np.isnan(p)
    pv = p[m]
    n = pv.size
    if n == 0:
        return q
    order = np.argsort(pv)
    ranked = pv[order] * n / (np.arange(n) + 1)
    ranked = np.minimum.accumulate(ranked[::-1])[::-1]
    out = np.empty(n)
    out[order] = np.minimum(ranked, 1)
    q[m] = out
    return q


def univariate(d: Design, n_boot: int = 1000) -> list[dict]:
    y = d.y
    hit_t, flop_t = np.percentile(y, 75), np.percentile(y, 25)
    hit, flop = y >= hit_t, y <= flop_t
    rows, pvals = [], []
    for j, mid in enumerate(d.mech_ids):
        w = d.B[:, j] == 1
        n1, n0 = int(w.sum()), int((~w).sum())
        row = {"mechanic": mid, "n_with": n1, "n_without": n0, "prevalence": n1 / len(y) if len(y) else 0}
        if n1 < 3 or n0 < 3:
            rows.append({**row, "status": "insufficient"})
            pvals.append(np.nan)
            continue
        y1, y0 = y[w], y[~w]
        diff = y1.mean() - y0.mean()
        sp = math.sqrt(((n1 - 1) * y1.var(ddof=1) + (n0 - 1) * y0.var(ddof=1)) / max(n1 + n0 - 2, 1)) or 1e-9
        b1 = y1[RNG.integers(0, n1, (n_boot, n1))].mean(axis=1)
        b0 = y0[RNG.integers(0, n0, (n_boot, n0))].mean(axis=1)
        bd = b1 - b0
        lo, hi = np.percentile(bd, [2.5, 97.5])
        se = bd.std(ddof=1) or 1e-9
        z = diff / se
        p = math.erfc(abs(z) / math.sqrt(2))
        pvals.append(p)
        hr1, hr0 = hit[w].mean(), hit[~w].mean()
        fr1, fr0 = flop[w].mean(), flop[~w].mean()
        rows.append({**row, "status": "ok" if n1 >= MIN_SUPPORT else "low_support",
                     "mean_with": float(y1.mean()), "mean_without": float(y0.mean()),
                     "median_with": float(np.median(y1)), "diff": float(diff), "ci_lo": float(lo), "ci_hi": float(hi),
                     "cohens_d": float(diff / sp), "p": p,
                     "hit_rate_with": float(hr1), "hit_rate_without": float(hr0),
                     "hit_lift": float(hr1 / hr0) if hr0 > 0 else None,
                     "flop_rate_with": float(fr1), "flop_rate_without": float(fr0),
                     "flop_ratio": float(fr1 / fr0) if fr0 > 0 else None,
                     "prev_in_hits": float(d.B[hit, j].mean()) if hit.any() else None,
                     "prev_in_flops": float(d.B[flop, j].mean()) if flop.any() else None,
                     "mean_intensity": float(d.X[w, j].mean())})
    q = _bh(np.array(pvals, dtype=float))
    for r, qi in zip(rows, q):
        r["q"] = None if np.isnan(qi) else float(qi)
    return rows


def _covariates(games: list[dict]) -> tuple[np.ndarray, list[str]]:
    tax = load_taxonomy()
    hy = tax.hybrids()
    cols, names = [], []
    for h in hy[1:]:  # first hybrid is the reference level
        cols.append([1.0 if g["subgenre"] == h else 0.0 for g in games])
        names.append(f"subgenre={h}")
    years = np.array([g.get("year") or 2020 for g in games], dtype=float)
    cols.append(list(years - 2020)); names.append("year-2020")
    cols.append([math.log10(g["price"]) if g.get("price") else 0.0 for g in games]); names.append("log10_price")
    cols.append([1.0 if g.get("free") else 0.0 for g in games]); names.append("free_to_play")
    cols.append([1.0 if g.get("early_access") else 0.0 for g in games]); names.append("early_access")
    return np.array(cols).T, names


def _ridge_fit(Z: np.ndarray, y: np.ndarray, lam: float, penalize: np.ndarray) -> tuple[float, np.ndarray]:
    mu, ym = Z.mean(axis=0), y.mean()
    Zc = Z - mu
    P = np.diag(penalize * lam)
    beta = np.linalg.solve(Zc.T @ Zc + P, Zc.T @ (y - ym))
    return float(ym - mu @ beta), beta


def ridge(d: Design, n_boot: int = 200, min_prev: float = 0.03) -> dict:
    prev = d.B.mean(axis=0)
    use = [j for j in range(len(d.mech_ids)) if min_prev <= prev[j] <= 1 - min_prev
           and not d.mech_ids[j].startswith("hybrid_")]
    C, cnames = _covariates(d.games)
    Z = np.hstack([d.B[:, use], C])
    penalize = np.array([1.0] * len(use) + [0.01] * C.shape[1])
    n = len(d.y)
    folds = RNG.permutation(n) % 5
    best = (None, np.inf)
    cv = []
    for lam in [0.3, 1, 3, 10, 30, 100, 300, 1000]:
        err = 0.0
        for k in range(5):
            tr, te = folds != k, folds == k
            b0, b = _ridge_fit(Z[tr], d.y[tr], lam, penalize)
            err += ((d.y[te] - (b0 + Z[te] @ b)) ** 2).sum()
        rmse = math.sqrt(err / n)
        cv.append({"lambda": lam, "rmse": rmse})
        if rmse < best[1]:
            best = (lam, rmse)
    lam = best[0]
    b0, beta = _ridge_fit(Z, d.y, lam, penalize)
    boots = np.empty((n_boot, Z.shape[1]))
    for i in range(n_boot):
        s = RNG.integers(0, n, n)
        boots[i] = _ridge_fit(Z[s], d.y[s], lam, penalize)[1]
    lo, hi = np.percentile(boots, [2.5, 97.5], axis=0)
    pred = b0 + Z @ beta
    ss_res = ((d.y - pred) ** 2).sum()
    ss_tot = ((d.y - d.y.mean()) ** 2).sum()
    baseline_rmse = float(d.y.std())
    names = [d.mech_ids[j] for j in use] + cnames
    coefs = [{"feature": nm, "coef": float(c), "ci_lo": float(a), "ci_hi": float(bb), "is_mechanic": i < len(use)}
             for i, (nm, c, a, bb) in enumerate(zip(names, beta, lo, hi))]
    return {"lambda": lam, "cv": cv, "cv_rmse": best[1], "baseline_rmse": baseline_rmse,
            "r2_in_sample": float(1 - ss_res / ss_tot) if ss_tot else None, "intercept": b0,
            "features": names, "means": Z.mean(axis=0).tolist(), "coefs": coefs, "n": n}


def classify(uni: list[dict], rid: dict | None) -> None:
    """Attach a plain-language verdict to each mechanic (mutates rows)."""
    rc = {c["feature"]: c for c in (rid or {}).get("coefs", [])}
    for r in uni:
        c = rc.get(r["mechanic"])
        r["ridge_coef"] = c["coef"] if c else None
        r["ridge_lo"] = c["ci_lo"] if c else None
        r["ridge_hi"] = c["ci_hi"] if c else None
        if r.get("status") != "ok":
            r["verdict"] = "insufficient data"
            continue
        pos_uni = r["ci_lo"] > 0
        neg_uni = r["ci_hi"] < 0
        pos_rid = c is not None and c["ci_lo"] > 0
        neg_rid = c is not None and c["ci_hi"] < 0
        risk_red = r.get("flop_ratio") is not None and r["flop_ratio"] <= 0.7
        if (neg_uni and (c is None or c["coef"] < 0)) or neg_rid:
            r["verdict"] = "red flag"
        elif (r.get("prev_in_hits") or 0) >= 0.5 and r["diff"] >= 0 and risk_red:
            r["verdict"] = "table stakes"
        elif r["prevalence"] <= 0.35 and (pos_uni or pos_rid):
            r["verdict"] = "differentiator"
        elif pos_uni or pos_rid:
            r["verdict"] = "positive"
        elif risk_red:
            r["verdict"] = "risk reducer"
        else:
            r["verdict"] = "neutral"


def synergies(d: Design, top: int = 30, min_cell: int = 8) -> list[dict]:
    prev = d.B.mean(axis=0)
    cand = [j for j in range(len(d.mech_ids)) if 0.08 <= prev[j] <= 0.92 and not d.mech_ids[j].startswith("hybrid_")]
    out = []
    for a_i, a in enumerate(cand):
        A = d.B[:, a] == 1
        for b in cand[a_i + 1:]:
            Bm = d.B[:, b] == 1
            cells = [A & Bm, A & ~Bm, ~A & Bm, ~A & ~Bm]
            ns = [int(c.sum()) for c in cells]
            if min(ns) < min_cell:
                continue
            m11, m10, m01, m00 = (d.y[c].mean() for c in cells)
            inter = (m11 - m10) - (m01 - m00)
            se = math.sqrt(sum(d.y[c].var(ddof=1) / n for c, n in zip(cells, ns)))
            out.append({"a": d.mech_ids[a], "b": d.mech_ids[b], "interaction": float(inter), "z": float(inter / se) if se else 0,
                        "n_both": ns[0], "n_a_only": ns[1], "n_b_only": ns[2], "n_neither": ns[3],
                        "mean_both": float(m11), "mean_neither": float(m00)})
    out.sort(key=lambda r: -abs(r["z"]))
    return out[:top * 2]


def family_effects(d: Design) -> list[dict]:
    tax = load_taxonomy()
    out = []
    for fid, fam in tax.families.items():
        cols = [d.mech_ids.index(m) for s in fam["subfamilies"].values() for m in s["mechanics"]]
        depth = (d.X[:, cols] >= 2).sum(axis=1)
        rho = _spearman(depth, d.y)
        out.append({"family": fid, "name": fam["name"], "mean_depth": float(depth.mean()), "spearman": rho,
                    "n_mechanics": len(cols)})
    return out


def _spearman(a: np.ndarray, b: np.ndarray) -> float | None:
    if len(a) < 5 or a.std() == 0 or b.std() == 0:
        return None
    ra = np.argsort(np.argsort(a)).astype(float)
    rb = np.argsort(np.argsort(b)).astype(float)
    return float(np.corrcoef(ra, rb)[0, 1])


def stat_correlations(games: list[dict], outcome: str = "gsi") -> list[dict]:
    keys = sorted({k for g in games for k in (g.get("stats") or {})})
    out = []
    for k in keys:
        pts = [(g["stats"][k], g[outcome]) for g in games
               if isinstance((g.get("stats") or {}).get(k), (int, float)) and g.get(outcome) is not None]
        if len(pts) < 8:
            continue
        a, b = np.array(pts, dtype=float).T
        out.append({"stat": k, "n": len(pts), "spearman": _spearman(a, b), "median": float(np.median(a))})
    return out


def complexity_curve(d: Design) -> list[dict]:
    n_mech = d.B.sum(axis=1)
    bins = [0, 10, 15, 20, 25, 30, 35, 40, 50, 200]
    out = []
    for lo, hi in zip(bins, bins[1:]):
        m = (n_mech >= lo) & (n_mech < hi)
        if m.sum() >= 5:
            out.append({"lo": lo, "hi": hi, "n": int(m.sum()), "mean": float(d.y[m].mean())})
    return out


def run_scope(games: list[dict], outcome: str = "gsi", min_conf: float = 0.0, with_ridge: bool = True,
              with_synergy: bool = True) -> dict:
    d = design_matrix(games, outcome, min_conf)
    if len(d.y) < 20:
        return {"n": len(d.y), "skipped": True}
    uni = univariate(d)
    rid = ridge(d) if with_ridge and len(d.y) >= 60 else None
    classify(uni, rid)
    return {"n": len(d.y), "outcome": outcome, "min_conf": min_conf,
            "hit_threshold": float(np.percentile(d.y, 75)), "flop_threshold": float(np.percentile(d.y, 25)),
            "mechanics": uni, "ridge": rid,
            "synergies": synergies(d) if with_synergy else [], "families": family_effects(d),
            "complexity": complexity_curve(d)}
