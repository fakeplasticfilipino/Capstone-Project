// =============================================================
// MACARIO — _dev/tools/lib/png.js
//
// Reading and writing PNGs in plain Node (node:zlib and chunk parsing,
// no npm package), for the tools that make or check sprite sheets
// (animate-bantay.js, preview-sheet.js). The proponent's computer has
// Node and no Python, and a tool that needs an install is a tool that
// does not get run.
//
//   decodePng(file)          { width, height, rgba }  straight alpha
//   encodePng(w, h, rgba)    a Buffer holding an RGBA PNG
//
// 8-bit, non-interlaced RGB or RGBA only, which is every sheet in
// assets/; anything else is refused with what to re-export as.
// measure-sprite.js and draw-siga.js keep their own copies, written
// before this file existed, and were left alone.
// =============================================================

"use strict";

const fs = require("fs");
const zlib = require("zlib");

function decodePng(file) {
  const buf = fs.readFileSync(file);
  let off = 8;
  let width = 0, height = 0, colorType = 0;
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
    } else if (type === "IDAT") idat.push(data);
    off += 12 + len;
  }
  const bpp = { 2: 3, 6: 4 }[colorType];
  if (!bpp) throw new Error(file + ": RGB or RGBA PNGs only; re-export it as RGBA");
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const px = Buffer.alloc(stride * height);
  const paeth = (a, b, c) => {
    const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  };
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
    rgba[i * 4] = px[i * bpp];
    rgba[i * 4 + 1] = px[i * bpp + 1];
    rgba[i * 4 + 2] = px[i * bpp + 2];
    rgba[i * 4 + 3] = bpp === 4 ? px[i * bpp + 3] : 255;
  }
  return { width, height, rgba };
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

function encodePng(w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

module.exports = { decodePng, encodePng };
