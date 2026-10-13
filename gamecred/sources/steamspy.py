"""SteamSpy: tag listings (discovery), owners estimates, user tags with vote counts."""
from __future__ import annotations

from urllib.parse import quote

from .http import get_json

BASE = "https://steamspy.com/api.php"
# SteamSpy tag names that define the roguelike universe.
# "Roguelike", "Roguelite" and "Bullet Heaven" are not SteamSpy tag names: they return a generic top-70 list.
ROGUE_TAGS = ["Rogue-like", "Rogue-lite", "Action Roguelike",
              "Roguelike Deckbuilder", "Traditional Roguelike", "Roguevania"]


def tag_listing(tag: str) -> dict:
    return get_json("steamspy_tag", tag.replace(" ", "_"), f"{BASE}?request=tag&tag={quote(tag)}",
                    min_interval=61, max_age_days=30) or {}


def appdetails(appid: int, max_age_days: float = 30) -> dict | None:
    return get_json("steamspy_app", str(appid), f"{BASE}?request=appdetails&appid={appid}",
                    min_interval=1.0, max_age_days=max_age_days)


def owners_midpoint(owners: str | None) -> float | None:
    """'1,000,000 .. 2,000,000' -> 1.5e6 (geometric midpoint is fairer on log scale)."""
    if not owners or ".." not in owners:
        return None
    lo, hi = (int(x.strip().replace(",", "")) for x in owners.split(".."))
    if lo == 0:
        return hi / 2
    return (lo * hi) ** 0.5
