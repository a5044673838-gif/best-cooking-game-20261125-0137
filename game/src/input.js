// Keyboard + mouse input. Tracks held keys, edge-triggered presses,
// and click-to-move targets for the chef.
function createInput(canvas) {
  const keys = new Set();
  const pressed = new Set();
  let moveTarget = null; // {x, y} in canvas coords, or null
  let clickStation = null; // station id clicked this frame, consumed by main
  let anyGesture = false;

  const KEYMAP = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    KeyE: 'interact', Space: 'interact',
    KeyP: 'pause', Escape: 'pause',
    Enter: 'confirm', KeyR: 'restart',
  };

  window.addEventListener('keydown', (e) => {
    const action = KEYMAP[e.code];
    if (!action) return;
    if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
    if (!keys.has(action)) pressed.add(action);
    keys.add(action);
    anyGesture = true;
  });
  window.addEventListener('keyup', (e) => {
    const action = KEYMAP[e.code];
    if (action) keys.delete(action);
  });
  window.addEventListener('blur', () => keys.clear());

  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    moveTarget = { x, y };
    clickStation = { x, y };
    anyGesture = true;
  });

  return {
    held(action) { return keys.has(action); },
    axis() {
      let x = 0, y = 0;
      if (keys.has('left')) x -= 1;
      if (keys.has('right')) x += 1;
      if (keys.has('up')) y -= 1;
      if (keys.has('down')) y += 1;
      return { x, y };
    },
    consumePress(action) {
      if (pressed.has(action)) { pressed.delete(action); return true; }
      return false;
    },
    takeMoveTarget() { const t = moveTarget; moveTarget = null; return t; },
    takeClick() { const c = clickStation; clickStation = null; return c; },
    clearClick() { clickStation = null; },
    gesture() { const g = anyGesture; anyGesture = false; return g; },
    endFrame() { pressed.clear(); },
  };
}
