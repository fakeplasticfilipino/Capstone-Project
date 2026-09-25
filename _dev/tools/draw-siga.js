// =============================================================
// MACARIO — _dev/tools/draw-siga.js
//
// Draws the three siga, the street toughs of Act I's opening, from
// nothing: no frame of any commissioned sheet is traced, moved or
// recoloured (the proponent's direction, Block 72). Each boy is a
// jointed figure (legs, arms, a spine and a head, each a few angles a
// frame) wearing clothes built from shapes, and the picture is made
// the way the artist's sheets look: a thin dark outline on every part,
// a soft shade on the side away from the light, a highlight on the
// side toward it, and a cast shadow under whatever hangs over it.
//
// Everything is drawn at SS times the size and averaged down, so edges
// come out soft like the painted sheets rather than stair-stepped. The
// feet are put on the ground by the rig itself (the lowest sole of the
// two legs touches GROUND), so the walk bobs by itself and the idle
// never floats.
//
// Run:  node _dev/tools/draw-siga.js [1 2 3]
//
// Writes, for each boy named (all three by default):
//   assets/sprites/characters/siga-N.png       idle, 12 frames, 4 by 3
//   assets/sprites/characters/siga-N-walk.png  walk,  8 frames, 4 by 2
// Then measure both with measure-sprite.js and paste the numbers into
// SIGA in content/act1.js, and bump ASSET_VERSION.
//
// Depends on nothing outside Node, like measure-sprite.js and
// make-combat-sfx.js, because the proponent's computer has Node and no
// Python.
// =============================================================

"use strict";

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const SS = 4;            // supersampling factor
const CELL = 256;        // one frame, in the sheet's own pixels
const HC = CELL * SS;    // one frame while drawing
const GROUND = 188;      // where the soles land, as in Macario's sheets

// -------------------------------------------------------------
// PNG out
// -------------------------------------------------------------

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// -------------------------------------------------------------
// Masks: one byte per drawing pixel, with the box that holds them,
// so every loop runs over a part's own few thousand pixels rather
// than the whole frame.
// -------------------------------------------------------------

class Mask {
  constructor() {
    this.d = new Uint8Array(HC * HC);
    this.x0 = HC; this.y0 = HC; this.x1 = -1; this.y1 = -1;
  }
  get(x, y) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= HC || y >= HC) return 0;
    return this.d[y * HC + x];
  }
  span(y, xa, xb) {
    if (y < 0 || y >= HC) return;
    xa = Math.max(0, xa); xb = Math.min(HC - 1, xb);
    if (xb < xa) return;
    this.d.fill(1, y * HC + xa, y * HC + xb + 1);
    if (xa < this.x0) this.x0 = xa;
    if (xb > this.x1) this.x1 = xb;
    if (y < this.y0) this.y0 = y;
    if (y > this.y1) this.y1 = y;
  }
  empty() { return this.x1 < 0; }
  refit() {
    // After a subtraction the box may be larger than what is left.
    let x0 = HC, y0 = HC, x1 = -1, y1 = -1;
    for (let y = this.y0; y <= this.y1; y++) {
      for (let x = this.x0; x <= this.x1; x++) {
        if (this.d[y * HC + x]) {
          if (x < x0) x0 = x; if (x > x1) x1 = x;
          if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
      }
    }
    this.x0 = x0; this.y0 = y0; this.x1 = x1; this.y1 = y1;
    return this;
  }
}

function union(...masks) {
  const m = new Mask();
  for (const a of masks) {
    if (!a || a.empty()) continue;
    for (let y = a.y0; y <= a.y1; y++) {
      for (let x = a.x0; x <= a.x1; x++) {
        if (a.d[y * HC + x]) m.d[y * HC + x] = 1;
      }
    }
    m.x0 = Math.min(m.x0, a.x0); m.y0 = Math.min(m.y0, a.y0);
    m.x1 = Math.max(m.x1, a.x1); m.y1 = Math.max(m.y1, a.y1);
  }
  return m;
}

function intersect(a, b) {
  const m = new Mask();
  if (a.empty() || b.empty()) return m;
  for (let y = a.y0; y <= a.y1; y++) {
    for (let x = a.x0; x <= a.x1; x++) {
      const i = y * HC + x;
      if (a.d[i] && b.d[i]) m.d[i] = 1;
    }
  }
  m.x0 = a.x0; m.y0 = a.y0; m.x1 = a.x1; m.y1 = a.y1;
  return m.refit();
}

function subtract(a, b) {
  const m = union(a);
  if (m.empty() || !b || b.empty()) return m;
  for (let y = m.y0; y <= m.y1; y++) {
    for (let x = m.x0; x <= m.x1; x++) {
      const i = y * HC + x;
      if (b.d[i]) m.d[i] = 0;
    }
  }
  return m.refit();
}

// Grows a mask by r drawing pixels (a square, which is enough for the
// small amounts it is used for: cloth sitting proud of a head).
function dilate(a, r) {
  const m = new Mask();
  if (a.empty()) return m;
  for (let y = a.y0; y <= a.y1; y++) {
    for (let x = a.x0; x <= a.x1; x++) {
      if (!a.d[y * HC + x]) continue;
      for (let j = -r; j <= r; j++) m.span(y + j, x - r, x + r);
    }
  }
  return m;
}

// -------------------------------------------------------------
// Shapes, in sheet pixels (they are scaled by SS here, so the rig
// and the costume can be written at the size a frame is seen).
// -------------------------------------------------------------

function polygon(points) {
  const m = new Mask();
  const pts = points.map(([x, y]) => [x * SS, y * SS]);
  let ya = Infinity, yb = -Infinity;
  for (const [, y] of pts) { ya = Math.min(ya, y); yb = Math.max(yb, y); }
  for (let y = Math.max(0, Math.floor(ya)); y <= Math.min(HC - 1, Math.ceil(yb)); y++) {
    const sy = y + 0.5;
    const xs = [];
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i];
      const [bx, by] = pts[(i + 1) % pts.length];
      if ((ay <= sy && by > sy) || (by <= sy && ay > sy)) {
        xs.push(ax + ((sy - ay) / (by - ay)) * (bx - ax));
      }
    }
    xs.sort((p, q) => p - q);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      m.span(y, Math.ceil(xs[i] - 0.5), Math.floor(xs[i + 1] - 0.5));
    }
  }
  return m;
}

