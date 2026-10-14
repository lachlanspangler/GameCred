# GameCred findings

_Auto-generated 2026-10-13 from 2462 roguelikes (392 expert-curated). Associations from observational data, not causal guarantees. Method: METHODOLOGY.md._

## Headline numbers

- **Model accuracy:** mechanics + subgenre + price/year/pedigree controls cut the error of predicting a game's Success Index from 23.4 to 17.4 points (5-fold CV).
- **Out-of-time test:** trained on releases ≤ 2021, then ranked 1104 unseen 2022+ games with Spearman ρ = 0.46. Of the games it put in the top quartile, **54%** really were hits (chance is 25%).
- **Tagging reliability:** blind re-tag of 30 games, Cohen's κ = 0.71 (substantial agreement).

## What every roguelike needs (table stakes)

- (none at current sample size)

## Robust positive signals

These have a positive stratified Δ, and a matched comparison against the 5 most similar games without the mechanic agrees.

- **Multiplicative Scaling**: Δ +9.1 pts (CI +5.1…+12.8), matched +13.0; in 1% of games
- **Dice Mechanics**: Δ +7.9 pts (CI +0.1…+14.4), matched +7.3; in 1% of games
- **Pre-run Mutators / Challenge Runs**: Δ +6.6 pts (CI +1.8…+10.5), matched +13.2; in 1% of games
- **Mod Support / Workshop**: Δ +6.5 pts (CI +3.1…+9.4), matched +14.2; in 2% of games
- **Projectile Modifiers**: Δ +6.4 pts (CI +0.6…+11.3), matched +12.9; in 1% of games
- **Passive Relics / Trinkets**: Δ +6.3 pts (CI +4.3…+8.4), matched +9.4; in 16% of games
- **Build / Combat Phases**: Δ +6.2 pts (CI +0.7…+11.1), matched +9.6; in 1% of games
- **Seeded Runs**: Δ +6.1 pts (CI +2.2…+9.7), matched +16.4; in 1% of games
- **Learnable Attack Patterns**: Δ +5.9 pts (CI +2.5…+9.1), matched +14.2; in 1% of games
- **Interest / Economy Management**: Δ +5.8 pts (CI -1.9…+13.7), matched +10.5; in 1% of games

## Red flags

- **Online Co-op**: Δ -2.6 pts (CI -4.8…-0.4)
- **Scarce Healing**: Δ -1.7 pts (CI -4.8…+1.0)
- **Party / Roster Building**: Δ -1.4 pts (CI -4.4…+1.5)
- **Boss Gates**: Δ -1.1 pts (CI -3.4…+1.4)
- **Dodge / Dash with i-frames**: Δ +0.3 pts (CI -2.8…+3.4)

## Per-subgenre must-haves

- **Roguelike Deckbuilder** (n=213): must have Acts / Biomes, Passive Relics / Trinkets; differentiators: Dice Mechanics, Item/Card Upgrading, Explicit Synergies. Full rubric: rubrics/hybrid_deckbuilder.md
- **Survivors-like** (n=112): must have Item/Card Pool Unlocks, Unlockable Characters, Pickup Collection / Magnet, Movement Speed Scaling, Enemy Health/Damage Scaling; differentiators: Weapon Variety, Status Effects, Wave Survival. Full rubric: rubrics/hybrid_survivors.md
- **Action Roguelite** (n=933): must have —; differentiators: Systemic Simulation, NPC Relationships, Pick 1 of N Rewards, Mod Support / Workshop, Passive Relics / Trinkets. Full rubric: rubrics/hybrid_action_roguelite.md
- **Traditional Roguelike** (n=126): must have Permadeath, Turn-based; differentiators: Level-up Choice. Full rubric: rubrics/hybrid_traditional.md
- **Strategy Roguelite** (n=482): must have —; differentiators: Build Archetypes, Mod Support / Workshop, Status Effects. Full rubric: rubrics/hybrid_strategy.md
- **Puzzle Roguelite** (n=90): must have —; differentiators: —. Full rubric: rubrics/hybrid_puzzle.md
- **Shooter Roguelite** (n=219): must have First-person; differentiators: Status Effects, Dodge / Dash with i-frames, Permanent Stat Upgrades. Full rubric: rubrics/hybrid_shooter.md
- **Auto-battler Roguelite** (n=80): must have —; differentiators: —. Full rubric: rubrics/hybrid_autobattler.md
- **Survival Roguelite** (n=128): must have Procedural Levels; differentiators: —. Full rubric: rubrics/hybrid_survival.md

