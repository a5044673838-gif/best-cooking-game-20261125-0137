// Sizzle & Serve — game state, orders, stations and the update loop.
// The chef carries one thing at a time: an ingredient, or a plate (with contents).

let orderSeq = 0;

function newOrder(rng, now) {
  const recipe = pick(rng, RECIPES);
  return {
    id: ++orderSeq,
    recipe,
    born: now,
    patience: ORDER_PATIENCE,
    flash: 0, // 1 when just served / expired, for the pop animation
  };
}

function freshState(seed) {
  const rng = mulberry32(seed || 1);
  return {
    mode: 'title', // title | playing | paused | over
    time: 0, // seconds since the day started
    dayLeft: DAY_LENGTH,
    coins: 0,
    served: 0,
    missed: 0,
    hearts: START_HEARTS,
    combo: 0,
    bestCombo: 0,
    orders: [],
    nextOrderIn: ORDER_FIRST_DELAY,
    chef: { x: VIEW.w / 2, y: 520, vx: 0, vy: 0, face: 1, moving: false, bob: 0 },
    carry: null, // {kind:'item', item} | {kind:'plate', contents:[...]}
    board: null, // {item, progress, chopping} on the chopping board
    burners: [null, null], // {item:'patty_raw', t} per burner
    plate: null, // contents array on the plating counter, or null
    platesLeft: 6,
    moveTarget: null,
    particles: [],
    floats: [], // {x,y,text,color,t,life}
    toast: null, // {text,t}
    chopping: null, // {t} while chopping is in progress
    rng,
    overReason: '',
    rank: '',
  };
}

function spawnParticles(s, x, y, color, n, spread) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 40 + Math.random() * 90;
    s.particles.push({
      x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40,
      t: 0, life: 0.5 + Math.random() * 0.4, color, r: 2 + Math.random() * 3,
    });
  }
}

function floatText(s, x, y, text, color) {
  s.floats.push({ x, y, text, color, t: 0, life: 1.2 });
}

function showToast(s, text) {
  s.toast = { text, t: 0 };
}

function plateMatches(contents, recipe) {
  const need = recipe.needs.slice().sort();
  const got = contents.slice().sort();
  return need.length === got.length && need.every((v, i) => v === got[i]);
}

function nearestStation(s) {
  const c = s.chef;
  let best = null, bestD = Infinity;
  const all = [
    ...STATIONS.bins,
    STATIONS.board, STATIONS.stove, STATIONS.plating,
    STATIONS.window, STATIONS.trash, STATIONS.plates,
  ];
  for (const st of all) {
    const dx = c.x - st.x, dy = c.y - st.y;
    const d = Math.hypot(dx, dy);
    if (d < bestD) { bestD = d; best = st; }
  }
  return bestD <= 110 ? { station: best, dist: bestD } : null;
}

function stationLabel(s) {
  const near = nearestStation(s);
  if (!near) return '';
  const st = near.station;
  const carry = s.carry;
  if (st.id.startsWith('bin-')) {
    if (carry) return 'Hands full';
    return `Take ${INGREDIENTS[st.item].name}`;
  }
  if (st.id === 'board') {
    if (s.board) return s.board.chopping ? 'Chopping…' : `Take ${INGREDIENTS[s.board.item].name}`;
    if (carry && carry.kind === 'item' && INGREDIENTS[carry.item].chop) return `Chop ${INGREDIENTS[carry.item].name}`;
    return 'Chopping board';
  }
  if (st.id === 'stove') {
    const free = s.burners.findIndex((b) => b === null);
    if (carry && carry.kind === 'item' && carry.item === 'patty_raw' && free !== -1) return 'Put patty on stove';
    const done = s.burners.findIndex((b) => b && b.t >= COOK_TIME);
    if (done !== -1 && !carry) return s.burners[done].t >= BURN_TIME ? 'Take burnt patty' : 'Take cooked patty';
    return 'Stove';
  }
  if (st.id === 'plates') {
    if (!carry && s.platesLeft > 0) return 'Take a plate';
    if (s.platesLeft === 0) return 'Out of plates!';
    return 'Plates';
  }
  if (st.id === 'plating') {
    if (carry && carry.kind === 'plate') return 'Put plate down';
    if (s.plate && !carry) return 'Pick plate up';
    if (carry && carry.kind === 'item' && s.plate) return `Add ${INGREDIENTS[carry.item].name}`;
    return 'Plating counter';
  }
  if (st.id === 'window') {
    if (carry && carry.kind === 'plate') {
      const match = s.orders.some((o) => plateMatches(carry.contents, o.recipe));
      return match ? 'Serve the dish!' : 'No order wants this';
    }
    return 'Serving window';
  }
  if (st.id === 'trash') {
    if (carry) return 'Throw it away';
    return 'Trash';
  }
  return '';
}

