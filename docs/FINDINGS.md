# GameCred findings

_Auto-generated 2026-10-13 from 2462 roguelikes (392 expert-curated). Associations from observational data, not causal guarantees. Method: METHODOLOGY.md._

## Headline numbers

- **Model accuracy:** mechanics + subgenre + price/year/pedigree controls cut the error of predicting a game's Success Index from 23.4 to 16.9 points (5-fold CV).
- **Out-of-time test:** trained on releases ≤ 2021, then ranked 911 unseen 2022+ games with Spearman ρ = 0.47. Of the games it put in the top quartile, **57%** really were hits (chance is 25%).
- **Tagging reliability:** blind re-tag of 30 games, Cohen's κ = 0.71 (substantial agreement).

## What every roguelike needs (table stakes)

- (none at current sample size)

## Robust positive signals

These have a positive stratified Δ, and a matched comparison against the 5 most similar games without the mechanic agrees.

- **Multiplicative Scaling**: Δ +9.1 pts (CI +4.8…+12.6), matched +12.7; in 1% of games
- **Passive Relics / Trinkets**: Δ +7.4 pts (CI +5.5…+9.6), matched +11.5; in 14% of games
- **Dice Mechanics**: Δ +7.4 pts (CI +2.0…+12.1), matched +10.6; in 1% of games
- **Pre-run Mutators / Challenge Runs**: Δ +6.6 pts (CI +2.1…+10.7), matched +12.9; in 1% of games
- **Item/Card Pool Unlocks**: Δ +6.6 pts (CI +4.6…+8.6), matched +10.5; in 18% of games
- **Permanent Stat Upgrades**: Δ +6.4 pts (CI +3.6…+9.1), matched +11.3; in 6% of games
- **Mod Support / Workshop**: Δ +6.4 pts (CI +3.3…+9.4), matched +14.0; in 2% of games
- **Projectile Modifiers**: Δ +6.3 pts (CI +0.9…+11.3), matched +10.4; in 1% of games
- **Build / Combat Phases**: Δ +6.2 pts (CI +0.7…+10.8), matched +7.8; in 1% of games
- **Seeded Runs**: Δ +6.1 pts (CI +2.2…+9.9), matched +15.9; in 1% of games

## Red flags

- **Persistent Shared World**: Δ -8.6 pts (CI -15.1…-2.0)
- **Auto-battle Resolution**: Δ -6.7 pts (CI -10.3…-3.0)
- **Online Co-op**: Δ -3.7 pts (CI -5.8…-1.5)
- **Party / Roster Building**: Δ -1.8 pts (CI -4.5…+1.2)
- **Scarce Healing**: Δ -1.7 pts (CI -4.4…+1.3)
- **Crafting**: Δ -1.5 pts (CI -4.2…+1.3)
- **Starting Loadout Choice**: Δ -0.8 pts (CI -4.1…+2.7)
- **Dodge / Dash with i-frames**: Δ -0.3 pts (CI -3.3…+2.7)

## Per-subgenre must-haves

- **Roguelike Deckbuilder** (n=213): must have Acts / Biomes, Pick 1 of N Rewards, Passive Relics / Trinkets; differentiators: Dice Mechanics, Item/Card Upgrading, Explicit Synergies. Full rubric: rubrics/hybrid_deckbuilder.md
- **Survivors-like** (n=99): must have Permanent Stat Upgrades, Item/Card Pool Unlocks, Pickup Collection / Magnet, Movement Speed Scaling, Status Effects, Enemy Health/Damage Scaling, Early Access Development; differentiators: Weapon Variety. Full rubric: rubrics/hybrid_survivors.md
- **Action Roguelite** (n=931): must have —; differentiators: Systemic Simulation, Multiple Endings / True Ending, NPC Relationships, On-hit / On-kill Triggers, Elites / Champions. Full rubric: rubrics/hybrid_action_roguelite.md
- **Traditional Roguelike** (n=122): must have Permadeath; differentiators: Level-up Choice. Full rubric: rubrics/hybrid_traditional.md
- **Strategy Roguelite** (n=471): must have —; differentiators: Build Archetypes, Status Effects, Horde Density, Mod Support / Workshop, Elites / Champions. Full rubric: rubrics/hybrid_strategy.md
- **Puzzle Roguelite** (n=90): must have —; differentiators: —. Full rubric: rubrics/hybrid_puzzle.md
- **Shooter Roguelite** (n=217): must have Permadeath, First-person; differentiators: Dodge / Dash with i-frames, Horde Density, Scarce Healing. Full rubric: rubrics/hybrid_shooter.md
- **Auto-battler Roguelite** (n=80): must have —; differentiators: Party / Roster Building. Full rubric: rubrics/hybrid_autobattler.md
- **Survival Roguelite** (n=121): must have Procedural Levels; differentiators: —. Full rubric: rubrics/hybrid_survival.md
- **Narrative / Event Roguelite** (n=50): must have Random Events (? nodes); differentiators: —. Full rubric: rubrics/hybrid_narrative.md

