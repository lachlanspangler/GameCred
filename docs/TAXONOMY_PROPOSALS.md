# Taxonomy proposals (from curation agents)

Collected from curators; reviewed into taxonomy versions. Status: `pending` / `accepted (vN)` / `rejected (reason)`.

## From action-roguelite curator (2026-10-13)
- weapon_durability — weapons break/degrade (Going Under, Exit the Gungeon)
- weapon_auto_swap — weapon changes on timer/trigger (Exit the Gungeon)
- combo_meter — uninterrupted kill/trick chains build a payout multiplier (Downwell, GoNNER, NecroDancer)
- rhythm_timing — actions synced to a beat (Crypt of the NecroDancer)
- parry_counter — dedicated precision parry/deflect (Absolum, Curse of the Dead Gods, Windblown)
- traversal_unlocks — permanent movement abilities open routes across runs (Dead Cells runes, RL2 heirlooms)
- heir_traits — each run's character rolls random mixed traits (Rogue Legacy)
- corruption_meter — run-long meter that inflicts curses as it fills (Curse of the Dead Gods, Sundered)
- day_night_cycle — in-run clock/day count structures exploration (Ravenswatch, Moon Hunters, Atomicrops)
- shop_management — run a shop/sell loot between runs (Moonlighter)
- life_sim_hub — non-combat social/farming layer between runs (Cult of the Lamb, Atomicrops, Dreamscaper)
- weapon_stance_swap — two movesets swapped mid-combat (Skul, Windblown)

## From deckbuilder curator (2026-10-13)
- party_building — recruit/manage multiple units in a run (Banners of Ruin, Across the Obelisk, Slice & Dice)
- unit_summoning — cards deploy persistent units (Monster Train, Inscryption, Wildfrost)
- lane_positioning — rows/lanes/front-back determine targeting (Monster Train, Wildfrost, Roguebook)
- card_mods — permanent per-card modifiers: sockets/enchants/seals (Balatro, Vault of the Void, Roguebook)
- dual_resource — two separate spend resources (Dawncaster, Fights in Tight Spaces)
- deck_from_equipment — deck derived from equipped gear (Trials of Fire, Hand of Fate)
- dice_manipulation — modify die faces/values (Dicey Dungeons, Astrea, Slice & Dice)
- score_target_rounds — each round must hit a score threshold (Balatro, Luck be a Landlord, Ballionaire)
- dual_deck — separate decks per conflict type (Griftlands)
- limited_play_card_pool — no free reshuffle; spent cards must be recovered (Deck of Ashes)

## Gaps noted
- Risk of Rain 2 (632360) not yet profiled; Slay the Spire 2 (2868840) not profiled.