function interact(s) {
  const near = nearestStation(s);
  if (!near) return;
  const st = near.station;
  const carry = s.carry;

  if (st.id.startsWith('bin-')) {
    if (carry) { sfx.error(); return; }
    s.carry = { kind: 'item', item: st.item };
    sfx.pickup();
    return;
  }
  if (st.id === 'board') {
    if (s.board && !s.board.chopping) {
      s.carry = { kind: 'item', item: s.board.item };
      s.board = null;
      sfx.pickup();
      return;
    }
    if (!s.board && carry && carry.kind === 'item' && INGREDIENTS[carry.item].chop) {
      s.board = { item: carry.item, progress: 0, chopping: true };
      s.carry = null;
      sfx.chop();
    }
    return;
  }
  if (st.id === 'stove') {
    if (carry && carry.kind === 'item' && carry.item === 'patty_raw') {
      const free = s.burners.findIndex((b) => b === null);
      if (free !== -1) {
        s.burners[free] = { item: 'patty_raw', t: 0 };
        s.carry = null;
        sfx.place();
        sfx.sizzleStart();
      }
      return;
    }
    if (!carry) {
      const done = s.burners.findIndex((b) => b && b.t >= COOK_TIME);
      if (done !== -1) {
        const burnt = s.burners[done].t >= BURN_TIME;
        s.carry = { kind: 'item', item: burnt ? 'patty_burnt' : 'patty' };
        s.burners[done] = null;
        sfx.pickup();
        if (!s.burners.some((b) => b)) sfx.stopSizzle();
      }
    }
    return;
  }
  if (st.id === 'plates') {
    if (!carry && s.platesLeft > 0) {
      s.platesLeft -= 1;
      s.carry = { kind: 'plate', contents: [] };
      sfx.pickup();
    }
    return;
  }
  if (st.id === 'plating') {
    if (carry && carry.kind === 'plate') {
      if (s.plate) return;
      s.plate = carry.contents;
      s.carry = null;
      sfx.place();
      return;
    }
    if (s.plate && !carry) {
      s.carry = { kind: 'plate', contents: s.plate };
      s.plate = null;
      sfx.pickup();
      return;
    }
    if (carry && carry.kind === 'item' && s.plate) {
      s.plate.push(carry.item);
      s.carry = null;
      sfx.place();
    }
    return;
  }
  if (st.id === 'window') {
    if (carry && carry.kind === 'plate') {
      const idx = s.orders.findIndex((o) => plateMatches(carry.contents, o.recipe));
      if (idx === -1) {
        sfx.error();
        showToast(s, 'No order wants this dish');
        return;
      }
      const order = s.orders[idx];
      s.orders.splice(idx, 1);
      const left = Math.max(0, order.patience - (s.time - order.born));
      const tip = Math.round(order.recipe.price * 0.5 * (left / ORDER_PATIENCE));
      const earned = order.recipe.price + tip;
      s.coins += earned;
      s.served += 1;
      s.combo += 1;
      s.bestCombo = Math.max(s.bestCombo, s.combo);
      s.platesLeft += 1;
      s.carry = null;
      sfx.serve();
      spawnParticles(s, STATIONS.window.x, STATIONS.window.y - 20, '#ffd76a', 14, 1);
      floatText(s, STATIONS.window.x, STATIONS.window.y - 50, `+$${earned}`, '#2b7a35');
      if (s.combo >= 2) floatText(s, STATIONS.window.x, STATIONS.window.y - 78, `Combo x${s.combo}!`, '#d64541');
    }
    return;
  }
  if (st.id === 'trash') {
    if (carry) {
      s.carry = null;
      sfx.place();
      showToast(s, 'Tossed it');
    }
  }
}

function expireOrders(s) {
  for (let i = s.orders.length - 1; i >= 0; i--) {
    const o = s.orders[i];
    if (s.time - o.born >= ORDER_PATIENCE) {
      s.orders.splice(i, 1);
      s.missed += 1;
      s.hearts -= 1;
      s.combo = 0;
      sfx.error();
      showToast(s, `${o.recipe.name} walked out!`);
      if (s.hearts <= 0) endDay(s, 'The customers lost patience.');
    }
  }
}

