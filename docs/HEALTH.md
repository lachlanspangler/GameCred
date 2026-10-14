# GameCred Health Report

_Generated 2026-10-13 20:09 by `python -m gamecred doctor --fix`_

**errors: 0 · fixed: 8 · warnings: 16**


## Taxonomy

- OK: 10 families, 195 mechanics

## Curated profiles

- 417 curated profiles

## Raw cache

- 7 curated games missing raw data
-   fetched
- cache files: steam_app=3000, steam_reviews=3002, steamspy_app=3002, steamspy_tag=9, wiki_cats=405, wiki_site=1792

## Auto-tagger calibration

- calibrated on 417 curated games with raw data
- multiple_endings/steam_tag: precision 22% on 9 predictions -> suppressed
- traversal_unlocks/keyword: precision 6% on 17 predictions -> suppressed
- ascension_ladder/keyword: precision 12% on 25 predictions -> suppressed
- modular_difficulty/keyword: precision 12% on 33 predictions -> suppressed
- narrative_across_runs/keyword: precision 11% on 9 predictions -> suppressed
- knowledge_progression/keyword: precision 0% on 12 predictions -> suppressed
- weapon_evolution/keyword: precision 18% on 33 predictions -> suppressed
- item_upgrading/keyword: precision 24% on 45 predictions -> suppressed
- talent_slots/keyword: precision 26% on 19 predictions -> suppressed
- card_mods/keyword: precision 18% on 17 predictions -> suppressed
- summons_minions/keyword: precision 29% on 31 predictions -> suppressed
- companions_pets/keyword: precision 17% on 60 predictions -> suppressed
- monster_capture/keyword: precision 11% on 18 predictions -> suppressed
- projectile_modifiers/keyword: precision 29% on 14 predictions -> suppressed
- proc_triggers/keyword: precision 0% on 22 predictions -> suppressed
- temporary_buffs/keyword: precision 0% on 29 predictions -> suppressed
- ultimate_meter/keyword: precision 6% on 52 predictions -> suppressed
- luck_stat/keyword: precision 12% on 8 predictions -> suppressed
- item_rarity/keyword: precision 24% on 38 predictions -> suppressed
- cursed_items/keyword: precision 23% on 22 predictions -> suppressed
- real_time_action/keyword: precision 16% on 19 predictions -> suppressed
- grid_tactics/keyword: precision 16% on 31 predictions -> suppressed
- lanes_ranks/keyword: precision 18% on 17 predictions -> suppressed
- melee_combos/keyword: precision 10% on 40 predictions -> suppressed
- stealth/keyword: precision 23% on 13 predictions -> suppressed
- weapon_handling/keyword: precision 17% on 12 predictions -> suppressed
- energy_mana/keyword: precision 8% on 12 predictions -> suppressed
- poker_hands/steam_tag: precision 4% on 77 predictions -> suppressed
- elemental_interactions/keyword: precision 25% on 12 predictions -> suppressed
- block_shield/keyword: precision 23% on 52 predictions -> suppressed
- physics_simulation/steam_tag: precision 12% on 67 predictions -> suppressed
- elites/keyword: precision 24% on 29 predictions -> suppressed
- unkillable_pursuer/keyword: precision 8% on 25 predictions -> suppressed
- enemy_variety/keyword: precision 7% on 14 predictions -> suppressed
- corruption_meter/keyword: precision 15% on 13 predictions -> suppressed
- secret_areas/keyword: precision 23% on 101 predictions -> suppressed
- leaderboards/steam_tag: precision 17% on 23 predictions -> suppressed
- leaderboards/keyword: precision 14% on 21 predictions -> suppressed
- hybrid_narrative/steam_tag: precision 20% on 10 predictions -> suppressed
- assist_mode/keyword: precision 20% on 10 predictions -> suppressed
- steam_deck_friendly/steam_tag: precision 14% on 50 predictions -> suppressed
- steam_deck_friendly/keyword: precision 27% on 15 predictions -> suppressed
- auto-tagger blind spots (recall <15%, curated-only signal): boss_gates, in_run_currency, act_structure, shops, pick_one_of_n, unlock_characters, healing_scarcity, consumables, status_effects, item_upgrading, loadout_start, optional_challenges, short_runs, double_edged_items, content_updates, room_based_floors, hub_building, node_map, long_runs, elites, enemy_hp_scaling, time_pressure, achievement_unlocks, mid_run_save, active_items
- wrote data/taxonomy/calibration.json

## Dataset

- 2462 games, 392 curated, GSI coverage 100%
- games with critic score: 284
- revenue model check: log(units est) vs log(SteamSpy owners) r = 0.81, median units/owners = 0.35 (n=2460)
- taxonomy steam_tags never seen on any game (dead rules): auto_attack:Bullet Heaven, auto_attack:Survivors-like, horde_density:Bullet Heaven, horde_density:Horde, hub_building:Base Building, hub_building:Town Building, hybrid_city_builder:Base Building, hybrid_survivors:Bullet Heaven, hybrid_survivors:Survivors-like, permadeath:Permadeath, push_your_luck:Push Your Luck, pvp:Online PvP, speedrun_support:Speedrun, waves:Wave Defense
- subgenres: hybrid_action_roguelite=914, hybrid_strategy=480, hybrid_shooter=219, hybrid_deckbuilder=213, hybrid_survivors=133, hybrid_survival=129, hybrid_traditional=128, hybrid_puzzle=90, hybrid_autobattler=79, hybrid_city_builder=39, hybrid_metroidvania=28, hybrid_narrative=10

## Dashboard

- OK
