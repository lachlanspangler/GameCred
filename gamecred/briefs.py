"""Auto design briefs for white-space opportunities (high revenue multiple, few competitors) -> docs/briefs/."""
from __future__ import annotations

import numpy as np

from . import DOCS_DIR
from .taxonomy import load_taxonomy


def write(games: list[dict], analysis: dict, max_briefs: int = 8) -> list[str]:
    tax = load_taxonomy()
    nm = lambda m: tax.mechanics[m].name
    money = (analysis.get("money") or {}).get("mechanics", [])
    ops = sorted([r for r in money if r["uplift_x"] >= 1.8 and r["n"] < 40 and not r["mechanic"].startswith("hybrid_")],
                 key=lambda r: -r["uplift_x"])[:max_briefs]
    out_dir = DOCS_DIR / "briefs"
    out_dir.mkdir(exist_ok=True)
    for old in out_dir.glob("*.md"):
        old.unlink()
    paid = [g for g in games if g.get("revenue_est")]
    written = []
    for r in ops:
        m = r["mechanic"]
        users = sorted([g for g in paid if m in g["mechanics"]], key=lambda g: -g["revenue_est"])
        top = users[: max(5, len(users) // 3)]
        cur_paid = [g for g in paid if g["source"] == "curated"] or paid  # like-for-like tagging depth
        base = {k: sum(k in g["mechanics"] for g in cur_paid) / len(cur_paid) for k in tax.ids()}
        lift = []
        for k in tax.ids():
            if k == m or k.startswith("hybrid_") or base[k] < 0.02:
                continue
            p = sum(k in g["mechanics"] for g in top) / len(top)
            if p >= 0.4:
                lift.append((p / base[k], p, k))
        lift.sort(reverse=True)
        subs = {}
        for g in users:
            subs[g["subgenre"]] = subs.get(g["subgenre"], 0) + 1
        prices = [g["price"] for g in top if g.get("price")]
        L = [f"# Design brief: {nm(m)}", "",
             f"_{tax.mechanics[m].desc}_", "",
             "## Why this is white space", "",
             f"- {r['n']} paid roguelikes use it (low competition). Their median gross is **${r['median_with']:,.0f}**, vs ${r['median_without']:,.0f} for comparable games without it: a **{r['uplift_x']:.1f}× revenue multiple**.",
             f"- {r['million_rate_with']:.0%} of them grossed $1M+, vs {r['million_rate_without']:.0%} of comparable games.",
             f"- Total market for games using it is ${r['market']:,.0f}.", "",
             "## Proven by", ""] + [f"- **{g['name']}** ({g.get('year')}, {nm(g['subgenre'])}): ~${g['revenue_est']:,.0f}" for g in users[:8]] + [
             "", "## Pair it with (over-represented in its top earners)", ""] + [
             f"- **{nm(k)}**: in {p:.0%} of top earners ({lf:.1f}× its rate across curated roguelikes)" for lf, p, k in lift[:10]] + [
             "", "## Where it lives", "", ", ".join(f"{nm(k)} ({v})" for k, v in sorted(subs.items(), key=lambda kv: -kv[1])), "",
             f"Typical launch price of the top earners: ${np.median(prices):.2f}" if prices else "", "",
             "## Caveats", "", "Small-n association: a few breakout hits can drive the multiple. Treat this as a lead to test, not a guarantee. Regenerated on every export."]
        (out_dir / f"{m}.md").write_text("\n".join(L) + "\n")
        written.append(m)
    idx = ["# White-space design briefs", "", "Auto-generated from the money analysis on every export.", ""] + [f"- [{nm(m)}]({m}.md)" for m in written]
    (out_dir / "README.md").write_text("\n".join(idx) + "\n")
    return written
