# GameCred findings

_Auto-generated 2026-10-19 from 2476 roguelikes (417 expert-curated). Associations from observational data, not causal guarantees. Method: METHODOLOGY.md._

## Headline numbers

- **Model accuracy:** mechanics + subgenre + price/year/pedigree controls cut the error of predicting a game's Success Index from 23.4 to 18.1 points (5-fold CV).
- **Out-of-time test:** trained on releases ≤ 2021, then ranked 1476 unseen 2022+ games with Spearman ρ = 0.47. Of the games it put in the top quartile, **51%** really were hits (chance is 25%).
- **Tagging reliability:** blind re-tag of 30 games, Cohen's κ = 0.71 (substantial agreement).

## What every roguelike needs (table stakes)

- (none at current sample size)

## Robust positive signals

These have a positive stratified Δ, and a matched comparison against the 5 most similar games without the mechanic agrees.

- **Systemic Simulation**: Δ +9.9 pts (CI +3.8…+16.1), matched +15.4; in 1% of games
- **Multiplicative Scaling**: Δ +9.0 pts (CI +5.0…+12.6), matched +13.4; in 1% of games
- **Pre-run Mutators / Challenge Runs**: Δ +7.4 pts (CI +2.4…+11.3), matched +13.8; in 1% of games
- **Projectile Modifiers**: Δ +7.0 pts (CI +1.7…+12.1), matched +11.6; in 1% of games
- **Seeded Runs**: Δ +6.9 pts (CI +3.3…+10.5), matched +17.2; in 1% of games
- **Build / Combat Phases**: Δ +6.9 pts (CI +1.8…+11.6), matched +8.7; in 1% of games
- **Mod Support / Workshop**: Δ +6.8 pts (CI +3.3…+9.9), matched +14.2; in 2% of games
- **Learnable Attack Patterns**: Δ +6.6 pts (CI +3.2…+10.2), matched +13.6; in 1% of games
- **Short Runs (<30 min)**: Δ +5.9 pts (CI +2.5…+8.9), matched +8.1; in 3% of games
- **Major Free Updates**: Δ +5.8 pts (CI +2.3…+9.3), matched +11.8; in 3% of games

## Red flags

- **Item Identification**: Δ -14.0 pts (CI -24.5…-3.8)
- **Hunger / Supply Clock**: Δ -6.2 pts (CI -11.3…-1.2)
- **Consumables**: Δ -3.8 pts (CI -6.9…-0.8)
- **Boss Gates**: Δ -3.6 pts (CI -6.0…-1.2)
- **In-run Currency**: Δ -2.6 pts (CI -4.5…-0.5)
- **Online Co-op**: Δ -0.6 pts (CI -2.9…+1.5)

## Per-subgenre must-haves

- **Roguelike Deckbuilder** (n=213): must have Acts / Biomes; differentiators: Item/Card Upgrading, Visible Enemy Intents. Full rubric: rubrics/hybrid_deckbuilder.md
- **Survivors-like** (n=133): must have Unlockable Characters, Pickup Collection / Magnet; differentiators: Party / Roster Building, Status Effects, Weapon Variety, Enemy Health/Damage Scaling. Full rubric: rubrics/hybrid_survivors.md
- **Action Roguelite** (n=916): must have —; differentiators: NPC Relationships, Mod Support / Workshop, Major Free Updates, Pick 1 of N Rewards, Starting Loadout Choice. Full rubric: rubrics/hybrid_action_roguelite.md
- **Traditional Roguelike** (n=129): must have Permadeath, Procedural Levels; differentiators: Early Access Development. Full rubric: rubrics/hybrid_traditional.md
- **Strategy Roguelite** (n=482): must have —; differentiators: —. Full rubric: rubrics/hybrid_strategy.md
- **Puzzle Roguelite** (n=94): must have —; differentiators: —. Full rubric: rubrics/hybrid_puzzle.md
- **Shooter Roguelite** (n=220): must have Permadeath, First-person; differentiators: Dodge / Dash with i-frames. Full rubric: rubrics/hybrid_shooter.md
- **Auto-battler Roguelite** (n=80): must have Explicit Synergies; differentiators: —. Full rubric: rubrics/hybrid_autobattler.md
- **Survival Roguelite** (n=128): must have Permadeath, Procedural Levels; differentiators: —. Full rubric: rubrics/hybrid_survival.md

