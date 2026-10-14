"""Recursive idea engine: mines the latest data for gaps and opportunities, writes them into docs/IDEAS.md.

Runs on every export. Ideas are rewritten between the AUTO markers so the backlog always reflects current data;
humans/agents promote an auto idea by copying it into a manual table with a new I-### id.
"""
from __future__ import annotations

import json
import re

from . import DATA, DOCS_DIR
from .taxonomy import load_taxonomy

START, END = "<!-- AUTO-IDEAS:START -->", "<!-- AUTO-IDEAS:END -->"


def generate(games: list[dict], analysis: dict) -> list[dict]:
    tax = load_taxonomy()
    nm = lambda m: tax.mechanics[m].name if m in tax.mechanics else m
    ideas: list[dict] = []
    add = lambda kind, text, v, e, why: ideas.append({"kind": kind, "text": text, "value": v, "effort": e, "why": why})
    hc = {r["mechanic"]: r for r in analysis["scopes"]["high_conf"]["mechanics"]}
    # 1. Promising but under-evidenced mechanics -> targeted curation
    for m, r in hc.items():
        if m.startswith("hybrid_"):
            continue
        if r.get("status") in ("insufficient", "low_support") and r.get("n_with", 0) >= 3 and r.get("diff") is not None and abs(r["diff"]) >= 6:
            add("data", f"Curate 15+ more games featuring **{nm(m)}** (Δ {r['diff']:+.1f} on only n={r['n_with']})", 4, 2, "large effect, too few games to trust it")
        elif r.get("status") == "ok" and r.get("ci_hi") is not None and (r["ci_hi"] - r["ci_lo"]) > 14:
            add("data", f"Tighten the estimate for **{nm(m)}** (95% CI width {r['ci_hi'] - r['ci_lo']:.0f} pts): curate more games", 3, 2, "wide confidence interval")
    # 2. Fuzzy definitions (low inter-rater kappa)
    for r in (analysis.get("irr") or {}).get("mechanics", []):
        if r.get("kappa") is not None and r["kappa"] < 0.4 and r["n_curated"] + r["n_rater2"] >= 6:
            add("taxonomy", f"Sharpen the definition of **{nm(r['mechanic'])}** (κ {r['kappa']:.2f}); add include/exclude examples", 3, 1, "raters disagree")
    # 3. Auto-tagger blind spots
    cal_p = DATA / "taxonomy" / "calibration.json"
    if cal_p.exists():
        cal = json.loads(cal_p.read_text()).get("precision", {})
        blind = [m for m, c in cal.items() if c.get("recall") is not None and c["recall"] < 0.1 and not m.startswith("hybrid_")
                 and hc.get(m, {}).get("prevalence", 0) > 0.03]
        for m in blind[:12]:
            add("tagging", f"Write auto-tag keyword rules for **{nm(m)}** (recall < 10% vs curated)", 3, 1, "long-tail games can't be tagged with it")
    # 4. Under-sampled subgenres
    for h, s in analysis.get("subgenres", {}).items():
        stakes = [r for r in s.get("mechanics", []) if r.get("verdict") == "table stakes"]
        if not stakes:
            add("data", f"Curate 30 more **{nm(h)}** games so its rubric has must-haves (n={s['n']}, none yet)", 4, 3, "empty rubric")
    for h in tax.hybrids():
        n = sum(g["subgenre"] == h and g["source"] == "curated" for g in games)
        if n < 15:
            add("data", f"Grow curated **{nm(h)}** coverage (only {n} curated)", 3, 2, "thin subgenre")
    # 5. Taxonomy proposals with several examples
    tp = (DOCS_DIR / "TAXONOMY_PROPOSALS.md").read_text() if (DOCS_DIR / "TAXONOMY_PROPOSALS.md").exists() else ""
    decided = " ".join(re.findall(r"## Decision.*?(?=\n## |\Z)", tp, flags=re.S))
    for line in tp.splitlines():
        mm = re.match(r"- (\w+) — (.*)", line.strip())
        if mm and mm.group(1) not in tax.mechanics and mm.group(1) not in decided and mm.group(2).count(",") >= 2:
            add("taxonomy", f"Promote proposed mechanic `{mm.group(1)}`: {mm.group(2)[:90]}", 3, 1, "≥3 examples cited")
    # 6. Market white space: archetypes / mechanics with high revenue multiple but few games
    money = (analysis.get("money") or {}).get("mechanics", [])
    for r in sorted([r for r in money if r["uplift_x"] >= 1.8 and r["n"] < 40 and not r["mechanic"].startswith("hybrid_")], key=lambda r: -r["uplift_x"])[:6]:
        add("opportunity", f"White space: **{nm(r['mechanic'])}** games earn {r['uplift_x']:.1f}× median revenue but only {r['n']} use it; build a design brief", 5, 2, "high $, low competition")
    # 7. Trend bets: rising and positive
    tr = (analysis.get("trends") or {}).get("mechanics", {})
    for m, v in tr.items():
        r = hc.get(m, {})
        if v.get("slope") and v["slope"] > 0.01 and r.get("diff", 0) > 2 and r.get("status") == "ok":
            add("opportunity", f"Trend bet: **{nm(m)}** is rising ({v['slope'] * 100:+.1f} pp/yr) and positive (Δ {r['diff']:+.1f})", 4, 1, "momentum + payoff")
        if v.get("slope") and v["slope"] > 0.01 and r.get("diff", 0) < -2 and r.get("status") == "ok":
            add("opportunity", f"Saturation warning: **{nm(m)}** is rising ({v['slope'] * 100:+.1f} pp/yr) but negative (Δ {r['diff']:+.1f})", 4, 1, "crowding into a weak pattern")
    # 8. Case studies from design-score outliers
    cur = [g for g in games if g["source"] == "curated" and g.get("design_score") is not None and g.get("gsi") is not None]
    for g in sorted(cur, key=lambda g: g["design_score"] - g["gsi"])[:3]:
        add("research", f"Case study: why did **{g['name']}** beat its design score ({g['gsi']:.0f} vs {g['design_score']:.0f})? Find the missing mechanic", 4, 2, "the model misses something")
    for g in sorted(cur, key=lambda g: g["gsi"] - g["design_score"])[:3]:
        add("research", f"Post-mortem: **{g['name']}** ticked the boxes but scored {g['gsi']:.0f} vs {g['design_score']:.0f}", 3, 2, "execution/marketing signal")
    # 9. Data-source gaps
    crit = sum(1 for g in games if g.get("metacritic") or g.get("ign"))
    if crit / max(len(games), 1) < 0.3:
        add("data", f"Add a critic-score source (only {crit}/{len(games)} games have one): OpenCritic API or IGN import", 4, 2, "critic component is sparse")
    seen, out = set(), []
    for i in sorted(ideas, key=lambda i: -(i["value"] / i["effort"])):
        if i["text"] not in seen:
            seen.add(i["text"]); out.append(i)
    return out


def write(games: list[dict], analysis: dict) -> list[dict]:
    ideas = generate(games, analysis)
    p = DOCS_DIR / "IDEAS.md"
    md = p.read_text() if p.exists() else "# Ideas backlog\n"
    block = [START, "## Auto-generated ideas (rewritten every export by `gamecred/ideas.py`)", "",
             "Ranked by value ÷ effort. Promote one by copying it into a table above with a new I-### id.", "",
             "| # | Kind | Idea | V | E | Why |", "|---|---|---|---|---|---|"]
    block += [f"| A{n + 1} | {i['kind']} | {i['text']} | {i['value']} | {i['effort']} | {i['why']} |" for n, i in enumerate(ideas[:40])]
    block.append(END)
    text = "\n".join(block)
    md = re.sub(re.escape(START) + ".*?" + re.escape(END), text, md, flags=re.S) if START in md else md.rstrip() + "\n\n" + text + "\n"
    p.write_text(md)
    return ideas
