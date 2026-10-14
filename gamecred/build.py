"""Assemble raw sources + curated profiles into one tidy dataset and a SQLite database."""
from __future__ import annotations

import json
import logging
import math
import re
import sqlite3

import numpy as np

from . import PROCESSED_DIR, RAW_DIR
from .fetch import target_appids
from .metrics import (percentile_rank, revenue_estimate, steamdb_rating, success_index, wilson_lower)
from .profiles import load_profiles, validate_profile
from .sources.steamspy import ROGUE_TAGS, owners_midpoint
from .tagging.autotag import clean_text, infer_subgenre, tag_game
from .taxonomy import load_taxonomy

log = logging.getLogger("gamecred.build")
DB_PATH = PROCESSED_DIR / "gamecred.sqlite"
DATASET_PATH = PROCESSED_DIR / "dataset.json"
ROGUE_TAG_SET = set(ROGUE_TAGS)
ROGUE_TAG_MAX_RANK = 12


def _read(source: str, appid: int):
    p = RAW_DIR / source / f"{appid}.json"
    if not p.exists():
        return None
    try:
        return json.loads(p.read_text())
    except json.JSONDecodeError:
        return None


def _year(s: str | None) -> int | None:
    m = re.search(r"(19|20)\d{2}", s or "")
    return int(m.group(0)) if m else None


