# GameCred Health Report

_Generated 2026-10-13 19:29 by `python -m gamecred doctor --fix`_

**errors: 0 · fixed: 1 · warnings: 16**


## Taxonomy

- OK: 10 families, 195 mechanics

## Curated profiles

- 392 curated profiles

## Raw cache

- cache files: steam_app=2080, steam_reviews=2995, steamspy_app=2995, steamspy_tag=9, wiki_cats=405, wiki_site=1792

## Auto-tagger calibration

- calibrated on 392 curated games with raw data
- multiple_endings/steam_tag: precision 12% on 8 predictions -> suppressed
- traversal_unlocks/keyword: precision 6% on 17 predictions -> suppressed
- ascension_ladder/keyword: precision 8% on 24 predictions -> suppressed
- modular_difficulty/keyword: precision 13% on 30 predictions -> suppressed
- knowledge_progression/keyword: precision 0% on 11 predictions -> suppressed
- weapon_evolution/keyword: precision 19% on 31 predictions -> suppressed
- item_upgrading/keyword: precision 22% on 40 predictions -> suppressed
- talent_slots/keyword: precision 28% on 18 predictions -> suppressed
- card_mods/keyword: precision 20% on 15 predictions -> suppressed
- summons_minions/keyword: precision 25% on 28 predictions -> suppressed
- companions_pets/keyword: precision 17% on 59 predictions -> suppressed
- monster_capture/keyword: precision 12% on 16 predictions -> suppressed
- projectile_modifiers/keyword: precision 29% on 14 predictions -> suppressed
- proc_triggers/keyword: precision 0% on 19 predictions -> suppressed
- temporary_buffs/keyword: precision 0% on 29 predictions -> suppressed
- ultimate_meter/keyword: precision 6% on 47 predictions -> suppressed
- item_rarity/keyword: precision 27% on 33 predictions -> suppressed
- cursed_items/keyword: precision 25% on 20 predictions -> suppressed
- faction_reputation/keyword: precision 13% on 23 predictions -> suppressed
- real_time_action/keyword: precision 17% on 18 predictions -> suppressed
- grid_tactics/keyword: precision 16% on 31 predictions -> suppressed
- lanes_ranks/keyword: precision 19% on 16 predictions -> suppressed
- melee_combos/keyword: precision 11% on 37 predictions -> suppressed
- stealth/keyword: precision 20% on 10 predictions -> suppressed
- weapon_handling/keyword: precision 18% on 11 predictions -> suppressed
- energy_mana/keyword: precision 9% on 11 predictions -> suppressed
- poker_hands/steam_tag: precision 3% on 73 predictions -> suppressed
- elemental_interactions/keyword: precision 27% on 11 predictions -> suppressed
- block_shield/keyword: precision 20% on 50 predictions -> suppressed
- physics_simulation/steam_tag: precision 9% on 57 predictions -> suppressed
- elites/keyword: precision 25% on 28 predictions -> suppressed
- unkillable_pursuer/keyword: precision 9% on 23 predictions -> suppressed
- enemy_variety/keyword: precision 7% on 14 predictions -> suppressed
- corruption_meter/keyword: precision 18% on 11 predictions -> suppressed
- secret_areas/keyword: precision 22% on 95 predictions -> suppressed
- high_variance_loot/steam_tag: precision 29% on 48 predictions -> suppressed
- leaderboards/steam_tag: precision 18% on 22 predictions -> suppressed
- leaderboards/keyword: precision 14% on 21 predictions -> suppressed
- hybrid_narrative/steam_tag: precision 11% on 9 predictions -> suppressed
- assist_mode/keyword: precision 20% on 10 predictions -> suppressed
- steam_deck_friendly/steam_tag: precision 14% on 49 predictions -> suppressed
- steam_deck_friendly/keyword: precision 21% on 14 predictions -> suppressed
- auto-tagger blind spots (recall <15%, curated-only signal): boss_gates, in_run_currency, act_structure, shops, pick_one_of_n, unlock_characters, healing_scarcity, status_effects, loadout_start, item_upgrading, short_runs, optional_challenges, room_based_floors, double_edged_items, content_updates, node_map, hub_building, elites, enemy_hp_scaling, long_runs, achievement_unlocks, time_pressure, energy_mana, ascension_ladder, active_items
- wrote data/taxonomy/calibration.json

## Dataset

- 2462 games, 392 curated, GSI coverage 100%
- games with critic score: 272
- revenue model check: log(units est) vs log(SteamSpy owners) r = 0.81, median units/owners = 0.37 (n=2460)
- taxonomy steam_tags never seen on any game (dead rules): auto_attack:Bullet Heaven, auto_attack:Survivors-like, horde_density:Bullet Heaven, horde_density:Horde, hub_building:Base Building, hub_building:Town Building, hybrid_city_builder:Base Building, hybrid_survivors:Bullet Heaven, hybrid_survivors:Survivors-like, permadeath:Permadeath, push_your_luck:Push Your Luck, pvp:Online PvP, speedrun_support:Speedrun, waves:Wave Defense
- subgenres: hybrid_action_roguelite=932, hybrid_strategy=471, hybrid_shooter=217, hybrid_deckbuilder=213, hybrid_traditional=122, hybrid_survival=122, hybrid_survivors=99, hybrid_puzzle=90, hybrid_autobattler=80, hybrid_narrative=50, hybrid_city_builder=39, hybrid_metroidvania=27

## Dashboard

- OK
