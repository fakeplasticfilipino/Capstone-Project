// =============================================================
// MACARIO — _dev/tools/preview-sheet.js
//
// Lays a sprite sheet's frames out to be looked at, with the numbers
// the game uses drawn on them, so a sheet can be checked by eye before
// it ships rather than on the phone after (Block 75). A sheet whose
// numbers are wrong looks right in an image viewer and wrong in the
// game; this shows what the game will do with it.
//
// Each frame gets its own cell on a light background, numbered, with:
//
//   red      the ground: contentTop + contentHeight, where spriteFit
//            stands the feet. Every frame's feet should touch it.
//   blue     contentTop, the top of the character as the game sizes him.
//   cyan     contentTop - headroom, the highest line the game draws.
//            Anything above it is cut off in the game.
//   green    footX, where the body stands. A walk's feet should pass
//            either side of it and not drift away from it.
//   orange   muzzle, where a shot leaves (a cross), if the sheet has one.
//
// and one more cell at the end, the onion skin: every frame laid over
// the others, faintly. A foot that should be planted and slides, or a
// head that jumps between frames, shows as a smear.
//
// Run:
//   node _dev/tools/preview-sheet.js <sheet.png> --columns=N --frames=M
//        [--contentTop=T --contentHeight=H --footX=X --headroom=R
//         --muzzle=X,Y] [--scale=S] [--out=file.png]
// or, to use exactly the numbers the content declares for that sheet:
//   node _dev/tools/preview-sheet.js assets/sprites/enemies/bantay-walk.png
//        --from=content/enemies.js
//
// --from loads the content file the way the page does (it only sets
// window.ACT_N) and finds the sheet whose src is the file given.
// Without --out it writes <name>-preview.png to the system's temporary
// folder and prints where, so nothing lands in the repository.
//
// Depends on nothing outside Node (lib/png.js).
// =============================================================

"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const vm = require("vm");
const { decodePng, encodePng } = require("./lib/png.js");

const ROOT = path.join(__dirname, "..", "..");

function parseArgs(argv) {
  const out = { _: [] };
  for (const a of argv) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
    else out._.push(a);
  }
  return out;
}

// The sheet def the content declares for src, found by walking
// everything window.ACT_N holds.
function defFromContent(contentFile, src) {
  const window = {};
  const noop = () => {};
  const context = vm.createContext({
    window, console, Math, Object, Array, JSON, Promise, setTimeout, noop,
  });
  vm.runInContext(fs.readFileSync(contentFile, "utf8"), context, { filename: contentFile });
  const want = src.replace(/\\/g, "/").replace(/^.*?(assets\/)/, "$1");
  const seen = new Set();
  let found = null;
  const walk = (v) => {
    if (found || !v || typeof v !== "object" || seen.has(v)) return;
    seen.add(v);
    if (typeof v.src === "string" && v.src === want && v.frames) { found = v; return; }
    for (const k of Object.keys(v)) walk(v[k]);
  };
  Object.keys(window).forEach((k) => walk(window[k]));
  if (!found) throw new Error("no sheet with src " + want + " in " + contentFile);
  return found;
}

// A 3 by 5 pixel font for the frame numbers, one string per digit.
const DIGITS = [
  "111101101101111", "010110010010111", "111001111100111", "111001111001111",
  "101101111001001", "111100111001111", "111100111101111", "111001001001001",
  "111101111101111", "111101111001111",
];

