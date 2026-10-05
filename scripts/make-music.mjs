// Synthesizes the score from the shared timeline, so every hit lands on a cut.
// Output: public/audio/score.wav (44.1 kHz, 16-bit stereo).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const T = JSON.parse(readFileSync(join(root, 'src/timeline.json'), 'utf8'));

const SR = 44100;
const BEAT = 60 / T.bpm;
const BAR = BEAT * 4;
const S = T.sections;
const totalBars = Math.max(...Object.values(S).map(([, e]) => e));
const DUR = totalBars * BAR + 1.5;
const N = Math.ceil(DUR * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);

// Deterministic noise, so every render sounds identical.
let seed = 0x2b7e1516;
const rnd = () => {
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return ((seed >>> 0) / 4294967296) * 2 - 1;
};

const barT = (b) => b * BAR;
const inSec = (name, bar) => bar >= S[name][0] && bar < S[name][1];
const sectionOf = (bar) => Object.keys(S).find((k) => inSec(k, bar));

function add(start, dur, fn, gain = 1, pan = 0) {
  const s0 = Math.floor(start * SR);
  const n = Math.floor(dur * SR);
  const gl = gain * Math.min(1, 1 - pan);
  const gr = gain * Math.min(1, 1 + pan);
  for (let i = 0; i < n; i++) {
    const idx = s0 + i;
    if (idx < 0 || idx >= N) continue;
    const v = fn(i / SR, i);
    L[idx] += v * gl;
    R[idx] += v * gr;
  }
}

const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

// ---- Instruments ---------------------------------------------------------
const kickTimes = [];
function kick(t, g = 1) {
  kickTimes.push(t);
  let ph = 0;
  add(t, 0.5, (x) => {
    const f = 45 + 110 * Math.exp(-x * 28);
    ph += (2 * Math.PI * f) / SR;
    const click = x < 0.004 ? rnd() * 0.4 : 0;
    return (Math.tanh(Math.sin(ph) * 2.2) * Math.exp(-x * 7) + click) * 0.9;
  }, g);
}
function snare(t, g = 1) {
  let lp = 0;
  add(t, 0.28, (x) => {
    const n = rnd();
    lp += 0.25 * (n - lp);
    const noise = (n - lp) * Math.exp(-x * 16);
    const tone = Math.sin(2 * Math.PI * 185 * x) * Math.exp(-x * 30);
    return (noise * 0.55 + tone * 0.45) * 0.8;
  }, g, 0.05);
}
function clap(t, g = 1) {
  let lp = 0;
  add(t, 0.22, (x) => {
    const n = rnd();
    lp += 0.4 * (n - lp);
    const bursts = x < 0.03 ? (Math.floor(x / 0.01) % 2 === 0 ? 1 : 0.3) : 1;
    return (n - lp) * Math.exp(-x * 20) * bursts * 0.5;
  }, g, -0.08);
}
function hat(t, g = 1, open = false) {
  let lp = 0;
  add(t, open ? 0.3 : 0.06, (x) => {
    const n = rnd();
    lp += 0.6 * (n - lp);
    return (n - lp) * Math.exp(-x * (open ? 11 : 70)) * 0.35;
  }, g, 0.25);
}
function bass(t, dur, freq, g = 1) {
  add(t, dur, (x) => {
    const env = Math.min(1, x * 200) * Math.exp(-x * 1.4) * Math.min(1, (dur - x) * 30);
    const v = Math.sin(2 * Math.PI * freq * x) + 0.25 * Math.sin(4 * Math.PI * freq * x);
    return Math.tanh(v * 1.6) * env * 0.55;
  }, g);
}
function pad(t, dur, freqs, g = 1, bright = 0.06) {
  freqs.forEach((f, k) => {
    for (const det of [-0.12, 0.12]) {
      let ph = 0;
      let lp = 0;
      const fr = f * Math.pow(2, det / 12);
      add(t, dur, (x) => {
        ph += fr / SR;
        const saw = 2 * (ph % 1) - 1;
        lp += bright * (saw - lp);
        const env = Math.min(1, x / 0.35) * Math.min(1, (dur - x) / 0.25);
        return lp * env * 0.11;
      }, g, (k - 1) * 0.35 + det);
    }
  });
}
function pluck(t, freq, g = 1, pan = 0) {
  add(t, 0.35, (x) => {
    const tri = 2 * Math.abs(2 * ((freq * x) % 1) - 1) - 1;
    const sq = Math.sign(Math.sin(2 * Math.PI * freq * 2 * x)) * 0.15;
    return (tri + sq) * Math.exp(-x * 9) * 0.22;
  }, g, pan);
}
function riser(t, dur, g = 1) {
  let lp = 0;
  add(t, dur, (x) => {
    const p = x / dur;
    const n = rnd();
    lp += (0.01 + 0.5 * p * p) * (n - lp);
    const tone = Math.sin(2 * Math.PI * (200 + 1400 * p * p) * x) * 0.15;
    return (lp + tone * p) * p * p * 0.6;
  }, g);
}
function impact(t, g = 1) {
  let ph = 0;
  add(t, 2.2, (x) => {
    ph += (2 * Math.PI * (30 + 70 * Math.exp(-x * 8))) / SR;
    const boom = Math.tanh(Math.sin(ph) * 3) * Math.exp(-x * 2.2);
    const crash = rnd() * Math.exp(-x * 3.5) * 0.35;
    return boom * 0.9 + crash;
  }, g);
}
function tick(t, g = 1, freq = 2600) {
  add(t, 0.02, (x) => Math.sin(2 * Math.PI * freq * x) * Math.exp(-x * 300) * 0.5 + rnd() * Math.exp(-x * 500) * 0.3, g, 0.15);
}
function thunk(t, g = 1, pitch = 1) {
  let ph = 0;
  add(t, 0.25, (x) => {
    ph += (2 * Math.PI * 160 * pitch * Math.exp(-x * 10)) / SR;
    return (Math.sin(ph) * 0.8 + rnd() * Math.exp(-x * 60) * 0.5) * Math.exp(-x * 14);
  }, g);
}
function heartbeat(t, g = 1) {
  for (const [dt, a] of [[0, 1], [0.22, 0.7]]) {
    let ph = 0;
    add(t + dt, 0.35, (x) => {
      ph += (2 * Math.PI * (55 + 30 * Math.exp(-x * 20))) / SR;
      return Math.sin(ph) * Math.exp(-x * 12) * a;
    }, g);
  }
}

