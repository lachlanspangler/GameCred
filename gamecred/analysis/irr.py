"""Inter-rater reliability: compare blind second-rater profiles (data/games/irr) with curated ones.

Writes docs/IRR.md and returns a summary for the dashboard. Mechanics with low agreement are the
ones whose definitions need sharpening (feed back into the taxonomy via TAXONOMY_PROPOSALS.md).
"""
from __future__ import annotations

from pathlib import Path

import numpy as np

from .. import DATA, DOCS_DIR
from ..profiles import load_profiles, validate_profile
from ..taxonomy import load_taxonomy

IRR_DIR = DATA / "games" / "irr"


def _kappa(a: np.ndarray, b: np.ndarray) -> float | None:
    n = len(a)
    if n == 0:
        return None
    po = (a == b).mean()
    pa, pb = a.mean(), b.mean()
    pe = pa * pb + (1 - pa) * (1 - pb)
    return None if pe >= 1 else float((po - pe) / (1 - pe))


def compute() -> dict | None:
    if not IRR_DIR.exists():
        return None
    tax = load_taxonomy()
    cur = {p["_file"]: validate_profile(p, fix=True)[0] for p in load_profiles()}
    pairs = []
    for p in load_profiles(Path(IRR_DIR)):
        p, _ = validate_profile(p, fix=True)
        if p["_file"] in cur:
            pairs.append((cur[p["_file"]], p))
    if len(pairs) < 5:
        return None
    ids = [m for m in tax.ids() if not m.startswith("hybrid_")]
    A = np.array([[1 if m in c["mechanics"] else 0 for m in ids] for c, _ in pairs])
    B = np.array([[1 if m in r["mechanics"] else 0 for m in ids] for _, r in pairs])
    per = []
    for j, m in enumerate(ids):
        if A[:, j].sum() + B[:, j].sum() == 0:
            continue
        per.append({"mechanic": m, "kappa": _kappa(A[:, j], B[:, j]), "n_curated": int(A[:, j].sum()),
                    "n_rater2": int(B[:, j].sum()), "agree": float((A[:, j] == B[:, j]).mean())})
    jac = [float((a & b).sum() / max((a | b).sum(), 1)) for a, b in zip(A.astype(bool), B.astype(bool))]
    overall = _kappa(A.ravel(), B.ravel())
    games = [{"name": c["name"], "jaccard": j, "n_curated": int(a.sum()), "n_rater2": int(b.sum())}
             for (c, _), j, a, b in zip(pairs, jac, A, B)]
    rated = [r for r in per if r["kappa"] is not None and r["n_curated"] + r["n_rater2"] >= 6]
    rated.sort(key=lambda r: r["kappa"])
    out = {"n_games": len(pairs), "overall_kappa": overall, "mean_jaccard": float(np.mean(jac)),
           "mechanics": per, "games": games}
    md = ["# Inter-rater reliability", "",
          f"{len(pairs)} curated games were re-tagged blind by an independent rater (presence/absence per mechanic).", "",
          f"- **Overall Cohen's κ:** {overall:.2f}  (0.4–0.6 moderate, 0.6–0.8 substantial)",
          f"- **Mean per-game Jaccard overlap:** {np.mean(jac):.2f}", "",
          "## Least reliable mechanics (sharpen definitions)", "", "| mechanic | κ | curated | rater 2 |", "|---|---|---|---|"]
    md += [f"| {tax.mechanics[r['mechanic']].name} | {r['kappa']:.2f} | {r['n_curated']} | {r['n_rater2']} |" for r in rated[:20]]
    md += ["", "## Most reliable", "", "| mechanic | κ | curated | rater 2 |", "|---|---|---|---|"]
    md += [f"| {tax.mechanics[r['mechanic']].name} | {r['kappa']:.2f} | {r['n_curated']} | {r['n_rater2']} |" for r in rated[-15:][::-1]]
    md += ["", "## Per game", "", "| game | Jaccard | curated tags | rater-2 tags |", "|---|---|---|---|"]
    md += [f"| {g['name']} | {g['jaccard']:.2f} | {g['n_curated']} | {g['n_rater2']} |" for g in sorted(games, key=lambda g: g["jaccard"])]
    (DOCS_DIR / "IRR.md").write_text("\n".join(md) + "\n")
    return out
