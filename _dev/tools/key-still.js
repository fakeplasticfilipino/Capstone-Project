// =============================================================
// MACARIO — _dev/tools/key-still.js
//
// One still delivered on black with no transparency, made ready for a
// rig (Blocks 129, 133): the background flooded out from the edges
// through the darkest values only (max channel at or below LIMIT, 2 by
// default, so black hair and dark cloth stay), cropped to the figure,
// and shrunk by area averaging to TARGET tall (540; 548 with its margin), since the
// puppet samples bilinearly and would shimmer pixel art shrunk by three.
// An edge pixel is kept or dropped by how much of it the figure covers,
// so the puppet cuts on a clean silhouette.
//
//   node _dev/tools/key-still.js <in.png> <out-still.png> [target] [limit]
//
// e.g. node _dev/tools/key-still.js docs-private/art-delivered/isko.png
//        assets/sprites/characters/isko-still.png
// Keep the original in docs-private/art-delivered/. A sheet (several
// cells) on black is _dev/tools/key-black.py's job instead.
// =============================================================

const path = require("path");
const { decodePng, encodePng } = require(path.join(__dirname, "lib", "png.js"));
const fs = require("fs");
const [src, out, target = 540, limit = 2] = process.argv.slice(2);
if (!src || !out) { console.error("usage: node _dev/tools/key-still.js <in.png> <out.png> [target] [limit]"); process.exit(1); }
const im = decodePng(src);
const { width: w, height: h } = im;
const px = Buffer.from(im.rgba);
const bg = new Uint8Array(w * h);
const dark = (i) => Math.max(px[i * 4], px[i * 4 + 1], px[i * 4 + 2]) <= +limit;
const stack = [];
for (let x = 0; x < w; x++) { stack.push(x, (h - 1) * w + x); }
for (let y = 0; y < h; y++) { stack.push(y * w, y * w + w - 1); }
while (stack.length) {
  const i = stack.pop();
  if (bg[i] || !dark(i)) continue;
  bg[i] = 1;
  const x = i % w, y = (i - x) / w;
  if (x > 0) stack.push(i - 1);
  if (x < w - 1) stack.push(i + 1);
  if (y > 0) stack.push(i - w);
  if (y < h - 1) stack.push(i + w);
}
let x0 = w, y0 = h, x1 = -1, y1 = -1;
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
  if (bg[y * w + x]) { px[(y * w + x) * 4 + 3] = 0; continue; }
  if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
}
const fh = y1 - y0 + 1, fw = x1 - x0 + 1;
const scale = Math.min(1, +target / fh);
const pad = 4;
const ow = Math.ceil(fw * scale) + pad * 2, oh = Math.ceil(fh * scale) + pad * 2;
const o = Buffer.alloc(ow * oh * 4);
// Area average: each output pixel is the alpha-weighted mean of the
// source pixels it covers.
const inv = 1 / scale;
for (let oy = 0; oy < oh - pad * 2; oy++) for (let ox = 0; ox < ow - pad * 2; ox++) {
  const sx0 = x0 + ox * inv, sx1 = sx0 + inv, sy0 = y0 + oy * inv, sy1 = sy0 + inv;
  let r = 0, g = 0, b = 0, a = 0, area = 0;
  for (let sy = Math.floor(sy0); sy < Math.ceil(sy1); sy++) {
    const wy = Math.min(sy + 1, sy1) - Math.max(sy, sy0);
    if (sy < 0 || sy >= h || wy <= 0) continue;
    for (let sx = Math.floor(sx0); sx < Math.ceil(sx1); sx++) {
      const wx = Math.min(sx + 1, sx1) - Math.max(sx, sx0);
      if (sx < 0 || sx >= w || wx <= 0) continue;
      const k = wx * wy, i = (sy * w + sx) * 4, al = px[i + 3] / 255;
      r += px[i] * al * k; g += px[i + 1] * al * k; b += px[i + 2] * al * k; a += al * k; area += k;
    }
  }
  const j = ((oy + pad) * ow + ox + pad) * 4;
  if (a > 0) { o[j] = Math.round(r / a); o[j + 1] = Math.round(g / a); o[j + 2] = Math.round(b / a); }
  // Edges below a third covered are dropped, the rest made solid, so
  // the puppet cuts on a clean silhouette as with the artist's PNGs.
  const cover = area ? a / area : 0;
  o[j + 3] = cover < 0.35 ? 0 : cover > 0.85 ? 255 : Math.round(cover * 255);
}
fs.writeFileSync(out, encodePng(ow, oh, o));
console.log(out, "figure", fw + "x" + fh, "->", ow + "x" + oh, "scale", scale.toFixed(3));
