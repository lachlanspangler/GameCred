"""Curated game profiles: load, validate and (optionally) auto-repair."""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import yaml

from . import CURATED_DIR
from .taxonomy import load_taxonomy

REQUIRED = ("appid", "name", "subgenre", "mechanics")
STAT_KEYS = {
    "playable_characters", "run_length_min", "item_count", "card_count", "weapon_count",
    "enemy_types", "boss_count", "biome_count", "difficulty_levels", "meta_currencies",
}


@dataclass
class Issue:
    file: str
    level: str  # error | warn | fixed
    msg: str

    def __str__(self) -> str:
        return f"[{self.level}] {self.file}: {self.msg}"


def load_profiles(directory: Path = CURATED_DIR) -> list[dict]:
    out = []
    for p in sorted(directory.glob("*.yaml")):
        with open(p) as f:
            d = yaml.safe_load(f) or {}
        d["_file"] = p.name
        out.append(d)
    return out


def validate_profile(d: dict, fix: bool = False) -> tuple[dict, list[Issue]]:
    """Validate one profile. With fix=True, repairable problems are corrected in-place."""
    tax = load_taxonomy()
    f = d.get("_file", "?")
    issues: list[Issue] = []
    for k in REQUIRED:
        if k not in d or d[k] in (None, "", {}):
            issues.append(Issue(f, "error", f"missing required field '{k}'"))
    if issues:
        return d, issues
    if not isinstance(d["appid"], int):
        try:
            d["appid"] = int(d["appid"])
            issues.append(Issue(f, "fixed", "appid coerced to int"))
        except (TypeError, ValueError):
            issues.append(Issue(f, "error", f"appid not an int: {d['appid']!r}"))
    sg = tax.resolve(str(d["subgenre"]))
    if sg is None or sg not in tax.hybrids():
        issues.append(Issue(f, "error", f"subgenre '{d['subgenre']}' is not a hybrid_* mechanic id"))
    elif sg != d["subgenre"]:
        issues.append(Issue(f, "fixed", f"subgenre {d['subgenre']} -> {sg}"))
        d["subgenre"] = sg
    clean = {}
    for k, v in (d.get("mechanics") or {}).items():
        mid = tax.resolve(str(k))
        if mid is None:
            issues.append(Issue(f, "error" if not fix else "warn", f"unknown mechanic '{k}'" + (" (dropped)" if fix else "")))
            if not fix:
                clean[k] = v
            continue
        if mid != k:
            issues.append(Issue(f, "fixed", f"mechanic {k} -> {mid}"))
        try:
            iv = int(v)
        except (TypeError, ValueError):
            iv = 1
            issues.append(Issue(f, "fixed", f"intensity for {mid} not int ({v!r}); set to 1"))
        if not 1 <= iv <= 3:
            issues.append(Issue(f, "fixed", f"intensity for {mid} clamped from {iv}"))
            iv = max(1, min(3, iv))
        clean[mid] = max(iv, clean.get(mid, 0))
    if sg and sg in tax.mechanics and sg not in clean:
        clean[sg] = 3
        issues.append(Issue(f, "fixed", f"added subgenre {sg} to mechanics"))
    d["mechanics"] = clean
    for k in list((d.get("stats") or {}).keys()):
        if k not in STAT_KEYS:
            issues.append(Issue(f, "warn", f"unknown stats key '{k}'"))
    for k in (d.get("evidence") or {}):
        if tax.resolve(str(k)) is None:
            issues.append(Issue(f, "warn", f"evidence for unknown mechanic '{k}'"))
    if len(clean) < 8:
        issues.append(Issue(f, "warn", f"only {len(clean)} mechanics tagged (expected >= 8)"))
    return d, issues


def save_profile(d: dict) -> None:
    body = {k: v for k, v in d.items() if not k.startswith("_")}
    with open(CURATED_DIR / d["_file"], "w") as f:
        yaml.safe_dump(body, f, sort_keys=False, allow_unicode=True, width=110)
