"""Data-driven design archetypes: NMF on the curated game x mechanic intensity matrix.

Each component is a bundle of mechanics that co-occur (an emergent "mechanic family"); each game is a
mixture of components. Complements the hand-built taxonomy: where they disagree is informative.
"""
from __future__ import annotations

import numpy as np

from ..taxonomy import load_taxonomy


def _nmf(V: np.ndarray, k: int, iters: int = 600, seed: int = 0) -> tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(seed)
    n, m = V.shape
    W = rng.random((n, k)) + 0.1
    H = rng.random((k, m)) + 0.1
    eps = 1e-9
    for _ in range(iters):
        H *= (W.T @ V) / (W.T @ W @ H + eps)
        W *= (V @ H.T) / (W @ H @ H.T + eps)
    return W, H


def archetypes(games: list[dict], k: int = 12) -> dict | None:
    tax = load_taxonomy()
    cur = [g for g in games if g["source"] == "curated" and g.get("gsi") is not None]
    if len(cur) < 60:
        return None
    ids = [m for m in tax.ids() if not m.startswith("hybrid_")]
    V = np.array([[g["mechanics"].get(m, {}).get("intensity", 0) for m in ids] for g in cur], dtype=float)
    keep = V.sum(axis=0) > 0
    ids = [m for m, kk in zip(ids, keep) if kk]
    V = V[:, keep]
    # tf-idf-like downweighting of near-universal mechanics so components are distinctive
    idf = np.log(len(cur) / (1 + (V > 0).sum(axis=0))) + 0.5
    W, H = _nmf(V * idf, k)
    share = W / (W.sum(axis=1, keepdims=True) + 1e-9)
    dom = share.argmax(axis=1)
    y = np.array([g["gsi"] for g in cur])
    out = []
    for c in range(k):
        top = np.argsort(-H[c])[:10]
        mem = np.where(dom == c)[0]
        weights = share[:, c]
        # loading-weighted correlation with success
        rho = float(np.corrcoef(weights, y)[0, 1]) if weights.std() > 0 else None
        top_games = np.argsort(-share[:, c])[:8]
        hy = {}
        for i in mem:
            hy[cur[i]["subgenre"]] = hy.get(cur[i]["subgenre"], 0) + 1
        out.append({
            "id": c, "mechanics": [{"id": ids[j], "w": round(float(H[c, j] / H[c].max()), 3)} for j in top],
            "n_dominant": int(len(mem)), "mean_gsi": float(y[mem].mean()) if len(mem) else None,
            "median_gsi": float(np.median(y[mem])) if len(mem) else None,
            "corr_with_gsi": rho, "games": [cur[i]["name"] for i in top_games],
            "subgenres": sorted(hy.items(), key=lambda kv: -kv[1])[:3],
        })
    recon = float(1 - np.linalg.norm(V * idf - W @ H) / np.linalg.norm(V * idf))
    out.sort(key=lambda a: -(a["n_dominant"]))
    return {"k": k, "n_games": len(cur), "fit": recon, "archetypes": out}
