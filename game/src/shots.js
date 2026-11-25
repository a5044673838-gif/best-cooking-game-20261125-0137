// Staged scenes for the screenshots: deterministic states of the real game,
// driven by the same update/render code the player sees (?shot=start|play|end).

function stagedOrder(id, recipeId, born, patience) {
  const recipe = RECIPES.find((r) => r.id === recipeId);
  return { id, recipe, born, patience, flash: 0 };
}

function stagedScene(kind, seed) {
  const s = freshState(seed || 1);
  if (kind === 'start') {
    s.mode = 'title';
    // a lively kitchen behind the title card: two orders waiting, chef idle
    s.orders = [
      stagedOrder(1, 'classic', 0, 50),
      stagedOrder(2, 'cheese', 0, 50),
    ];
    s.time = 6;
    return s;
  }
  if (kind === 'play') {
    s.mode = 'playing';
    s.time = DAY_LENGTH - 87; // 87 seconds left on the clock
    s.dayLeft = 87;
    s.coins = 46;
    s.served = 4;
    s.combo = 2;
    s.bestCombo = 2;
    s.orders = [
      stagedOrder(1, 'classic', s.time - 12, 50),
      stagedOrder(2, 'salad', s.time - 26, 50),
      stagedOrder(3, 'double', s.time - 4, 50),
    ];
    s.chef.x = 640;
    s.chef.y = 520;
    s.chef.face = 1;
    // one patty sizzling on the stove, one cooked and ready
    s.burners = [
      { item: 'patty_raw', t: 3.5 },
      { item: 'patty_raw', t: 6.8 },
    ];
    // a plate mid-assembly: bun + lettuce, chef carrying the cooked patty
    s.plate = ['bun', 'lettuce_chopped'];
    s.carry = { kind: 'item', item: 'patty' };
    s.platesLeft = 4;
    return s;
  }
  // end
  s.mode = 'over';
  s.time = DAY_LENGTH;
  s.dayLeft = 0;
  s.coins = 86;
  s.served = 7;
  s.missed = 1;
  s.combo = 0;
  s.bestCombo = 3;
  s.rank = 'A';
  s.overReason = 'Service complete!';
  s.chef.x = 640;
  s.chef.y = 520;
  return s;
}
