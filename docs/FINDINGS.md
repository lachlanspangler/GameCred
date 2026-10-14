# GameCred findings

_Auto-generated 2026-10-13 from 1529 roguelikes (343 expert-curated). Associations from observational data, not causal guarantees. Method: METHODOLOGY.md._

## Headline numbers

- **Model accuracy:** mechanics + subgenre + price/year/pedigree controls cut the error of predicting a game's Success Index from 23.7 to 17.4 points (5-fold CV).
- **Out-of-time test:** trained on releases ≤ 2021, then ranked 496 unseen 2022+ games with Spearman ρ = 0.45. Of the games it put in the top quartile, **56%** really were hits (chance is 25%).
- **Tagging reliability:** blind re-tag of 30 games, Cohen's κ = 0.72 (substantial agreement).

## What every roguelike needs (table stakes)

- (none at current sample size)

## Robust positive signals

These have a positive stratified Δ, and a matched comparison against the 5 most similar games without the mechanic agrees.

- **Multiplicative Scaling**: Δ +12.0 pts (CI +7.4…+16.5), matched +16.6; in 2% of games
- **Mod Support / Workshop**: Δ +10.2 pts (CI +6.3…+14.0), matched +19.5; in 2% of games
- **Build Archetypes**: Δ +8.1 pts (CI +4.8…+11.6), matched +16.5; in 6% of games
- **Controller / Deck Friendly**: Δ +7.9 pts (CI +2.7…+12.3), matched +14.6; in 2% of games
- **Passive Relics / Trinkets**: Δ +7.8 pts (CI +5.1…+10.6), matched +13.1; in 16% of games
- **Stealth / Detection**: Δ +7.6 pts (CI +1.2…+13.8), matched +16.5; in 2% of games
- **Explicit Synergies**: Δ +7.5 pts (CI +4.3…+10.8), matched +15.1; in 12% of games
- **Item/Card Pool Unlocks**: Δ +7.2 pts (CI +4.5…+10.0), matched +13.3; in 18% of games
- **Weapon Handling Skill**: Δ +7.2 pts (CI +2.2…+11.7), matched +15.7; in 1% of games
- **Gambling / Chance Rewards**: Δ +7.1 pts (CI +2.8…+11.6), matched +18.6; in 2% of games

## Red flags

- **Scarce Healing**: Δ -3.0 pts (CI -6.5…+0.6)
- **Branching Node Map**: Δ -2.0 pts (CI -6.7…+2.3)
- **Boss Gates**: Δ -1.8 pts (CI -5.5…+1.7)
- **Crafting**: Δ -1.7 pts (CI -5.0…+1.8)
- **Online Co-op**: Δ -1.6 pts (CI -4.2…+1.1)
- **Dodge / Dash with i-frames**: Δ -0.9 pts (CI -4.7…+2.7)

## Per-subgenre must-haves

- **Roguelike Deckbuilder** (n=144): must have Acts / Biomes, Item/Card Pool Unlocks, Pick 1 of N Rewards, Item/Card Upgrading, Passive Relics / Trinkets; differentiators: Explicit Synergies. Full rubric: rubrics/hybrid_deckbuilder.md
- **Survivors-like** (n=61): must have Short Runs (<30 min), Item/Card Pool Unlocks, Explicit Synergies, Build Archetypes, Weapon Variety, Enemy Health/Damage Scaling; differentiators: —. Full rubric: rubrics/hybrid_survivors.md
- **Action Roguelite** (n=592): must have —; differentiators: Systemic Simulation, Party / Roster Building, NPC Relationships, Mod Support / Workshop, Multiple Endings / True Ending. Full rubric: rubrics/hybrid_action_roguelite.md
- **Traditional Roguelike** (n=84): must have —; differentiators: —. Full rubric: rubrics/hybrid_traditional.md
- **Strategy Roguelite** (n=296): must have —; differentiators: Elites / Champions, Wave Survival. Full rubric: rubrics/hybrid_strategy.md
- **Puzzle Roguelite** (n=45): must have —; differentiators: —. Full rubric: rubrics/hybrid_puzzle.md
- **Shooter Roguelite** (n=130): must have Weapon Variety; differentiators: Online Co-op, Distinct Characters / Classes, Scarce Healing, Acts / Biomes. Full rubric: rubrics/hybrid_shooter.md
- **Auto-battler Roguelite** (n=49): must have Party / Roster Building; differentiators: Distinct Characters / Classes. Full rubric: rubrics/hybrid_autobattler.md
- **Survival Roguelite** (n=77): must have —; differentiators: —. Full rubric: rubrics/hybrid_survival.md