function thunder(t, g = 1, length = 4) {
  // Crack: a hard broadband snap with crackle, panned wide.
  for (const pan of [-0.6, 0.6]) {
    let hp = 0;
    add(t, 0.4, (x) => {
      const n = rnd();
      hp += 0.5 * (n - hp);
      const crackle = rnd() > 0.7 ? 1 : 0.25;
      return (n - hp) * Math.exp(-x * 18) * crackle * 0.9;
    }, g, pan);
  }
  // Rumble: very low noise that rolls and swells.
  for (const pan of [-0.4, 0.4]) {
    let lp = 0;
    let lp2 = 0;
    add(t + 0.03, length, (x) => {
      lp += 0.02 * (rnd() - lp);
      lp2 += 0.05 * (lp - lp2);
      const roll = 0.6 + 0.4 * Math.sin(x * 5.3 + pan * 3) * Math.sin(x * 1.7);
      return lp2 * 9 * Math.min(1, x / 0.08) * Math.exp(-x * (3 / length)) * roll;
    }, g, pan);
  }
  let ph = 0;
  add(t, 1.6, (x) => {
    ph += (2 * Math.PI * (28 + 50 * Math.exp(-x * 6))) / SR;
    return Math.tanh(Math.sin(ph) * 2.5) * Math.exp(-x * 2) * 0.8;
  }, g);
}
function swell(t, dur, g = 1) {
  // A reversed-cymbal style rush that snaps off at its end.
  let lp = 0;
  add(t, dur, (x) => {
    const p = x / dur;
    lp += (0.05 + 0.6 * p) * (rnd() - lp);
    return (rnd() - lp) * Math.pow(p, 3) * 0.9;
  }, g);
}
function shimmer(t, g = 1, dur = 3.4) {
  // A bright A-major stack that blooms open: the reveal chord.
  [57, 64, 69, 73, 76, 81].forEach((m, k) => {
    for (const det of [-0.08, 0.08]) {
      let ph = 0;
      let lp = 0;
      const f = hz(m) * Math.pow(2, det / 12);
      add(t, dur, (x) => {
        ph += f / SR;
        const saw = 2 * (ph % 1) - 1;
        lp += Math.min(0.5, 0.02 + x * 0.25) * (saw - lp);
        const env = Math.min(1, x / 0.04) * Math.exp(-x * (1.6 / dur) * 1.6);
        const trem = 1 + 0.08 * Math.sin(2 * Math.PI * 6 * x);
        return lp * env * trem * 0.12;
      }, g, (k % 2 ? 0.4 : -0.4) + det);
    }
  });
  // Glitter: a fast run up the chord, high and quick.
  [81, 85, 88, 93, 97, 100].forEach((m, k) => {
    add(t + 0.05 + k * 0.045, 1.2, (x) => Math.sin(2 * Math.PI * hz(m) * x) * Math.exp(-x * 4) * 0.14, g, k % 2 ? 0.5 : -0.5);
  });
}

