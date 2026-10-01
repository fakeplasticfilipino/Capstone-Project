// =============================================================
// MACARIO — _dev/tools/lib/puppet.js
//
// The paper cut-out puppet both animation tools share
// (animate-bantay.js, Block 73; animate-siga.js, Block 96): a still is
// cut into layers, and each frame draws the layers through affine maps
// onto a canvas, sampled bilinearly so a turned part keeps its soft
// edge. Moved here out of animate-bantay.js unchanged, so the bantay's
// sheets come out byte for byte as before.
//
//   blankLayer(w, h)          straight-alpha RGBA, { w, h, d }
//   dropSpecks(layer, min)    clears islands smaller than min pixels
//   I, move, turn, compose,   affine maps; turn(cx, cy, deg) is
//   invert, apply             clockwise on screen for a positive deg
//   new Canvas(w, h)          draw(layer, map, shade), fill(inside,
//                             rgb, alpha, box), crop(x0, y0, w, h)
//   sheet(frames, fw, fh, columns)   cropped frames into one grid
// =============================================================

"use strict";

function blankLayer(w, h) { return { w, h, d: new Uint8Array(w * h * 4) }; }

// Clears any island of fewer than min pixels: the soft edge of the rifle
// left behind on the body once the rifle is lifted out.
function dropSpecks(layer, min) {
  const { w, h, d } = layer;
  const seen = new Uint8Array(w * h);
  for (let start = 0; start < w * h; start++) {
    if (seen[start] || !d[start * 4 + 3]) continue;
    const island = [start];
    seen[start] = 1;
    for (let n = 0; n < island.length; n++) {
      const p = island[n], x = p % w, y = (p - x) / w;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const q = (y + dy) * w + x + dx;
        if (x + dx < 0 || x + dx >= w || y + dy < 0 || y + dy >= h || seen[q] || !d[q * 4 + 3]) continue;
        seen[q] = 1;
        island.push(q);
      }
    }
    if (island.length < min) island.forEach((p) => d.fill(0, p * 4, p * 4 + 4));
  }
}

// -------------------------------------------------------------
// Affine maps: x' = a x + c y + e, y' = b x + d y + f
// -------------------------------------------------------------

