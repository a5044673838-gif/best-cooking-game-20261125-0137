// Tiny WebAudio synth: every sound is generated, no audio files.
// Created lazily on the first user gesture so browsers allow it.
let audioCtx = null;
let sizzleNodes = null;

function ensure() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone(freq, dur, type, vol, slideTo) {
  const ac = ensure();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, ac.currentTime);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + dur);
  gain.gain.setValueAtTime(vol || 0.15, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + dur);
}

function noiseBurst(dur, vol, filterFreq) {
  const ac = ensure();
  if (!ac) return;
  const len = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq || 1800;
  const gain = ac.createGain();
  gain.gain.value = vol || 0.2;
  src.connect(filter).connect(gain).connect(ac.destination);
  src.start();
}

const sfx = {
  unlock() { ensure(); },
  pickup() { tone(520, 0.08, 'triangle', 0.12, 760); },
  place() { tone(300, 0.08, 'triangle', 0.12, 210); },
  chop() { noiseBurst(0.09, 0.28, 900); },
  chopped() { tone(660, 0.1, 'square', 0.08, 880); tone(880, 0.12, 'sine', 0.1); },
  sizzleStart() { noiseBurst(0.4, 0.1, 3200); },
  done() { tone(880, 0.12, 'sine', 0.14); setTimeout(() => tone(1174, 0.16, 'sine', 0.14), 90); },
  serve() { tone(523, 0.12, 'sine', 0.16); setTimeout(() => tone(659, 0.12, 'sine', 0.16), 90); setTimeout(() => tone(784, 0.2, 'sine', 0.16), 180); },
  error() { tone(160, 0.18, 'sawtooth', 0.1, 110); },
  tick() { tone(980, 0.05, 'square', 0.05); },
  startSizzle() {
    const ac = ensure();
    if (!ac || sizzleNodes) return;
    const len = ac.sampleRate;
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const filter = ac.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 4000;
    const gain = ac.createGain();
    gain.gain.value = 0.03;
    src.connect(filter).connect(gain).connect(ac.destination);
    src.start();
    sizzleNodes = { src, gain };
  },
  stopSizzle() {
    if (!sizzleNodes) return;
    try { sizzleNodes.src.stop(); } catch (e) { /* already stopped */ }
    sizzleNodes = null;
  },
};