// ---- Instruments for the dark mix -------------------------------------------
function arp(t, freq, g = 1, cutoff = 0.12, pan = 0) {
  // A filtered saw pluck: the neon-synth sixteenth line.
  let ph = 0;
  let lp = 0;
  add(t, 0.22, (x) => {
    ph += freq / SR;
    const saw = 2 * (ph % 1) - 1;
    lp += (cutoff + 0.25 * Math.exp(-x * 30)) * (saw - lp);
    return lp * Math.exp(-x * 14) * 0.32;
  }, g, pan);
}
function sub(t, dur, freq, g = 1) {
  add(t, dur, (x) => Math.sin(2 * Math.PI * freq * x) * Math.min(1, x * 40) * Math.min(1, (dur - x) * 12) * 0.5, g);
}
function blip(t, g = 1, freq = 1760) {
  add(t, 0.09, (x) => Math.sin(2 * Math.PI * freq * x) * Math.exp(-x * 40) * 0.25, g, 0.2);
}

// ---- Harmony: Am – F – Dm – E (harmonic minor, a little tension) -----------
const PROG = [
  { root: 45, chord: [57, 60, 64] }, // Am
  { root: 41, chord: [57, 60, 65] }, // F
  { root: 38, chord: [57, 62, 65] }, // Dm
  { root: 40, chord: [56, 59, 64] }, // E
];

// Energy per section: 0 silent, 1 ambient, 2 half-time groove, 3 driving.
const ENERGY = {
  intro: 1, route: 2, legacy: 2, better: 0, taproot: 3, payswap: 2, market: 3,
  portal: 2, deploy: 2, backend: 2, wallet: 2, router: 3, cta: 2, thanks: 1, lightning: 1, outro: 1,
};

