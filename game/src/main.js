// Sizzle & Serve — game loop, screen wiring and screenshot staging.
// Plain script loaded by game/index.html (classic scripts, no modules).
// No network, no libraries.

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW.w;
canvas.height = VIEW.h;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed') || '1') || 1;

let state;
if (shot === 'start' || shot === 'play' || shot === 'end') {
  state = stagedScene(shot, seed);
} else {
  state = freshState(seed);
}

const input = createInput(canvas);
let last = performance.now();

function stationAtPoint(x, y) {
  const all = [
    ...STATIONS.bins,
    STATIONS.board, STATIONS.stove, STATIONS.plating,
    STATIONS.window, STATIONS.trash, STATIONS.plates,
  ];
  let best = null, bestD = Infinity;
  for (const st of all) {
    const d = Math.hypot(x - st.x, y - st.y);
    if (d < bestD) { bestD = d; best = st; }
  }
  return bestD <= 130 ? best : null;
}

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (input.gesture()) sfx.unlock();

  // click-to-move / click-to-interact
  const click = input.takeClick();
  if (click && state.mode === 'playing') {
    const st = stationAtPoint(click.x, click.y);
    if (st) {
      const d = Math.hypot(state.chef.x - st.x, state.chef.y - st.y);
      if (d <= 130) {
        interact(state);
      } else {
        state.moveTarget = { x: st.x, y: Math.min(st.y + 60, VIEW.h - 50) };
      }
    } else {
      state.moveTarget = click;
    }
  } else if (click && state.mode === 'title') {
    state.mode = 'playing';
    sfx.done();
  } else if (click && state.mode === 'over') {
    state = freshState(seed);
    state.mode = 'playing';
  }
  input.clearClick();

  if (input.consumePress('interact')) {
    if (state.mode === 'title') { state.mode = 'playing'; sfx.done(); }
    else if (state.mode === 'playing') interact(state);
  }
  if (input.consumePress('confirm')) {
    if (state.mode === 'title') { state.mode = 'playing'; sfx.done(); }
    else if (state.mode === 'over') { state = freshState(seed); state.mode = 'playing'; }
  }
  if (input.consumePress('restart') && state.mode === 'over') {
    state = freshState(seed);
    state.mode = 'playing';
  }
  if (input.consumePress('pause') && (state.mode === 'playing' || state.mode === 'paused')) {
    state.mode = state.mode === 'playing' ? 'paused' : 'playing';
  }

  // staged shots never tick: they are frozen renders of the real game
  if (!shot) update(state, dt, input);
  render(ctx, state, currentPrompt(state));
  input.endFrame();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