function discInto(m, cx, cy, r) {
  cx *= SS; cy *= SS; r *= SS;
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    const dy = y + 0.5 - cy;
    if (dy * dy > r * r) continue;
    const dx = Math.sqrt(r * r - dy * dy);
    m.span(y, Math.ceil(cx - dx - 0.5), Math.floor(cx + dx - 0.5));
  }
}

function disc(cx, cy, r) {
  const m = new Mask();
  discInto(m, cx, cy, r);
  return m;
}

// A limb: every disc from a (radius ra) to b (radius rb), which is a
// tapered capsule with round ends that meet the next limb cleanly.
function capsule(a, ra, b, rb) {
  const m = new Mask();
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const steps = Math.max(1, Math.ceil(len * SS * 1.5));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    discInto(m, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, ra + (rb - ra) * t);
  }
  return m;
}

// A stroke along a polyline, width w (tapering to w2 if given).
function stroke(points, w, w2) {
  const m = new Mask();
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  }
  let run = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const steps = Math.max(1, Math.ceil(len * SS * 2));
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const along = total ? (run + len * t) / total : 0;
      const r = (w + ((w2 == null ? w : w2) - w) * along) / 2;
      discInto(m, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, r);
    }
    run += len;
  }
  return m;
}

// A rolled cuff: a band across a limb from a to b, r either side of
// the line, with square ends (a capsule's round ends read as a pad).
function band(a, b, r) {
  const d = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(...d) || 1;
  const n = [-d[1] / l * r, d[0] / l * r];
  const bulge = [d[0] / l * 0.5, d[1] / l * 0.5];
  return polygon([
    [a[0] + n[0], a[1] + n[1]], [a[0] - n[0], a[1] - n[1]],
    [b[0] - n[0] + bulge[0], b[1] - n[1] + bulge[1]], [b[0] + n[0] + bulge[0], b[1] + n[1] + bulge[1]],
  ]);
}

function ellipse(cx, cy, rx, ry, rotDeg = 0, n = 40) {
  const pts = [];
  const c = Math.cos(rotDeg * Math.PI / 180), s = Math.sin(rotDeg * Math.PI / 180);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    pts.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return polygon(pts);
}

// A quadratic Bezier as points, for cloth edges.
function quad(p0, p1, p2, n = 8) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
              u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]);
  }
  return out;
}

// -------------------------------------------------------------
// Geometry helpers
// -------------------------------------------------------------

const rad = (d) => (d * Math.PI) / 180;
// Angle measured from straight down, positive toward the front (+x):
// the way a leg or an arm swings.
const limb = (from, deg, len) => [from[0] + Math.sin(rad(deg)) * len, from[1] + Math.cos(rad(deg)) * len];
const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// A frame of reference: origin, rotation (degrees, positive turns the
// top forward), and x/y scale. Local y is UP; the result is on screen.
function frame(origin, deg, sx = 1, sy = 1) {
  const c = Math.cos(rad(deg)), s = Math.sin(rad(deg));
  return ([x, y]) => {
    const lx = x * sx, ly = y * sy;
    return [origin[0] + lx * c + ly * s, origin[1] + lx * s - ly * c];
  };
}

// Two-bone reach: an elbow for a hand that must be at target.
// bend: +1 puts the elbow behind the line (an arm), -1 in front.
function reach(root, target, l1, l2, bend) {
  const dx = target[0] - root[0], dy = target[1] - root[1];
  const d = Math.min(Math.hypot(dx, dy), l1 + l2 - 0.01);
  const a = Math.atan2(dy, dx);
  const cosA = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
  const off = Math.acos(Math.max(-1, Math.min(1, cosA)));
  const ang = a + bend * off;
  const elbow = [root[0] + Math.cos(ang) * l1, root[1] + Math.sin(ang) * l1];
  const hand = [root[0] + Math.cos(a) * d, root[1] + Math.sin(a) * d];
  return { elbow, hand };
}

// -------------------------------------------------------------
// Colour
// -------------------------------------------------------------

const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];

// A material: the colour a part is in full light, in its own shade,
// in its highlight, and its outline. Parts on the far side of the body
// are the same cloth in less light, a little cooler.
function material(base, dark, light, ink) {
  return { base, dark, light, ink: ink || mix(mul(dark, 0.55), [30, 20, 20], 0.45) };
}

function far(mat) {
  const f = (c) => mix(mul(c, 0.7), [40, 44, 64], 0.12);
  return { base: f(mat.base), dark: f(mat.dark), light: f(mat.light), ink: mul(mat.ink, 0.85) };
}

// A small fixed grain, so a flat of cloth reads as painted rather
// than filled. Hashed from the sheet pixel, so every frame agrees.
function grain(x, y) {
  let h = (x * 374761393 + y * 668265263) ^ 0x5bd1e995;
  h = (h ^ (h >>> 13)) * 1274126177;
  h = h ^ (h >>> 16);
  return ((h & 1023) / 1023 - 0.5);
}

// -------------------------------------------------------------
// The canvas and the painting of a part
// -------------------------------------------------------------

class Canvas {
  constructor() {
    this.rgb = new Float32Array(HC * HC * 3);
    this.a = new Uint8Array(HC * HC);
  }
  put(i, c) {
    this.rgb[i * 3] = c[0]; this.rgb[i * 3 + 1] = c[1]; this.rgb[i * 3 + 2] = c[2];
    this.a[i] = 1;
  }
}

// Distance, in drawing pixels, from each pixel of a mask to the
// nearest pixel outside it (a two-pass chamfer). The outline is where
// it is small.
function insideDistance(m) {
  const x0 = m.x0 - 1, y0 = m.y0 - 1, w = m.x1 - m.x0 + 3, h = m.y1 - m.y0 + 3;
  const d = new Float32Array(w * h);
  const BIG = 1e6;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) d[y * w + x] = m.get(x0 + x, y0 + y) ? BIG : 0;
  }
  const D = Math.SQRT2;
  for (let y = 1; y < h; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (!d[i]) continue;
      d[i] = Math.min(d[i], d[i - 1] + 1, d[i - w] + 1, d[i - w - 1] + D, d[i - w + 1] + D);
    }
  }
  for (let y = h - 2; y >= 0; y--) {
    for (let x = w - 2; x >= 1; x--) {
      const i = y * w + x;
      if (!d[i]) continue;
      d[i] = Math.min(d[i], d[i + 1] + 1, d[i + w] + 1, d[i + w + 1] + D, d[i + w - 1] + D);
    }
  }
  return { get: (x, y) => d[(y - y0) * w + (x - x0)] };
}

