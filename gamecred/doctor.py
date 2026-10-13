"""Self-healing health check.

Each check reports problems and, with --fix, repairs what can be repaired safely:
  * curated profiles: alias/typo mechanic ids, bad intensities, missing subgenre tag   -> rewritten
  * raw cache: corrupt JSON                                                         -> deleted (refetched next run)
  * curated games missing raw data                                                  -> fetched
  * auto-tagger: precision measured vs curated ground truth                         -> calibration.json
    (low-precision sources are suppressed, others get their measured precision as confidence)
  * taxonomy: dead mechanics (0 games) and non-discriminating ones (>90% prevalence) -> reported
  * dashboard: data.js missing/stale                                                -> rebuilt
Writes docs/HEALTH.md and appends a line to docs/DIARY.md.
"""
from __future__ import annotations

import datetime as dt
import json
import logging

from . import DASHBOARD_DIR, DOCS_DIR, RAW_DIR
from .profiles import load_profiles, save_profile, validate_profile
from .tagging import autotag
from .taxonomy import load_taxonomy

log = logging.getLogger("gamecred.doctor")


class Report:
    def __init__(self):
        self.sections: list[tuple[str, list[str]]] = []
        self.errors = 0
        self.fixed = 0
        self.warnings = 0

    def add(self, title: str, lines: list[str]):
        self.sections.append((title, lines))


def check_taxonomy(rep: Report):
    lines = []
    try:
        tax = load_taxonomy()
        lines.append(f"OK: {len(tax.families)} families, {len(tax.mechanics)} mechanics")
        for m in tax.mechanics.values():
            if not m.desc:
                lines.append(f"warn: {m.id} has no description"); rep.warnings += 1
            if not m.keywords and not m.steam_tags:
                lines.append(f"info: {m.id} has no auto-tag rules (curated-only mechanic)")
    except Exception as e:  # taxonomy broken is fatal for everything else
        lines.append(f"ERROR: taxonomy failed to load: {e}"); rep.errors += 1
    rep.add("Taxonomy", lines)


def check_profiles(rep: Report, fix: bool):
    lines, seen = [], {}
    profiles = load_profiles()
    for d in profiles:
        d, issues = validate_profile(d, fix=fix)
        for i in issues:
            if i.level == "error":
                rep.errors += 1; lines.append(str(i))
            elif i.level == "fixed":
                rep.fixed += 1; lines.append(str(i))
            else:
                rep.warnings += 1
        if fix and any(i.level == "fixed" for i in issues):
            save_profile(d)
        if d.get("appid") in seen:
            rep.errors += 1
            lines.append(f"[error] duplicate appid {d['appid']}: {d['_file']} and {seen[d['appid']]}")
        seen[d.get("appid")] = d["_file"]
    lines.insert(0, f"{len(profiles)} curated profiles")
    rep.add("Curated profiles", lines)
    return profiles


def check_cache(rep: Report, fix: bool, profiles: list[dict]):
    lines, corrupt = [], 0
    for p in RAW_DIR.glob("*/*.json"):
        try:
            json.loads(p.read_text())
        except json.JSONDecodeError:
            corrupt += 1
            if fix:
                p.unlink(); rep.fixed += 1
    if corrupt:
        lines.append(f"{corrupt} corrupt cache files" + (" deleted" if fix else ""))
    missing = [int(d["appid"]) for d in profiles if d.get("appid")
               and not (RAW_DIR / "steam_reviews" / f"{d['appid']}.json").exists()]
    if missing:
        lines.append(f"{len(missing)} curated games missing raw data")
        if fix:
            from .sources import steam, steamspy
            for a in missing:
                steamspy.appdetails(a); steam.appdetails(a); steam.review_summary(a)
            rep.fixed += len(missing); lines.append("  fetched")
    lines.append(f"cache files: " + ", ".join(f"{d.name}={len(list(d.glob('*.json')))}" for d in sorted(RAW_DIR.iterdir()) if d.is_dir()))
    rep.add("Raw cache", lines)


