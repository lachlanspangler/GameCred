# GameCred findings

_Auto-generated 2026-10-13 from 1382 roguelikes (318 expert-curated). Associations from observational data, not causal guarantees. Method: METHODOLOGY.md._

## Headline numbers

- **Model accuracy:** mechanics + subgenre + price/year/pedigree controls cut the error of predicting a game's Success Index from 23.7 to 17.4 points (5-fold CV).
- **Out-of-time test:** trained on releases ≤ 2021, then ranked 446 unseen 2022+ games with Spearman ρ = 0.46. Of the games it put in the top quartile, **57%** really were hits (chance is 25%).
- **Tagging reliability:** blind re-tag of 30 games, Cohen's κ = 0.72 (substantial agreement).

## What every roguelike needs (table stakes)

- (none at current sample size)

## Robust positive signals

These have a positive stratified Δ, and a matched comparison against the 5 most similar games without the mechanic agrees.

- **Multiplicative Scaling**: Δ +11.9 pts (CI +6.9…+16.6), matched +15.6; in 2% of games
- **Mod Support / Workshop**: Δ +11.4 pts (CI +7.7…+15.4), matched +20.6; in 2% of games
- **Stealth / Detection**: Δ +8.8 pts (CI +3.3…+15.1), matched +19.2; in 2% of games
- **Build Archetypes**: Δ +8.2 pts (CI +4.8…+12.0), matched +17.3; in 6% of games
- **Controller / Deck Friendly**: Δ +8.1 pts (CI +2.6…+12.7), matched +16.2; in 2% of games
- **Flat Stat Increments**: Δ +8.0 pts (CI +0.9…+14.2), matched +10.3; in 1% of games
- **Weapon Handling Skill**: Δ +7.7 pts (CI +2.9…+13.0), matched +12.5; in 2% of games
- **Passive Relics / Trinkets**: Δ +7.7 pts (CI +4.9…+10.6), matched +13.8; in 16% of games
- **Explicit Synergies**: Δ +7.5 pts (CI +4.1…+10.7), matched +15.2; in 12% of games
- **Item/Card Pool Unlocks**: Δ +7.4 pts (CI +4.7…+9.9), matched +13.5; in 19% of games

## Red flags

- **Energy / Mana per Turn**: Δ -5.8 pts (CI -10.7…-1.4)
- **Party / Roster Building**: Δ -4.8 pts (CI -8.8…-0.6)
- **Boss Gates**: Δ -3.5 pts (CI -7.6…+0.3)
- **Crafting**: Δ -1.9 pts (CI -5.5…+1.6)
- **Online Co-op**: Δ -1.9 pts (CI -4.6…+0.8)
- **Dodge / Dash with i-frames**: Δ -0.0 pts (CI -3.4…+3.4)

## Per-subgenre must-haves

- **Roguelike Deckbuilder** (n=135): must have Item/Card Pool Unlocks, Pick 1 of N Rewards, Explicit Synergies, Item/Card Upgrading, Passive Relics / Trinkets; differentiators: —. Full rubric: rubrics/hybrid_deckbuilder.md
- **Survivors-like** (n=57): must have Short Runs (<30 min), Item/Card Pool Unlocks, Explicit Synergies, Build Archetypes, Weapon Variety, Enemy Health/Damage Scaling; differentiators: —. Full rubric: rubrics/hybrid_survivors.md
- **Action Roguelite** (n=524): must have —; differentiators: Systemic Simulation, Mod Support / Workshop, NPC Relationships, Item/Card Pool Unlocks, Stealth / Detection. Full rubric: rubrics/hybrid_action_roguelite.md
- **Traditional Roguelike** (n=75): must have —; differentiators: —. Full rubric: rubrics/hybrid_traditional.md
- **Strategy Roguelite** (n=270): must have —; differentiators: Status Effects, Wave Survival. Full rubric: rubrics/hybrid_strategy.md
- **Puzzle Roguelite** (n=42): must have —; differentiators: —. Full rubric: rubrics/hybrid_puzzle.md
- **Shooter Roguelite** (n=118): must have Weapon Variety; differentiators: Distinct Characters / Classes, Early Access Development, Scarce Healing, Acts / Biomes. Full rubric: rubrics/hybrid_shooter.md
- **Auto-battler Roguelite** (n=45): must have Distinct Characters / Classes, Party / Roster Building; differentiators: —. Full rubric: rubrics/hybrid_autobattler.md
- **Survival Roguelite** (n=67): must have —; differentiators: —. Full rubric: rubrics/hybrid_survival.md

