// =============================================================
// MACARIO — _dev/tools/make-fun-sfx.js
//
// The sounds Block 64 added, made the same way as the combat sounds
// (make-combat-sfx.js, whose helpers are copied below rather than shared,
// so each tool runs on its own): short retro tones, 16-bit mono WAV at
// 22050 Hz, loudness baked in so the engine plays them at SFX_VOLUME.
//
//   page      a Pahina ng Kasaysayan picked up: a flick of paper and a
//             bright rising three-note chime
//   fanfare   the last page found: a short four-note flourish
//   streak    the apple game, a third catch in a row: the catch chime's
//             brighter cousin
//   jump      (Block 93, replacing make-sfx.py's) a foot pushing off the
//             dirt: a soft scuff and a low thump, no tone. The old square
//             wave sweeping up was a cartoon boing, and the proponent
//             found it goofy.
//
// Usage, from the repository root (no dependencies):
//
//     node _dev/tools/make-fun-sfx.js
// =============================================================
const fs = require("fs");
const path = require("path");

const RATE = 22050;
const OUT = path.join(__dirname, "..", "..", "assets", "audio", "sfx");

// A small seeded generator, so the noise, and so the files, are the same
// on every run.
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296 * 2 - 1;
  };
}

const len = (seconds) => Math.round(RATE * seconds);

// Quick attack, then a decay to silence over the rest.
function env(n, attack, curve) {
  const a = Math.max(1, Math.round(RATE * attack));
  const e = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    e[i] = i < a ? i / a : Math.pow(1 - (i - a) / Math.max(1, n - a), curve);
  }
  return e;
}

// A sine whose pitch slides from f0 to f1.
function sineSweep(f0, f1, seconds) {
  const n = len(seconds);
  const out = new Float64Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    phase += (f0 + (f1 - f0) * i / n) / RATE;
    out[i] = Math.sin(2 * Math.PI * phase);
  }
  return out;
}

function squareSweep(f0, f1, seconds) {
  const n = len(seconds);
  const out = new Float64Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    phase += (f0 + (f1 - f0) * i / n) / RATE;
    out[i] = (phase % 1) < 0.5 ? 1 : -1;
  }
  return out;
}

function noise(seconds, seed) {
  const r = rng(seed);
  return Float64Array.from({ length: len(seconds) }, r);
}

// A moving average: the wider the window, the duller the noise.
function smooth(sig, width) {
  const out = new Float64Array(sig.length);
  let acc = 0;
  for (let i = 0; i < sig.length; i++) {
    acc += sig[i];
    if (i >= width) acc -= sig[i - width];
    out[i] = acc / width;
  }
  return out;
}

const mul = (a, b) => a.map((v, i) => v * b[i]);
const add = (a, b, offset) => {
  const out = new Float64Array(Math.max(a.length, b.length + (offset || 0)));
  out.set(a);
  b.forEach((v, i) => { out[i + (offset || 0)] += v; });
  return out;
};
const scale = (a, k) => a.map((v) => v * k);

function write(name, sig, gain) {
  const n = sig.length;
  const k = len(0.003); // a few milliseconds of fade at both ends: no clicks
  const data = Buffer.alloc(44 + n * 2);
  data.write("RIFF", 0); data.writeUInt32LE(36 + n * 2, 4); data.write("WAVE", 8);
  data.write("fmt ", 12); data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20);
  data.writeUInt16LE(1, 22); data.writeUInt32LE(RATE, 24); data.writeUInt32LE(RATE * 2, 28);
  data.writeUInt16LE(2, 32); data.writeUInt16LE(16, 34);
  data.write("data", 36); data.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    let v = Math.max(-1, Math.min(1, sig[i] * gain));
    if (i < k) v *= i / k;
    if (i >= n - k) v *= (n - 1 - i) / k;
    data.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  fs.writeFileSync(path.join(OUT, name + ".wav"), data);
  console.log("wrote", "assets/audio/sfx/" + name + ".wav", Math.round(data.length / 1024), "KB");
}

// A triangle wave at one pitch, with a short attack and a ringing decay.
function tone(freq, seconds, curve) {
  const n = len(seconds);
  const out = new Float64Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    phase += freq / RATE;
    const p = phase % 1;
    out[i] = p < 0.5 ? 4 * p - 1 : 3 - 4 * p;
  }
  return mul(out, env(n, 0.004, curve || 2));
}

// Notes laid one after another, each starting gap seconds after the last
// and ringing over the next.
function arpeggio(freqs, gap, ring) {
  let out = new Float64Array(0);
  freqs.forEach((f, i) => { out = add(out, tone(f, ring), len(gap * i)); });
  return out;
}

const C6 = 1046.5, E6 = 1318.5, G6 = 1568.0, C7 = 2093.0, A5 = 880.0, D6 = 1174.7;

// A page: a quick paper flick (noise, shaped), then the chime over it.
{
  const flick = mul(smooth(noise(0.07, 31), 3), env(len(0.07), 0.002, 2.5));
  const chime = arpeggio([C6, E6, G6], 0.07, 0.32);
  write("page", add(scale(flick, 0.5), scale(chime, 0.55), len(0.03)), 0.55);
}

// The last page: a little flourish, lower and longer than a page.
{
  const run = arpeggio([G6 / 2, C6, E6, G6], 0.09, 0.4);
  const top = tone(C7, 0.6, 1.6);
  write("fanfare", add(scale(run, 0.5), scale(top, 0.4), len(0.36)), 0.68);
}

// A streak in the apple game: two quick notes, a step above the catch.
{
  write("streak", scale(arpeggio([A5, D6], 0.06, 0.2), 0.6), 0.57);
}

// A jump (Block 93): the push-off, heard, not a tune. Dull noise for the
// scuff of a sole on dirt, and under it a short sine falling from 150 to
// 70 Hz for the weight leaving the ground. Quiet: it is pressed often.
{
  const scuff = mul(smooth(noise(0.13, 93), 7), env(len(0.13), 0.004, 3));
  const n = len(0.09);
  const thump = new Float64Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    phase += (150 - 80 * i / n) / RATE;
    thump[i] = Math.sin(2 * Math.PI * phase);
  }
  write("jump", add(scale(scuff, 1.6), scale(mul(thump, env(n, 0.003, 2.5)), 0.55)), 0.5);
}
