# best-cooking-game-20261125-0137

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/a5044673838-gif/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/a5044673838-gif/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

**Sizzle & Serve** — a tiny kitchen, a lunch rush, no mercy. A complete,
original 2D cooking game that plays offline in a desktop browser: take orders
from the board, grab ingredients from the counter, chop on the board, grill
patties on the stove, build dishes on plates and serve them at the window
before the customers walk out. Five recipes, combos, a day timer, three
strikes and the day is done. Pure canvas art and synthesized sound — no
assets, no network, no libraries.

## Run it

Serve the game folder and open it in a desktop browser:

```
node serve.ts
```

Then open http://localhost:8080 — move with **WASD / arrows / click**,

Or just double-click `game/index.html` — it needs no server at all.interact with **E** or by clicking a station, pause with **P**, restart
with **R**.

Hand in the entry (copies `game/` and `screenshots/` to `/output` and
writes the judge's `dossier.json`):

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## How it plays

- **Orders** arrive on the board with a patience bar. Serve the exact dish
  before the bar runs out, or the customer walks out and you lose a heart.
- **Chop** lettuce, tomato and onion on the chopping board.
- **Grill** raw patties on the stove — cooked is perfect, left too long it
  burns and goes in the trash.
- **Plate** dishes on the plating counter, then **serve** at the window.
- Tips grow with patience left; back-to-back serves build a combo.
