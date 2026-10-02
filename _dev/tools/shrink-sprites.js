// =============================================================
// MACARIO — _dev/tools/shrink-sprites.js (Block 105)
//
// Makes every sprite sheet in assets/ a quarter of its size, so a phone
// on a classroom connection downloads the game in a quarter of the time
// and keeps it in a quarter of the space. Each sheet is rewritten in
// place as a 256-colour palette PNG: the sheets were full 32-bit PNGs
// of 40,000 to 130,000 colours, written unfiltered, 18 MB in all.
//
//   node _dev/tools/shrink-sprites.js            every sheet not yet shrunk
//   node _dev/tools/shrink-sprites.js <png>...   only these
//   node _dev/tools/shrink-sprites.js --check    say what is not shrunk,
//                                                change nothing
//
// Run it after anything writes a sheet: animate-still.js, animate-bantay.js,
// animate-kabayo.js, or a picture from the artist. verify_new_scene.js
// fails while a sheet in assets/ has not been through it, then
// make-asset-manifest.js and an ASSET_VERSION bump as for any picture.
//
// What it promises, and checks on every file before keeping the result:
//
//   It looks the same where it is seen. The colours are chosen for each
//   sheet (median cut, then refined), without dithering, which only
//   added noise and size in the trials. Scored at a third of the
//   sheet's size, about the size the game draws it, the result must
//   be within MIN_PSNR (40 dB) of the original; a sheet that is not is
//   kept as a full-colour PNG instead (still smaller: its rows are
//   filtered now). Every sheet passed at 46 dB or better when this was
//   written; the Sultan and the horse were compared by eye as well.
//
//   It measures the same. A pixel that was fully clear stays clear, one
//   that was seen stays seen, and one at or below measure-sprite.js's
//   threshold (16) stays at or below it, so contentTop, contentHeight,
//   footX and frameBottoms do not move by a pixel. The colours are
//   chosen separately for the faint edge pixels and the solid ones, so
//   no edge pixel can be matched to a solid colour or the other way.
//
// Not touched: <name>-still.png. Those are the artist's originals, the
// pictures the rigs in _dev/rigs/ were traced on, and are never drawn by
// the game (game.js leaves them out of what it keeps on the phone).
// Nothing but node:zlib and lib/png.js, as every tool here.
// =============================================================

"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");
const { decodePng, encodePng, encodePalettePng, SHRUNK_KEYWORD, SHRUNK_VALUE } = require("./lib/png.js");

const ROOT = path.join(__dirname, "..", "..");
const MIN_PSNR = 40;
const EDGE_ALPHA = 16; // measure-sprite.js, --threshold default
const EDGE_COLOURS = 16; // of the 255, for the faint edge pixels
const KMEANS_ROUNDS = 6;
const MARK = { text: { [SHRUNK_KEYWORD]: SHRUNK_VALUE } };

function sheetsUnder(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) out.push(...sheetsUnder(p));
    else if (/\.png$/i.test(name) && !/-still\.png$/i.test(name)) out.push(p);
  }
  return out;
}

// Alpha classes: 0 clear, 1 a faint edge (at or below the threshold),
// 2 seen. A colour is only ever matched within its own class.
const alphaClass = (a) => (a === 0 ? 0 : a <= EDGE_ALPHA ? 1 : 2);

