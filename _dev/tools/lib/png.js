// =============================================================
// MACARIO — _dev/tools/lib/png.js
//
// Reading and writing PNGs in plain Node (node:zlib and chunk parsing,
// no npm package), for the tools that make or check sprite sheets
// (animate-bantay.js, preview-sheet.js). The proponent's computer has
// Node and no Python, and a tool that needs an install is a tool that
// does not get run.
//
//   decodePng(file)          { width, height, rgba, paletted, shrunk }
//                            straight alpha; paletted is true for a
//                            palette PNG, shrunk for one written by
//                            shrink-sprites.js (Block 105)
//   encodePng(w, h, rgba, opts)          a Buffer holding an RGBA PNG
//   encodePalettePng(w, h, idx, pal, opts)  one holding a palette PNG:
//                            idx one byte per pixel, pal RGBA per entry
//   writeSheet(file, w, h, rgba)  a sheet for assets/, written and
//                            shrunk (Block 106); every animate tool
//                            writes through it
//
// opts.text: { keyword: value } written as tEXt chunks; shrink-sprites.js
// marks what it wrote with one (SHRUNK_KEYWORD), which verify_new_scene.js
// reads.
//
// 8-bit, non-interlaced only. Since Block 105 every colour type is read
// (grey, grey with alpha, RGB, RGBA and palette), because the sheets in
// assets/ are palette PNGs now (shrink-sprites.js). Writing chooses each
// row's filter by the usual sum-of-differences rule; before Block 105
// every row was written unfiltered, which made sheets a quarter larger
// than they needed to be.
// measure-sprite.js keeps its own copy, written before this file
// existed, and was left alone.
// =============================================================

"use strict";

const fs = require("fs");
const zlib = require("zlib");

const SHRUNK_KEYWORD = "MACARIO";
const SHRUNK_VALUE = "shrink-sprites.js";

function paeth(a, b, c) {
  const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

function decodePng(file) {
  const buf = fs.readFileSync(file);
  let off = 8;
  let width = 0, height = 0, colorType = 0;
  let plte = null, trns = null;
  let shrunk = false;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      if (data[8] !== 8 || data[12] !== 0) {
        throw new Error(file + ": 8-bit, non-interlaced PNGs only; re-export it that way");
      }
      colorType = data[9];
    } else if (type === "PLTE") plte = data;
    else if (type === "tRNS") trns = data;
    else if (type === "tEXt") {
      const nul = data.indexOf(0);
      if (data.toString("latin1", 0, nul) === SHRUNK_KEYWORD &&
          data.toString("latin1", nul + 1) === SHRUNK_VALUE) shrunk = true;
    } else if (type === "IDAT") idat.push(data);
    off += 12 + len;
  }
  const bpp = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  if (!bpp) throw new Error(file + ": colour type " + colorType + " is not a PNG this tool reads");
  if (colorType === 3 && !plte) throw new Error(file + ": a palette PNG with no palette");
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const px = Buffer.alloc(stride * height);
  for (let y = 0, r = 0; y < height; y++) {
    const f = raw[r++];
    for (let x = 0; x < stride; x++, r++) {
      const a = x >= bpp ? px[y * stride + x - bpp] : 0;
      const b = y > 0 ? px[(y - 1) * stride + x] : 0;
      const c = y > 0 && x >= bpp ? px[(y - 1) * stride + x - bpp] : 0;
      const v = raw[r];
      px[y * stride + x] = (f === 0 ? v : f === 1 ? v + a : f === 2 ? v + b
        : f === 3 ? v + ((a + b) >> 1) : v + paeth(a, b, c)) & 255;
    }
  }
  const rgba = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const o = i * 4;
    if (colorType === 3) {
      const k = px[i];
      rgba[o] = plte[k * 3];
      rgba[o + 1] = plte[k * 3 + 1];
      rgba[o + 2] = plte[k * 3 + 2];
      rgba[o + 3] = trns && k < trns.length ? trns[k] : 255;
    } else if (bpp >= 3) {
      rgba[o] = px[i * bpp];
      rgba[o + 1] = px[i * bpp + 1];
      rgba[o + 2] = px[i * bpp + 2];
      rgba[o + 3] = bpp === 4 ? px[i * bpp + 3] : 255;
    } else {
      rgba[o] = rgba[o + 1] = rgba[o + 2] = px[i * bpp];
      rgba[o + 3] = bpp === 2 ? px[i * bpp + 1] : 255;
    }
  }
  return { width, height, rgba, paletted: colorType === 3, shrunk };
}

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

