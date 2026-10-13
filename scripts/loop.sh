#!/usr/bin/env bash
# One iteration of the GameCred self-healing loop. Safe to run repeatedly (cron, CI, or by hand).
#   1. heal: validate + auto-repair profiles, cache, calibration
#   2. rebuild dataset and dashboard
#   3. run tests; on failure, heal once more and retry (two-strike rule)
#   4. log the outcome in docs/DIARY.md
set -uo pipefail
cd "$(dirname "$0")/.."
PY=.venv/bin/python
stamp() { date "+%Y-%m-%d %H:%M"; }
run() { "$@" >> build.log 2>&1; }

: > build.log
run $PY -m gamecred doctor --fix
run $PY -m gamecred build && run $PY -m gamecred export
if ! run $PY -m pytest -q tests; then
  echo "tests failed; healing and retrying" >> build.log
  run $PY -m gamecred doctor --fix
  run $PY -m gamecred build && run $PY -m gamecred export
  if ! run $PY -m pytest -q tests; then
    echo "- $(stamp) · loop: FAILED after retry — see build.log; needs human/agent attention" >> docs/DIARY.md
    tail -n 30 build.log
    exit 1
  fi
fi
games=$($PY -c "import json;print(len(json.load(open('data/processed/dataset.json'))))")
echo "- $(stamp) · loop: OK — $games games rebuilt, tests green" >> docs/DIARY.md
echo "loop OK ($games games)"