## Design archetypes (data-driven)

- **Item Stacking + Challenge-gated Unlocks + Gambling / Chance Rewards**: median GSI 92, ρ +0.23, n=14 (e.g. Risk of Rain 2, Risk of Rain (2013), Risk of Rain Returns)
- **Auto-battle Resolution + Adjacency / Grid Placement Effects + Build / Combat Phases**: median GSI 91, ρ +0.12, n=9 (e.g. Super Auto Pets, The Bazaar, Backpack Battles)
- **Room-based Floors + Dodge / Dash with i-frames + Learnable Attack Patterns**: median GSI 82, ρ +0.13, n=35 (e.g. Spiritfall, Dreamscaper, Ultros)
- **Large Enemy Roster + Mod Support / Workshop + Long Runs (>90 min)**: median GSI 78, ρ +0.12, n=17 (e.g. Tales of Maj'Eyal, ADOM (Ancient Domains Of Mystery), Rift Wizard)
- **Grid Tactics + Turn-based + Dice Mechanics**: median GSI 76, ρ -0.05, n=23 (e.g. Shotgun King: The Final Checkmate, Die in the Dungeon, Dicefolk)
- **Wave Survival + Build / Combat Phases + Twin-stick Shooting**: median GSI 76, ρ +0.03, n=19 (e.g. Rogue Tower, Wall World, Dome Keeper)
- **First-person + Weapon Variety + Procedural Levels**: median GSI 75, ρ -0.05, n=51 (e.g. Receiver, STRAFE: Gold Edition, Heavy Bullets)
- **Auto-attack (Survivors-like) + Horde Density + Level-up Choice**: median GSI 74, ρ -0.06, n=33 (e.g. Twilight Survivors, Spirit Hunters: Infinite Horde, Army of Ruin)
- **Online Co-op + Local Co-op + In-run Clock / Day Cycle**: median GSI 72, ρ -0.08, n=29 (e.g. Rogue Heroes: Ruins of Tasos, Arcadegeddon, Tunche)
- **Deckbuilding + Energy / Mana per Turn + Draw Manipulation**: median GSI 72, ρ -0.06, n=36 (e.g. Dawncaster, NEOVERSE, Card Quest)
- **Crafting + Inventory / Spatial Inventory + Hunger / Supply Clock**: median GSI 72, ρ -0.09, n=24 (e.g. Windbound, NEO Scavenger, The Flame in the Flood)
- **Party / Roster Building + Random Events (? nodes) + Vehicle / Ship Avatar**: median GSI 68, ρ -0.11, n=28 (e.g. Shortest Trip to Earth, HighFleet, Crying Suns)

## Checklists predict the floor, not the ceiling

Biggest **over-performers** (actual far above what their mechanics predict): The Binding of Isaac (94 vs 40), FTL: Faster Than Light (96 vs 47), Balatro (99 vs 54), Tales of Maj'Eyal (89 vs 46), SYNTHETIK: Legion Rising (94 vs 51), Don't Starve (92 vs 49).

Biggest **under-performers** (ticked the boxes, missed): LONE RUIN (10 vs 65), Card Crawl (14 vs 53), Loot River (31 vs 70), Survivor Mercs (12 vs 47), Dawncaster (36 vs 66), MythForce (36 vs 65).

So GameCred reduces downside risk: missing fundamentals and red flags are detectable. Breakout originality and execution aren't.

## Trends

Rising: Early Access Development (+4.3 pp/yr), Explicit Synergies (+2.8 pp/yr), Deckbuilding (+2.0 pp/yr), Pick 1 of N Rewards (+1.9 pp/yr), Horde Density (+1.6 pp/yr), Passive Relics / Trinkets (+1.4 pp/yr).

Declining: Permadeath (-3.0 pp/yr), Procedural Levels (-2.8 pp/yr), Local Co-op (-1.4 pp/yr), Shops / Merchants (-1.4 pp/yr), Consumables (-1.4 pp/yr).