// Light comes from the upper left, as in the commissioned sheets.
const TO_SHADOW = (() => { const v = [0.5, 0.86]; const l = Math.hypot(...v); return [v[0] / l, v[1] / l]; })();

// Paints one part. opts:
//   outline   outline width in sheet pixels (default 0.8)
//   shade     how far in from the shadow edge the shade reaches
//   light     how far in from the lit edge the highlight reaches
//   flat      no shading at all (eyes, small marks)
//   cast      [{ mask, dx, dy, amt }]: darkens where that mask, moved
//             by (dx, dy), covers this part, which is a shadow thrown
//             by something hanging over it
//   grain     texture strength (default 0.05)
function paint(cv, m, mat, opts = {}) {
  if (m.empty()) return;
  const dist = insideDistance(m);
  const ow = (opts.outline == null ? 0.8 : opts.outline) * SS;
  const shadeLen = (opts.shade == null ? 4.2 : opts.shade) * SS;
  const lightLen = (opts.light == null ? 2.4 : opts.light) * SS;
  const step = SS * 0.5;
  const grainK = opts.grain == null ? 0.05 : opts.grain;
  for (let y = m.y0; y <= m.y1; y++) {
    for (let x = m.x0; x <= m.x1; x++) {
      const i = y * HC + x;
      if (!m.d[i]) continue;
      let col;
      if (dist.get(x, y) < ow) {
        col = mat.ink;
      } else if (opts.flat) {
        col = mat.base;
      } else {
        // How soon a walk toward the shadow side leaves the part.
        let ts = shadeLen;
        for (let s = step; s < shadeLen; s += step) {
          if (!m.get(x + TO_SHADOW[0] * s, y + TO_SHADOW[1] * s)) { ts = s; break; }
        }
        let tl = lightLen;
        for (let s = step; s < lightLen; s += step) {
          if (!m.get(x - TO_SHADOW[0] * s, y - TO_SHADOW[1] * s)) { tl = s; break; }
        }
        const sh = Math.pow(1 - ts / shadeLen, 0.8);
        const li = Math.pow(1 - tl / lightLen, 1.2) * (1 - sh);
        col = mix(mat.base, mat.dark, sh * 0.9);
        if (opts.vgrad) col = mix(col, mat.dark, opts.vgrad * (y - m.y0) / Math.max(1, m.y1 - m.y0));
        col = mix(col, mat.light, li * 0.75);
        if (opts.cast) {
          for (const c of opts.cast) {
            if (c.mask && c.mask.get(x - c.dx * SS, y - c.dy * SS)) {
              col = mix(col, mat.dark, c.amt);
              break;
            }
          }
        }
        const g = grain(Math.floor(x / SS), Math.floor(y / SS)) * grainK;
        col = [col[0] * (1 + g), col[1] * (1 + g), col[2] * (1 + g)];
      }
      cv.put(i, col);
    }
  }
}

// Averages the drawing down to the sheet's size.
function downsample(cv) {
  const out = Buffer.alloc(CELL * CELL * 4);
  for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
      let n = 0, r = 0, g = 0, b = 0;
      for (let j = 0; j < SS; j++) {
        for (let k = 0; k < SS; k++) {
          const i = (y * SS + j) * HC + x * SS + k;
          if (!cv.a[i]) continue;
          n++; r += cv.rgb[i * 3]; g += cv.rgb[i * 3 + 1]; b += cv.rgb[i * 3 + 2];
        }
      }
      const o = (y * CELL + x) * 4;
      if (!n) continue;
      out[o] = Math.max(0, Math.min(255, Math.round(r / n)));
      out[o + 1] = Math.max(0, Math.min(255, Math.round(g / n)));
      out[o + 2] = Math.max(0, Math.min(255, Math.round(b / n)));
      out[o + 3] = Math.round((n / (SS * SS)) * 255);
    }
  }
  return out;
}

// -------------------------------------------------------------
// The three boys. Lengths are in sheet pixels for a boy of about 125
// (Macario's walk is 127), scaled by `scale`; `build` widens the body.
// -------------------------------------------------------------

const SKIN = material([158, 104, 70], [108, 66, 44], [196, 142, 102]);
const HAIR = material([34, 28, 30], [16, 12, 14], [72, 64, 70], [10, 8, 10]);
const LIP = [100, 52, 42];

const BOYS = {
  // The one who speaks: the leader. A red panyo tied round his head,
  // a faded indigo camisa with the sleeves rolled up, khaki trousers
  // rolled to the calf, barefoot, a stalk of grass in his teeth.
  1: {
    scale: 1.0, build: 1.0,
    headgear: "panyo",
    panyo: material([152, 46, 38], [98, 28, 26], [196, 88, 68]),
    hair: "short",
    shirt: material([74, 86, 110], [44, 52, 72], [116, 130, 152]),
    patch: [92, 104, 128],
    sleeves: "rolled",
    trousers: material([150, 126, 90], [100, 82, 58], [186, 164, 124]),
    trouserEnd: 0.6,
    sash: null,
    stalk: true,
    swagger: 1.0,
  },
  // The big one. A buri hat pushed back, a white camisa hanging open
  // over a bare chest, dark trousers, a red sash knotted at the hip.
  2: {
    scale: 1.05, build: 1.25,
    headgear: "hat",
    hat: material([196, 164, 104], [138, 108, 62], [230, 206, 150]),
    hair: "cropped",
    shirt: material([214, 206, 184], [150, 140, 120], [240, 236, 222]),
    openShirt: true,
    sleeves: "long-rolled",
    trousers: material([70, 58, 52], [42, 34, 32], [104, 90, 80]),
    trouserEnd: 0.8,
    sash: material([150, 40, 34], [96, 24, 22], [190, 76, 60]),
    stalk: false,
    swagger: 0.8,
  },
  // The small one, who follows. No hat, a mop of hair, an ochre shirt
  // too big for him with a patch on the back, grey knee trousers.
  3: {
    scale: 0.9, build: 0.9,
    headgear: null,
    hair: "mop",
    shirt: material([176, 136, 64], [120, 88, 38], [212, 178, 104]),
    patch: [150, 116, 60],
    sleeves: "long",
    trousers: material([92, 96, 100], [58, 60, 66], [130, 134, 138]),
    trouserEnd: 0.42,
    sash: null,
    stalk: false,
    swagger: 1.3,
  },
};