def assemble() -> list[dict]:
    tax = load_taxonomy()
    curated = {}
    for p in load_profiles():
        p, issues = validate_profile(p, fix=True)
        if any(i.level == "error" for i in issues):
            log.warning("skipping invalid curated profile %s", p.get("_file"))
            continue
        curated[int(p["appid"])] = p

    from .wikis import load as load_wikis
    wikis = load_wikis()
    games = []
    for appid in target_appids():
        spy = _read("steamspy_app", appid) or {}
        st_raw = _read("steam_app", appid) or {}
        st = (st_raw.get(str(appid)) or {}).get("data") if st_raw.get(str(appid), {}).get("success") else None
        rv_raw = _read("steam_reviews", appid) or {}
        rv = rv_raw.get("query_summary") if rv_raw.get("success") else None
        cur = curated.get(appid)
        if not (spy or st or cur):
            continue
        tags = spy.get("tags") if isinstance(spy.get("tags"), dict) else {}
        ranked_tags = [t for t, _ in sorted(tags.items(), key=lambda kv: -kv[1])]
        rogue_rank = next((i for i, t in enumerate(ranked_tags) if t in ROGUE_TAG_SET), None)
        # A stray low-ranked "Rogue-like" vote doesn't make Hollow Knight a roguelike: require a top-N rogue tag.
        is_rogue = bool(cur) or (rogue_rank is not None and rogue_rank < ROGUE_TAG_MAX_RANK)
        if not is_rogue:
            continue
        if st and st.get("type") not in (None, "game"):
            continue
        pos = (rv or {}).get("total_positive", spy.get("positive", 0)) or 0
        neg = (rv or {}).get("total_negative", spy.get("negative", 0)) or 0
        name = (cur or {}).get("name") or (st or {}).get("name") or spy.get("name") or str(appid)
        year = (cur or {}).get("release_year") or _year(((st or {}).get("release_date") or {}).get("date"))
        po = (st or {}).get("price_overview") or {}
        spy_price = str(spy.get("initialprice") or "0")
        price = (po.get("initial") / 100) if po.get("initial") else (
            int(spy_price) / 100 if spy_price.isdigit() and int(spy_price) > 0 else None)
        free = bool((st or {}).get("is_free")) or price in (None, 0)
        text = clean_text(((st or {}).get("short_description") or "") + " " + ((st or {}).get("detailed_description") or ""))

        mech = tag_game(tags, text)
        source = "auto"
        if cur:
            mech = {k: {"intensity": int(v), "confidence": 1.0, "source": "curated"} for k, v in cur["mechanics"].items()}
            source = "curated"
        subgenre = (cur or {}).get("subgenre") or infer_subgenre(tags, mech)
        if subgenre not in mech:
            mech[subgenre] = {"intensity": 3, "confidence": 0.7 if not cur else 1.0, "source": "inferred"}

        critic = dict((cur or {}).get("critic") or {})
        mc = ((st or {}).get("metacritic") or {}).get("score")
        if mc and "metacritic" not in critic:
            critic["metacritic"] = mc
        rev = revenue_estimate(pos + neg, None if free else price, year)
        games.append({
            "appid": appid, "name": name, "year": year, "price": None if free else price, "free": free,
            "developer": (cur or {}).get("developer") or ", ".join((st or {}).get("developers") or []) or spy.get("developer"),
            "publisher": ", ".join((st or {}).get("publishers") or []) or spy.get("publisher"),
            "subgenre": subgenre, "source": source, "rogue_tag_rank": rogue_rank, "confidence": (cur or {}).get("confidence", "auto"),
            "wiki": (cur or {}).get("wiki"),
            "reviews": pos + neg, "positive": pos, "negative": neg,
            "pos_ratio": pos / (pos + neg) if pos + neg else None,
            "rating": steamdb_rating(pos, neg), "wilson": wilson_lower(pos, neg),
            "review_desc": (rv or {}).get("review_score_desc"),
            "owners_mid": owners_midpoint(spy.get("owners")), "ccu": spy.get("ccu"),
            "units_est": rev["units"], "revenue_est": rev["gross"], "revenue_low": rev["low"], "revenue_high": rev["high"],
            "metacritic": critic.get("metacritic"), "ign": critic.get("ign"),
            "early_access": "Early Access" in tags or any(g.get("description") == "Early Access" for g in (st or {}).get("genres", [])),
            "steam_tags": [t for t, _ in sorted(tags.items(), key=lambda kv: -kv[1])][:20],
            "stats": (cur or {}).get("stats") or {},
            "evidence": (cur or {}).get("evidence") or {},
            "mechanics": mech,
            "header": (st or {}).get("header_image"),
            **_wiki_fields(wikis.get(str(appid)), (cur or {}).get("wiki")),
        })

    # Composite outcome variables (percentiles across the whole universe).
    wk = np.array([math.log10(g["wiki_edits"] + 1) if g.get("wiki_edits") else np.nan for g in games], dtype=float)
    for g, e in zip(games, percentile_rank(wk)):
        g["community_pct"] = None if np.isnan(e) else round(float(e), 2)
    rating = np.array([g["rating"] if g["rating"] is not None else np.nan for g in games], dtype=float)
    # Commercial: log revenue for paid games; F2P falls back to log(units) scaled to same percentile space.
    comm_raw = np.array([math.log10(g["revenue_est"]) if g["revenue_est"] else
                         (math.log10(g["units_est"] * 8) if g["units_est"] else np.nan) for g in games], dtype=float)
    critic = np.array([(g["metacritic"] if g["metacritic"] else (g["ign"] * 10 if g["ign"] else np.nan)) for g in games], dtype=float)
    q, c, k = percentile_rank(rating), percentile_rank(comm_raw), percentile_rank(critic)
    gsi = success_index(q, c, k)
    for g, qi, ci, ki, si in zip(games, q, c, k, gsi):
        g["quality_pct"] = None if np.isnan(qi) else round(float(qi), 2)
        g["commercial_pct"] = None if np.isnan(ci) else round(float(ci), 2)
        g["critic_pct"] = None if np.isnan(ki) else round(float(ki), 2)
        g["gsi"] = None if np.isnan(si) else round(float(si), 2)
    # Team pedigree (confounder): earlier titles by the same developer within the dataset, and whether one was a hit.
    by_dev: dict[str, list[dict]] = {}
    for g in games:
        for dev in _devs(g.get("developer")):
            by_dev.setdefault(dev, []).append(g)
    for g in games:
        prior = {p["appid"]: p for dev in _devs(g.get("developer")) for p in by_dev.get(dev, [])
                 if p["appid"] != g["appid"] and p.get("year") and g.get("year") and p["year"] < g["year"]}
        g["dev_prior_titles"] = len(prior)
        g["dev_prior_hit"] = any((p.get("gsi") or 0) >= 75 for p in prior.values())
    log.info("assembled %d games (%d curated)", len(games), sum(g["source"] == "curated" for g in games))
    DATASET_PATH.write_text(json.dumps(games))
    write_sqlite(games, tax)
    return games