// ---- Arrangement ------------------------------------------------------------
for (let b = 0; b < totalBars; b++) {
  const sec = sectionOf(b);
  const e = ENERGY[sec] ?? 1;
  const t0 = barT(b);
  const ch = PROG[b % 4];
  const next = sectionOf(b + 1);
  const lastOfSec = next !== sec;
  const isEnd = sec === 'outro';
  const fadeK = isEnd ? Math.max(0, 1 - (b - S.outro[0]) / (S.outro[1] - S.outro[0])) : 1;

  if (sec === 'better') {
    // A held breath: just a low drone and a swell into Taproot.
    pad(t0, BAR + 0.1, [hz(45), hz(52)], 0.8, 0.012);
    if (lastOfSec) swell(t0 + BAR / 2, BAR / 2, 1);
    continue;
  }

  pad(t0, BAR + 0.1, ch.chord.map(hz), (e >= 3 ? 0.9 : 0.75) * fadeK, e >= 3 ? 0.05 : 0.025);
  sub(t0, BAR, hz(ch.root - 12), (e >= 2 ? 0.9 : 0.6) * fadeK);

  // The arp: sixteenths over the chord, opening up with energy.
  if (e >= 1) {
    const notes = [ch.chord[0], ch.chord[1], ch.chord[2], ch.chord[0] + 12];
    const steps = e >= 2 ? 16 : 8;
    for (let i = 0; i < steps; i++) {
      const n = notes[[0, 2, 1, 3, 2, 1, 3, 2][i % 8]] + 12;
      arp(t0 + i * (BAR / steps), hz(n), (e >= 3 ? 0.8 : e === 2 ? 0.6 : 0.4) * fadeK, e >= 3 ? 0.14 : 0.08, i % 2 ? 0.35 : -0.35);
    }
  }

  if (e === 2) {
    // Half time: kick on 1 and the "and" of 2, snare on 3.
    kick(t0, 1); kick(t0 + BEAT * 1.5, 0.7);
    snare(t0 + BEAT * 2, 0.8);
    for (let i = 0; i < 8; i++) hat(t0 + i * BEAT / 2, i % 2 ? 0.35 : 0.55);
  }
  if (e >= 3) {
    for (let i = 0; i < 4; i++) kick(t0 + i * BEAT, 1);
    snare(t0 + BEAT, 0.8); snare(t0 + 3 * BEAT, 0.8);
    clap(t0 + BEAT, 0.6); clap(t0 + 3 * BEAT, 0.6);
    for (let i = 0; i < 16; i++) hat(t0 + i * BEAT / 4, i % 4 === 2 ? 0.6 : 0.35, i % 8 === 6);
    bass(t0 + BEAT * 0.5, BEAT * 0.4, hz(ch.root), 0.45);
    bass(t0 + BEAT * 2.5, BEAT * 0.4, hz(ch.root), 0.45);
  }
  if (sec === 'thanks' || sec === 'lightning') for (let i = 0; i < 4; i++) hat(t0 + i * BEAT, 0.3);
  if (sec === 'lightning') heartbeat(t0, 0.7);

  // Lift into the next section.
  if (lastOfSec && next && next !== 'better') {
    if ((ENERGY[next] ?? 1) >= 3) riser(t0, BAR, 0.9);
    else if (e >= 2) for (let i = 0; i < 4; i++) snare(t0 + 3 * BEAT + i * BEAT / 4, 0.2 + i * 0.1);
  }
}

// Downbeat hits on the big turns.
for (const name of ['taproot', 'market', 'portal', 'router']) impact(barT(S[name][0]), 0.7);
thunder(barT(S.lightning[0]) + BEAT, 0.45, 4);
shimmer(barT(S.outro[0]), 0.5);
impact(barT(S.outro[1]) - BAR * 0.02, 0); // keeps the tail allocated

// ---- Sidechain duck, master, write -----------------------------------------
const duck = new Float32Array(N).fill(1);
for (const kt of kickTimes) {
  const s0 = Math.floor(kt * SR);
  for (let i = 0; i < SR * 0.3; i++) {
    const idx = s0 + i;
    if (idx >= N) break;
    duck[idx] = Math.min(duck[idx], 1 - 0.35 * Math.exp(-(i / SR) * 12));
  }
}
let peak = 0;
for (let i = 0; i < N; i++) {
  L[i] = Math.tanh(L[i] * duck[i] * 0.9);
  R[i] = Math.tanh(R[i] * duck[i] * 0.9);
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = 0.89 / (peak || 1);
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8);
buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(L[i] * norm * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(R[i] * norm * 32767), 46 + i * 4);
}
mkdirSync(join(root, 'public/audio'), { recursive: true });
writeFileSync(join(root, 'public/audio/score.wav'), buf);
console.log(`score.wav: ${DUR.toFixed(1)}s, ${totalBars} bars @ ${T.bpm} BPM`);
