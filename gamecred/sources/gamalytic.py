"""Gamalytic adapter (optional). Requires GAMALYTIC_API_KEY (Starter/Professional plan).

Without a key, revenue is estimated in metrics.py via the review-count (Boxleiter) method.
"""
from __future__ import annotations

import os

from .http import get_json

BASE = "https://api.gamalytic.com/game"


def available() -> bool:
    return bool(os.environ.get("GAMALYTIC_API_KEY"))


def game(appid: int) -> dict | None:
    key = os.environ.get("GAMALYTIC_API_KEY")
    if not key:
        return None
    d = get_json("gamalytic", str(appid), f"{BASE}/{appid}", min_interval=1.0, max_age_days=30,
                 params={"key": key})
    if not d or d.get("error"):
        return None
    return d
