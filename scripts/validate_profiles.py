"""Quick validator for curated profiles. Usage: .venv/bin/python scripts/validate_profiles.py [--fix] [files...]"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from gamecred.profiles import load_profiles, save_profile, validate_profile  # noqa: E402

fix = "--fix" in sys.argv
only = {Path(a).name for a in sys.argv[1:] if not a.startswith("--")}
errors = 0
seen = {}
for d in load_profiles():
    if only and d["_file"] not in only:
        continue
    d, issues = validate_profile(d, fix=fix)
    for i in issues:
        print(i)
        errors += i.level == "error"
    if d.get("appid") in seen:
        print(f"[error] {d['_file']}: duplicate appid {d['appid']} (also {seen[d['appid']]})")
        errors += 1
    seen[d.get("appid")] = d["_file"]
    if fix and any(i.level == "fixed" for i in issues):
        save_profile(d)
print(f"{len(seen)} profiles checked, {errors} errors")
sys.exit(1 if errors else 0)
