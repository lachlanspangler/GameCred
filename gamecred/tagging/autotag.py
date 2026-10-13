"""Automatic mechanic tagging from Steam user tags and store descriptions.

Confidence levels:  curated profile 1.0  >  steam user tag 0.7  >  description keyword 0.4
"""
from __future__ import annotations

import html
import json
import re
from functools import lru_cache

from .. import DATA
from ..taxonomy import load_taxonomy

TAG_CONF = 0.7
KW_CONF = 0.4
# Written by `gamecred doctor`: measured precision of each auto-tag source against curated ground truth.
CALIBRATION_PATH = DATA / "taxonomy" / "calibration.json"
SUPPRESS_BELOW = 0.3


@lru_cache(maxsize=1)
def calibration() -> dict:
    if CALIBRATION_PATH.exists():
        try:
            return json.loads(CALIBRATION_PATH.read_text()).get("precision", {})
        except json.JSONDecodeError:
            return {}
    return {}


def _conf(mid: str, source: str, default: float) -> float | None:
    """Calibrated confidence, or None if this source is too unreliable for this mechanic."""
    c = calibration().get(mid, {}).get(source)
    if c is None or c.get("n", 0) < 8:
        return default
    if c["precision"] < SUPPRESS_BELOW:
        return None
    return round(c["precision"], 2)
_TAG_RE = re.compile(r"<[^>]+>")


def clean_text(s: str | None) -> str:
    if not s:
        return ""
    s = _TAG_RE.sub(" ", s)
    return re.sub(r"\s+", " ", html.unescape(s)).lower()


def _kw_pattern(kw: str) -> re.Pattern:
    return re.compile(r"(?<![a-z])" + re.escape(kw) + r"(?![a-z])")


_patterns: dict[str, list[re.Pattern]] = {}


def tag_game(steam_tags: dict[str, int] | None, text: str, calibrated: bool = True) -> dict[str, dict]:
    """Return {mechanic_id: {"intensity": int, "confidence": float, "source": str}}.

    calibrated=False ignores calibration.json (used by the doctor to measure raw precision).
    """
    tax = load_taxonomy()
    if not _patterns:
        for mid, m in tax.mechanics.items():
            _patterns[mid] = [_kw_pattern(k) for k in m.keywords]
    out: dict[str, dict] = {}
    tags = steam_tags or {}
    ranked = [t for t, _ in sorted(tags.items(), key=lambda kv: -kv[1])]
    rank = {t: i for i, t in enumerate(ranked)}
    for mid, m in tax.mechanics.items():
        best = None
        for t in m.steam_tags:
            if t in rank:
                r = rank[t]
                inten = 3 if r < 5 else 2 if r < 12 else 1
                if best is None or inten > best:
                    best = inten
        if best is not None:
            conf = _conf(mid, "steam_tag", TAG_CONF) if calibrated else TAG_CONF
            if conf is not None:
                out[mid] = {"intensity": best, "confidence": conf, "source": "steam_tag"}
                continue
        if text:
            hits = sum(1 for p in _patterns[mid] if p.search(text))
            if hits:
                conf = _conf(mid, "keyword", KW_CONF) if calibrated else KW_CONF
                if conf is not None:
                    out[mid] = {"intensity": 2 if hits >= 2 else 1, "confidence": conf, "source": "keyword"}
    return out


def infer_subgenre(steam_tags: dict[str, int] | None, mechanics: dict[str, dict]) -> str:
    """Pick the primary hybrid_* subgenre: strongest-ranked hybrid tag, with fallbacks."""
    hy = {k: v for k, v in mechanics.items() if k.startswith("hybrid_")}
    if hy:
        return max(hy, key=lambda k: (hy[k]["intensity"], _HYBRID_PRIORITY.get(k, 0)))
    if "turn_based" in mechanics:
        return "hybrid_traditional"
    return "hybrid_action_roguelite"


# Tie-break: more specific hybrids win over broad ones.
_HYBRID_PRIORITY = {
    "hybrid_deckbuilder": 9, "hybrid_survivors": 9, "hybrid_autobattler": 8, "hybrid_traditional": 7,
    "hybrid_metroidvania": 6, "hybrid_city_builder": 6, "hybrid_puzzle": 5, "hybrid_shooter": 4,
    "hybrid_survival": 3, "hybrid_strategy": 2, "hybrid_action_roguelite": 1,
}
