# GameCred findings

_Auto-generated 2026-10-13 from 2462 roguelikes (392 expert-curated). Associations from observational data, not causal guarantees. Method: METHODOLOGY.md._

## Headline numbers

- **Model accuracy:** mechanics + subgenre + price/year/pedigree controls cut the error of predicting a game's Success Index from 23.3 to 18.0 points (5-fold CV).
- **Out-of-time test:** trained on releases ≤ 2021, then ranked 1465 unseen 2022+ games with Spearman ρ = 0.47. Of the games it put in the top quartile, **50%** really were hits (chance is 25%).
- **Tagging reliability:** blind re-tag of 30 games, Cohen's κ = 0.71 (substantial agreement).

## What every roguelike needs (table stakes)

- (none at current sample size)

## Robust positive signals

These have a positive stratified Δ, and a matched comparison against the 5 most similar games without the mechanic agrees.

- **Multiplicative Scaling**: Δ +9.1 pts (CI +4.7…+12.6), matched +13.0; in 1% of games
- **Dice Mechanics**: Δ +8.6 pts (CI +1.0…+15.7), matched +10.1; in 1% of games
- **Pre-run Mutators / Challenge Runs**: Δ +6.6 pts (CI +1.2…+10.4), matched +13.2; in 1% of games
- **Mod Support / Workshop**: Δ +6.5 pts (CI +3.4…+9.5), matched +14.2; in 2% of games
- **Projectile Modifiers**: Δ +6.4 pts (CI +1.2…+11.4), matched +12.9; in 1% of games
- **Build / Combat Phases**: Δ +6.2 pts (CI +1.1…+10.8), matched +9.6; in 1% of games
- **Seeded Runs**: Δ +6.1 pts (CI +2.2…+9.9), matched +16.4; in 1% of games
- **Learnable Attack Patterns**: Δ +5.9 pts (CI +2.6…+9.6), matched +14.2; in 1% of games
- **Build Archetypes**: Δ +5.7 pts (CI +2.8…+8.5), matched +12.5; in 4% of games
- **Multiple Endings / True Ending**: Δ +5.7 pts (CI +2.8…+8.7), matched +13.8; in 2% of games

## Red flags

- **Boss Gates**: Δ -3.9 pts (CI -6.4…-1.3)
- **In-run Currency**: Δ -3.0 pts (CI -5.2…-1.0)
- **Online Co-op**: Δ -1.1 pts (CI -3.4…+1.1)

## Per-subgenre must-haves

- **Roguelike Deckbuilder** (n=213): must have Acts / Biomes; differentiators: Item/Card Upgrading, Visible Enemy Intents. Full rubric: rubrics/hybrid_deckbuilder.md
- **Survivors-like** (n=133): must have Unlockable Characters, Pickup Collection / Magnet; differentiators: Party / Roster Building, Status Effects, Weapon Variety, Enemy Health/Damage Scaling. Full rubric: rubrics/hybrid_survivors.md
- **Action Roguelite** (n=913): must have —; differentiators: NPC Relationships, Mod Support / Workshop, Pick 1 of N Rewards, Major Free Updates, Starting Loadout Choice. Full rubric: rubrics/hybrid_action_roguelite.md
- **Traditional Roguelike** (n=128): must have Permadeath, Procedural Levels, Turn-based; differentiators: Early Access Development. Full rubric: rubrics/hybrid_traditional.md
- **Strategy Roguelite** (n=480): must have —; differentiators: —. Full rubric: rubrics/hybrid_strategy.md
- **Puzzle Roguelite** (n=90): must have —; differentiators: —. Full rubric: rubrics/hybrid_puzzle.md
- **Shooter Roguelite** (n=219): must have Permadeath, First-person; differentiators: Dodge / Dash with i-frames. Full rubric: rubrics/hybrid_shooter.md
- **Auto-battler Roguelite** (n=79): must have Explicit Synergies; differentiators: —. Full rubric: rubrics/hybrid_autobattler.md
- **Survival Roguelite** (n=128): must have Permadeath, Procedural Levels; differentiators: —. Full rubric: rubrics/hybrid_survival.md

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

Biggest **over-performers** (actual far above what their mechanics predict): The Binding of Isaac (96 vs 58), Crab Champions (98 vs 64), FTL: Faster Than Light (97 vs 63), SNKRX (84 vs 51), Downwell (89 vs 58), Post Void (92 vs 61).

Biggest **under-performers** (ticked the boxes, missed): LONE RUIN (30 vs 79), Ravenbound (46 vs 82), Survivor Mercs (31 vs 67), Loot River (45 vs 80), Card Crawl (26 vs 58), Dice Legacy (46 vs 78).

So GameCred reduces downside risk: missing fundamentals and red flags are detectable. Breakout originality and execution aren't.

## Trends

Rising: Early Access Development (+4.2 pp/yr), Deckbuilding (+2.3 pp/yr), Explicit Synergies (+2.2 pp/yr), Passive Relics / Trinkets (+1.1 pp/yr), Pick 1 of N Rewards (+0.8 pp/yr), Permanent Stat Upgrades (+0.7 pp/yr).

Declining: Procedural Levels (-2.4 pp/yr), Permadeath (-2.4 pp/yr), Consumables (-1.1 pp/yr), Local Co-op (-1.0 pp/yr), Platforming (-1.0 pp/yr).