def calibrate(rep: Report, fix: bool):
    """Measure auto-tag precision/recall per mechanic and source against curated profiles."""
    from .build import _read
    tax = load_taxonomy()
    stats: dict[str, dict[str, dict]] = {m: {"steam_tag": {"tp": 0, "fp": 0}, "keyword": {"tp": 0, "fp": 0}, "fn": 0}
                                         for m in tax.mechanics}
    n_games = 0
    for d in load_profiles():
        d, issues = validate_profile(d, fix=True)
        if any(i.level == "error" for i in issues):
            continue
        a = int(d["appid"])
        spy = _read("steamspy_app", a) or {}
        st = ((_read("steam_app", a) or {}).get(str(a)) or {}).get("data") or {}
        tags = spy.get("tags") if isinstance(spy.get("tags"), dict) else {}
        if not tags and not st:
            continue
        n_games += 1
        text = autotag.clean_text((st.get("short_description") or "") + " " + (st.get("detailed_description") or ""))
        pred = autotag.tag_game(tags, text, calibrated=False)
        truth = set(d["mechanics"])
        for mid, v in pred.items():
            stats[mid][v["source"]]["tp" if mid in truth else "fp"] += 1
        for mid in truth - set(pred):
            stats[mid]["fn"] += 1
    lines = [f"calibrated on {n_games} curated games with raw data"]
    precision = {}
    poor = []
    for mid, s in stats.items():
        precision[mid] = {}
        for src in ("steam_tag", "keyword"):
            n = s[src]["tp"] + s[src]["fp"]
            if n:
                pr = s[src]["tp"] / n
                precision[mid][src] = {"precision": round(pr, 3), "n": n}
                if n >= 8 and pr < autotag.SUPPRESS_BELOW:
                    poor.append(f"{mid}/{src}: precision {pr:.0%} on {n} predictions -> suppressed")
        tp = s["steam_tag"]["tp"] + s["keyword"]["tp"]
        precision[mid]["recall"] = round(tp / (tp + s["fn"]), 3) if tp + s["fn"] else None
    lines += poor or ["no low-precision auto-tag sources"]
    blind = sorted((m for m, p in precision.items() if p.get("recall") is not None and p["recall"] < 0.15
                    and stats[m]["fn"] >= 15), key=lambda m: -stats[m]["fn"])
    if blind:
        lines.append("auto-tagger blind spots (recall <15%, curated-only signal): " + ", ".join(blind[:25]))
    if fix and n_games >= 10:
        autotag.CALIBRATION_PATH.write_text(json.dumps(
            {"generated": dt.datetime.now().isoformat(timespec="seconds"), "n_games": n_games, "precision": precision},
            indent=1))
        autotag.calibration.cache_clear()
        rep.fixed += 1
        lines.append("wrote data/taxonomy/calibration.json")
    rep.add("Auto-tagger calibration", lines)


def check_dataset(rep: Report):
    from .build import load_dataset
    games = load_dataset()
    lines = []
    if not games:
        lines.append("ERROR: no dataset; run `python -m gamecred build`"); rep.errors += 1
        rep.add("Dataset", lines); return
    tax = load_taxonomy()
    n = len(games)
    prev = {m: 0 for m in tax.mechanics}
    for g in games:
        for m in g["mechanics"]:
            if m in prev:
                prev[m] += 1
    dead = [m for m, c in prev.items() if c == 0]
    broad = [m for m, c in prev.items() if c / n > 0.9]
    gsi = sum(g["gsi"] is not None for g in games)
    lines.append(f"{n} games, {sum(g['source'] == 'curated' for g in games)} curated, GSI coverage {gsi / n:.0%}")
    lines.append(f"games with critic score: {sum(bool(g['metacritic'] or g['ign']) for g in games)}")
    if dead:
        lines.append("dead mechanics (0 games): " + ", ".join(dead)); rep.warnings += len(dead)
    if broad:
        lines.append("non-discriminating (>90% of games): " + ", ".join(broad)); rep.warnings += len(broad)
    sub = {}
    for g in games:
        sub[g["subgenre"]] = sub.get(g["subgenre"], 0) + 1
    lines.append("subgenres: " + ", ".join(f"{k}={v}" for k, v in sorted(sub.items(), key=lambda kv: -kv[1])))
    rep.add("Dataset", lines)


def check_dashboard(rep: Report, fix: bool):
    from .build import DATASET_PATH
    lines = []
    dj = DASHBOARD_DIR / "data.js"
    stale = not dj.exists() or (DATASET_PATH.exists() and dj.stat().st_mtime < DATASET_PATH.stat().st_mtime)
    if stale:
        lines.append("dashboard data missing or older than dataset")
        if fix and DATASET_PATH.exists():
            from .export import export
            export(); rep.fixed += 1; lines.append("  rebuilt dashboard/data.js")
    for f in ("index.html", "app.js", "styles.css"):
        if not (DASHBOARD_DIR / f).exists():
            lines.append(f"ERROR: dashboard/{f} missing"); rep.errors += 1
    rep.add("Dashboard", lines or ["OK"])


def doctor(fix: bool = False) -> int:
    rep = Report()
    check_taxonomy(rep)
    profiles = check_profiles(rep, fix)
    check_cache(rep, fix, profiles)
    calibrate(rep, fix)
    check_dataset(rep)
    check_dashboard(rep, fix)
    now = dt.datetime.now().strftime("%Y-%m-%d %H:%M")
    md = [f"# GameCred Health Report\n\n_Generated {now} by `python -m gamecred doctor{' --fix' if fix else ''}`_\n",
          f"**errors: {rep.errors} · fixed: {rep.fixed} · warnings: {rep.warnings}**\n"]
    for title, lines in rep.sections:
        md.append(f"\n## {title}\n")
        md += [f"- {l}" for l in lines]
    (DOCS_DIR / "HEALTH.md").write_text("\n".join(md) + "\n")
    with open(DOCS_DIR / "DIARY.md", "a") as f:
        f.write(f"- {now} · doctor{' --fix' if fix else ''}: {rep.errors} errors, {rep.fixed} fixed, {rep.warnings} warnings\n")
    print("\n".join(md))
    return 1 if rep.errors else 0
