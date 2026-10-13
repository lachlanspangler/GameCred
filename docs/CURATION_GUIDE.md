# Curation guide

How to write a curated profile. Template: `data/games/curated/slay_the_spire.yaml`.

1. **appid**: verify via `https://store.steampowered.com/api/storesearch/?term=NAME&cc=us` (base game, not DLC/demo/soundtrack).
2. **subgenre**: exactly one `hybrid_*`. `hybrid_shooter` is for 3D (FPS/TPS/space) shooters only. Top-down shooters are `hybrid_action_roguelite` with `hybrid_shooter: 2`.
3. **Intensity**: 1 present · 2 significant · 3 core pillar.
4. **Baseline checklist.** The blind inter-rater study (docs/IRR.md) found these are the tags raters most often *forget*, not disagree on. Decide on each one explicitly:
   `permadeath`, `pick_one_of_n`, `unlock_items`, `healing_scarcity`, `consumables`, `passive_relics`, `random_events`, `item_upgrading`, `elites`, `block_shield`, `reroll`, `ascension_ladder`, `time_pressure`.
5. **Critic scores / stats**: only verified values; omit unknowns. Never guess.
6. **Evidence**: 3–6 lines for distinctive or non-obvious tags.
7. **Confidence**: high or medium. If you'd rate it low, don't profile the game.
8. Run `make check`.
