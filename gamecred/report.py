"""Terminal report of the strongest findings."""
from __future__ import annotations

import json

from .export import ANALYSIS_PATH
from .taxonomy import load_taxonomy


def report(args: list[str]) -> None:
    scope = args[0] if args else "all"
    a = json.loads(ANALYSIS_PATH.read_text())
    s = a["scopes"].get(scope) or a["subgenres"].get(scope)
    tax = load_taxonomy()
    rows = [r for r in s["mechanics"] if r.get("status") == "ok"]
    rows.sort(key=lambda r: -(r.get("ridge_coef") or r["diff"]))
    print(f"scope={scope} n={s['n']}  ridge cv_rmse={s['ridge']['cv_rmse']:.1f} vs baseline {s['ridge']['baseline_rmse']:.1f}"
          if s.get("ridge") else f"scope={scope} n={s['n']}")
    print(f"{'mechanic':34} {'prev':>5} {'diff':>6} {'95% CI':>15} {'ridge':>6} {'hitLift':>7} {'flopR':>6}  verdict")
    for r in rows[:25] + [None] + rows[-15:]:
        if r is None:
            print("..."); continue
        name = tax.mechanics[r["mechanic"]].name[:34]
        rc = f"{r['ridge_coef']:6.1f}" if r.get("ridge_coef") is not None else "     -"
        hl = f"{r['hit_lift']:7.2f}" if r.get("hit_lift") else "      -"
        fr = f"{r['flop_ratio']:6.2f}" if r.get("flop_ratio") else "     -"
        print(f"{name:34} {r['prevalence']:5.0%} {r['diff']:6.1f} [{r['ci_lo']:6.1f},{r['ci_hi']:6.1f}] {rc} {hl} {fr}  {r['verdict']}")