## From traditional/strategy curator (2026-10-13)
- stealth — detection/alarm systems; avoidance is a viable core strategy (Invisible Inc, Cogmind, Quasimorph)
- summons_minions — build around controlling allied summons (Rift Wizard, Iratus, Loop Hero necromancer)
- legacy_inheritance — next character inherits from the dead one (Sunless Sea, Rogue Legacy, Dungeonmans)
- breeding_genetics — units bred from previous ones pass traits (Mewgenics)
- stress_sanity — second meter besides HP causing breakdowns (Darkest Dungeon, Curious Expedition, Don't Starve)
- turn_escalation — per-turn/jump escalation (FTL rebel fleet, Invisible Inc alarm, One Way Heroics)
- item_identification — unidentified consumables learned by use (Pixel Dungeon, Shiren, ADOM)
- hunger_clock — food drains per turn forcing progress (Shiren, SPD, Stoneshard)
- limb_injuries — localized body-part wounds (NEO Scavenger, Stoneshard, Quasimorph)
- positional_ranks — line/rank positions (Darkest Dungeon, Iratus, Shogun Showdown)
- day_night_phases — separate build/prep and combat phases per cycle (The Last Spell, Against the Storm, Don't Starve)

## From shooter/3D curator (2026-10-13)
- weapon_handling — manual reload/jam/heat as a skill layer (Synthetik, Heavy Bullets)
- weapon_mastery — weapons level/gain perks through use, persisting (Witchfire, Returnal)
- run_loss_carry — one chosen item carries across levels/runs (Nightmare Reaper, Mothergunship)
- time_loop_world — hand-built world resets on cycle, chosen progress persists (Ultros, Returnal)
- vehicle_combat — ship/vehicle is the avatar (Everspace, Sublevel Zero, Nova Drift)
- asymmetric_multiplayer — one vs many with different roles (Crawl)
- faction_reputation — standing unlocks wares/quests (ZERO Sievert, Arcadegeddon)
- traversal_tools — grapple/whip/multi-jump kit central to play (Phantom Abyss, Roboquest)
- (+ votes) stress_sanity, rhythm_timing, stealth

## Subgenre alignment note
Top-down/twin-stick shooters: shooter curator used hybrid_shooter (Dead Estate, Synthetik 2, ZERO Sievert, Nova Drift); action curator used hybrid_action_roguelite for Gungeon-likes. Decision needed (see I-014).

## Decision: taxonomy v2 (2026-10-13) — 34 mechanics accepted (121 → 155)
Accepted as proposed: turn_escalation, day_night_cycle, legacy_inheritance (merges heir_traits), breeding_genetics, life_sim_hub,
shop_management, traversal_unlocks, weapon_mastery, card_mods, party_building, combo_meter, weapon_durability, item_identification,
deck_from_equipment, faction_reputation, vehicle_combat, traversal_tools, parry_counter, rhythm_timing, stealth, weapon_handling,
score_target_rounds, dice_manipulation, dual_resource, limb_injuries, stress_sanity, corruption_meter, hunger_clock, asymmetric_multiplayer.
Merged/renamed: weapon_stance_swap (as moveset swap); summons_minions (merges unit_summoning); lanes_ranks (merges lane_positioning +
positional_ranks); prep_combat_phases (from day_night_phases); handcrafted_loop_world (from time_loop_world).
Rejected for now (≤2 examples): weapon_auto_swap, dual_deck, limited_play_card_pool, run_loss_carry.

## From survivors curator (2026-10-13) — pending (candidate v3)
- pickup_magnet_economy — XP/pickups must be collected; pickup radius is an upgradable stat (all survivors-likes)
- minute_spawn_schedule — enemy composition scripted by elapsed time, not waves (Vampire Survivors, Nomad Survival)
- aim_mode_options — player-selectable auto/manual aim (20MTD, Spellbook Demonslayers, Time Wasters)
- adjacency_placement — item effect depends on grid adjacency (God Of Weapons, Bioprototype, Backpack Battles, Backpack Hero)
- skill_tags — tag-based ability scaling (Soulstone Survivors, Halls of Torment)
- random_run_traits — run-start random trait roll (Survivor Mercs)
- friendly_fire, arena_manipulation, streamer_integration — single-example, rejected for now

## From round-2 curator D (2026-10-13) — pending
- health_drain — HP drains continuously; kills restore (Post Void)
- momentum_movement — speed conservation as core skill/resource (Haste)
- realtime_deck_cycling — real-time deck play with continuous shuffle (One Step From Eden)
- vehicle_crew_stations — co-op players man stations of a shared vehicle (We Need To Go Deeper, Void Crew)
- sacrifice_healing — heal one unit by consuming another (Othercide)

## From round-2 curator B (2026-10-13) — pending
- tile_placement_world — player places tiles that build the hero's level (Guild of Dungeoneering, Loop Hero)
- time_manipulation — time scales with movement / slow-mo as resource (SUPERHOT MCD, OTXO)
- vehicle_or_base_design — design own ship/base layout as run-long system (Genesis Alpha One, HighFleet, FTL?)
- catchup_drafting, pvp_only_rounds — ROUNDS-specific; rejected for now

## From round-2 curator A (2026-10-13) — pending
- automation_logistics — conveyors/production chains that run autonomously (PlateUp!)
- run_carryover_on_win — winning carries chosen items/layout into next run (PlateUp! franchising)
- indirect_control — command via interface/orders, not direct control (Duskers)
- destructible_subsystems — targetable systems whose destruction order matters (CRYPTARK, FTL)
- shrinking_zone — closing circle forces movement (Nightreign)
- raid_mechanics — MMO-style co-op boss mechanics (Rabbit and Steel)
- vr_motion_control — physical movement as input (Until You Fall)

## From round-2 curator C (2026-10-13) — pending
- spell_programming — ordered spell/modifier slots determine output (Noita, Magicraft)
- monster_capture — capture/tame enemies as allies or forms (Abyss Odyssey, Patch Quest, Temtem: Swarm)
- unkillable_pursuer — persistent hunter that must be evaded (Baldi's Basics, Monstrum)
- shared_world_mmo — persistent massively-multiplayer world (Realm of the Mad God)

## Decision: taxonomy v3 (2026-10-13) — 14 accepted (155 → 169)
tile_placement_world, minute_spawn_schedule, pickup_magnet_economy, skill_tags, spell_programming, adjacency_placement,
ship_base_design (from vehicle_or_base_design), automation_logistics, aim_mode_options, time_manipulation, monster_capture,
destructible_subsystems, unkillable_pursuer, crew_stations (from vehicle_crew_stations).
Still pending (1–2 examples): health_drain, momentum_movement, realtime_deck_cycling, sacrifice_healing, indirect_control,
run_carryover_on_win, shrinking_zone, raid_mechanics, vr_motion_control, shared_world_mmo, random_run_traits.

## From round-3 curator B (2026-10-13) — pending
- knowledge_progression — progress across runs is mainly player knowledge (Blue Prince, Outer Wilds-likes)
- soft_run_limit — run ends by a non-death limit (steps/days), not permadeath (Blue Prince)
- dice_placement — slot rolled dice into requirement boxes (One Deck Dungeon, Dicey Dungeons)
- worker_decay — units wear out with use (Dice Legacy)

## From round-3 curator A (2026-10-13) — pending
- hybrid_narrative — event/text-driven narrative roguelite (WORLD OF HORROR, The Red Lantern, Sunless Sea?, Curious Expedition?) — strong candidate for v4
- corpse_run — recover gear from previous body (BELOW, LET IT DIE)
- persistent_shortcuts — shortcuts persist across runs (BELOW)
- (round-3 C) falling_block_placement (Drop Duchy), minesweeper_deduction (DemonCrawl), heist_planning (Crime Boss), boss_checkpoint_shortcut (Neon Chrome) — single examples, pending

## Decision: taxonomy v4 (2026-10-13) — 5 accepted (169 → 174)
hybrid_narrative (new subgenre; WORLD OF HORROR, The Red Lantern, Sunless Sea reassigned, old subgenre kept at 2), corpse_run,
soft_run_limit, knowledge_progression, dice_placement.