function endDay(s, reason) {
  if (s.mode === 'over') return;
  s.mode = 'over';
  s.overReason = reason || 'Service complete!';
  const coins = s.coins;
  s.rank = coins >= 120 ? 'S' : coins >= 90 ? 'A' : coins >= 60 ? 'B' : coins >= 30 ? 'C' : 'D';
  sfx.stopSizzle();
  sfx.done();
}

function update(s, dt, input) {
  if (s.mode !== 'playing') return;
  s.time += dt;
  s.dayLeft = Math.max(0, DAY_LENGTH - s.time);
  if (s.dayLeft <= 0) {
    endDay(s, 'Service complete!');
    return;
  }

  // Orders trickle in faster as the day wears on.
  s.nextOrderIn -= dt;
  if (s.nextOrderIn <= 0 && s.orders.length < MAX_ORDERS) {
    s.orders.push(newOrder(s.rng, s.time));
    const rush = Math.max(0.55, 1 - s.time / (DAY_LENGTH * 1.4));
    s.nextOrderIn = ORDER_INTERVAL * rush;
    sfx.tick();
  }
  expireOrders(s);
  if (s.mode !== 'playing') return;

  // Chopping progresses while the chef stays at the board.
  if (s.board && s.board.chopping) {
    const near = nearestStation(s);
    if (near && near.station.id === 'board') {
      s.board.progress += dt / CHOP_TIME;
      if (Math.random() < dt * 6) sfx.chop();
      if (s.board.progress >= 1) {
        const chopped = s.board.item + '_chopped';
        s.board = { item: chopped, progress: 0, chopping: false };
        sfx.chopped();
        spawnParticles(s, STATIONS.board.x, STATIONS.board.y - 10, '#8fce7a', 8, 1);
      }
    } else {
      s.board.chopping = false;
    }
  }

  // Burners cook; a finished patty burns if left too long.
  for (const b of s.burners) if (b) b.t += dt;
  const cooking = s.burners.some((b) => b && b.t < BURN_TIME);
  if (!cooking) sfx.stopSizzle();

  // Movement: keys win over a click target.
  const ax = input.axis();
  const chef = s.chef;
  let mx = 0, my = 0;
  if (ax.x || ax.y) {
    const len = Math.hypot(ax.x, ax.y);
    mx = ax.x / len; my = ax.y / len;
    s.moveTarget = null;
  } else if (s.moveTarget) {
    const dx = s.moveTarget.x - chef.x, dy = s.moveTarget.y - chef.y;
    const d = Math.hypot(dx, dy);
    if (d > 8) { mx = dx / d; my = dy / d; } else s.moveTarget = null;
  }
  chef.moving = mx !== 0 || my !== 0;
  if (chef.moving) {
    chef.x += mx * CHEF.speed * dt;
    chef.y += my * CHEF.speed * dt;
    chef.face = mx !== 0 ? Math.sign(mx) : chef.face;
    chef.bob += dt * 11;
  }
  // Keep the chef on the kitchen floor, out of the counters.
  chef.x = Math.max(36, Math.min(VIEW.w - 36, chef.x));
  chef.y = Math.max(HUD_H + 116, Math.min(VIEW.h - 40, chef.y));
  // Counters are solid: push the chef out of the top counter row.
  if (chef.y < HUD_H + 118 && chef.y > HUD_H + 40 && chef.x > 24 && chef.x < 876) {
    chef.y = HUD_H + 118;
  }

  // Particles and floating text age out.
  for (const p of s.particles) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 30 * dt; }
  s.particles = s.particles.filter((p) => p.t < p.life);
  for (const f of s.floats) { f.t += dt; f.y -= 34 * dt; }
  s.floats = s.floats.filter((f) => f.t < f.life);
  if (s.toast) {
    s.toast.t += dt;
    if (s.toast.t > 2.2) s.toast = null;
  }

  // Steam puffs above a cooking burner.
  for (let i = 0; i < s.burners.length; i++) {
    const b = s.burners[i];
    if (b && Math.random() < dt * 4) {
      s.particles.push({
        x: STATIONS.stove.x - 52 + i * 104 + (Math.random() * 20 - 10),
        y: STATIONS.stove.y - 26, vx: (Math.random() - 0.5) * 12, vy: -46 - Math.random() * 20,
        t: 0, life: 0.9, color: b.t >= BURN_TIME ? '#5a5a5a' : '#ffffff', r: 4 + Math.random() * 4,
      });
    }
  }
}

function currentPrompt(s) {
  if (s.mode !== 'playing') return '';
  return stationLabel(s);
}
