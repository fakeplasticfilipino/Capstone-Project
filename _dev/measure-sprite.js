// =============================================================
// MACARIO — _dev/measure-sprite.js
//
// Measures where a character actually sits inside its sprite sheet's
// frame cells, from the art itself, so contentTop/contentHeight (see
// CLAUDE.md, Sprite sheets) never has to be eyeballed. A frame is a
// fixed-size cell; real art rarely fills it edge to edge, and how much
// of it gets filled varies sheet to sheet, which is exactly what made
// Macario's idle pose, his walk cycle, and Nanay all render at three
// different heights and float above the ground by three different
// amounts before this was fixed (see TRACKER.md, Blocks done, and
// CLAUDE.md, Decisions on record).
//
// Run:  node _dev/measure-sprite.js <path-to-png> --columns=N --frames=M
//
// Options:
//   --columns=N     required. Frames per row, same meaning as the
//                   columns field on a sprite sheet definition.
//   --frames=M      required. Total frame count, same meaning as the
//                   frames field. Only the first M cells (row-major)
//                   are measured; unused trailing cells (an idle sheet
//                   on a grid taller than it needs, say) are ignored,
//                   matching how the game itself reads the sheet.
//   --threshold=N   optional, default 16. An alpha value at or below
//                   this counts as "not really there" — faint
//                   anti-aliasing dust rather than the character —
//                   same idea as the 16 used when this tool's numbers
//                   were first worked out by hand for Nanay and
//                   Macario. Raise it if a sheet has visible haze
//                   around its edges inflating the measured box.
//
// Prints every frame's own bounding box, so a human can see at a
// glance whether one frame is a wild outlier (a raised arm, a weapon
// held overhead) before trusting the union, then prints the union
// across all frames — the contentTop/contentHeight/footX line to paste
// into the sheet's definition — plus a warning if any single frame's own
// content height strays far from that union, since a single global
// number cannot correct a sheet whose character genuinely changes
// size frame to frame (see the code comment on spriteFit in game.js
// for why: one background-image can only be scaled one way).
//
// Depends on nothing outside Node itself — no npm install, no
// pngjs or any other decoder — because everything this needs (chunk
// parsing, zlib inflate, the PNG filter reconstruction) is either
// built into node:zlib or plain byte arithmetic. Supports 8-bit,
// non-interlaced PNGs of color type 0 (grayscale), 2 (RGB), 4
// (grayscale+alpha) or 6 (RGBA) — every sheet in this project's
// Assets/ is a plain 8-bit RGBA export and falls in the last case.
// Anything else (16-bit, interlaced, or palette/color type 3) is
// refused with a message telling you what to re-export as, rather
// than silently measuring garbage.
// =============================================================

const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

function parseArgs(argv) {
  const out = { _: [] };
  for (const a of argv) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
    else out._.push(a);
  }
  return out;
}

function readChunks(buf) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (!buf.subarray(0, 8).equals(sig)) {
    throw new Error("not a PNG file (bad signature)");
  }
  const chunks = [];
  let off = 8;
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    chunks.push({ type, data });
    off += 8 + len + 4; // length + type + data + crc
  }
  return chunks;
}

// PNG's five per-scanline filters. All arithmetic is mod 256; Node
// Buffers already wrap on overflow for single-byte writes, so plain
// + and & 0xff below is enough — no separate mod step needed.
function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function unfilter(raw, width, height, bpp) {
  const stride = width * bpp;
  const out = Buffer.alloc(stride * height);
  let rawOff = 0;
  for (let y = 0; y < height; y++) {
    const filterType = raw[rawOff];
    rawOff += 1;
    const rowStart = y * stride;
    const priorStart = (y - 1) * stride;
    for (let x = 0; x < stride; x++) {
      const filt = raw[rawOff + x];
      const a = x >= bpp ? out[rowStart + x - bpp] : 0; // left
      const b = y > 0 ? out[priorStart + x] : 0; // up
      const c = y > 0 && x >= bpp ? out[priorStart + x - bpp] : 0; // upper-left
      let recon;
      switch (filterType) {
        case 0: recon = filt; break;
        case 1: recon = filt + a; break;
        case 2: recon = filt + b; break;
        case 3: recon = filt + Math.floor((a + b) / 2); break;
        case 4: recon = filt + paeth(a, b, c); break;
        default:
          throw new Error(`unsupported scanline filter type ${filterType}`);
      }
      out[rowStart + x] = recon & 0xff;
    }
    rawOff += stride;
  }
  return out;
}

