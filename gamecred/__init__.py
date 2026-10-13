"""GameCred: a living, quantitative database of roguelike game mechanics."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
TAXONOMY_PATH = DATA / "taxonomy" / "mechanics.yaml"
CURATED_DIR = DATA / "games" / "curated"
RAW_DIR = DATA / "raw"
PROCESSED_DIR = DATA / "processed"
DASHBOARD_DIR = ROOT / "dashboard"
DOCS_DIR = ROOT / "docs"