// Each row filtered the way that leaves the smallest sum of differences,
// the rule every PNG encoder uses. adaptive false writes every row
// unfiltered, which suits a palette image better as often as not, so
// encodePalettePng tries both.
function filterRows(px, w, h, bpp, adaptive) {
  const stride = w * bpp;
  const out = Buffer.alloc((stride + 1) * h);
  const line = Buffer.alloc(stride);
  const best = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    let bestScore = Infinity;
    let bestFilter = 0;
    for (const f of adaptive ? [0, 1, 2, 3, 4] : [0]) {
      let score = 0;
      for (let x = 0; x < stride; x++) {
        const v = px[y * stride + x];
        const a = x >= bpp ? px[y * stride + x - bpp] : 0;
        const b = y > 0 ? px[(y - 1) * stride + x] : 0;
        const c = y > 0 && x >= bpp ? px[(y - 1) * stride + x - bpp] : 0;
        const d = (f === 0 ? v : f === 1 ? v - a : f === 2 ? v - b
          : f === 3 ? v - ((a + b) >> 1) : v - paeth(a, b, c)) & 255;
        line[x] = d;
        score += d < 128 ? d : 256 - d;
      }
      if (score < bestScore) {
        bestScore = score;
        bestFilter = f;
        line.copy(best);
      }
    }
    out[y * (stride + 1)] = bestFilter;
    best.copy(out, y * (stride + 1) + 1);
  }
  return out;
}

function deflate(raw) {
  return zlib.deflateSync(raw, { level: 9, memLevel: 9 });
}

function textChunks(text) {
  return Object.entries(text || {}).map(([k, v]) =>
    pngChunk("tEXt", Buffer.concat([Buffer.from(k, "latin1"), Buffer.from([0]), Buffer.from(String(v), "latin1")])));
}

function ihdrChunk(w, h, colorType) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = colorType;
  return pngChunk("IHDR", ihdr);
}

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function encodePng(w, h, rgba, opts) {
  const px = Buffer.from(rgba.buffer, rgba.byteOffset, w * h * 4);
  return Buffer.concat([
    SIGNATURE,
    ihdrChunk(w, h, 6),
    ...textChunks(opts && opts.text),
    pngChunk("IDAT", deflate(filterRows(px, w, h, 4, true))),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function encodePalettePng(w, h, idx, pal, opts) {
  const n = pal.length / 4;
  if (n > 256) throw new Error("a palette PNG holds 256 colours at most");
  const plte = Buffer.alloc(n * 3);
  const trns = Buffer.alloc(n);
  for (let i = 0; i < n; i++) {
    plte[i * 3] = pal[i * 4];
    plte[i * 3 + 1] = pal[i * 4 + 1];
    plte[i * 3 + 2] = pal[i * 4 + 2];
    trns[i] = pal[i * 4 + 3];
  }
  let lastAlpha = n;
  while (lastAlpha > 0 && trns[lastAlpha - 1] === 255) lastAlpha--;
  const px = Buffer.from(idx.buffer, idx.byteOffset, w * h);
  const plain = deflate(filterRows(px, w, h, 1, false));
  const filtered = deflate(filterRows(px, w, h, 1, true));
  return Buffer.concat([
    SIGNATURE,
    ihdrChunk(w, h, 3),
    ...textChunks(opts && opts.text),
    pngChunk("PLTE", plte),
    ...(lastAlpha ? [pngChunk("tRNS", trns.subarray(0, lastAlpha))] : []),
    pngChunk("IDAT", plain.length <= filtered.length ? plain : filtered),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// Block 106. A sheet for the game, written and shrunk in one step
// (shrink-sprites.js: a palette PNG a quarter of the size, looking and
// measuring the same), so a tool that writes into assets/ never leaves a
// full-size sheet for someone to remember. Returns shrink's report.
function writeSheet(file, w, h, rgba) {
  fs.writeFileSync(file, encodePng(w, h, rgba));
  return require("../shrink-sprites.js").shrink(file);
}

module.exports = { decodePng, encodePng, encodePalettePng, writeSheet, SHRUNK_KEYWORD, SHRUNK_VALUE };