// Decodes an 8-bit, non-interlaced PNG into a flat RGBA Uint8Array plus
// its width/height. Throws a clear error for anything this doesn't
// handle rather than silently decoding it wrong.
function decodePng(filePath) {
  const buf = fs.readFileSync(filePath);
  const chunks = readChunks(buf);

  const ihdr = chunks.find((c) => c.type === "IHDR");
  if (!ihdr) throw new Error("no IHDR chunk found");
  const width = ihdr.data.readUInt32BE(0);
  const height = ihdr.data.readUInt32BE(4);
  const bitDepth = ihdr.data.readUInt8(8);
  const colorType = ihdr.data.readUInt8(9);
  const interlace = ihdr.data.readUInt8(12);

  if (bitDepth !== 8) {
    throw new Error(
      `${bitDepth}-bit PNGs are not supported, only 8-bit. Re-export ` +
      `this sheet as 8-bit color.`
    );
  }
  if (interlace !== 0) {
    throw new Error(
      "interlaced PNGs are not supported. Re-export this sheet with " +
      "interlacing turned off (\"none\", not \"Adam7\")."
    );
  }

  const channelsByColorType = { 0: 1, 2: 3, 4: 2, 6: 4 };
  const channels = channelsByColorType[colorType];
  if (!channels) {
    throw new Error(
      `color type ${colorType} is not supported (palette images, ` +
      `type 3, are the usual cause). Re-export this sheet as a plain ` +
      `RGBA (32-bit) PNG.`
    );
  }

  const idat = Buffer.concat(
    chunks.filter((c) => c.type === "IDAT").map((c) => c.data)
  );
  const raw = zlib.inflateSync(idat);
  const pixels = unfilter(raw, width, height, channels);

  // Normalize to RGBA regardless of source color type, so everything
  // downstream only ever deals with one shape of pixel data.
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0, p = 0; i < width * height; i++, p += channels) {
    let r, g, b, a;
    if (channels === 4) {
      r = pixels[p]; g = pixels[p + 1]; b = pixels[p + 2]; a = pixels[p + 3];
    } else if (channels === 3) {
      r = pixels[p]; g = pixels[p + 1]; b = pixels[p + 2]; a = 255;
    } else if (channels === 2) {
      r = g = b = pixels[p]; a = pixels[p + 1];
    } else {
      r = g = b = pixels[p]; a = 255;
    }
    const o = i * 4;
    rgba[o] = r; rgba[o + 1] = g; rgba[o + 2] = b; rgba[o + 3] = a;
  }

  return { width, height, rgba };
}

