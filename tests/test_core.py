import math

import numpy as np
import pytest

from gamecred.analysis.impact import _bh, design_matrix, ridge, univariate
from gamecred.metrics import percentile_rank, revenue_estimate, steamdb_rating, success_index, wilson_lower
from gamecred.profiles import load_profiles, validate_profile
from gamecred.tagging.autotag import tag_game
from gamecred.taxonomy import load_taxonomy


def test_taxonomy_loads_and_ids_unique():
    t = load_taxonomy()
    assert len(t.mechanics) >= 100
    assert len(t.hybrids()) >= 8
    for m in t.mechanics.values():
        assert m.name and m.family and m.subfamily


def test_resolve_self_heals_typos():
    t = load_taxonomy()
    assert t.resolve("deckbuilding") == "deckbuilding"
    assert t.resolve("Deck-Building") is None or t.resolve("Deck-Building") == "deckbuilding"
    assert t.resolve("permadeth") == "permadeath"
    assert t.resolve("totally_unknown_mechanic") is None


def test_all_curated_profiles_valid():
    profiles = load_profiles()
    assert profiles, "no curated profiles"
    seen = set()
    for p in profiles:
        _, issues = validate_profile(dict(p), fix=True)
        errs = [i for i in issues if i.level == "error"]
        assert not errs, errs
        assert p["appid"] not in seen, f"duplicate appid {p['appid']}"
        seen.add(p["appid"])


def test_validate_fixes_bad_values():
    d = {"_file": "x.yaml", "appid": "123", "name": "X", "subgenre": "hybrid_deckbuilder",
         "mechanics": {"permadeth": 5, "deckbuilding": "two"}}
    d, issues = validate_profile(d, fix=True)
    assert d["appid"] == 123
    assert d["mechanics"]["permadeath"] == 3
    assert d["mechanics"]["deckbuilding"] == 1
    assert d["mechanics"]["hybrid_deckbuilder"] == 3


def test_metrics():
    assert steamdb_rating(0, 0) is None
    assert 0.5 < steamdb_rating(90, 10) < 0.9
    assert steamdb_rating(9000, 1000) > steamdb_rating(90, 10)
    assert wilson_lower(90, 10) < 0.9
    r = revenue_estimate(1000, 20.0, 2023)
    assert math.isclose(r["gross"], 1000 * 30 * 20 * 0.55)
    assert revenue_estimate(1000, None, 2023)["gross"] is None
    pr = percentile_rank(np.array([1.0, 2.0, np.nan, 3.0]))
    assert pr[0] == 0 and pr[3] == 100 and np.isnan(pr[2])
    gsi = success_index(np.array([100.0, 0]), np.array([100.0, np.nan]), np.array([np.nan, np.nan]))
    assert math.isclose(gsi[0], 100) and gsi[1] == 0


def test_bh_monotone():
    q = _bh(np.array([0.01, 0.04, 0.03, np.nan, 0.5]))
    assert np.isnan(q[3]) and (q[~np.isnan(q)] <= 1).all() and q[0] <= q[1]


def test_autotag():
    out = tag_game({"Roguelike Deckbuilder": 500, "Card Game": 300}, "a deckbuilder with relics and permadeath")
    assert out["deckbuilding"]["source"] == "steam_tag"
    assert "permadeath" in out


def _synthetic(n=300, seed=0):
    rng = np.random.default_rng(seed)
    t = load_taxonomy()
    ids = [m for m in t.ids() if not m.startswith("hybrid_")][:20]
    games = []
    for i in range(n):
        mech = {m: {"intensity": 2, "confidence": 1.0, "source": "curated"} for m in ids if rng.random() < 0.4}
        y = 50 + (15 if ids[0] in mech else 0) - (10 if ids[1] in mech else 0) + rng.normal(0, 8)
        games.append({"appid": i, "subgenre": "hybrid_deckbuilder", "year": 2020, "price": 20, "free": False,
                      "early_access": False, "mechanics": mech, "gsi": float(np.clip(y, 0, 100))})
    return games, ids


def test_analysis_recovers_planted_effects():
    games, ids = _synthetic()
    d = design_matrix(games)
    uni = {r["mechanic"]: r for r in univariate(d, n_boot=300)}
    assert uni[ids[0]]["ci_lo"] > 5
    assert uni[ids[1]]["ci_hi"] < -3
    rid = ridge(d, n_boot=50)
    coefs = {c["feature"]: c for c in rid["coefs"]}
    assert coefs[ids[0]]["coef"] > 8
    assert coefs[ids[1]]["coef"] < -5
    assert rid["cv_rmse"] < rid["baseline_rmse"]


def test_depth_strata_and_oof():
    from gamecred.analysis.impact import depth_strata
    games, ids = _synthetic()
    for i, g in enumerate(games):
        g["source"] = "curated" if i % 2 else "auto"
    d = design_matrix(games)
    st = depth_strata(d)
    assert len(set(st)) >= 4  # 2 sources x tertiles
    rid = ridge(d, n_boot=5)
    assert len(rid["oof"]) == len(games)
    assert "tag_depth_z" in rid["features"] and "curated_profile" in rid["features"]


def test_confound_is_removed_by_stratification():
    """A mechanic with no real effect, tagged only on well-documented (famous) games, must not look positive."""
    rng = np.random.default_rng(3)
    t = load_taxonomy()
    ids = [m for m in t.ids() if not m.startswith("hybrid_")][:30]
    games = []
    for i in range(600):
        fame = rng.random()
        n_tags = int(5 + fame * 25)
        mech = {m: {"intensity": 2, "confidence": 1.0, "source": "curated"} for m in rng.choice(ids[1:], n_tags, replace=False)}
        if fame > 0.6 and rng.random() < 0.5:
            mech[ids[0]] = {"intensity": 2, "confidence": 1.0, "source": "curated"}
        games.append({"appid": i, "subgenre": "hybrid_deckbuilder", "year": 2020, "price": 20, "free": False,
                      "early_access": False, "source": "curated", "mechanics": mech,
                      "gsi": float(np.clip(30 + 50 * fame + rng.normal(0, 8), 0, 100))})
    d = design_matrix(games)
    naive = {r["mechanic"]: r for r in univariate(d, n_boot=200, adjust_depth=False)}[ids[0]]
    adj = {r["mechanic"]: r for r in univariate(d, n_boot=200, adjust_depth=True)}[ids[0]]
    assert naive["diff"] > 10            # confounded
    assert abs(adj["diff"]) < naive["diff"] / 2   # stratification removes most of it