// Distance in premultiplied colour, alpha weighted a little above the
// rest, since an edge that changes its alpha shows more than one that
// changes its hue.
function dist(p, c) {
  return (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2 + 1.5 * (p[3] - c[3]) ** 2;
}

// cols: [r, g, b, a, count] premultiplied. Returns k colours.
function chooseColours(cols, k) {
  if (!cols.length || k <= 0) return [];
  if (cols.length <= k) return cols.map((c) => c.slice(0, 4));
  let boxes = [cols];
  while (boxes.length < k) {
    let pick = -1, pickDim = 0, pickScore = -1;
    boxes.forEach((box, i) => {
      if (box.length < 2) return;
      let count = 0;
      for (const c of box) count += c[4];
      for (let d = 0; d < 4; d++) {
        let lo = Infinity, hi = -Infinity;
        for (const c of box) { if (c[d] < lo) lo = c[d]; if (c[d] > hi) hi = c[d]; }
        const score = (hi - lo) * Math.sqrt(count);
        if (score > pickScore) { pickScore = score; pick = i; pickDim = d; }
      }
    });
    if (pick < 0) break;
    const box = boxes[pick].sort((a, b) => a[pickDim] - b[pickDim]);
    let total = 0;
    for (const c of box) total += c[4];
    let acc = 0, cut = 1;
    for (let i = 0; i < box.length; i++) {
      acc += box[i][4];
      if (acc >= total / 2) { cut = Math.max(1, Math.min(box.length - 1, i)); break; }
    }
    boxes.splice(pick, 1, box.slice(0, cut), box.slice(cut));
  }
  let pal = boxes.map((box) => {
    const s = [0, 0, 0, 0];
    let n = 0;
    for (const c of box) { for (let d = 0; d < 4; d++) s[d] += c[d] * c[4]; n += c[4]; }
    return s.map((v) => v / n);
  });
  for (let round = 0; round < KMEANS_ROUNDS; round++) {
    const sums = pal.map(() => [0, 0, 0, 0, 0]);
    for (const c of cols) {
      let best = 0, bestD = Infinity;
      for (let i = 0; i < pal.length; i++) { const d = dist(pal[i], c); if (d < bestD) { bestD = d; best = i; } }
      const s = sums[best];
      for (let d = 0; d < 4; d++) s[d] += c[d] * c[4];
      s[4] += c[4];
    }
    pal = pal.map((p, i) => (sums[i][4] ? sums[i].slice(0, 4).map((v) => v / sums[i][4]) : p));
  }
  return pal;
}

function quantise(rgba, w, h) {
  const hist = [new Map(), new Map(), new Map()];
  for (let i = 0; i < rgba.length; i += 4) {
    const a = rgba[i + 3];
    const cls = alphaClass(a);
    if (!cls) continue;
    const key = ((rgba[i] << 24) | (rgba[i + 1] << 16) | (rgba[i + 2] << 8) | a) >>> 0;
    hist[cls].set(key, (hist[cls].get(key) || 0) + 1);
  }
  const colsOf = (m) => [...m].map(([key, n]) => {
    const a = key & 255, f = a / 255;
    return [((key >>> 24) & 255) * f, ((key >>> 16) & 255) * f, ((key >>> 8) & 255) * f, a, n];
  });
  const edge = colsOf(hist[1]);
  const solid = colsOf(hist[2]);
  const edgeK = Math.min(EDGE_COLOURS, edge.length);
  const groups = [null, chooseColours(edge, edgeK), chooseColours(solid, 255 - edgeK)];

  // Index 0 is clear; then the edge colours, then the solid ones. Each
  // colour's alpha is rounded, then held inside its class.
  const pal = [[0, 0, 0, 0]];
  const offset = [0, 1, 1 + groups[1].length];
  const pm = [null, [], []];
  for (const cls of [1, 2]) {
    for (const p of groups[cls]) {
      let a = Math.round(p[3]);
      a = cls === 1 ? Math.min(EDGE_ALPHA, Math.max(1, a)) : Math.max(EDGE_ALPHA + 1, a);
      const f = 255 / a;
      pal.push([0, 1, 2].map((d) => Math.min(255, Math.round(p[d] * f))).concat(a));
      pm[cls].push(p);
    }
  }

  const idx = Buffer.alloc(w * h);
  const memo = new Map();
  for (let i = 0; i < w * h; i++) {
    const j = i * 4;
    const a = rgba[j + 3];
    const cls = alphaClass(a);
    if (!cls) continue; // 0, clear
    const key = ((rgba[j] << 24) | (rgba[j + 1] << 16) | (rgba[j + 2] << 8) | a) >>> 0;
    let k = memo.get(key);
    if (k === undefined) {
      const f = a / 255;
      const c = [rgba[j] * f, rgba[j + 1] * f, rgba[j + 2] * f, a];
      let best = 0, bestD = Infinity;
      pm[cls].forEach((p, n) => { const d = dist(p, c); if (d < bestD) { bestD = d; best = n; } });
      k = offset[cls] + best;
      memo.set(key, k);
    }
    idx[i] = k;
  }
  const palBytes = Buffer.alloc(pal.length * 4);
  pal.forEach((p, i) => { for (let d = 0; d < 4; d++) palBytes[i * 4 + d] = p[d]; });
  return { idx, pal: palBytes };
}

// Premultiplied colour averaged over s by s squares: what the sheet looks
// like at about the size the game draws it.
function shrinkView(rgba, w, h, s) {
  const W = Math.floor(w / s), H = Math.floor(h / s);
  const out = new Float64Array(W * H * 4);
  for (let y = 0; y < H * s; y++) {
    for (let x = 0; x < W * s; x++) {
      const j = (y * w + x) * 4, f = rgba[j + 3] / 255;
      const k = (Math.floor(y / s) * W + Math.floor(x / s)) * 4;
      out[k] += rgba[j] * f; out[k + 1] += rgba[j + 1] * f; out[k + 2] += rgba[j + 2] * f; out[k + 3] += rgba[j + 3];
    }
  }
  for (let i = 0; i < out.length; i++) out[i] /= s * s;
  return out;
}

function psnr(a, b) {
  let se = 0;
  for (let i = 0; i < a.length; i++) se += (a[i] - b[i]) ** 2;
  return se === 0 ? Infinity : 10 * Math.log10((255 * 255) / (se / a.length));
}

function sameClasses(a, b) {
  for (let i = 3; i < a.length; i += 4) if (alphaClass(a[i]) !== alphaClass(b[i])) return false;
  return true;
}

function shrink(file) {
  const before = fs.statSync(file).size;
  const { width: w, height: h, rgba } = decodePng(file);
  // Colour under a clear pixel is never seen and only costs bytes.
  const clean = Buffer.from(rgba);
  for (let i = 0; i < clean.length; i += 4) if (clean[i + 3] === 0) clean[i] = clean[i + 1] = clean[i + 2] = 0;

  const q = quantise(clean, w, h);
  let out = encodePalettePng(w, h, q.idx, q.pal, MARK);
  const tmp = path.join(os.tmpdir(), "shrink-" + process.pid + ".png");
  fs.writeFileSync(tmp, out);
  const back = decodePng(tmp).rgba;
  fs.unlinkSync(tmp);
  const score = psnr(shrinkView(clean, w, h, 3), shrinkView(back, w, h, 3));
  let kind = "palette";
  if (!(score >= MIN_PSNR) || !sameClasses(clean, back)) {
    out = encodePng(w, h, clean, MARK);
    kind = "full colour (" + (score >= MIN_PSNR ? "an edge moved" : "too far from the original") + ")";
  }
  fs.writeFileSync(file, out);
  return { before, after: out.length, score, kind };
}

function main() {
  const args = process.argv.slice(2);
  const check = args.includes("--check");
  const named = args.filter((a) => !a.startsWith("--")).map((a) => path.resolve(a));
  const files = named.length ? named : sheetsUnder(path.join(ROOT, "assets"));
  let saved = 0, done = 0, waiting = 0;
  for (const file of files) {
    const rel = path.relative(ROOT, file).split(path.sep).join("/");
    if (/-still\.png$/i.test(file)) { console.log("  left alone (a still):  " + rel); continue; }
    if (decodePng(file).shrunk && !named.length) continue;
    if (check) { console.log("  not shrunk:  " + rel); waiting++; continue; }
    const r = shrink(file);
    saved += r.before - r.after;
    done++;
    console.log(`  ${rel}  ${Math.round(r.before / 1024)}K -> ${Math.round(r.after / 1024)}K  ` +
      `${r.kind}, ${r.score === Infinity ? "exact" : r.score.toFixed(1) + " dB"}`);
  }
  if (check) {
    console.log(waiting ? waiting + " sheet(s) not shrunk: node _dev/tools/shrink-sprites.js" : "every sheet is shrunk");
    process.exit(waiting ? 1 : 0);
  }
  console.log(done ? `${done} sheet(s) shrunk, ${(saved / 1048576).toFixed(1)} MB saved. ` +
    "Now: node _dev/tools/make-asset-manifest.js, and bump ASSET_VERSION in js/game.js."
    : "every sheet is already shrunk");
}

if (require.main === module) main();

module.exports = { shrink, quantise };
