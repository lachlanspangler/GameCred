"""Load and query the mechanic taxonomy."""
from __future__ import annotations

import difflib
from dataclasses import dataclass, field
from functools import lru_cache

import yaml

from . import TAXONOMY_PATH


@dataclass(frozen=True)
class Mechanic:
    id: str
    name: str
    desc: str
    family: str
    family_name: str
    subfamily: str
    subfamily_name: str
    steam_tags: tuple[str, ...] = field(default_factory=tuple)
    keywords: tuple[str, ...] = field(default_factory=tuple)
    aliases: tuple[str, ...] = field(default_factory=tuple)


class Taxonomy:
    def __init__(self, raw: dict):
        self.raw = raw
        self.mechanics: dict[str, Mechanic] = {}
        self.families: dict[str, dict] = {}
        for fid, fam in raw["families"].items():
            self.families[fid] = {"id": fid, "name": fam["name"], "desc": fam.get("desc", ""), "subfamilies": {}}
            for sid, sub in fam["subfamilies"].items():
                self.families[fid]["subfamilies"][sid] = {"id": sid, "name": sub["name"], "mechanics": []}
                for mid, m in sub["mechanics"].items():
                    if mid in self.mechanics:
                        raise ValueError(f"duplicate mechanic id {mid}")
                    self.mechanics[mid] = Mechanic(
                        id=mid, name=m["name"], desc=m.get("desc", ""),
                        family=fid, family_name=fam["name"], subfamily=sid, subfamily_name=sub["name"],
                        steam_tags=tuple(m.get("steam_tags", []) or []),
                        keywords=tuple(k.lower() for k in (m.get("keywords", []) or [])),
                        aliases=tuple(m.get("aliases", []) or []),
                    )
                    self.families[fid]["subfamilies"][sid]["mechanics"].append(mid)
        self._alias = {a: m.id for m in self.mechanics.values() for a in m.aliases}

    def resolve(self, key: str) -> str | None:
        """Map an id/alias/near-miss to a canonical mechanic id (self-healing)."""
        if key in self.mechanics:
            return key
        if key in self._alias:
            return self._alias[key]
        norm = key.strip().lower().replace("-", "_").replace(" ", "_")
        if norm in self.mechanics:
            return norm
        close = difflib.get_close_matches(norm, list(self.mechanics) + list(self._alias), n=1, cutoff=0.85)
        if close:
            return self._alias.get(close[0], close[0])
        return None

    def ids(self) -> list[str]:
        return list(self.mechanics)

    def hybrids(self) -> list[str]:
        return [m for m in self.mechanics if self.mechanics[m].subfamily == "hybrids"]


@lru_cache(maxsize=1)
def load_taxonomy() -> Taxonomy:
    with open(TAXONOMY_PATH) as f:
        return Taxonomy(yaml.safe_load(f))
