// =============================================================
// MACARIO — _dev/tools/animate-kabayo.js
//
// The Kutsero's horse, from the proponent's one still (Block 100):
// assets/sprites/characters/kabayo-still.png, a saddled bay standing side
// on, facing right. animate-still.js (Block 97) rigs a person, a head,
// a torso, two legs and an arm, and a horse fits none of it, so this is
// its own small tool on the same paper cut-out puppet (lib/puppet.js), as
// the bantay's rifle has animate-bantay.js. He only stands: he is groomed,
// never ridden or led.
//
// Two parts move and the rest is the artist's still, untouched:
//
//   neck   the head and neck, everything ahead of a line from the front
//          of the saddle down to the chest, nodded about the middle of
//          that line. It is cut a few pixels long behind the line, so
//          the overlap covers the seam whichever way it turns.
//   tail   everything behind the rump's outline, swished about its root.
//          Drawn under the body, so it tucks behind the near hind leg.
//
// One sheet, idle, 12 frames at 6 fps, two seconds a loop: the head dips
// and comes back up while the tail swishes against it, small on purpose
// (a horse at rest, not a horse in a fight), every number below read off
// the still on zoomed crops with a 10px grid.
//
// Run:  node _dev/tools/animate-kabayo.js
//
// Writes assets/sprites/characters/kabayo.png and prints its numbers for
// content/act1.js (KABAYO), shrunk as it is written (lib/png.js,
// writeSheet). Then node _dev/tools/prepare.js (Block 106).
// =============================================================

"use strict";

const fs = require("fs");
const path = require("path");
const { decodePng, writeSheet } = require("./lib/png.js");
const { blankLayer, compose, move, turn, Canvas, sheet } = require("./lib/puppet.js");

const ROOT = path.join(__dirname, "..", "..");
const STILL = "assets/sprites/characters/kabayo-still.png";
const OUT = "assets/sprites/characters/kabayo.png";

// Drawn at half size: about 280px tall, still more than the 120 the
// street draws him at on a phone's glass.
const SCALE = 0.5;

const TOP = 32;            // the tips of his ears
const GROUND = 554;        // the bottom of his hooves
const FOOT_X = 452;        // where he stands: measure-sprite.js on the still

// The neck's cut runs from the front of the saddle (NECK_CUT[0]) down to
// the chest above the forelegs (NECK_CUT[1]); below NECK_FLOOR is leg,
// which stays put. NECK_PIVOT is the middle of the cut.
const NECK_CUT = [[585, 145], [665, 335]];
const NECK_FLOOR = 335;
const NECK_PIVOT = [622, 240];
const NECK_OVERLAP = 8;

// The tail: everything left of the rump's outline, from its root at the
// top of the croup down to its tips. The outline is a list of points,
// top to bottom; the tail is what lies left of it.
const TAIL_EDGE = [
  [305, 180], [290, 195], [281, 215], [278, 245], [281, 275],
  [286, 300], [287, 318], [281, 345], [276, 380], [268, 430], [262, 470],
];
const TAIL_ROOT = [296, 190];

// The poses: the nod in degrees (positive dips the head, clockwise about
// the pivot) and the swish (negative tucks the tip in under the body).
const FRAMES = 12;
const FPS = 6;
function pose(i) {
  const t = i / FRAMES;
  return {
    neck: 1.2 * Math.pow(Math.sin(Math.PI * t), 2), // halved in Block 101
    // Only ever in under the body: swung out past where it hangs, the
    // tail's edge leaves a sliver of sky against the rump.
    tail: -1.2 * (1 - Math.cos(2 * Math.PI * t)),
  };
}

// Which side of the neck's cut a point is on: positive ahead of it.
function aheadOfCut(x, y) {
  const [[ax, ay], [bx, by]] = NECK_CUT;
  const len = Math.hypot(bx - ax, by - ay);
  // The cut runs down and forward; its normal toward the head points
  // forward and up.
  return ((x - ax) * (by - ay) - (y - ay) * (bx - ax)) / len;
}

// How far left of the tail's edge a point is, at its height; above the
// root or below the tips nothing is tail.
function tailEdgeAt(y) {
  for (let i = 0; i < TAIL_EDGE.length - 1; i++) {
    const [x0, y0] = TAIL_EDGE[i], [x1, y1] = TAIL_EDGE[i + 1];
    if (y >= y0 && y <= y1) return x0 + ((x1 - x0) * (y - y0)) / (y1 - y0);
  }
  return null;
}

function split(img) {
  const { width: W, height: H, rgba } = img;
  const body = blankLayer(W, H), neck = blankLayer(W, H), tail = blankLayer(W, H);
  for (let y = 0; y < H; y++) {
    const edge = tailEdgeAt(y);
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (!rgba[i + 3]) continue;
      const px = rgba.subarray(i, i + 4);
      const ahead = aheadOfCut(x, y);
      const isTail = edge != null && x < edge && x < 320;
      if (isTail) tail.d.set(px, i);
      else body.d.set(px, i);
      // The neck takes its own pixels and a strip of the body's behind
      // the cut, so a turn never opens a gap at the seam.
      if (y < NECK_FLOOR && ahead > -NECK_OVERLAP) neck.d.set(px, i);
      if (y < NECK_FLOOR && ahead > 0) body.d.fill(0, i, i + 4);
    }
  }
  return { W, H, body, neck, tail };
}

function main() {
  const img = decodePng(path.join(ROOT, STILL));
  const parts = split(img);
  const W = Math.ceil(parts.W * SCALE), H = Math.ceil(parts.H * SCALE);
  const S = { a: SCALE, b: 0, c: 0, d: SCALE, e: 0, f: 0 };

  const drawn = Array.from({ length: FRAMES }, (_, i) => {
    const p = pose(i);
    const cv = new Canvas(W, H);
    cv.draw(parts.tail, compose(S, turn(TAIL_ROOT[0], TAIL_ROOT[1], p.tail)));
    cv.draw(parts.body, S);
    cv.draw(parts.neck, compose(S, turn(NECK_PIVOT[0], NECK_PIVOT[1], p.neck)));
    return cv;
  });

  // One cell for every frame, the box around all of them and a few
  // pixels spare, standing on the ground line.
  let x0 = W, x1 = 0, y0 = H;
  drawn.forEach((cv) => {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (cv.d[(y * W + x) * 4 + 3] < 0.02) continue;
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y);
      }
    }
  });
  const cell = { x: x0 - 3, y: Math.max(0, y0 - 3), w: x1 - x0 + 7 };
  cell.h = Math.ceil((GROUND + 1) * SCALE) + 2 - cell.y;
  const frames = drawn.map((cv) => cv.crop(cell.x, cell.y, cell.w, cell.h));
  const out = sheet(frames, cell.w, cell.h, 4);
  writeSheet(path.join(ROOT, OUT), out.W, out.H, out.out); // shrunk too, Block 106

  const top = Math.round(TOP * SCALE) - cell.y;
  console.log("wrote " + OUT);
  console.log("  frames: " + FRAMES + ", fps: " + FPS + ", columns: 4, contentTop: " + top +
    ", contentHeight: " + Math.round((GROUND + 1 - TOP) * SCALE) +
    ", footX: " + Math.round(FOOT_X * SCALE - cell.x) + ", headroom: " + top);
}

main();