const I = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
const rad = (deg) => (deg * Math.PI) / 180;
function compose(m, n) { // m after n
  return {
    a: m.a * n.a + m.c * n.b, b: m.b * n.a + m.d * n.b,
    c: m.a * n.c + m.c * n.d, d: m.b * n.c + m.d * n.d,
    e: m.a * n.e + m.c * n.f + m.e, f: m.b * n.e + m.d * n.f + m.f,
  };
}
const move = (dx, dy) => ({ a: 1, b: 0, c: 0, d: 1, e: dx, f: dy });
// Turns by deg about (cx, cy); positive turns clockwise on screen.
function turn(cx, cy, deg) {
  const s = Math.sin(rad(deg)), c = Math.cos(rad(deg));
  return { a: c, b: s, c: -s, d: c, e: cx - c * cx + s * cy, f: cy - s * cx - c * cy };
}
function invert(m) {
  const det = m.a * m.d - m.b * m.c;
  return {
    a: m.d / det, b: -m.b / det, c: -m.c / det, d: m.a / det,
    e: (m.c * m.f - m.d * m.e) / det, f: (m.b * m.e - m.a * m.f) / det,
  };
}
const apply = (m, [x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f];

// -------------------------------------------------------------
// A frame: premultiplied float RGBA, drawn into with "over".
// -------------------------------------------------------------

class Canvas {
  constructor(w, h) { this.w = w; this.h = h; this.d = new Float32Array(w * h * 4); }

  // A layer through a map, sampled bilinearly so turned parts keep soft
  // edges. shade darkens it (the far leg, the far arm).
  draw(layer, m, shade = 1) {
    const inv = invert(m);
    const corners = [[0, 0], [layer.w, 0], [0, layer.h], [layer.w, layer.h]].map((p) => apply(m, p));
    const x0 = Math.max(0, Math.floor(Math.min(...corners.map((p) => p[0]))));
    const x1 = Math.min(this.w - 1, Math.ceil(Math.max(...corners.map((p) => p[0]))));
    const y0 = Math.max(0, Math.floor(Math.min(...corners.map((p) => p[1]))));
    const y1 = Math.min(this.h - 1, Math.ceil(Math.max(...corners.map((p) => p[1]))));
    const L = layer.d, W = layer.w, H = layer.h;
    const px = (x, y, out) => {
      if (x < 0 || y < 0 || x >= W || y >= H) { out[0] = out[1] = out[2] = out[3] = 0; return; }
      const i = (y * W + x) * 4, a = L[i + 3] / 255;
      out[0] = (L[i] / 255) * a; out[1] = (L[i + 1] / 255) * a; out[2] = (L[i + 2] / 255) * a; out[3] = a;
    };
    const p00 = [0, 0, 0, 0], p10 = [0, 0, 0, 0], p01 = [0, 0, 0, 0], p11 = [0, 0, 0, 0];
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const [sx, sy] = apply(inv, [x + 0.5, y + 0.5]);
        const fx = sx - 0.5, fy = sy - 0.5;
        const ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
        px(ix, iy, p00); px(ix + 1, iy, p10); px(ix, iy + 1, p01); px(ix + 1, iy + 1, p11);
        const w00 = (1 - tx) * (1 - ty), w10 = tx * (1 - ty), w01 = (1 - tx) * ty, w11 = tx * ty;
        const sa = p00[3] * w00 + p10[3] * w10 + p01[3] * w01 + p11[3] * w11;
        if (sa <= 0.002) continue;
        const o = (y * this.w + x) * 4, keep = 1 - sa;
        for (let c = 0; c < 3; c++) {
          const s = (p00[c] * w00 + p10[c] * w10 + p01[c] * w01 + p11[c] * w11) * shade;
          this.d[o + c] = s + this.d[o + c] * keep;
        }
        this.d[o + 3] = sa + this.d[o + 3] * keep;
      }
    }
  }

  // A shape given as inside(x, y), filled with an even 4 by 4 sampling
  // per pixel, so a drawn flash has the same soft edge as the art.
  fill(inside, rgb, alpha, box) {
    const [bx0, by0, bx1, by1] = box.map(Math.round);
    for (let y = Math.max(0, by0); y <= Math.min(this.h - 1, by1); y++) {
      for (let x = Math.max(0, bx0); x <= Math.min(this.w - 1, bx1); x++) {
        let n = 0;
        for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) {
          if (inside(x + (sx + 0.5) / 4, y + (sy + 0.5) / 4)) n++;
        }
        if (!n) continue;
        const a = (alpha * n) / 16, o = (y * this.w + x) * 4, keep = 1 - a;
        for (let c = 0; c < 3; c++) this.d[o + c] = (rgb[c] / 255) * a + this.d[o + c] * keep;
        this.d[o + 3] = a + this.d[o + 3] * keep;
      }
    }
  }

  // Straight-alpha bytes of the window (x0, y0, w, h).
  crop(x0, y0, w, h) {
    const out = new Uint8Array(w * h * 4);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const sx = x + x0, sy = y + y0;
        if (sx < 0 || sy < 0 || sx >= this.w || sy >= this.h) continue;
        const i = (sy * this.w + sx) * 4, a = this.d[i + 3], o = (y * w + x) * 4;
        if (a <= 0.002) continue;
        for (let c = 0; c < 3; c++) out[o + c] = Math.max(0, Math.min(255, Math.round((this.d[i + c] / a) * 255)));
        out[o + 3] = Math.min(255, Math.round(a * 255));
      }
    }
    return out;
  }
}

function sheet(frames, fw, fh, columns) {
  const rows = Math.ceil(frames.length / columns);
  const W = fw * columns, H = fh * rows;
  const out = new Uint8Array(W * H * 4);
  frames.forEach((f, n) => {
    const cx = (n % columns) * fw, cy = Math.floor(n / columns) * fh;
    for (let y = 0; y < fh; y++) out.set(f.subarray(y * fw * 4, (y + 1) * fw * 4), ((cy + y) * W + cx) * 4);
  });
  return { W, H, out };
}


module.exports = {
  blankLayer, dropSpecks, I, rad, compose, move, turn, invert, apply, Canvas, sheet,
};