## Design archetypes (data-driven)

- **Item Stacking + Challenge-gated Unlocks + On-hit / On-kill Triggers**: median GSI 97, ρ +0.24, n=12 (e.g. Risk of Rain 2, Risk of Rain (2013), Risk of Rain Returns)
- **Score-target Rounds + Multiplicative Scaling + Pattern / Hand Scoring**: median GSI 94, ρ +0.11, n=14 (e.g. Wordatro!, Aotenjo: Infinite Hands, Nubby's Number Factory)
- **Room-based Floors + Dodge / Dash with i-frames + Learnable Attack Patterns**: median GSI 89, ρ +0.14, n=49 (e.g. Dreamscaper, Spiritfall, BlazBlue Entropy Effect)
- **Dice Mechanics + Dice Manipulation + Dice Placement**: median GSI 82, ρ -0.08, n=12 (e.g. Tharsis, One Deck Dungeon, Dice Legacy)
- **First-person + Weapon Variety + Real-time Action**: median GSI 81, ρ -0.02, n=71 (e.g. Receiver, ROBOBEAT, STRAFE: Gold Edition)
- **Build / Combat Phases + Auto-battle Resolution + Merge Duplicates to Upgrade**: median GSI 81, ρ +0.08, n=24 (e.g. Super Auto Pets, The Bazaar, Backpack Battles)
- **Deckbuilding + Energy / Mana per Turn + Draw Manipulation**: median GSI 81, ρ -0.00, n=48 (e.g. Dawncaster, NEOVERSE, Card Quest)
- **Horde Density + Auto-attack (Survivors-like) + Level-up Choice**: median GSI 80, ρ +0.04, n=39 (e.g. Spirit Hunters: Infinite Horde, Twilight Survivors, Army of Ruin)
- **Online Co-op + Local Co-op + In-run Clock / Day Cycle**: median GSI 78, ρ -0.05, n=41 (e.g. Rogue Heroes: Ruins of Tasos, The Swords of Ditto: Mormo's Curse, We Need To Go Deeper)
- **Item Identification + Large Enemy Roster + Consumables**: median GSI 76, ρ -0.16, n=34 (e.g. Dragon Quest Heroes: Torneko's Mystery Dungeon -Classic HD-, Shiren the Wanderer: The Mystery Dungeon of Serpentcoil Island, Vulture for NetHack)
- **Grid Tactics + Turn-based + Party / Roster Building**: median GSI 74, ρ -0.11, n=32 (e.g. Overland, Mewgenics, MASSIVE CHALICE)
- **Long Runs (>90 min) + Hunger / Supply Clock + Open Procedural World**: median GSI 73, ρ -0.12, n=41 (e.g. Sunless Skies: Sovereign Edition, Sunless Sea, The Long Journey Home)

## Checklists predict the floor, not the ceiling

Biggest **over-performers** (actual far above what their mechanics predict): The Binding of Isaac (96 vs 59), Content Warning (99 vs 64), SNKRX (84 vs 50), FTL: Faster Than Light (97 vs 64), Post Void (92 vs 60), Vampire Survivors (98 vs 66).

Biggest **under-performers** (ticked the boxes, missed): Skillful Pixel Dungeon (7 vs 60), LONE RUIN (30 vs 78), Dragon Quest Heroes: Torneko's Mystery Dungeon -Classic HD- (34 vs 79), Tamarak Trail (30 vs 70), Hero Generations (25 vs 63), Ultimate ADOM - Caverns of Chaos (38 vs 75).

So GameCred reduces downside risk: missing fundamentals and red flags are detectable. Breakout originality and execution aren't.

## Trends

Rising: Early Access Development (+4.1 pp/yr), Deckbuilding (+2.3 pp/yr), Explicit Synergies (+2.1 pp/yr), Passive Relics / Trinkets (+1.0 pp/yr), Pick 1 of N Rewards (+0.8 pp/yr), Permanent Stat Upgrades (+0.7 pp/yr).

Declining: Procedural Levels (-2.3 pp/yr), Permadeath (-2.2 pp/yr), Local Co-op (-1.0 pp/yr), Platforming (-1.0 pp/yr), Consumables (-1.0 pp/yr).