// -------------------------------------------------------------
// Poses. Angles in degrees. A leg is { t: thigh from straight down,
// forward positive; k: knee bend; f: foot, toe up positive }. An arm
// is { s: upper arm from straight down, forward positive; e: elbow
// bend, forearm forward } or { onHip: true }.
// -------------------------------------------------------------

// One leg through the eight frames of a step and back. The other leg
// is the same four frames later.
const GAIT = [
  { t: 23, k: 3, f: 12 },    // heel strikes, leg reaching forward
  { t: 16, k: 17, f: 0 },    // takes the weight
  { t: 4, k: 7, f: 0 },      // passing under the body
  { t: -9, k: 4, f: 0 },     // pushing back
  { t: -19, k: 10, f: -18 }, // heel up
  { t: -12, k: 42, f: -32 }, // toe off
  { t: 7, k: 58, f: -12 },   // swinging through
  { t: 21, k: 24, f: 2 },    // reaching
];

function walkPose(i, boy) {
  const n = GAIT.length;
  const near = GAIT[i];
  const farLeg = GAIT[(i + n / 2) % n];
  const ph = (i / n) * Math.PI * 2;
  const sw = boy.swagger;
  // Arms swing against the legs, loose and wide: a swagger, not a march.
  const armSwing = (t) => -t * 1.05 * sw;
  return {
    lean: -2.5 + Math.cos(ph * 2) * 0.8,       // leaning back, chest out
    head: -4 + Math.sin(ph * 2 + 0.6) * 1.2,   // chin up
    breath: 0,
    shoulderRoll: Math.sin(ph) * 1.5 * sw,
    legs: { near, far: farLeg },
    arms: {
      near: { s: armSwing(near.t) - 4, e: 16 + Math.max(0, armSwing(near.t)) * 0.9 },
      far: { s: armSwing(farLeg.t) - 4, e: 16 + Math.max(0, armSwing(farLeg.t)) * 0.9 },
    },
    tail: Math.sin(ph - 1.2) * 14,
    hem: Math.sin(ph - 0.9) * 1.0,
    stalk: Math.sin(ph * 2) * 5,
  };
}

// Twelve frames of standing about: breathing, weight settling on the
// back foot, a hand on the hip, the grass stalk worked in his teeth.
function idlePose(i, boy) {
  const n = 12;
  const ph = (i / n) * Math.PI * 2;
  const b = Math.sin(ph);
  return {
    lean: -3 + b * 0.35,
    head: -5 + Math.sin(ph + 0.8) * 0.9,
    breath: b,
    shoulderRoll: 0,
    legs: {
      near: { t: 9, k: 11 + b * 0.8, f: 0 },
      far: { t: -5, k: 1, f: 0 },
    },
    arms: {
      near: { onHip: true },
      far: { s: -8 + Math.sin(ph + 0.4) * 1.2, e: 10 },
    },
    tail: Math.sin(ph - 1) * 5,
    hem: 0,
    stalk: Math.sin(ph * 2) * 7 + Math.sin(ph * 3) * 3,
  };
}

// -------------------------------------------------------------
// The body
// -------------------------------------------------------------

function legGeometry(hip, pose, L) {
  const knee = limb(hip, pose.t, L.thigh);
  const ankle = limb(knee, pose.t - pose.k, L.shin);
  // Foot outline, x forward and y down, ankle at the origin, sole at
  // L.ankle below it. Rotated so a positive f lifts the toe.
  const A = L.ankle, s = L.scale;
  const foot = [
    [-2.1, -1.6], [-3.6, 1.0], [-3.4, A], [3.2, A + 0.1], [7.6, A],
    [8.5, A - 1.0], [7.4, A - 2.3], [3.2, A - 3.1], [1.9, -1.6],
  ].map(([x, y]) => [x * s, y * (y > 0 ? 1 : s)]);
  const c = Math.cos(rad(-pose.f)), sn = Math.sin(rad(-pose.f));
  const pts = foot.map(([x, y]) => [ankle[0] + x * c - y * sn, ankle[1] + x * sn + y * c]);
  const toeLines = [5.6, 6.9].map((tx) => {
    const a = [tx * s, (A - 2.3) * 1], b = [tx * s + 0.6, A - 0.4];
    return [a, b].map(([x, y]) => [ankle[0] + x * c - y * sn, ankle[1] + x * sn + y * c]);
  });
  return { knee, ankle, foot: pts, toeLines, lowest: Math.max(...pts.map((p) => p[1])) };
}