## Design archetypes (data-driven)

- **Item Stacking + Challenge-gated Unlocks + High-variance Loot**: median GSI 91, ρ +0.19, n=11 (e.g. Risk of Rain (2013), Risk of Rain Returns, Risk of Rain 2)
- **Multiplicative Scaling + Score-target Rounds + Build Archetypes**: median GSI 85, ρ +0.14, n=13 (e.g. Wordatro!, Ballionaire, Nubby's Number Factory)
- **Learnable Attack Patterns + Multi-phase Bosses + Ascension / Heat Ladder**: median GSI 82, ρ +0.25, n=19 (e.g. The Void Rains Upon Her Heart, Rogue Legacy 2, Returnal)
- **Room-based Floors + Melee Combos + Ability Slots / Boons**: median GSI 80, ρ +0.01, n=41 (e.g. Little Noah: Scion of Paradise, Spiritfall, SWORN)
- **Auto-battle Resolution + Adjacency / Grid Placement Effects + Asynchronous Multiplayer**: median GSI 79, ρ +0.09, n=9 (e.g. The Bazaar, Backpack Battles, Super Auto Pets)
- **Wave Survival + Build / Combat Phases + Twin-stick Shooting**: median GSI 78, ρ +0.01, n=23 (e.g. Wall World, Dome Keeper, Rogue Tower)
- **Horde Density + Auto-attack (Survivors-like) + Level-up Choice**: median GSI 75, ρ -0.02, n=34 (e.g. Twilight Survivors, Spirit Hunters: Infinite Horde, Bounty of One)
- **First-person + Procedural Levels + Weapon Variety**: median GSI 74, ρ -0.07, n=60 (e.g. Receiver, STRAFE: Gold Edition, Heavy Bullets)
- **Deckbuilding + Energy / Mana per Turn + Draw Manipulation**: median GSI 74, ρ -0.03, n=36 (e.g. Vault of the Void, Dawncaster, Pirates Outlaws)
- **Crafting + Long Runs (>90 min) + Open Procedural World**: median GSI 69, ρ -0.07, n=32 (e.g. UnReal World, Windbound, ADOM (Ancient Domains Of Mystery))
- **Turn-based + Party / Roster Building + Grid Tactics**: median GSI 68, ρ -0.12, n=47 (e.g. Tharsis, Vambrace: Cold Soul, Overland)
- **Vehicle / Ship Avatar + Targetable Subsystems + Random Events (? nodes)**: median GSI 67, ρ -0.15, n=18 (e.g. Abandon Ship, Shortest Trip to Earth, HighFleet)

## Checklists predict the floor, not the ceiling

Biggest **over-performers** (actual far above what their mechanics predict): The Binding of Isaac (95 vs 41), FTL: Faster Than Light (96 vs 48), Don't Starve (92 vs 46), Enter the Gungeon (96 vs 51), Brotato (98 vs 54), Into the Breach (96 vs 52).

Biggest **under-performers** (ticked the boxes, missed): LONE RUIN (13 vs 65), Survivor Mercs (15 vs 55), Card Crawl (16 vs 53), Loot River (34 vs 69), MythForce (38 vs 67), Ravenbound (40 vs 69).

So GameCred reduces downside risk: missing fundamentals and red flags are detectable. Breakout originality and execution aren't.

## Trends

Rising: Early Access Development (+4.2 pp/yr), Explicit Synergies (+3.0 pp/yr), Deckbuilding (+2.0 pp/yr), Pick 1 of N Rewards (+1.7 pp/yr), Horde Density (+1.4 pp/yr), Passive Relics / Trinkets (+1.4 pp/yr).

Declining: Permadeath (-3.0 pp/yr), Procedural Levels (-2.9 pp/yr), Shops / Merchants (-1.5 pp/yr), Consumables (-1.4 pp/yr), Scarce Healing (-1.3 pp/yr).
