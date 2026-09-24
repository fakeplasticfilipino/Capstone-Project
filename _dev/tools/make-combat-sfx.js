// =============================================================
// MACARIO — _dev/tools/make-combat-sfx.js
//
// The four combat sounds (Block 60), made the same way make-sfx.py makes
// the other nine (Block 58): short retro tones and a little noise, 16-bit
// mono WAV at 22050 Hz, each one's loudness baked in so the engine plays
// them all at SFX_VOLUME. Written in Node rather than added to the Python
// tool because the proponent's computer has Node and no Python, and a
// generator nobody can run is not reproducible.
//
//   swing     every punch, landed or not: a short whoosh of air
//   punch     a punch that lands: a low thump with a crack on top
//   knockout  the blow that drops someone: a heavier thump, and a
//             smaller one as he hits the boards
//   hurt      Macario takes a hit: a quick falling buzz
//
// A recorded or commissioned effect replaces any of these by dropping a
// file over the same name (and bumping ASSET_VERSION).
//
// Usage, from the repository root (no dependencies):
//
//     node _dev/tools/make-combat-sfx.js
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

// A swing: filtered noise that rises and falls, like a fist through air.
// Quiet, because it is heard on every press of Atake.
{
  const n = noise(0.13, 11);
  const air = smooth(n, 6);
  const shape = Float64Array.from({ length: air.length }, (_, i) => Math.pow(Math.sin(Math.PI * i / air.length), 1.6));
  write("swing", mul(air, shape), 1.1);
}

// A punch that lands: a low sine thump falling in pitch, with a short
// bright crack of noise at its very front.
{
  const body = mul(sineSweep(170, 55, 0.14), env(len(0.14), 0.002, 2.2));
  const crack = mul(smooth(noise(0.03, 5), 2), env(len(0.03), 0.001, 3));
  write("punch", add(body, scale(crack, 0.55)), 0.9);
}

// A knockout: a heavier, longer thump, then a smaller one as he hits the
// boards of the stage a moment later.
{
  const blow = mul(sineSweep(150, 42, 0.26), env(len(0.26), 0.002, 2.0));
  const crack = mul(smooth(noise(0.04, 9), 2), env(len(0.04), 0.001, 3));
  const land = mul(add(sineSweep(110, 50, 0.14), scale(smooth(noise(0.14, 13), 10), 0.8)),
    env(len(0.14), 0.002, 2.5));
  write("knockout", add(add(blow, scale(crack, 0.6)), scale(land, 0.55), len(0.2)), 0.9);
}

// Macario hurt: a quick falling buzz, square and a touch of noise, short
// enough not to talk over the toast that says what happened.
{
  const buzz = mul(squareSweep(420, 150, 0.17), env(len(0.17), 0.002, 1.6));
  const grit = mul(smooth(noise(0.17, 21), 3), env(len(0.17), 0.002, 3));
  write("hurt", add(scale(buzz, 0.8), scale(grit, 0.35)), 0.6);
}