function buildFrame(boy, pose) {
  const s = boy.scale, w = boy.build;
  const L = {
    scale: s,
    thigh: 29 * s, shin: 28 * s, ankle: 3.4 * s,
    torso: 38 * s, upper: 20 * s, fore: 18.5 * s,
  };
  const HIP_X = 128;

  // Put the feet on the ground: work the legs out from a hip at 0,
  // then lift the whole boy so the lower sole touches GROUND.
  const trial = (hip) => ({
    near: legGeometry([hip[0] + 0.8, hip[1]], pose.legs.near, L),
    far: legGeometry([hip[0] - 0.8, hip[1]], pose.legs.far, L),
  });
  const probe = trial([HIP_X, 0]);
  const hipY = GROUND - Math.max(probe.near.lowest, probe.far.lowest);
  const hip = [HIP_X, hipY];
  const legs = trial(hip);

  // The torso's frame: origin at the hip, local y up. The chest swells
  // a touch with a breath.
  const T = frame(hip, pose.lean + pose.shoulderRoll * 0.4, w * 1.18, s);
  const br = pose.breath * 0.35;
  const hem = pose.hem;
  const shoulderNear = T([0.2, 33.8 + br * 0.6]);
  const shoulderFar = T([-1.6, 34.2 + br * 0.6]);
  const neckBase = T([1.2, 39 + br * 0.5]);

  const cv = new Canvas();
  const shirt = boy.shirt, trousers = boy.trousers;

  // --- The head, first as shapes, because the neck and the torso need
  // to know where it throws its shadow.
  const hs = s * 1.14; // a boy's head, a little large for his body
  const headOrigin = [neckBase[0] + Math.sin(rad(pose.lean)) * 3.0 * s + 0.6 * s,
                      neckBase[1] - Math.cos(rad(pose.lean)) * 3.0 * s];
  const H = frame(headOrigin, pose.lean + pose.head, hs, hs);
  const skull = ellipse(...H([-0.9, 10.8]), 8.2 * hs, 9.0 * hs, pose.lean + pose.head);
  const face = polygon([
    [0.8, 17.9], [5.2, 17.2], [7.3, 14.8], [7.9, 12.9], [7.35, 12.0],
    [8.25, 10.6], [9.9, 8.0], [9.45, 7.25], [8.05, 7.0], [8.35, 5.9],
    [7.85, 5.25], [8.1, 4.5], [7.55, 3.35], [7.95, 1.9], [6.7, 0.4],
    [3.6, -0.2], [0.4, -0.7], [-1.4, 4.0], [-0.4, 10],
  ].map(H));
  const head = union(skull, face);

  // --- Neck
  const neck = capsule(neckBase, 4.2 * s * Math.min(w, 1.1), H([0.6, 2.0]), 3.6 * s);

  // --- Shirt: a loose camisa, untucked, the hem hanging to the top of
  // the thigh. Local x forward, y up from the hip.
  const hemY = boy.openShirt ? -6.5 : -7.5;
  const shirtPts = [
    ...quad([-9.4 + hem * 0.6, hemY - 0.6], [-10.8, 8], [-9.4, 21]),
    ...quad([-9.6, 23], [-10.2, 31.5], [-7.4, 36.4 + br]),
    ...quad([-6.4, 37.4 + br], [-4.8, 39.4 + br], [-2.2, 40.0 + br]),
    [3.0, 40.0 + br],
    ...quad([5.8, 39.0 + br], [10.4 + br, 34], [10.2 + br * 0.6, 24]),
    ...quad([9.9, 20], [8.3, 10], [10.4 + hem, hemY + 0.8]),
    ...quad([10.0 + hem, hemY - 0.2], [2 + hem * 0.5, hemY - 1.8], [-9.2 + hem * 0.6, hemY - 0.6]),
  ];
  let shirtMask = polygon(shirtPts.map(T));
  // A torn corner at the back of the hem.
  if (boy.patch) {
    shirtMask = subtract(shirtMask, polygon([[-9.8, hemY - 2], [-7.4, hemY - 2], [-8.6, hemY + 1.4]].map(T)));
  }

  // --- Arms
  function armGeometry(shoulder, a, isNear) {
    let elbow, wrist;
    if (a.onHip) {
      // Knuckles on the hip, elbow out behind him.
      const target = T([-4.2, 3.5]);
      const r = reach(shoulder, target, L.upper, L.fore, 1);
      elbow = r.elbow; wrist = r.hand;
    } else {
      elbow = limb(shoulder, a.s, L.upper);
      wrist = limb(elbow, a.s + a.e, L.fore);
    }
    return { shoulder, elbow, wrist };
  }
  const armN = armGeometry(shoulderNear, pose.arms.near, true);
  const armF = armGeometry(shoulderFar, pose.arms.far, false);

  function armMasks(g) {
    const { shoulder, elbow, wrist } = g;
    const sleeveTo = boy.sleeves === "long" ? 1.0 : boy.sleeves === "long-rolled" ? 0.55 : 0.62;
    const upperSkin = capsule(shoulder, 4.9 * s * w, elbow, 3.7 * s * w);
    const foreDir = [wrist[0] - elbow[0], wrist[1] - elbow[1]];
    const fl = Math.hypot(...foreDir);
    const handC = [wrist[0] + (foreDir[0] / fl) * 2.2 * s, wrist[1] + (foreDir[1] / fl) * 2.2 * s];
    const forearm = capsule(elbow, 3.5 * s * w, wrist, 2.6 * s * w);
    const hand = ellipse(handC[0], handC[1], 3.3 * s, 2.8 * s, Math.atan2(foreDir[1], foreDir[0]) * 180 / Math.PI);
    let sleeve, cuff = null;
    if (boy.sleeves === "long") {
      // Too long for him: down past the wrist, only the fingers out.
      const upperC = capsule(shoulder, 5.4 * s * w, elbow, 4.4 * s * w);
      const foreC = capsule(elbow, 4.4 * s * w, lerp2(elbow, wrist, 0.92), 3.9 * s * w);
      sleeve = union(upperC, foreC);
      cuff = band(lerp2(elbow, wrist, 0.8), lerp2(elbow, wrist, 0.94), 3.9 * s * w);
    } else if (boy.sleeves === "long-rolled") {
      const upperC = capsule(shoulder, 5.6 * s * w, elbow, 4.6 * s * w);
      const foreC = capsule(elbow, 4.6 * s * w, lerp2(elbow, wrist, sleeveTo), 4.1 * s * w);
      sleeve = union(upperC, foreC);
      cuff = band(lerp2(elbow, wrist, sleeveTo - 0.18), lerp2(elbow, wrist, sleeveTo), 4.3 * s * w);
    } else {
      const end = lerp2(shoulder, elbow, sleeveTo);
      sleeve = capsule(shoulder, 5.5 * s * w, end, 4.8 * s * w);
      cuff = band(lerp2(shoulder, elbow, sleeveTo - 0.22), end, 5.0 * s * w);
    }
    return { upperSkin, forearm, hand, sleeve, cuff };
  }
  const aN = armMasks(armN);
  const aF = armMasks(armF);

  // --- Legs
  function legMasks(g, hipJ) {
    const { knee, ankle } = g;
    const end = boy.trouserEnd;
    const cuffAt = lerp2(knee, ankle, end);
    const thigh = capsule(hipJ, 8.2 * s * w, knee, 6.0 * s * w);
    const shinT = capsule(knee, 6.0 * s * w, cuffAt, 5.6 * s * w);
    const cuff = band(lerp2(knee, ankle, end - 0.1), lerp2(knee, ankle, end + 0.01), 6.1 * s * w);
    const calf = capsule(lerp2(knee, ankle, end - 0.1), 4.0 * s * w, ankle, 2.5 * s);
    const foot = polygon(g.foot);
    const toes = union(...g.toeLines.map((l) => stroke(l, 0.35)));
    return { trouser: union(thigh, shinT), cuff, calf, foot, toes };
  }
  const lN = legMasks(legs.near, [hip[0] + 0.8, hip[1]]);
  const lF = legMasks(legs.far, [hip[0] - 0.8, hip[1]]);
  const pelvis = ellipse(...T([0.4, 1.5]), 8.4 * s * w, 7.6 * s, pose.lean);

  // --- Paint, back to front.
  const skinF = far(SKIN);

  // Far arm, behind everything.
  paint(cv, aF.upperSkin, skinF);
  paint(cv, aF.forearm, skinF);
  paint(cv, aF.hand, skinF, { shade: 2.5 });
  paint(cv, aF.sleeve, far(shirt));
  if (aF.cuff) paint(cv, aF.cuff, far(shirt), { shade: 1.6 });

  // Far leg.
  paint(cv, lF.calf, skinF);
  paint(cv, lF.foot, skinF, { shade: 2 });
  paint(cv, lF.toes, { base: skinF.ink, dark: skinF.ink, light: skinF.ink, ink: skinF.ink }, { flat: true, outline: 0 });
  paint(cv, lF.trouser, far(trousers), { shade: 5.5, vgrad: 0.2, cast: [{ mask: shirtMask, dx: 0.6, dy: 2.2, amt: 0.45 }] });
  paint(cv, lF.cuff, far(trousers), { shade: 1.6 });

  // Pelvis and near leg.
  paint(cv, pelvis, trousers);
  paint(cv, lN.calf, SKIN);
  paint(cv, lN.foot, SKIN, { shade: 2 });
  paint(cv, lN.toes, { base: SKIN.ink, dark: SKIN.ink, light: SKIN.ink, ink: SKIN.ink }, { flat: true, outline: 0 });
  paint(cv, lN.trouser, trousers, { shade: 5.5, vgrad: 0.2, cast: [{ mask: shirtMask, dx: 0.6, dy: 2.4, amt: 0.5 }] });
  paint(cv, lN.cuff, trousers, { shade: 1.6, light: 1.2 });

  // Neck, in the shadow of the jaw.
  paint(cv, neck, SKIN, { cast: [{ mask: head, dx: 0.3, dy: 1.8, amt: 0.6 }] });

  // Shirt, with the near arm's shadow on it.
  const nearArmAll = union(aN.upperSkin, aN.forearm, aN.hand, aN.sleeve);
  paint(cv, shirtMask, shirt, {
    shade: 7, light: 3.4, vgrad: 0.22,
    cast: [{ mask: nearArmAll, dx: 1.4, dy: 1.2, amt: 0.4 }, { mask: head, dx: 0.4, dy: 2.2, amt: 0.35 }],
  });

  // Open neck: a V of skin, or for the big one a shirt hanging open
  // down the whole front.
  if (boy.openShirt) {
    const chest = intersect(polygon([
      [1.8, 40], [6.8, 38.4], [9.4, 30], [9.0, 20], [8.8, 8], [10, hemY],
      [6.4, hemY - 1], [4.8, 10], [4.0, 24], [2.2, 34],
    ].map(T)), shirtMask);
    paint(cv, chest, SKIN, { shade: 3, light: 2 });
    // The shirt's front edge, a fold of cloth over the chest.
    paint(cv, stroke(quad(T([2.6, 38.5]), T([3.6, 20]), T([5.6, hemY + 0.5]), 10), 1.4 * s),
      shirt, { outline: 0.45, shade: 0.8, light: 0.6 });
  } else {
    const vee = intersect(polygon([[2.2, 40.2], [6.4, 38.6], [4.6, 33.6]].map(T)), shirtMask);
    paint(cv, vee, SKIN, { shade: 1.4, outline: 0.5 });
    paint(cv, stroke([T([2.2, 39.8]), T([4.4, 33.8]), T([6.2, 38.2])], 0.55 * s),
      { base: shirt.ink, dark: shirt.ink, light: shirt.ink, ink: shirt.ink }, { flat: true, outline: 0 });
  }
  // Folds: a crease from the armpit and one pulling at the belly.
  const foldInk = mix(shirt.dark, shirt.ink, 0.35);
  const fold = (pts, width) => paint(cv, intersect(stroke(pts.map(T), width * s, width * 0.35 * s), shirtMask),
    { base: foldInk, dark: foldInk, light: foldInk, ink: foldInk }, { flat: true, outline: 0 });
  fold(quad([-4.5, 30], [-3.5, 22], [-5.5, 13]), 0.7);
  fold(quad([6.5, 16], [3.2, 10], [4.6, 1]), 0.55);
  fold(quad([-2, 4], [0.5, 0], [-1.5, hemY + 1.5]), 0.5);
  // A patch sewn on the back, a poor boy's shirt.
  if (boy.patch) {
    const pm = intersect(polygon([[-8.6, 7.4], [-3.6, 7.8], [-3.9, 13.2], [-8.8, 12.8]].map(T)), shirtMask);
    paint(cv, pm, material(boy.patch, mul(boy.patch, 0.7), mix(boy.patch, [255, 255, 255], 0.2)), { outline: 0.5, shade: 2 });
    const stitch = mix(boy.patch, [230, 220, 190], 0.5);
    for (const [a, b] of [[[-8.2, 8.2], [-7.6, 8.3]], [[-6.6, 8.4], [-6, 8.5]], [[-5, 8.5], [-4.4, 8.6]]]) {
      paint(cv, intersect(stroke([T(a), T(b)], 0.35), shirtMask), { base: stitch, dark: stitch, light: stitch, ink: stitch }, { flat: true, outline: 0 });
    }
  }
  // A sash knotted at the hip, over the shirt.
  if (boy.sash) {
    const band = intersect(polygon([[-12, 1.6], [12, 2.8], [12, -1.6], [-12, -2.6]].map(T)), dilate(shirtMask, 2));
    paint(cv, band, boy.sash, { shade: 2, light: 1.2 });
    const knot = ellipse(...T([8.8, 0.4]), 2.2 * s, 1.9 * s, pose.lean);
    paint(cv, knot, boy.sash, { shade: 1.6 });
    const tailA = stroke([T([8.6, -0.8]), T([9.6 + pose.hem, -7]), T([9.0 + pose.hem * 1.5, -10.5])], 2.2 * s, 1.2 * s);
    paint(cv, tailA, boy.sash, { shade: 1.4 });
  }

  // Panyo tails, behind the head.
  let tails = null;
  if (boy.headgear === "panyo") {
    const knot = H([-9.2, 12.8]);
    const t1 = limb(knot, -62 + pose.tail, 7.5 * hs);
    const t1b = limb(t1, -40 + pose.tail * 1.4, 3 * hs);
    const t2 = limb(knot, -32 + pose.tail * 0.7, 5.5 * hs);
    tails = union(stroke([knot, t1, t1b], 2.4 * hs, 1.0 * hs), stroke([knot, t2], 2.0 * hs, 1.0 * hs));
    paint(cv, tails, boy.panyo, { shade: 1.6, light: 1 });
  }
  // A hat pushed back hangs its brim behind the head too; drawn after.

  // Head.
  paint(cv, head, SKIN, { shade: 3.6, light: 2.4 });

  // Ear.
  const ear = ellipse(...H([-1.2, 9.2]), 1.8 * hs, 2.7 * hs, pose.lean + pose.head + 8);
  paint(cv, ear, SKIN, { shade: 1.4, outline: 0.55 });
  paint(cv, ellipse(...H([-1.0, 9.0]), 0.6 * hs, 1.2 * hs, pose.lean + pose.head), SKIN.dark ? { base: SKIN.dark, dark: SKIN.dark, light: SKIN.dark, ink: SKIN.dark } : SKIN, { flat: true, outline: 0 });

  // Hair.
  const hairLine = polygon([
    [9, 30], [8.6, 16.6], [5.6, 15.9], [3.6, 14.6], [2.4, 12.4], [2.2, 9.4],
    [0.9, 9.6], [0.4, 12.3], [-2.2, 12.5], [-3.6, 8.4], [-3.4, 5.0], [-5.2, 1.8],
    [-20, 1], [-20, 30],
  ].map(H));
  let hairMask = intersect(dilate(head, 1), hairLine);
  if (boy.hair === "short" || boy.hair === "mop") {
    // Spikes and strands, so the top of the head is not a clean dome.
    const spikes = [];
    const tips = boy.hair === "mop"
      ? [[-10.0, 16.8, 5.0], [-6.8, 20.4, 5.2], [-2.2, 21.4, 5.2], [2.6, 20.6, 4.6], [-10.6, 10.8, 4.6], [-9.4, 4.0, 4.2]]
      : [[-9.2, 16.4, 2.6], [-6.6, 19.6, 2.8], [-2.6, 21.2, 2.8], [1.6, 21.0, 2.6], [5.0, 19.8, 2.4], [-9.8, 11.6, 2.4], [-8.2, 5.4, 2]];
    const tipW = boy.hair === "mop" ? 1.6 : 0.4;
    for (const [x, y, r] of tips) {
      const base = H([x * 0.55, (y - 10.6) * 0.55 + 10.6]);
      spikes.push(stroke([base, H([x, y])], r * hs, tipW * hs));
    }
    hairMask = union(hairMask, ...spikes);
    if (boy.hair === "mop") {
      // A fringe falling over the brow.
      hairMask = union(hairMask, stroke([H([2, 18]), H([6.2, 16.8]), H([8.4, 13.4])], 3.2 * hs, 0.6 * hs));
    }
  }
  paint(cv, hairMask, HAIR, { shade: 3, light: 1.6, grain: 0.08 });
  // A few strands of light through the hair.
  for (const pts of [[[-6, 16], [-2, 18.8], [2.4, 18.4]], [[-8, 12], [-6.4, 15.4]]]) {
    paint(cv, intersect(stroke(pts.map(H), 0.4 * hs), hairMask),
      { base: HAIR.light, dark: HAIR.light, light: HAIR.light, ink: HAIR.light }, { flat: true, outline: 0 });
  }

  // Headgear.
  if (boy.headgear === "panyo") {
    const bandPoly = polygon([[-14, 14.4], [12, 18.2], [12, 14.4], [-14, 10.8]].map(H));
    const band = intersect(dilate(head, Math.round(0.9 * SS)), bandPoly);
    paint(cv, band, boy.panyo, { shade: 1.8, light: 1.2 });
    const knot = ellipse(...H([-9.0, 12.8]), 2.3 * hs, 2.0 * hs, pose.lean + pose.head);
    paint(cv, knot, boy.panyo, { shade: 1.6 });
    // A fold line along the band.
    paint(cv, intersect(stroke([H([-8, 12.6]), H([8, 16.2])], 0.4 * hs), band),
      { base: boy.panyo.dark, dark: boy.panyo.dark, light: boy.panyo.dark, ink: boy.panyo.dark }, { flat: true, outline: 0 });
  } else if (boy.headgear === "hat") {
    // A buri hat, pushed back on the head: a low crown and a wide brim
    // tipped up at the front.
    const crown = polygon([
      ...quad([-7.2, 16.2], [-6.4, 24.2], [0.6, 24.6]),
      ...quad([1.2, 24.6], [6.2, 24], [6.4, 17.6]),
    ].map(H));
    const brim = ellipse(...H([-0.4, 16.6]), 13.2 * hs, 2.3 * hs, pose.lean + pose.head - 9);
    const hatAll = union(crown, brim);
    paint(cv, brim, boy.hat, { shade: 1.4, light: 1 });
    paint(cv, crown, boy.hat, { shade: 3, light: 2 });
    const bandH = intersect(polygon([[-9, 19.4], [9, 19.4], [9, 17.4], [-9, 17.4]].map(H)), crown);
    paint(cv, bandH, material([70, 44, 30], [44, 26, 18], [104, 70, 50]), { outline: 0.4, shade: 1 });
    // The weave: a few faint lines across the brim.
    for (const t of [-8, -3, 2, 7]) {
      paint(cv, intersect(stroke([H([t, 15.4]), H([t + 1.6, 17.6])], 0.35 * hs), brim),
        { base: boy.hat.dark, dark: boy.hat.dark, light: boy.hat.dark, ink: boy.hat.dark }, { flat: true, outline: 0 });
    }
    void hatAll;
  }

  // The face: a scowl, a narrowed eye, a smirk.
  const flatInk = (c) => ({ base: c, dark: c, light: c, ink: c });
  const eyeDark = [26, 18, 18];
  paint(cv, ellipse(...H([4.7, 11.2]), 1.5 * hs, 0.85 * hs, pose.lean + pose.head - 6), flatInk(eyeDark), { flat: true, outline: 0 });
  paint(cv, disc(...H([5.5, 11.4]), 0.4 * hs), flatInk([210, 196, 180]), { flat: true, outline: 0 });
  // Brow, drawn down toward the nose.
  paint(cv, stroke([H([2.4, 13.9]), H([4.6, 13.5]), H([6.8, 12.6])], 1.4 * hs, 0.9 * hs), flatInk(HAIR.base), { flat: true, outline: 0 });
  // Upper lid line and the shadow of the socket.
  paint(cv, stroke([H([3.6, 12.2]), H([6.0, 12.0])], 0.5 * hs), flatInk(SKIN.dark), { flat: true, outline: 0 });
  // Nostril, mouth with a curl at the corner.
  paint(cv, disc(...H([8.3, 7.6]), 0.42 * hs), flatInk(mul(SKIN.dark, 0.8)), { flat: true, outline: 0 });
  paint(cv, stroke([H([8.0, 5.3]), H([6.6, 5.15]), H([5.9, 5.75])], 0.55 * hs), flatInk(LIP), { flat: true, outline: 0 });
  // Cheekbone and jaw, a little shadow.
  // Under the jaw, a soft shadow rather than a line across the face.
  paint(cv, intersect(stroke([H([0.6, 3.2]), H([3.6, 1.2]), H([6.6, 0.8])], 1.6 * hs, 0.8 * hs), head),
    flatInk(mix(SKIN.base, SKIN.dark, 0.4)), { flat: true, outline: 0 });
  if (boy.stalk) {
    const root = H([7.9, 5.2]);
    const tip = limb(root, 118 + pose.stalk, 7.4 * hs);
    const tip2 = limb(tip, 100 + pose.stalk * 1.4, 1.6 * hs);
    paint(cv, stroke([root, tip, tip2], 0.95 * hs, 0.5 * hs), flatInk([58, 52, 22]), { flat: true, outline: 0 });
    paint(cv, stroke([root, tip, tip2], 0.5 * hs, 0.25 * hs), flatInk([204, 186, 104]), { flat: true, outline: 0 });
  }

  // Near arm, last: in front of everything.
  paint(cv, aN.upperSkin, SKIN);
  paint(cv, aN.forearm, SKIN);
  paint(cv, aN.sleeve, shirt, { shade: 3, light: 1.8 });
  if (aN.cuff) paint(cv, aN.cuff, shirt, { shade: 1.4, light: 1.2 });
  paint(cv, aN.hand, SKIN, { shade: 2.4 });
  // Knuckles.
  {
    const w0 = armN.wrist, e0 = armN.elbow;
    const d = [w0[0] - e0[0], w0[1] - e0[1]], l = Math.hypot(...d);
    const u = [d[0] / l, d[1] / l], nrm = [-u[1], u[0]];
    const kc = [w0[0] + u[0] * 3.6 * s, w0[1] + u[1] * 3.6 * s];
    paint(cv, stroke([[kc[0] + nrm[0] * 1.6 * s, kc[1] + nrm[1] * 1.6 * s], [kc[0] - nrm[0] * 1.2 * s, kc[1] - nrm[1] * 1.2 * s]], 0.35 * s),
      flatInk(SKIN.dark), { flat: true, outline: 0 });
  }

  return downsample(cv);
}

