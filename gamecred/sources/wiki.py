"""Wiki discovery + statistics via the MediaWiki API (Fandom, wiki.gg, self-hosted).

Two kinds of signal:
  * community depth  — article/edit counts (an *outcome*: big wikis follow success, not cause it)
  * content volume   — sizes of item/enemy/boss/card/... categories (a design-scale proxy; noisy)
"""
from __future__ import annotations

import re
from urllib.parse import urlparse

from .http import get_json

CATEGORY_PATTERNS = {
    "item_count": r"^(items?|relics?|artifacts?|trinkets?|passive items|collectibles|equipment)$",
    "enemy_types": r"^(enemies|monsters|mobs|creatures)$",
    "boss_count": r"^(bosses|boss)$",
    "card_count": r"^(cards?)$",
    "weapon_count": r"^(weapons?|guns)$",
    "biome_count": r"^(biomes|areas|locations|floors|zones|stages|levels)$",
}


def _slugs(name: str) -> list[str]:
    base = re.sub(r"[:™®'’!.,&]", "", name.lower())
    base = re.sub(r"\(.*?\)", "", base).strip()
    words = [w for w in re.split(r"[\s\-_/]+", base) if w]
    short = [w for w in words if w not in {"the", "edition", "remastered", "definitive", "ultimate", "deluxe"}]
    cands = ["-".join(words), "".join(words), "-".join(short), "".join(short)]
    if len(short) > 2:
        cands += ["".join(short[:2]), "-".join(short[:2])]
    out = []
    for c in cands:
        if c and c not in out:
            out.append(c)
    return out


def api_candidates(name: str, wiki_url: str | None) -> list[str]:
    out = []
    if wiki_url:
        u = urlparse(wiki_url)
        host = f"{u.scheme}://{u.netloc}"
        if "fandom.com" in u.netloc or "wiki.gg" in u.netloc:
            out.append(f"{host}/api.php")
        else:
            out += [f"{host}/api.php", f"{host}/w/api.php", f"{host}/wiki/api.php"]
    for s in _slugs(name):
        out += [f"https://{s}.fandom.com/api.php", f"https://{s}.wiki.gg/api.php"]
    return list(dict.fromkeys(out))


def _key(api: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", api.lower())[:120]


def siteinfo(api: str) -> dict | None:
    d = get_json("wiki_site", _key(api), api, min_interval=0.4, max_age_days=60, retries=1,
                 params={"action": "query", "meta": "siteinfo", "siprop": "general|statistics", "format": "json"})
    if not isinstance(d, dict) or "query" not in d:
        return None
    q = d["query"]
    return {"api": api, "sitename": q.get("general", {}).get("sitename", ""), **q.get("statistics", {})}


def _name_matches(sitename: str, name: str) -> bool:
    sw = set(re.findall(r"[a-z0-9]+", sitename.lower())) - {"wiki", "the", "official", "fandom"}
    nw = set(re.findall(r"[a-z0-9]+", name.lower())) - {"the", "of", "edition", "a"}
    return bool(sw & nw)


def discover(name: str, wiki_url: str | None) -> dict | None:
    for api in api_candidates(name, wiki_url):
        info = siteinfo(api)
        if info and info.get("articles", 0) >= 20 and (wiki_url or _name_matches(info["sitename"], name)):
            return info
    return None


def category_counts(api: str) -> dict:
    d = get_json("wiki_cats", _key(api), api, min_interval=0.4, max_age_days=60, retries=1,
                 params={"action": "query", "list": "allcategories", "acprop": "size", "aclimit": "500", "format": "json"})
    cats = ((d or {}).get("query") or {}).get("allcategories") or []
    out = {}
    for c in cats:
        nm = (c.get("*") or c.get("category") or "").strip().lower()
        for stat, pat in CATEGORY_PATTERNS.items():
            if re.match(pat, nm):
                out[stat] = max(out.get(stat, 0), int(c.get("pages", c.get("size", 0))))
    return out
