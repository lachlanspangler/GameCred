"""Success metrics: turn raw store/estimate data into comparable outcome variables.

All formulas are documented in docs/METHODOLOGY.md. Keep them in sync.
"""
from __future__ import annotations

import math

import numpy as np


def steamdb_rating(pos: int, neg: int) -> float | None:
    """SteamDB rating: shrinks the positive ratio toward 50% when review counts are small."""
    total = pos + neg
    if total == 0:
        return None
    avg = pos / total
    return avg - (avg - 0.5) * 2 ** (-math.log10(total + 1))


def wilson_lower(pos: int, neg: int, z: float = 1.96) -> float | None:
    n = pos + neg
    if n == 0:
        return None
    p = pos / n
    return (p + z * z / (2 * n) - z * math.sqrt((p * (1 - p) + z * z / (4 * n)) / n)) / (1 + z * z / n)


def boxleiter_multiplier(release_year: int | None) -> float:
    """Owners-per-review ratio. Ratio has fallen over time as review prompts improved."""
    if release_year is None:
        return 35.0
    if release_year <= 2016:
        return 55.0
    if release_year <= 2019:
        return 40.0
    if release_year <= 2021:
        return 33.0
    return 30.0


def revenue_estimate(reviews: int, price_usd: float | None, release_year: int | None) -> dict:
    """Gross revenue estimate (USD) with a low/high band.

    units ~= reviews * multiplier;  gross ~= units * launch_price * realized_price_factor (0.55:
    discounts, regional pricing, refunds). Band uses multipliers 0.6x and 1.6x.
    """
    if not reviews or not price_usd:
        return {"units": reviews * boxleiter_multiplier(release_year) if reviews else None,
                "gross": None, "low": None, "high": None}
    m = boxleiter_multiplier(release_year)
    units = reviews * m
    gross = units * price_usd * 0.55
    return {"units": units, "gross": gross, "low": gross * 0.6, "high": gross * 1.6}


def percentile_rank(values: np.ndarray) -> np.ndarray:
    """0-100 percentile rank, NaN-safe (NaNs stay NaN)."""
    out = np.full(values.shape, np.nan)
    mask = ~np.isnan(values)
    v = values[mask]
    if v.size == 0:
        return out
    order = v.argsort(kind="mergesort")
    ranks = np.empty_like(order, dtype=float)
    ranks[order] = np.arange(v.size)
    # average ties
    _, inv, counts = np.unique(v, return_inverse=True, return_counts=True)
    sums = np.bincount(inv, weights=ranks)
    ranks = sums[inv] / counts[inv]
    out[mask] = 100 * ranks / max(v.size - 1, 1)
    return out


DEFAULT_WEIGHTS = {"quality": 0.4, "commercial": 0.45, "critic": 0.15}


def success_index(quality_pct: np.ndarray, commercial_pct: np.ndarray, critic_pct: np.ndarray,
                  weights: dict = DEFAULT_WEIGHTS) -> np.ndarray:
    """GameCred Success Index (GSI), 0-100. Missing components are re-weighted away."""
    comps = np.vstack([quality_pct, commercial_pct, critic_pct])
    w = np.array([weights["quality"], weights["commercial"], weights["critic"]])[:, None] * np.ones_like(comps)
    w[np.isnan(comps)] = 0
    comps = np.nan_to_num(comps)
    denom = w.sum(axis=0)
    with np.errstate(invalid="ignore", divide="ignore"):
        return np.where(denom > 0, (w * comps).sum(axis=0) / denom, np.nan)
