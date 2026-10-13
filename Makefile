# GameCred — every workflow step is one target. Run `make help`.
PY := .venv/bin/python

.PHONY: help setup discover fetch build export doctor heal check test serve all loop report

help:            ## list targets
	@grep -E '^[a-z]+:.*##' Makefile | awk -F':.*## ' '{printf "  make %-10s %s\n", $$1, $$2}'

setup:           ## create venv and install deps
	python3 -m venv .venv && .venv/bin/pip install -q -r requirements.txt

discover:        ## rebuild the roguelike universe from SteamSpy tags (~6 min, rate limited)
	$(PY) -m gamecred discover

fetch:           ## fetch/refresh raw store, review and tag data (cached, resumable; ~80 min cold)
	$(PY) -m gamecred fetch

build:           ## assemble dataset + SQLite from raw cache and curated profiles
	$(PY) -m gamecred build

export:          ## run analyses and write dashboard/data.js
	$(PY) -m gamecred export

doctor:          ## health check, report only
	$(PY) -m gamecred doctor

heal:            ## health check + automatic repairs (self-healing)
	$(PY) -m gamecred doctor --fix

test:            ## unit tests
	$(PY) -m pytest -q tests

check: test      ## validate profiles + tests (run before every commit)
	$(PY) scripts/validate_profiles.py

all: build export heal  ## full rebuild (no network except doctor fetching missing curated data)

loop:            ## one iteration of the improvement loop (see docs/WORKFLOW.md)
	bash scripts/loop.sh

report:          ## print strongest findings in the terminal
	$(PY) -m gamecred report

serve:           ## open the dashboard at http://127.0.0.1:8765
	cd dashboard && python3 -m http.server 8765 --bind 127.0.0.1
