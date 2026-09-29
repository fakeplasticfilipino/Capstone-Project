// =============================================================
// MACARIO — _dev/tools/make-scene-sfx.js
//
// The sounds Block 81 added, made the way make-fun-sfx.js makes its own
// (its helpers are copied rather than shared, so each tool runs on its
// own): 16-bit mono WAV at 22050 Hz, loudness baked in so the engine
// plays every one at SFX_VOLUME.
//
//   applause    a theatre crowd on its feet: a few dozen people each
//               clapping at their own pace, every clap a short burst of
//               band-limited noise, swelling in and dying away. For the
//               black card when a curtain closes.
//   intertitle  the black card (replacing make-sfx.py's bell, which
//               read as a phone's message chime): a low, soft drum
//               under a curtain's swish, a stage sound rather than a
//               device's.
//
// No recording was used. A recorded, freely licensed file dropped over
// either name replaces it; bump ASSET_VERSION in js/game.js.
//
// Usage, from the repository root (no dependencies):
//
//     node _dev/tools/make-scene-sfx.js
// =============================================================
const fs = require("fs");
const path = require("path");

const RATE = 22050;
const OUT = path.join(__dirname, "..", "..", "assets", "audio", "sfx");

// A small seeded generator, so the files are the same on every run.
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const len = (seconds) => Math.round(RATE * seconds);

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

// One-pole filters. A clap is noise with its lows and its highest highs
// taken off, which is what keeps it from sounding like a hiss.
function lowpass(sig, cutoff) {
  const a = 1 - Math.exp(-2 * Math.PI * cutoff / RATE);
  const out = new Float64Array(sig.length);
  let y = 0;
  for (let i = 0; i < sig.length; i++) { y += a * (sig[i] - y); out[i] = y; }
  return out;
}
function highpass(sig, cutoff) {
  const low = lowpass(sig, cutoff);
  return sig.map((v, i) => v - low[i]);
}

// Loudest sample to 1, so the gain passed to write() is the loudness.
function normalise(sig) {
  let peak = 0;
  for (const v of sig) peak = Math.max(peak, Math.abs(v));
  return peak ? sig.map((v) => v / peak) : sig;
}

// ---- applause ----------------------------------------------------
// Each person claps at their own steady rate with a little jitter, and
// each clap has its own brightness and strength. The crowd comes in over
// half a second, holds, and thins out over the last second and a half,
// the way a real one does: the quiet ones stop first.
{
  const SECONDS = 4.6;
  const n = len(SECONDS);
  const r = rng(81);
  const raw = new Float64Array(n);
  const PEOPLE = 36;
  for (let p = 0; p < PEOPLE; p++) {
    const rate = 3.4 + r() * 2.4;            // claps a second
    const loud = 0.35 + r() * 0.65;
    const start = r() * 0.5;                  // when they join in
    const stop = SECONDS - 1.6 + r() * 1.5;   // when they stop
    const clapLen = len(0.012 + r() * 0.012);
    for (let t = start + r() / rate; t < stop; t += (1 / rate) * (0.85 + r() * 0.3)) {
      const at = len(t);
      // The clap itself: a crack of noise with a fast decay.
      const decay = 0.0025 + r() * 0.003;
      const amp = loud * (0.7 + r() * 0.3);
      for (let i = 0; i < clapLen * 3 && at + i < n; i++) {
        raw[at + i] += (r() * 2 - 1) * amp * Math.exp(-i / (RATE * decay));
      }
    }
  }
  // The band a clap lives in, then a small room: two short, soft echoes.
  let sig = lowpass(highpass(raw, 700), 4200);
  const room = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    room[i] = sig[i] +
      (i >= len(0.031) ? 0.35 * sig[i - len(0.031)] : 0) +
      (i >= len(0.057) ? 0.2 * sig[i - len(0.057)] : 0);
  }
  // The swell in and the long tail out.
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const inEnv = Math.min(1, t / 0.45);
    const outEnv = t < SECONDS - 1.8 ? 1 : Math.max(0, (SECONDS - t) / 1.8);
    room[i] *= inEnv * Math.pow(outEnv, 1.5);
  }
  write("applause", normalise(room), 0.5);
}

// ---- intertitle --------------------------------------------------
// A soft, low drum (a sine falling from 105 to 62 Hz with a long decay,
// and a little felt at the front) under a curtain's swish (noise swept
// from dull to a little brighter and back, over most of a second).
{
  const SECONDS = 1.9;
  const n = len(SECONDS);
  const r = rng(58);
  const out = new Float64Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const f = 62 + 43 * Math.exp(-t / 0.18);
    phase += f / RATE;
    const drum = Math.sin(2 * Math.PI * phase) * Math.exp(-t / 0.55) * Math.min(1, t / 0.006);
    out[i] = drum;
  }
  // The felt: a very short, very dull thump at the start.
  const felt = lowpass(Float64Array.from({ length: len(0.03) }, () => r() * 2 - 1), 400);
  felt.forEach((v, i) => { out[i] += v * 1.8 * (1 - i / felt.length); });
  // The swish, lower than the drum's own loudness.
  const swishLen = len(1.1);
  const noiseSig = Float64Array.from({ length: swishLen }, () => r() * 2 - 1);
  const swish = highpass(lowpass(noiseSig, 1800), 250);
  for (let i = 0; i < swishLen; i++) {
    const t = i / swishLen;
    out[i] += swish[i] * 0.22 * Math.sin(Math.PI * Math.min(1, t * 1.15));
  }
  write("intertitle", normalise(out), 0.42);
}
