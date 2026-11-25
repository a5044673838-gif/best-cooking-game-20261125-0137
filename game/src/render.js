// Sizzle & Serve — every pixel is drawn here with canvas paths.
// No image files, no fonts from the network: system sans-serif only.

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align, weight) {
  ctx.fillStyle = color || COLORS.ink;
  ctx.font = `${weight || '700'} ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// ---- a gold coin, drawn (no emoji: headless Linux has no color-emoji font) ----
function drawCoin(ctx, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#ffd76a';
  ctx.strokeStyle = '#b98a1e';
  ctx.lineWidth = Math.max(1.5, r * 0.12);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#b98a1e';
  ctx.font = `800 ${Math.round(r * 1.15)}px system-ui, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('$', 0, r * 0.06);
  ctx.restore();
}

// ---- food icons, drawn small and readable at a glance ----
function drawIngredient(ctx, item, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineWidth = Math.max(1.5, s * 0.06);
  ctx.strokeStyle = 'rgba(43,33,24,0.55)';
  if (item === 'bun') {
    ctx.fillStyle = '#e8a54b';
    ctx.beginPath(); ctx.ellipse(0, -s * 0.12, s * 0.52, s * 0.3, 0, Math.PI, 0); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f7cf8a';
    ctx.beginPath(); ctx.ellipse(0, s * 0.16, s * 0.52, s * 0.16, 0, 0, Math.PI); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff3d6';
    for (const [dx, dy] of [[-0.2, -0.22], [0.05, -0.3], [0.26, -0.2]]) {
      ctx.beginPath(); ctx.ellipse(dx * s, dy * s, s * 0.05, s * 0.03, 0, 0, Math.PI * 2); ctx.fill();
    }
  } else if (item === 'patty_raw' || item === 'patty' || item === 'patty_burnt') {
    ctx.fillStyle = item === 'patty_raw' ? '#c98a7a' : item === 'patty' ? '#7a4a2b' : '#241a14';
    rr(ctx, -s * 0.5, -s * 0.18, s, s * 0.36, s * 0.16); ctx.fill(); ctx.stroke();
    if (item === 'patty_raw') {
      ctx.fillStyle = '#e8b7ac';
      for (const [dx, dy] of [[-0.25, 0], [0.1, -0.05], [0.3, 0.05]]) {
        ctx.beginPath(); ctx.arc(dx * s, dy * s, s * 0.06, 0, Math.PI * 2); ctx.fill();
      }
    }
  } else if (item === 'lettuce' || item === 'lettuce_chopped') {
    ctx.fillStyle = item === 'lettuce' ? '#69b455' : '#7cc96a';
    ctx.beginPath();
    ctx.moveTo(-s * 0.5, s * 0.1);
    for (let i = 0; i <= 4; i++) {
      ctx.quadraticCurveTo(-s * 0.5 + (i + 0.5) * s * 0.25, -s * 0.42, -s * 0.5 + (i + 1) * s * 0.25, s * 0.1);
    }
    ctx.lineTo(s * 0.5, s * 0.28); ctx.lineTo(-s * 0.5, s * 0.28); ctx.closePath();
    ctx.fill(); ctx.stroke();
  } else if (item === 'tomato' || item === 'tomato_chopped') {
    ctx.fillStyle = item === 'tomato' ? '#e04b3a' : '#ef6a55';
    ctx.beginPath(); ctx.arc(0, 0, s * 0.42, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#3f9e4d';
    ctx.beginPath(); ctx.ellipse(0, -s * 0.4, s * 0.14, s * 0.08, 0, 0, Math.PI * 2); ctx.fill();
    if (item === 'tomato_chopped') {
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath(); ctx.moveTo(-s * 0.3, -s * 0.25); ctx.lineTo(s * 0.3, s * 0.25); ctx.stroke();
    }
  } else if (item === 'cheese') {
    ctx.fillStyle = '#f2c230';
    ctx.beginPath(); ctx.moveTo(-s * 0.48, s * 0.28); ctx.lineTo(s * 0.48, s * 0.28); ctx.lineTo(0, -s * 0.36); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#d9962b';
    for (const [dx, dy] of [[-0.18, 0.1], [0.16, 0.02], [0.02, 0.18]]) {
      ctx.beginPath(); ctx.arc(dx * s, dy * s, s * 0.05, 0, Math.PI * 2); ctx.fill();
    }
  } else if (item === 'onion' || item === 'onion_chopped') {
    ctx.fillStyle = item === 'onion' ? '#b678c9' : '#c98fdb';
    ctx.beginPath(); ctx.arc(0, 0, s * 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath(); ctx.arc(0, 0, s * 0.24, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, s * 0.1, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

function drawPlate(ctx, x, y, s, contents) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#f4f6f8';
  ctx.strokeStyle = 'rgba(43,33,24,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.56, s * 0.2, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#dfe4ea';
  ctx.beginPath(); ctx.ellipse(0, -s * 0.02, s * 0.42, s * 0.13, 0, 0, Math.PI * 2); ctx.fill();
  if (contents && contents.length) {
    // stack the dish on the plate, newest on top
    let dy = -s * 0.1;
    for (const item of contents) {
      drawIngredient(ctx, item, 0, dy, s * 0.62);
      dy -= s * 0.14;
    }
  }
  ctx.restore();
}

function drawCounter(ctx, x, y, w, h, label) {
  ctx.fillStyle = COLORS.counterSide;
  rr(ctx, x - w / 2, y - h / 2, w, h, 10); ctx.fill();
  ctx.fillStyle = COLORS.counterTop;
  rr(ctx, x - w / 2, y - h / 2, w, h - 12, 10); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(x - w / 2 + 8, y - h / 2 + 6, w - 16, 5);
  if (label) text(ctx, label, x, y + h / 2 + 16, 13, COLORS.cream, 'center', '700');
}

function drawTicket(ctx, order, x, y, w, h, now) {
  const left = Math.max(0, order.recipe ? order.patience - (now - order.born) : 0);
  const frac = left / order.patience;
  ctx.fillStyle = COLORS.ticket;
  rr(ctx, x, y, w, h, 8); ctx.fill();
  ctx.strokeStyle = frac < 0.3 ? COLORS.red : 'rgba(43,33,24,0.35)';
  ctx.lineWidth = frac < 0.3 ? 3 : 1.5;
  rr(ctx, x, y, w, h, 8); ctx.stroke();
  text(ctx, order.recipe.name, x + 8, y + 14, 12, COLORS.ink, 'left', '800');
  text(ctx, `$${order.recipe.price}`, x + w - 8, y + 14, 12, COLORS.green, 'right', '800');
  // needed ingredients as icons
  let ix = x + 18;
  for (const item of order.recipe.needs) {
    drawIngredient(ctx, item, ix, y + 34, 22);
    ix += 26;
  }
  // patience bar
  ctx.fillStyle = '#e5d9c3';
  rr(ctx, x + 8, y + h - 10, w - 16, 6, 3); ctx.fill();
  ctx.fillStyle = frac < 0.3 ? COLORS.red : frac < 0.6 ? COLORS.gold : COLORS.green;
  if (frac > 0) { rr(ctx, x + 8, y + h - 10, (w - 16) * frac, 6, 3); ctx.fill(); }
}

function drawChef(ctx, chef, carry) {
  const bob = chef.moving ? Math.sin(chef.bob) * 3 : 0;
  ctx.save();
  ctx.translate(chef.x, chef.y + bob * 0.3);
  // shadow
  ctx.fillStyle = 'rgba(43,33,24,0.25)';
  ctx.beginPath(); ctx.ellipse(0, 24, 26, 8, 0, 0, Math.PI * 2); ctx.fill();
  // body / apron
  ctx.fillStyle = '#f2f2f2';
  rr(ctx, -20, -6, 40, 34, 12); ctx.fill();
  ctx.strokeStyle = 'rgba(43,33,24,0.4)'; ctx.lineWidth = 2; rr(ctx, -20, -6, 40, 34, 12); ctx.stroke();
  ctx.fillStyle = '#3a7bd5';
  rr(ctx, -14, 6, 28, 20, 6); ctx.fill();
  // head
  ctx.fillStyle = '#f2c49b';
  ctx.beginPath(); ctx.arc(0, -20, 15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // chef hat
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.ellipse(0, -32, 17, 10, 0, Math.PI, 0); ctx.fill(); ctx.stroke();
  ctx.fillRect(-17, -34, 34, 6);
  // eyes
  ctx.fillStyle = '#2b2118';
  ctx.beginPath(); ctx.arc(-5 * chef.face, -21, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(5 * chef.face, -21, 2, 0, Math.PI * 2); ctx.fill();
  // carried item above the hat
  if (carry) {
    if (carry.kind === 'plate') drawPlate(ctx, 0, -58, 44, carry.contents);
    else drawIngredient(ctx, carry.item, 0, -56, 40);
  }
  ctx.restore();
}

function drawKitchen(ctx, s) {
  // floor tiles
  const tile = 64;
  for (let ty = HUD_H; ty < VIEW.h; ty += tile) {
    for (let tx = 0; tx < VIEW.w; tx += tile) {
      ctx.fillStyle = ((tx / tile + ty / tile) % 2 === 0) ? COLORS.floorA : COLORS.floorB;
      ctx.fillRect(tx, ty, tile, tile);
    }
  }
  // wall strip under the HUD
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, HUD_H, VIEW.w, 34);
  ctx.fillStyle = COLORS.wallTrim;
  ctx.fillRect(0, HUD_H + 30, VIEW.w, 4);

  // ingredient bins along the top
  for (const bin of STATIONS.bins) {
    drawCounter(ctx, bin.x, bin.y, bin.w, bin.h, bin.label);
    drawIngredient(ctx, bin.item, bin.x, bin.y - 6, 44);
  }
  // chopping board
  drawCounter(ctx, STATIONS.board.x, STATIONS.board.y, STATIONS.board.w, STATIONS.board.h, STATIONS.board.label);
  ctx.fillStyle = COLORS.board;
  rr(ctx, STATIONS.board.x - 88, STATIONS.board.y - 30, 176, 62, 8); ctx.fill();
  ctx.strokeStyle = 'rgba(43,33,24,0.4)'; ctx.lineWidth = 2;
  rr(ctx, STATIONS.board.x - 88, STATIONS.board.y - 30, 176, 62, 8); ctx.stroke();
  if (s.board) {
    drawIngredient(ctx, s.board.item, STATIONS.board.x, STATIONS.board.y - 2, 52);
    if (s.board.chopping) {
      ctx.fillStyle = 'rgba(43,33,24,0.2)';
      rr(ctx, STATIONS.board.x - 60, STATIONS.board.y + 34, 120, 10, 5); ctx.fill();
      ctx.fillStyle = COLORS.green;
      rr(ctx, STATIONS.board.x - 60, STATIONS.board.y + 34, 120 * Math.min(1, s.board.progress), 10, 5); ctx.fill();
    }
  }
  // stove with two burners
  drawCounter(ctx, STATIONS.stove.x, STATIONS.stove.y, STATIONS.stove.w, STATIONS.stove.h, STATIONS.stove.label);
  for (let i = 0; i < 2; i++) {
    const bx = STATIONS.stove.x - 52 + i * 104;
    const by = STATIONS.stove.y - 8;
    ctx.fillStyle = '#3a3f47';
    ctx.beginPath(); ctx.arc(bx, by, 34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#22252b';
    ctx.beginPath(); ctx.arc(bx, by, 26, 0, Math.PI * 2); ctx.fill();
    const b = s.burners[i];
    if (b) {
      const item = b.t >= BURN_TIME ? 'patty_burnt' : b.t >= COOK_TIME ? 'patty' : 'patty_raw';
      drawIngredient(ctx, item, bx, by, 44);
      // cook ring
      const frac = Math.min(1, b.t / COOK_TIME);
      ctx.strokeStyle = b.t >= BURN_TIME ? COLORS.red : b.t >= COOK_TIME ? COLORS.green : COLORS.gold;
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(bx, by, 40, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac); ctx.stroke();
      if (b.t >= COOK_TIME && b.t < BURN_TIME) text(ctx, 'READY', bx, by + 52, 11, COLORS.green, 'center', '800');
      if (b.t >= BURN_TIME) text(ctx, 'BURNT!', bx, by + 52, 11, COLORS.red, 'center', '800');
    }
  }
  // plates stack
  drawCounter(ctx, STATIONS.plates.x, STATIONS.plates.y, STATIONS.plates.w, STATIONS.plates.h, STATIONS.plates.label);
  for (let i = 0; i < Math.min(3, s.platesLeft); i++) {
    drawPlate(ctx, STATIONS.plates.x, STATIONS.plates.y - 8 - i * 7, 46, null);
  }
  text(ctx, `x${s.platesLeft}`, STATIONS.plates.x, STATIONS.plates.y + 26, 14, COLORS.ink, 'center', '800');
  // plating counter
  drawCounter(ctx, STATIONS.plating.x, STATIONS.plating.y, STATIONS.plating.w, STATIONS.plating.h, STATIONS.plating.label);
  if (s.plate) drawPlate(ctx, STATIONS.plating.x, STATIONS.plating.y - 6, 64, s.plate);
  // serving window
  drawCounter(ctx, STATIONS.window.x, STATIONS.window.y, STATIONS.window.w, STATIONS.window.h, STATIONS.window.label);
  ctx.fillStyle = '#7a4a2b';
  rr(ctx, STATIONS.window.x - 80, STATIONS.window.y - 34, 160, 44, 8); ctx.fill();
  ctx.fillStyle = '#3a2a1a';
  rr(ctx, STATIONS.window.x - 80, STATIONS.window.y - 34, 160, 14, 8); ctx.fill();
  text(ctx, 'SERVE', STATIONS.window.x, STATIONS.window.y + 6, 16, '#ffe9b0', 'center', '800');
  // bell
  ctx.fillStyle = '#f2c230';
  ctx.beginPath(); ctx.arc(STATIONS.window.x + 88, STATIONS.window.y - 22, 12, Math.PI, 0); ctx.fill();
  ctx.fillRect(STATIONS.window.x + 74, STATIONS.window.y - 22, 28, 4);
  // trash
  drawCounter(ctx, STATIONS.trash.x, STATIONS.trash.y, STATIONS.trash.w, STATIONS.trash.h, STATIONS.trash.label);
  ctx.fillStyle = '#5a6470';
  rr(ctx, STATIONS.trash.x - 34, STATIONS.trash.y - 26, 68, 52, 8); ctx.fill();
  ctx.fillStyle = '#3c434d';
  rr(ctx, STATIONS.trash.x - 40, STATIONS.trash.y - 32, 80, 12, 6); ctx.fill();
}

function drawHUD(ctx, s) {
  // bar
  ctx.fillStyle = COLORS.ink;
  ctx.fillRect(0, 0, VIEW.w, HUD_H);
  ctx.fillStyle = '#3a2f24';
  ctx.fillRect(0, HUD_H - 6, VIEW.w, 6);
  // logo
  text(ctx, 'SIZZLE & SERVE', 20, 24, 24, '#ffd76a', 'left', '800');
  text(ctx, 'Day 1  ·  Lunch Rush', 20, 52, 13, '#e8d9bd', 'left', '600');
  // order board tickets
  let tx = 300;
  for (const order of s.orders) {
    drawTicket(ctx, order, tx, 10, 168, 56, s.time);
    tx += 178;
  }
  if (!s.orders.length) {
    text(ctx, 'No orders — take a breath!', 300, 38, 14, '#9a8a70', 'left', '600');
  }
  // timer, coins, hearts (right side)
  const rx = VIEW.w - 20;
  const frac = s.dayLeft / DAY_LENGTH;
  ctx.fillStyle = '#57493a';
  rr(ctx, rx - 300, 14, 180, 16, 8); ctx.fill();
  ctx.fillStyle = frac < 0.25 ? COLORS.red : COLORS.gold;
  if (frac > 0) { rr(ctx, rx - 300, 14, 180 * frac, 16, 8); ctx.fill(); }
  const mins = Math.floor(s.dayLeft / 60);
  const secs = Math.floor(s.dayLeft % 60);
  text(ctx, `${mins}:${String(secs).padStart(2, '0')}`, rx - 210, 22, 15, '#fff6e3', 'center', '800');
  const coinStr = `$${s.coins}`;
  ctx.font = '800 20px system-ui, -apple-system, "Segoe UI", sans-serif';
  const coinW = ctx.measureText(coinStr).width;
  drawCoin(ctx, rx - 96 - coinW - 16, 24, 10);
  text(ctx, coinStr, rx - 96, 24, 20, '#ffd76a', 'right', '800');
  let hx = rx - 8;
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < s.hearts ? '#e04b3a' : '#57493a';
    ctx.beginPath();
    ctx.arc(hx - 8, 52, 7, 0, Math.PI * 2);
    ctx.arc(hx + 4, 52, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx - 14, 54); ctx.lineTo(hx + 10, 54); ctx.lineTo(hx - 2, 66); ctx.closePath(); ctx.fill();
    hx -= 34;
  }
  text(ctx, `Served ${s.served}`, rx - 116, 52, 13, '#e8d9bd', 'right', '600');
  if (s.combo >= 2) text(ctx, `COMBO x${s.combo}`, rx - 260, 52, 14, '#ff8a5c', 'center', '800');
}

function drawParticles(ctx, s) {
  for (const p of s.particles) {
    ctx.globalAlpha = Math.max(0, 1 - p.t / p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const f of s.floats) {
    ctx.globalAlpha = Math.max(0, 1 - f.t / f.life);
    text(ctx, f.text, f.x, f.y, 22, f.color, 'center', '800');
  }
  ctx.globalAlpha = 1;
}

function drawPrompt(ctx, s, prompt) {
  if (!prompt) return;
  const x = s.chef.x, y = s.chef.y - 86;
  ctx.font = '700 15px system-ui, sans-serif';
  const w = ctx.measureText(prompt).width + 56;
  ctx.fillStyle = 'rgba(43,33,24,0.9)';
  rr(ctx, x - w / 2, y - 18, w, 32, 16); ctx.fill();
  ctx.fillStyle = '#ffd76a';
  rr(ctx, x - w / 2 + 6, y - 12, 22, 20, 5); ctx.fill();
  text(ctx, 'E', x - w / 2 + 17, y + 1, 13, COLORS.ink, 'center', '800');
  text(ctx, prompt, x + 16, y + 1, 15, '#fff6e3', 'center', '700');
}

function drawToast(ctx, s) {
  if (!s.toast) return;
  const a = Math.max(0, 1 - Math.max(0, s.toast.t - 1.4) / 0.8);
  ctx.globalAlpha = a;
  text(ctx, s.toast.text, VIEW.w / 2, VIEW.h - 28, 18, COLORS.cream, 'center', '700');
  ctx.globalAlpha = 1;
}

function drawTitle(ctx, s) {
  ctx.fillStyle = 'rgba(30,20,12,0.55)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  ctx.fillStyle = COLORS.cream;
  rr(ctx, VIEW.w / 2 - 330, 120, 660, 380, 18); ctx.fill();
  ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 4;
  rr(ctx, VIEW.w / 2 - 330, 120, 660, 380, 18); ctx.stroke();
  text(ctx, 'SIZZLE & SERVE', VIEW.w / 2, 168, 52, COLORS.red, 'center', '800');
  text(ctx, 'A tiny kitchen. A lunch rush. No mercy.', VIEW.w / 2, 210, 18, COLORS.ink, 'center', '600');
  // mini recipe strip
  const items = ['bun', 'patty', 'lettuce_chopped', 'tomato_chopped', 'cheese'];
  let ix = VIEW.w / 2 - 110;
  for (const item of items) { drawIngredient(ctx, item, ix, 258, 44); ix += 55; }
  text(ctx, 'Take orders from the board. Chop, grill, plate, serve —', VIEW.w / 2, 310, 17, COLORS.ink, 'center', '600');
  text(ctx, 'before the customers walk out. Three strikes and the day is done.', VIEW.w / 2, 336, 17, COLORS.ink, 'center', '600');
  text(ctx, 'Move: WASD / arrows / click   ·   Interact: E or click a station', VIEW.w / 2, 384, 16, '#6b543a', 'center', '700');
  text(ctx, 'Chop on the board  ·  Grill patties on the stove  ·  Serve at the window', VIEW.w / 2, 410, 16, '#6b543a', 'center', '700');
  ctx.fillStyle = COLORS.green;
  rr(ctx, VIEW.w / 2 - 130, 436, 260, 44, 22); ctx.fill();
  text(ctx, '▶  START THE RUSH', VIEW.w / 2, 459, 19, '#ffffff', 'center', '800');
}

function drawOver(ctx, s) {
  ctx.fillStyle = 'rgba(30,20,12,0.6)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  ctx.fillStyle = COLORS.cream;
  rr(ctx, VIEW.w / 2 - 300, 140, 600, 360, 18); ctx.fill();
  ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 4;
  rr(ctx, VIEW.w / 2 - 300, 140, 600, 360, 18); ctx.stroke();
  text(ctx, 'SERVICE OVER', VIEW.w / 2, 186, 40, COLORS.red, 'center', '800');
  text(ctx, s.overReason, VIEW.w / 2, 224, 17, COLORS.ink, 'center', '600');
  const endStr = `$${s.coins}`;
  ctx.font = '800 44px system-ui, -apple-system, "Segoe UI", sans-serif';
  const endW = ctx.measureText(endStr).width;
  drawCoin(ctx, VIEW.w / 2 - endW / 2 - 34, 286, 20);
  text(ctx, endStr, VIEW.w / 2, 286, 44, COLORS.green, 'center', '800');
  text(ctx, `Dishes served: ${s.served}    Missed: ${s.missed}    Best combo: x${s.bestCombo}`, VIEW.w / 2, 336, 18, COLORS.ink, 'center', '700');
  text(ctx, `Rank: ${s.rank}`, VIEW.w / 2, 380, 30, COLORS.gold, 'center', '800');
  text(ctx, 'Press R to cook again', VIEW.w / 2, 448, 17, '#6b543a', 'center', '700');
}

function render(ctx, s, prompt) {
  ctx.clearRect(0, 0, VIEW.w, VIEW.h);
  ctx.fillStyle = COLORS.floorA;
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  drawKitchen(ctx, s);
  drawChef(ctx, s.chef, s.carry);
  drawParticles(ctx, s);
  drawHUD(ctx, s);
  if (s.mode === 'playing') drawPrompt(ctx, s, prompt);
  drawToast(ctx, s);
  if (s.mode === 'title') drawTitle(ctx, s);
  if (s.mode === 'paused') {
    ctx.fillStyle = 'rgba(30,20,12,0.55)';
    ctx.fillRect(0, 0, VIEW.w, VIEW.h);
    text(ctx, 'PAUSED', VIEW.w / 2, VIEW.h / 2 - 10, 48, COLORS.cream, 'center', '800');
    text(ctx, 'Press P to keep cooking', VIEW.w / 2, VIEW.h / 2 + 36, 18, COLORS.cream, 'center', '600');
  }
  if (s.mode === 'over') drawOver(ctx, s);
}