## Design archetypes (data-driven)

- **Multiplicative Scaling + Build Archetypes + Ascension / Heat Ladder**: median GSI 92, ρ +0.17, n=14 (e.g. Wordatro!, Nubby's Number Factory, Ballionaire)
- **Item Stacking + Challenge-gated Unlocks + On-hit / On-kill Triggers**: median GSI 92, ρ +0.20, n=10 (e.g. Risk of Rain (2013), Risk of Rain Returns, Risk of Rain 2)
- **Room-based Floors + Dodge / Dash with i-frames + Melee Combos**: median GSI 90, ρ +0.13, n=39 (e.g. Dreamscaper, Spiritfall, BlazBlue Entropy Effect)
- **Twin-stick Shooting + Projectile Modifiers + Bullet Hell Patterns**: median GSI 86, ρ +0.04, n=28 (e.g. West of Dead, Dead Estate, Magicraft)
- **Platforming + Procedural Levels + Daily / Weekly Challenge**: median GSI 83, ρ +0.03, n=42 (e.g. Spelunky, Spelunky 2, Chasm)
- **Deckbuilding + Energy / Mana per Turn + Turn-based**: median GSI 80, ρ -0.03, n=57 (e.g. Dawncaster, Card Quest, Vault of the Void)
- **Horde Density + Auto-attack (Survivors-like) + Level-up Choice**: median GSI 80, ρ +0.02, n=35 (e.g. Spirit Hunters: Infinite Horde, Twilight Survivors, Army of Ruin)
- **Build / Combat Phases + Auto-battle Resolution + Merge Duplicates to Upgrade**: median GSI 80, ρ +0.05, n=22 (e.g. Super Auto Pets, The Bazaar, 9 Kings)
- **First-person + Weapon Variety + Real-time Action**: median GSI 79, ρ -0.08, n=37 (e.g. Receiver, Heavy Bullets, STRAFE: Gold Edition)
- **Crafting + Inventory / Spatial Inventory + Hunger / Supply Clock**: median GSI 77, ρ -0.09, n=40 (e.g. NEO Scavenger, Stoneshard, Sword of the Stars: The Pit)
- **Party / Roster Building + Vehicle / Ship Avatar + Random Events (? nodes)**: median GSI 74, ρ -0.18, n=38 (e.g. Abandon Ship, Shortest Trip to Earth, Convoy)
- **Online Co-op + In-run Clock / Day Cycle + Local Co-op**: median GSI 74, ρ -0.11, n=30 (e.g. The Swords of Ditto: Mormo's Curse, Tribes of Midgard, Moon Hunters)

## Checklists predict the floor, not the ceiling

Biggest **over-performers** (actual far above what their mechanics predict): The Binding of Isaac (96 vs 53), FTL: Faster Than Light (97 vs 59), Don't Starve (93 vs 57), Super Auto Pets (96 vs 60), ROUNDS (97 vs 62), Picayune Dreams (89 vs 54).

Biggest **under-performers** (ticked the boxes, missed): LONE RUIN (30 vs 80), Survivor Mercs (31 vs 64), Loot River (45 vs 77), Ravenbound (46 vs 78), Card Crawl (25 vs 57), Wizard of Legend 2 (49 vs 75).

So GameCred reduces downside risk: missing fundamentals and red flags are detectable. Breakout originality and execution aren't.

## Trends

Rising: Early Access Development (+4.1 pp/yr), Explicit Synergies (+2.3 pp/yr), Deckbuilding (+2.3 pp/yr), Passive Relics / Trinkets (+1.3 pp/yr), Pick 1 of N Rewards (+1.0 pp/yr), Permanent Stat Upgrades (+0.8 pp/yr).

Declining: Procedural Levels (-2.5 pp/yr), Permadeath (-2.5 pp/yr), Consumables (-1.2 pp/yr), Local Co-op (-1.1 pp/yr), Platforming (-0.9 pp/yr).