## Design archetypes (data-driven)

- **Multiplicative Scaling + Build Archetypes + Ascension / Heat Ladder**: median GSI 95, ρ +0.18, n=12 (e.g. Wordatro!, Nubby's Number Factory, Ballionaire)
- **Item Stacking + On-hit / On-kill Triggers + Challenge-gated Unlocks**: median GSI 93, ρ +0.16, n=10 (e.g. Risk of Rain (2013), Risk of Rain Returns, Risk of Rain 2)
- **Room-based Floors + Dodge / Dash with i-frames + Melee Combos**: median GSI 88, ρ +0.10, n=44 (e.g. Dreamscaper, Teenage Mutant Ninja Turtles: Splintered Fate, Spiritfall)
- **Twin-stick Shooting + Projectile Modifiers + Weapon Handling Skill**: median GSI 86, ρ -0.00, n=26 (e.g. West of Dead, CRYPTARK, SYNTHETIK 2)
- **Deckbuilding + Energy / Mana per Turn + Turn-based**: median GSI 81, ρ -0.04, n=56 (e.g. Dawncaster, Pirates Outlaws, Card Quest)
- **Platforming + Movement Kit + Procedural Levels**: median GSI 81, ρ -0.01, n=38 (e.g. Fury Unleashed, GoNNER, Ultros)
- **Build / Combat Phases + Auto-battle Resolution + Merge Duplicates to Upgrade**: median GSI 80, ρ +0.06, n=23 (e.g. Super Auto Pets, The Bazaar, 9 Kings)
- **Horde Density + Auto-attack (Survivors-like) + Level-up Choice**: median GSI 80, ρ +0.01, n=35 (e.g. Spirit Hunters: Infinite Horde, Twilight Survivors, Army of Ruin)
- **First-person + Weapon Variety + Real-time Action**: median GSI 80, ρ -0.08, n=40 (e.g. STRAFE: Gold Edition, Receiver, Eldritch)
- **Party / Roster Building + Random Events (? nodes) + Vehicle / Ship Avatar**: median GSI 78, ρ -0.18, n=53 (e.g. Abandon Ship, Shortest Trip to Earth, Convoy)
- **Secrets / Hidden Areas + Cursed Items + Item Identification**: median GSI 78, ρ +0.08, n=23 (e.g. ToeJam & Earl: Back in the Groove!, Pixel Dungeon, Shattered Pixel Dungeon)
- **Crafting + Inventory / Spatial Inventory + Open Procedural World**: median GSI 74, ρ -0.10, n=32 (e.g. Windbound, UnReal World, NEO Scavenger)

## Checklists predict the floor, not the ceiling

Biggest **over-performers** (actual far above what their mechanics predict): The Binding of Isaac (96 vs 55), FTL: Faster Than Light (97 vs 57), Super Auto Pets (96 vs 55), One Way Heroics (88 vs 49), Don't Starve (93 vs 55), Rogue Legacy (95 vs 57).

Biggest **under-performers** (ticked the boxes, missed): LONE RUIN (30 vs 74), Survivor Mercs (31 vs 63), Card Crawl (25 vs 56), Loot River (45 vs 76), Ravenbound (46 vs 76), Dice Legacy (45 vs 71).

So GameCred reduces downside risk: missing fundamentals and red flags are detectable. Breakout originality and execution aren't.

## Trends

Rising: Early Access Development (+4.0 pp/yr), Explicit Synergies (+2.6 pp/yr), Deckbuilding (+2.2 pp/yr), Horde Density (+1.4 pp/yr), Passive Relics / Trinkets (+1.3 pp/yr), Pick 1 of N Rewards (+1.2 pp/yr).

Declining: Procedural Levels (-2.8 pp/yr), Permadeath (-2.6 pp/yr), Local Co-op (-1.1 pp/yr), Platforming (-0.9 pp/yr), Shops / Merchants (-0.9 pp/yr).