def _devs(s: str | None) -> list[str]:
    if not s:
        return []
    return [re.sub(r"\b(inc|llc|ltd|studios?|games?|entertainment)\b\.?", "", d.lower()).strip(" ,.") for d in re.split(r",|/|&", s) if d.strip()]


def _wiki_fields(w: dict | None, curated_url: str | None) -> dict:
    if not w or not w.get("found"):
        return {"wiki_articles": None, "wiki_edits": None, "wiki_content": {}}
    url = curated_url or w["api"].replace("/api.php", "/")
    return {"wiki_articles": w.get("articles"), "wiki_edits": w.get("edits"), "wiki_content": w.get("content") or {},
            "wiki": url}


def write_sqlite(games: list[dict], tax) -> None:
    if DB_PATH.exists():
        DB_PATH.unlink()
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.executescript("""
    CREATE TABLE families(id TEXT PRIMARY KEY, name TEXT, desc TEXT);
    CREATE TABLE subfamilies(id TEXT PRIMARY KEY, family TEXT, name TEXT);
    CREATE TABLE mechanics(id TEXT PRIMARY KEY, name TEXT, desc TEXT, family TEXT, subfamily TEXT);
    CREATE TABLE games(appid INTEGER PRIMARY KEY, name TEXT, year INTEGER, price REAL, free INTEGER, developer TEXT,
        publisher TEXT, subgenre TEXT, source TEXT, confidence TEXT, wiki TEXT, reviews INTEGER, positive INTEGER,
        negative INTEGER, pos_ratio REAL, rating REAL, wilson REAL, owners_mid REAL, ccu INTEGER, units_est REAL,
        revenue_est REAL, revenue_low REAL, revenue_high REAL, metacritic REAL, ign REAL, early_access INTEGER,
        quality_pct REAL, commercial_pct REAL, critic_pct REAL, gsi REAL, wiki_articles INTEGER, wiki_edits INTEGER,
        community_pct REAL);
    CREATE TABLE game_mechanics(appid INTEGER, mechanic TEXT, intensity INTEGER, confidence REAL, source TEXT,
        evidence TEXT, PRIMARY KEY(appid, mechanic));
    CREATE TABLE game_stats(appid INTEGER, stat TEXT, value REAL, PRIMARY KEY(appid, stat));
    CREATE TABLE game_tags(appid INTEGER, tag TEXT, rank INTEGER);
    """)
    for fid, f in tax.families.items():
        cur.execute("INSERT INTO families VALUES(?,?,?)", (fid, f["name"], f["desc"]))
        for sid, s in f["subfamilies"].items():
            cur.execute("INSERT INTO subfamilies VALUES(?,?,?)", (sid, fid, s["name"]))
    for m in tax.mechanics.values():
        cur.execute("INSERT INTO mechanics VALUES(?,?,?,?,?)", (m.id, m.name, m.desc, m.family, m.subfamily))
    cols = ["appid", "name", "year", "price", "free", "developer", "publisher", "subgenre", "source", "confidence", "wiki",
            "reviews", "positive", "negative", "pos_ratio", "rating", "wilson", "owners_mid", "ccu", "units_est",
            "revenue_est", "revenue_low", "revenue_high", "metacritic", "ign", "early_access", "quality_pct",
            "commercial_pct", "critic_pct", "gsi", "wiki_articles", "wiki_edits", "community_pct"]
    for g in games:
        cur.execute(f"INSERT INTO games VALUES({','.join('?' * len(cols))})", [g.get(c) for c in cols])
        for mid, v in g["mechanics"].items():
            cur.execute("INSERT INTO game_mechanics VALUES(?,?,?,?,?,?)",
                        (g["appid"], mid, v["intensity"], v["confidence"], v["source"], g["evidence"].get(mid)))
        for k, v in g["stats"].items():
            if isinstance(v, (int, float)):
                cur.execute("INSERT INTO game_stats VALUES(?,?,?)", (g["appid"], k, v))
        for i, t in enumerate(g["steam_tags"]):
            cur.execute("INSERT INTO game_tags VALUES(?,?,?)", (g["appid"], t, i))
    con.commit()
    con.close()


def load_dataset() -> list[dict]:
    return json.loads(DATASET_PATH.read_text()) if DATASET_PATH.exists() else []