function measure(filePath, columns, frames, threshold) {
  const { width, height, rgba } = decodePng(filePath);
  const frameWidth = width / columns;
  const rows = Math.ceil(frames / columns);
  const frameHeight = height / rows;

  if (!Number.isInteger(frameWidth) || !Number.isInteger(frameHeight)) {
    console.warn(
      `warning: ${width}x${height} does not divide evenly into ` +
      `${columns} columns x ${rows} rows (frame ${frameWidth}x${frameHeight}). ` +
      `Double check --columns and --frames match how this sheet is declared.`
    );
  }

  const perFrame = [];
  let unionTop = Infinity, unionBottom = -Infinity;
  let unionLeft = Infinity, unionRight = -Infinity;

  for (let f = 0; f < frames; f++) {
    const col = f % columns;
    const row = Math.floor(f / columns);
    const x0 = Math.round(col * frameWidth);
    const y0 = Math.round(row * frameHeight);
    const fw = Math.round(frameWidth);
    const fh = Math.round(frameHeight);

    let top = Infinity, bottom = -Infinity, left = Infinity, right = -Infinity;
    for (let y = 0; y < fh; y++) {
      for (let x = 0; x < fw; x++) {
        const idx = ((y0 + y) * width + (x0 + x)) * 4;
        const alpha = rgba[idx + 3];
        if (alpha > threshold) {
          if (y < top) top = y;
          if (y > bottom) bottom = y;
          if (x < left) left = x;
          if (x > right) right = x;
        }
      }
    }

    if (top === Infinity) {
      perFrame.push(null);
      console.log(`frame ${String(f).padStart(2)}: EMPTY`);
      continue;
    }

    perFrame.push({ top, bottom, left, right });
    unionTop = Math.min(unionTop, top);
    unionBottom = Math.max(unionBottom, bottom);
    unionLeft = Math.min(unionLeft, left);
    unionRight = Math.max(unionRight, right);

    console.log(
      `frame ${String(f).padStart(2)}: contentTop=${String(top).padStart(3)} ` +
      `contentBottom=${String(bottom).padStart(3)} h=${String(bottom - top + 1).padStart(3)}  ` +
      `left=${String(left).padStart(3)} right=${String(right).padStart(3)} w=${String(right - left + 1).padStart(3)}`
    );
  }

  if (unionTop === Infinity) {
    throw new Error("every measured frame was empty — wrong columns/frames, or a blank sheet");
  }

  const contentHeight = unionBottom - unionTop + 1;

  // Flag frames whose OWN content height strays far from the union. A
  // couple of pixels is normal hand-drawn variance (see the real
  // numbers in CLAUDE.md, Decisions on record); a big gap means one
  // frame draws the character at a genuinely different size, which a
  // single scale/offset pair cannot correct — see the comment on
  // spriteFit in game.js for why not.
  const outliers = perFrame
    .map((r, i) => (r ? { i, h: r.bottom - r.top + 1 } : null))
    .filter((r) => r && Math.abs(r.h - contentHeight) > 6);

  // footX: where the character STANDS inside its cell, horizontally —
  // the centre of whatever is opaque in the bottom fifth of the union
  // box (the feet and lower legs), averaged across every frame. This,
  // not the frame's centre and not the union box's centre, is what
  // game.js lines up with a character's logical body (see bodySprite
  // in game.js and Sprite sheets in CLAUDE.md). The union box is a bad
  // anchor for anything with a pose that reaches: a raised or extended
  // arm widens the box on one side only and drags its centre off the
  // body, which is exactly Macario_Shooting.png. Feet do not reach.
  const footBand = Math.max(1, Math.round(contentHeight * 0.2));
  const footCentres = [];
  for (let f = 0; f < frames; f++) {
    if (!perFrame[f]) continue;
    const col = f % columns;
    const row = Math.floor(f / columns);
    const x0 = Math.round(col * frameWidth);
    const y0 = Math.round(row * frameHeight);
    const fw = Math.round(frameWidth);
    let lo = Infinity, hi = -Infinity;
    for (let y = unionBottom - footBand + 1; y <= unionBottom; y++) {
      for (let x = 0; x < fw; x++) {
        if (rgba[((y0 + y) * width + (x0 + x)) * 4 + 3] > threshold) {
          if (x < lo) lo = x;
          if (x > hi) hi = x;
        }
      }
    }
    if (lo !== Infinity) footCentres.push((lo + hi) / 2);
  }
  const footX = footCentres.length
    ? Math.round(footCentres.reduce((a, b) => a + b, 0) / footCentres.length)
    : Math.round((unionLeft + unionRight) / 2);
  const footSpread = footCentres.length
    ? Math.round(Math.max(...footCentres) - Math.min(...footCentres))
    : 0;

  console.log("\n--- union across all frames ---");
  console.log(`contentTop: ${unionTop}, contentHeight: ${contentHeight}`);
  console.log(`footX: ${footX}  (stance centre, from the bottom ${footBand}px of the box; ` +
    `per-frame stance centres span ${footSpread}px)`);
  console.log(`(union box, for reference only: ` +
    `left=${unionLeft} right=${unionRight} width=${unionRight - unionLeft + 1})`);

  if (outliers.length) {
    console.log(
      `\nwarning: ${outliers.length} frame(s) differ from the union content ` +
      `height by more than 6px: ${outliers.map((o) => `#${o.i} (${o.h}px)`).join(", ")}. ` +
      `A single contentTop/contentHeight will not equalize these frames' apparent ` +
      `size — look at them before trusting this number for a sheet with a pose ` +
      `that changes height a lot (a raised weapon, a crouch).`
    );
  } else {
    console.log(
      `\nEvery frame's own content height is within 6px of the union — a single ` +
      `contentTop/contentHeight pair is a safe fit for this sheet.`
    );
  }

  console.log(`\nPaste into the sheet's definition:`);
  console.log(`  contentTop: ${unionTop}, contentHeight: ${contentHeight}, footX: ${footX},`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const file = args._[0];
  if (!file || !args.columns || !args.frames) {
    console.error(
      "usage: node _dev/measure-sprite.js <path-to-png> --columns=N --frames=M [--threshold=16]"
    );
    process.exit(1);
  }
  const columns = parseInt(args.columns, 10);
  const frames = parseInt(args.frames, 10);
  const threshold = args.threshold !== undefined ? parseInt(args.threshold, 10) : 16;

  console.log(`${path.resolve(file)}  (columns=${columns} frames=${frames} threshold=${threshold})\n`);
  try {
    measure(file, columns, frames, threshold);
  } catch (err) {
    console.error(`\nerror: ${err.message}`);
    process.exit(1);
  }
}

main();