function main() {
  const args = parseArgs(process.argv.slice(2));
  const file = args._[0];
  if (!file) {
    console.error("usage: node _dev/tools/preview-sheet.js <sheet.png> --columns=N --frames=M [...]");
    process.exit(1);
  }
  const def = args.from ? defFromContent(path.resolve(args.from), path.relative(ROOT, path.resolve(file))) : {};
  const num = (k) => (args[k] !== undefined ? Number(args[k]) : def[k]);
  const frames = num("frames");
  const columns = num("columns") || frames;
  if (!frames) throw new Error("--frames is needed (or --from with a sheet that declares it)");
  const muzzle = args.muzzle ? args.muzzle.split(",").map(Number)
    : def.muzzle ? [def.muzzle.x, def.muzzle.y] : null;

  const img = decodePng(file);
  const rows = Math.ceil(frames / columns);
  const fw = Math.floor(img.width / columns), fh = Math.floor(img.height / rows);
  const top = num("contentTop"), height = num("contentHeight");
  const footX = num("footX"), headroom = num("headroom") || 0;
  const scale = Number(args.scale) || Math.min(1, 300 / fh);

  const pad = 6, label = 14;
  const cw = Math.round(fw * scale), ch = Math.round(fh * scale);
  const cells = frames + 1; // and the onion skin
  const across = Math.min(cells, columns + 1);
  const down = Math.ceil(cells / across);
  const W = across * (cw + pad) + pad, H = down * (ch + label + pad) + pad;
  const out = new Uint8Array(W * H * 4);
  const put = (x, y, rgb, a = 1) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const o = (y * W + x) * 4;
    for (let c = 0; c < 3; c++) out[o + c] = Math.round(rgb[c] * a + out[o + c] * (1 - a));
    out[o + 3] = 255;
  };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) put(x, y, [60, 60, 66]);

  const cellAt = (n) => [pad + (n % across) * (cw + pad), pad + Math.floor(n / across) * (ch + label + pad) + label];
  // One frame's pixel at cell coordinates, sampled nearest.
  const sample = (n, x, y) => {
    const sx = (n % columns) * fw + Math.min(fw - 1, Math.floor(x / scale));
    const sy = Math.floor(n / columns) * fh + Math.min(fh - 1, Math.floor(y / scale));
    const i = (sy * img.width + sx) * 4;
    return [img.rgba[i], img.rgba[i + 1], img.rgba[i + 2], img.rgba[i + 3] / 255];
  };
  const drawNumber = (text, x0, y0) => {
    [...String(text)].forEach((d, k) => {
      const g = DIGITS[d] || DIGITS[0];
      for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) {
        if (g[r * 3 + c] === "1") {
          for (let yy = 0; yy < 2; yy++) for (let xx = 0; xx < 2; xx++) {
            put(x0 + k * 8 + c * 2 + xx, y0 + r * 2 + yy, [235, 235, 235]);
          }
        }
      }
    });
  };
  const guides = (cx, cy) => {
    const hline = (v, rgb) => { if (v == null || isNaN(v)) return;
      const y = cy + Math.round(v * scale); for (let x = 0; x < cw; x++) put(cx + x, y, rgb, 0.85); };
    const vline = (v, rgb) => { if (v == null || isNaN(v)) return;
      const x = cx + Math.round(v * scale); for (let y = 0; y < ch; y++) put(x, cy + y, rgb, 0.7); };
    hline(top != null ? top - headroom : null, [40, 190, 210]);
    hline(top, [50, 90, 230]);
    hline(top != null && height ? top + height : null, [225, 40, 40]);
    vline(footX, [40, 170, 60]);
    if (muzzle) {
      const mx = cx + Math.round(muzzle[0] * scale), my = cy + Math.round(muzzle[1] * scale);
      for (let d = -5; d <= 5; d++) { put(mx + d, my, [255, 140, 0]); put(mx, my + d, [255, 140, 0]); }
    }
  };

  for (let n = 0; n < cells; n++) {
    const [cx, cy] = cellAt(n);
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const light = ((x >> 3) + (y >> 3)) % 2 ? 232 : 222;
        put(cx + x, cy + y, [light, light, light]);
        if (n < frames) {
          const [r, g, b, a] = sample(n, x, y);
          if (a) put(cx + x, cy + y, [r, g, b], a);
        } else {
          for (let f = 0; f < frames; f++) {
            const [r, g, b, a] = sample(f, x, y);
            if (a) put(cx + x, cy + y, [r, g, b], (a * 1.6) / frames);
          }
        }
      }
    }
    guides(cx, cy);
    // The onion skin is the cell without a number.
    if (n < frames) drawNumber(n, cx, cy - label + 2);
  }

  const outFile = args.out || path.join(os.tmpdir(), path.basename(file, ".png") + "-preview.png");
  fs.writeFileSync(outFile, encodePng(W, H, out));
  console.log("wrote " + outFile);
  console.log("frames " + frames + ", columns " + columns + ", cell " + fw + " by " + fh +
    (top != null ? ", contentTop " + top + ", contentHeight " + height : "") +
    (footX != null ? ", footX " + footX : "") + (headroom ? ", headroom " + headroom : "") +
    (muzzle ? ", muzzle " + muzzle.join(",") : ""));
}

main();
