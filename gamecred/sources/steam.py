"""Steam storefront: app details (description, genres, metacritic, price, release date) and review summary."""
from __future__ import annotations

from .http import get_json

STORE = "https://store.steampowered.com"


def appdetails(appid: int, max_age_days: float = 60) -> dict | None:
    d = get_json("steam_app", str(appid), f"{STORE}/api/appdetails?appids={appid}&cc=us&l=english",
                 min_interval=1.8, max_age_days=max_age_days)
    if not d:
        return None
    entry = d.get(str(appid)) or {}
    return entry.get("data") if entry.get("success") else None


def review_summary(appid: int, max_age_days: float = 14) -> dict | None:
    d = get_json("steam_reviews", str(appid),
                 f"{STORE}/appreviews/{appid}?json=1&language=all&purchase_type=all&num_per_page=0&filter=all",
                 min_interval=1.0, max_age_days=max_age_days)
    if not d or not d.get("success"):
        return None
    return d.get("query_summary")