// -------------------------------------------------------------
// Sheets
// -------------------------------------------------------------

function sheet(frames, columns) {
  const rows = Math.ceil(frames.length / columns);
  const W = columns * CELL, Hh = rows * CELL;
  const out = Buffer.alloc(W * Hh * 4);
  frames.forEach((f, n) => {
    const cx = (n % columns) * CELL, cy = Math.floor(n / columns) * CELL;
    for (let y = 0; y < CELL; y++) f.copy(out, ((cy + y) * W + cx) * 4, y * CELL * 4, (y + 1) * CELL * 4);
  });
  return { width: W, height: Hh, rgba: out };
}

function main() {
  const which = process.argv.slice(2).filter((a) => BOYS[a]);
  const ids = which.length ? which : Object.keys(BOYS);
  const outDir = path.join(__dirname, "..", "..", "assets", "sprites", "characters");
  for (const id of ids) {
    const boy = BOYS[id];
    const idle = [];
    for (let i = 0; i < 12; i++) idle.push(buildFrame(boy, idlePose(i, boy)));
    const walk = [];
    for (let i = 0; i < GAIT.length; i++) walk.push(buildFrame(boy, walkPose(i, boy)));
    const a = sheet(idle, 4), b = sheet(walk, 4);
    fs.writeFileSync(path.join(outDir, `siga-${id}.png`), encodePng(a.width, a.height, a.rgba));
    fs.writeFileSync(path.join(outDir, `siga-${id}-walk.png`), encodePng(b.width, b.height, b.rgba));
    console.log(`siga-${id}.png (12 frames, 4 columns) and siga-${id}-walk.png (8 frames, 4 columns)`);
  }
}

if (require.main === module) main();

module.exports = { BOYS, buildFrame, idlePose, walkPose, GAIT, CELL };
