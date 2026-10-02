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
//               device's. (Unused since Block 84: black cards are silent.)
//
// Block 85:
//
//   notice      a guard starting to notice: two soft rising notes, a
//               question more than an alarm.
//   caught      a guard's catch: a short, sharp low stab.
//   cheer       a crowd's shout for a line that names it ("Mabuhay!"):
//               many voices as noise shaped around a voice's vowel
//               bands, rising and falling.
//   gabi        music/gabi.wav, the pamphlet run's night: crickets over
//               a faint wind, a loop that joins without a click.
//
// No recording was used. A recorded, freely licensed file dropped over
// either name replaces it; then node _dev/tools/prepare.js.
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

function write(name, sig, gain, dir) {
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
  const folder = dir || "sfx";
  fs.writeFileSync(path.join(OUT, "..", folder, name + ".wav"), data);
  console.log("wrote", "assets/audio/" + folder + "/" + name + ".wav", Math.round(data.length / 1024), "KB");
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

// ---- notice ------------------------------------------------------
// Two soft triangle notes, the second a fourth above the first, each with
// a quick rise: heard as "hm?" rather than a siren.
{
  const tri = (freq, seconds, start) => {
    const n = len(seconds);
    const out = new Float64Array(n);
    let phase = 0;
    for (let i = 0; i < n; i++) {
      const t = i / RATE;
      phase += freq * (1 + 0.04 * Math.min(1, t / 0.05)) / RATE;
      const p = phase % 1;
      const wave = p < 0.5 ? 4 * p - 1 : 3 - 4 * p;
      out[i] = wave * Math.min(1, t / 0.01) * Math.exp(-t / 0.09);
    }
    return { out, start: len(start) };
  };
  const notes = [tri(660, 0.22, 0), tri(880, 0.3, 0.1)];
  const sig = new Float64Array(len(0.45));
  notes.forEach(({ out, start }) => out.forEach((v, i) => { if (start + i < sig.length) sig[start + i] += v; }));
  write("notice", normalise(sig), 0.35);
}

// ---- caught ------------------------------------------------------
// A low square stab with a burst of noise at the front, gone in a third
// of a second: the moment of being seen, not a fanfare.
{
  const n = len(0.35);
  const r = rng(85);
  const out = new Float64Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    phase += (170 - 60 * Math.min(1, t / 0.3)) / RATE;
    const square = (phase % 1) < 0.5 ? 1 : -1;
    out[i] = square * 0.6 * Math.exp(-t / 0.12) + (r() * 2 - 1) * Math.exp(-t / 0.02);
  }
  write("caught", normalise(lowpass(out, 2600)), 0.45);
}

// ---- cheer -------------------------------------------------------
// A crowd shouting: noise passed through two vowel bands ("a", around 700
// and 1200 Hz) with a slow wobble, so it reads as many voices, swelling
// in over a quarter second and tailing off.
{
  const SECONDS = 2.2;
  const n = len(SECONDS);
  const r = rng(86);
  const noiseSig = Float64Array.from({ length: n }, () => r() * 2 - 1);
  const band = (lo, hi) => lowpass(highpass(noiseSig, lo), hi);
  const a = band(550, 900), b = band(1000, 1500), s = band(2500, 4500);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const wobble = 1 + 0.25 * Math.sin(2 * Math.PI * 5.5 * t) * Math.sin(2 * Math.PI * 0.7 * t);
    const env = Math.min(1, t / 0.25) * (t < SECONDS - 1.2 ? 1 : Math.max(0, (SECONDS - t) / 1.2));
    out[i] = (a[i] * 1.0 + b[i] * 0.7 + s[i] * 0.15) * wobble * env;
  }
  write("cheer", normalise(out), 0.5);
}

// ---- gabi (music) ------------------------------------------------
// Eight seconds that loop: a faint low wind, and crickets, each a burst
// of three or four quick pulses of a high tone, at a few pitches and
// distances. Placed with wrap-around, so a chirp that runs off the end
// finishes at the start and the join cannot be heard.
{
  const SECONDS = 8;
  const n = len(SECONDS);
  const r = rng(87);
  const out = new Float64Array(n);
  const wind = lowpass(Float64Array.from({ length: n }, () => r() * 2 - 1), 300);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    out[i] += wind[i] * 0.5 * (0.7 + 0.3 * Math.sin(2 * Math.PI * t / SECONDS));
  }
  const crickets = [
    { freq: 4200, gap: 0.9, loud: 0.5 },
    { freq: 4700, gap: 1.3, loud: 0.3 },
    { freq: 3900, gap: 1.7, loud: 0.22 },
  ];
  crickets.forEach((c) => {
    for (let t = r() * c.gap; t < SECONDS; t += c.gap * (0.85 + r() * 0.3)) {
      const pulses = 3 + Math.floor(r() * 2);
      for (let p = 0; p < pulses; p++) {
        const start = len(t + p * 0.045);
        const pl = len(0.028);
        for (let i = 0; i < pl; i++) {
          const k = (start + i) % n;
          const env = Math.sin(Math.PI * i / pl);
          out[k] += Math.sin(2 * Math.PI * c.freq * i / RATE) * env * c.loud;
        }
      }
    }
  });
  // Wind wraps too: fade its first and last half second into each other.
  const x = len(0.5);
  for (let i = 0; i < x; i++) {
    const w = i / x;
    out[i] = out[i] * w + out[n - x + i] * (1 - w);
  }
  write("gabi", normalise(out.subarray(0, n - x)), 0.55, "music");
}
