// =============================================================
// MACARIO — _dev/tools/animate-still.js
//
// Animates any character from one still (Block 97): an NPC, someone a
// cutscene walks on, or an enemy. The still is cut into its parts and
// the parts are moved, the paper cut-out puppet of lib/puppet.js, so
// every pixel of the character is the artist's own, except where a
// part has moved off something it covered; that is filled from the
// colours around it (fillHoles).
//
// What differs from one picture to the next is where the joints are.
// That lives in a rig, one small file per character in _dev/rigs/,
// which also names the sheets to write and the motion for each. How
// to make one: CLAUDE.md, Animating a character from one still. The
// first rig, _dev/rigs/siga-2.js, is the big siga of Block 96 and is
// the one to copy.
//
// The parts:
//
//   head     above the collar, nodded about the neck.
//   torso    the body from the collar to the waist, and any cloth that
//            hangs over the legs (overLegs: a sash's end, a coat's tail).
//   legs     one leg, split at the knee into a thigh and a shin, each
//            turned about its own joint. The far leg is the same leg
//            drawn again half a step later and darkened, so a far foot
//            that shows in the still is cut away (farFoot).
//   sleeve   optional: the upper arm, turned about the shoulder. What it
//            covered (his side) is filled in, so the arm can leave it.
//   arm      optional: the forearm and hand, turned about the elbow and
//            carried by the sleeve. Without them a character still
//            breathes, nods, sways and walks; only the arms stay put,
//            which suits someone holding something or in long sleeves.
//
// The motions (MOTIONS, below), shared by every rig, broad on purpose
// (the proponent: "simple but verbose") so they read on a phone where a
// character is a hundred pixels tall:
//
//   idle     8 frames, looped: a deep breath, a sway and a nod.
//   walk     8 frames, looped: long strides, the arm swinging against
//            the near leg, the body riding up over the planted foot.
//   attack   8 frames, played once per strike (an enemy's
//            attackAnimation): 0 to 2 he leans back and draws his fist
//            back, which is the red "!" (game.js, ATTACK_TELL_MS); 3 he
//            lunges and throws it from the shoulder, arm straight, with
//            streaks behind the fist; 4 and 5 hold it; 6 and 7 bring him
//            back. Needs the arm.
//   hit      4 frames: the head snaps back, the body tips back, the far
//            foot steps back to catch him, and he comes upright. Frame 1,
//            leaning furthest back, is the knockoutFrame.
//
// A new motion (a wave, a gesture while talking) is added here once and
// is then every rig's to use.
//
// Every sheet a rig writes shares one cell, sized from every frame
// drawn, so nothing is clipped and all of them take one set of numbers;
// the character is one size and stands on one spot whatever he does.
//
// Run:  node _dev/tools/animate-still.js <rig>          e.g. siga-2
//       node _dev/tools/animate-still.js <rig> --debug  the cut parts,
//                                                        apart and tinted,
//                                                        to the temp folder
//
// Writes the rig's sheets beside its still and prints the numbers for
// the content. Then bump ASSET_VERSION in js/game.js and run
// make-asset-manifest.js.
// =============================================================

"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { decodePng, encodePng } = require("./lib/png.js");
const { blankLayer, dropSpecks, compose, move, turn, apply, Canvas, sheet } = require("./lib/puppet.js");

const ROOT = path.join(__dirname, "..", "..");
const FAR_SHADE = 0.6;

function inPolygon(pts, x, y) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function boxOf(pts) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return [Math.floor(Math.min(...xs)), Math.floor(Math.min(...ys)), Math.ceil(Math.max(...xs)), Math.ceil(Math.max(...ys))];
}

function asLayer(img, mirror) {
  const { width: W, height: H, rgba } = img;
  const out = blankLayer(W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      out.d.set(rgba.subarray(i, i + 4), (y * W + (mirror ? W - 1 - x : x)) * 4);
    }
  }
  return out;
}

// Paints over the pixels of a layer that hole() names, keeping their
// alpha, with colour spread in from the pixels around them: each pass
// gives every unfilled hole pixel the average of its filled neighbours,
// so a shirt's colour reaches into the shirt and the trousers' into the
// trousers; then the hole is relaxed (each pixel the mean of its four
// neighbours, many times over) so what was spread in becomes an even
// blend rather than streaks. Soft rather than drawn, which at a hundred
// pixels tall is all it needs to be. source(x, y), if given, says which
// pixels around the hole may lend it their colour.
function fillHoles(layer, hole, source) {
  const { w, h, d } = layer;
  const todo = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (hole(x, y) && d[(y * w + x) * 4 + 3]) todo.push(y * w + x);
    }
  }
  const known = new Uint8Array(w * h);
  for (let p = 0; p < w * h; p++) {
    const x = p % w;
    // Only solid pixels lend colour: the faint edge of a drawing keeps
    // whatever colour the export left under alpha 0, pure yellow among it.
    known[p] = d[p * 4 + 3] > 200 && (!source || source(x, (p - x) / w)) ? 1 : 0;
  }
  todo.forEach((p) => { known[p] = 0; });
  let left = todo;
  while (left.length) {
    const next = [], done = [];
    for (const p of left) {
      const x = p % w, y = (p - x) / w;
      let r = 0, g = 0, b = 0, n = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
        const q = (y + dy) * w + x + dx;
        if (x + dx < 0 || x + dx >= w || y + dy < 0 || y + dy >= h || !known[q]) continue;
        r += d[q * 4]; g += d[q * 4 + 1]; b += d[q * 4 + 2]; n++;
      }
      if (n) done.push([p, r / n, g / n, b / n]);
      else next.push(p);
    }
    if (!done.length) break;
    for (const [p, r, g, b] of done) {
      d[p * 4] = Math.round(r); d[p * 4 + 1] = Math.round(g); d[p * 4 + 2] = Math.round(b);
      known[p] = 1;
    }
    left = next;
  }
  const isHole = new Uint8Array(w * h);
  todo.forEach((p) => { isHole[p] = 1; });
  for (let pass = 0; pass < 200; pass++) {
    for (const p of todo) {
      for (let c = 0; c < 3; c++) {
        let sum = 0, n = 0;
        for (const q of [p - 1, p + 1, p - w, p + w]) {
          if (q < 0 || q >= w * h || !(known[q] || isHole[q])) continue;
          sum += d[q * 4 + c]; n++;
        }
        if (n) d[p * 4 + c] = Math.round(sum / n);
      }
    }
  }
}

function splitStill(still, rig) {
  const { w: W, h: H, d } = still;
  const at = (x, y) => (y * W + x) * 4;
  const { cuts, outlines } = rig;
  const overLegs = outlines.overLegs ? (x, y) => inPolygon(outlines.overLegs, x, y) : () => false;

  // The arm: everything inside its traced outline.
  const arm = blankLayer(W, H), body = blankLayer(W, H);
  const armMask = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = at(x, y);
      if (!d[i + 3]) continue;
      const onArm = Boolean(outlines.arm) && inPolygon(outlines.arm, x, y);
      if (onArm) armMask[y * W + x] = 1;
      (onArm ? arm : body).d.set(d.subarray(i, i + 4), i);
    }
  }
  if (outlines.arm) {
    dropSpecks(arm, 40);
    // Under the arm, spread in. Cloth that hangs over the legs is filled
    // from that cloth alone, so it reads as cloth rather than a smudge of
    // it and the trousers; the rest, from whatever is around it.
    body.d.forEach((_, i) => { if (i % 4 === 3 && armMask[i >> 2]) body.d[i] = d[i]; });
    if (outlines.overLegs) {
      fillHoles(body, (x, y) => armMask[y * W + x] && overLegs(x, y), overLegs);
    }
    fillHoles(body, (x, y) => armMask[y * W + x] && !overLegs(x, y));
    dropSpecks(body, 40);
  }

  const sleeve = blankLayer(W, H);
  if (outlines.sleeve) {
    const [bx0, by0, bx1, by1] = boxOf(outlines.sleeve);
    for (let y = by0; y <= by1; y++) {
      for (let x = bx0; x <= bx1; x++) {
        const i = at(x, y);
        if (body.d[i + 3] && inPolygon(outlines.sleeve, x, y)) sleeve.d.set(body.d.subarray(i, i + 4), i);
      }
    }
    // His side, behind the sleeve, from the colour the rig says his side
    // is (sideColour), so a sash or his neck beside it cannot band it.
    const side = rig.sideColour;
    fillHoles(body, (x, y) => inPolygon(outlines.sleeve, x, y), side && ((x, y) => {
      const i = at(x, y);
      return side(body.d[i], body.d[i + 1], body.d[i + 2]);
    }));
  }

  const head = blankLayer(W, H), torso = blankLayer(W, H), legs = blankLayer(W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = at(x, y);
      if (!body.d[i + 3]) continue;
      const p = body.d.subarray(i, i + 4);
      if (y < cuts.headBottom) head.d.set(p, i);
      if (y >= cuts.torsoTop && (y < cuts.torsoBottom || overLegs(x, y))) torso.d.set(p, i);
      if (y >= cuts.legTop) legs.d.set(p, i);
    }
  }
  // The legs under the hanging cloth, which stays on the body.
  if (outlines.overLegs) fillHoles(legs, (x, y) => y >= cuts.torsoBottom && overLegs(x, y));

  const farFoot = outlines.farFoot || (() => false);
  const thigh = blankLayer(W, H), shin = blankLayer(W, H);
  for (let y = cuts.legTop; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = at(x, y);
      if (!legs.d[i + 3]) continue;
      const p = legs.d.subarray(i, i + 4);
      if (y < cuts.thighBottom) thigh.d.set(p, i);
      if (y >= cuts.shinTop && !farFoot(x, y)) shin.d.set(p, i);
    }
  }
  dropSpecks(shin, 40);
  return { arm, sleeve, head, torso, thigh, shin, hasArm: Boolean(outlines.arm), hasSleeve: Boolean(outlines.sleeve) };
}

// -------------------------------------------------------------
// One pose, drawn. Every frame of every motion is one of these:
//
//   lean    degrees about the hip; positive tips him forward
//   head    degrees about the neck, on top of the lean; positive nods
//   breathe the chest's rise, as a stretch of the torso upward
//   shoulder  degrees about the shoulder; positive swings the arm
//           back, negative forward (-85 is straight out in front)
//   arm     degrees about the elbow, on top of that; positive bends
//           the fist back, negative forward
//   near, far   each leg's { thigh, knee } in degrees: thigh positive
//           swings it forward, knee positive bends it
//   push    how far he has moved forward (negative, back), in pixels
//           of a character 540 tall; scaled to the rig's own height
//   streaks the punch's motion lines behind the fist, 0 to 1
//
// The lower of the two feet is put on the ground, so a stride lowers
// him and a straight leg lifts him, by itself.
// -------------------------------------------------------------

function drawPose(parts, rig, pose, W, H) {
  const { joints, cuts } = rig;
  const scale = rig.scale;
  // Distances in the motions are written for a still 540 tall (the
  // first rig's); a taller or shorter still moves as far for its size.
  const unit = (rig.ground + 1 - rig.top) / 540;
  const legMaps = (leg) => {
    const thigh = turn(joints.hip[0], joints.hip[1], -leg.thigh);
    return { thigh, shin: compose(thigh, turn(joints.knee[0], joints.knee[1], leg.knee)) };
  };
  const lowestSole = (maps) => {
    let y = -Infinity;
    for (let x = rig.soles[0]; x <= rig.soles[1]; x += 2) y = Math.max(y, apply(maps.shin, [x, rig.ground - 1])[1]);
    return y;
  };

  const p = Object.assign({ lean: 0, head: 0, breathe: 0, shoulder: 0, arm: 0, push: 0,
    near: { thigh: 0, knee: 0 }, far: { thigh: 0, knee: 0 } }, pose);
  const near = legMaps(p.near), far = legMaps(p.far);
  const drop = rig.ground - Math.max(lowestSole(near), lowestSole(far));
  const S = { a: scale, b: 0, c: 0, d: scale, e: 0, f: 0 };
  const ride = compose(S, move(p.push * unit, drop));
  // The breath stretches the torso up from the waist, and carries the
  // head and the elbow up with it.
  const k = 1 + p.breathe;
  const stretch = { a: 1, b: 0, c: 0, d: k, e: 0, f: cuts.torsoBottom * (1 - k) };
  const body = compose(ride, compose(turn(joints.hip[0], joints.hip[1], p.lean), stretch));
  const head = compose(body, turn(joints.neck[0], joints.neck[1], p.head));

  const cv = new Canvas(W, H);
  cv.draw(parts.shin, compose(ride, far.shin), FAR_SHADE);
  cv.draw(parts.thigh, compose(ride, far.thigh), FAR_SHADE);
  cv.draw(parts.shin, compose(ride, near.shin));
  cv.draw(parts.thigh, compose(ride, near.thigh));
  cv.draw(parts.head, head);
  cv.draw(parts.torso, body);
  const sleeve = parts.hasSleeve ? compose(body, turn(joints.shoulder[0], joints.shoulder[1], p.shoulder)) : body;
  if (parts.hasArm) {
    const arm = compose(sleeve, turn(joints.elbow[0], joints.elbow[1], p.arm));
    if (p.streaks) drawStreaks(cv, apply(arm, joints.fist), p.streaks, scale * unit);
    cv.draw(parts.arm, arm);
  }
  if (parts.hasSleeve) cv.draw(parts.sleeve, sleeve);
  return cv;
}

// Three pale streaks trailing the fist, above and below the arm, the
// comic-strip sign of speed. Offsets for a still 540 tall.
function drawStreaks(cv, [fx, fy], strength, k) {
  const lines = [[-24, 56], [22, 48], [36, 30]];
  lines.forEach(([dy, len]) => {
    const y = fy + dy * k, x1 = fx - 4 * k, x0 = x1 - len * k * strength;
    cv.fill((x, yy) => x > x0 && x < x1 && Math.abs(yy - y) < 1.6 + 1.2 * (x - x0) / (x1 - x0),
      [255, 250, 232], 0.85, [x0 - 2, y - 4, x1 + 2, y + 4]);
  });
}

// -------------------------------------------------------------
// The motions, as poses. Every rig picks from these.
// -------------------------------------------------------------

const wave = (t, phase = 0) => Math.sin(2 * Math.PI * (t + phase));

const SWING = 24, KNEE_BEND = 46;
function stride(phase) {
  const p = 2 * Math.PI * phase;
  // The knee folds while the leg swings forward and is nearly straight
  // while it carries him, as the bantay's does.
  return { thigh: SWING * Math.sin(p), knee: 4 + KNEE_BEND * Math.pow(Math.max(0, Math.cos(p)), 1.6) };
}

const LUNGE = { near: { thigh: 26, knee: 22 }, far: { thigh: -24, knee: 4 } };

const MOTIONS = {
  idle: {
    fps: 6, loop: true,
    poses: Array.from({ length: 8 }, (_, i) => {
      const t = i / 8;
      return {
        breathe: 0.05 * (1 + wave(t)) / 2,
        lean: 2.5 * wave(t, 0.5),
        head: 7 * wave(t, 0.15),
        shoulder: 5 * wave(t, 0.3),
        arm: 8 * wave(t, 0.3),
      };
    }),
  },
  walk: {
    fps: 12, loop: true,
    poses: Array.from({ length: 8 }, (_, i) => {
      const t = i / 8;
      const near = stride(t), far = stride(t + 0.5);
      return {
        near, far,
        lean: 3,
        head: 3 * wave(t * 2, 0.25),
        // Against the near leg: forward while it swings back.
        shoulder: 0.8 * near.thigh,
        arm: 0.5 * near.thigh,
      };
    }),
  },
  attack: {
    fps: 10, needsArm: true,
    poses: [
      { lean: -5, head: -2, shoulder: 14, arm: 18, push: -3 },
      { lean: -9, head: -4, shoulder: 28, arm: 32, push: -6, near: { thigh: 6, knee: 10 } },
      { lean: -11, head: -5, shoulder: 34, arm: 40, push: -8, near: { thigh: 8, knee: 14 } },
      { lean: 13, head: 4, shoulder: -84, arm: -6, push: 26, ...LUNGE, streaks: 1 },
      { lean: 14, head: 4, shoulder: -86, arm: -6, push: 28, ...LUNGE, streaks: 0.45 },
      { lean: 13, head: 3, shoulder: -84, arm: -4, push: 28, ...LUNGE },
      { lean: 6, head: 1, shoulder: -40, arm: -18, push: 14, near: { thigh: 12, knee: 10 }, far: { thigh: -10, knee: 4 } },
      { lean: 2, head: 0, shoulder: -8, arm: -4, push: 4 },
    ],
  },
  hit: {
    fps: 12, knockoutFrame: 1,
    poses: [
      { lean: -10, head: -9, shoulder: -16, arm: -14, push: -7, far: { thigh: -12, knee: 2 }, near: { thigh: 5, knee: 3 } },
      { lean: -17, head: -13, shoulder: -26, arm: -22, push: -12, far: { thigh: -18, knee: 2 }, near: { thigh: 7, knee: 4 } },
      { lean: -8, head: -5, shoulder: -12, arm: -10, push: -6, far: { thigh: -10, knee: 2 }, near: { thigh: 4, knee: 3 } },
      { lean: -2, head: -1, shoulder: -3, arm: -2, push: -1, far: { thigh: -3, knee: 2 }, near: { thigh: 1, knee: 2 } },
    ],
  },
};

// -------------------------------------------------------------

function debugParts(parts, W, H) {
  const tints = { thigh: [1, 0.6, 0.6], shin: [0.6, 0.6, 1], head: [0.6, 1, 0.6], torso: [1, 1, 1], arm: [1, 1, 0.4], sleeve: [0.7, 0.9, 1] };
  const cv = new Canvas(W, H);
  for (const name of ["shin", "thigh", "torso", "head", "arm", "sleeve"]) {
    const L = parts[name], t = tints[name];
    const tinted = blankLayer(L.w, L.h);
    for (let i = 0; i < L.d.length; i += 4) {
      tinted.d[i] = L.d[i] * t[0]; tinted.d[i + 1] = L.d[i + 1] * t[1];
      tinted.d[i + 2] = L.d[i + 2] * t[2]; tinted.d[i + 3] = L.d[i + 3];
    }
    // Each part apart from the next, so a seam or a hole shows.
    const dx = { shin: 160, thigh: 80, torso: 0, head: -80, arm: 240, sleeve: 320 }[name];
    cv.draw(tinted, move(dx, 0));
  }
  return cv;
}

function main() {
  const args = process.argv.slice(2);
  const name = args.find((a) => !a.startsWith("--"));
  if (!name) {
    const rigs = fs.readdirSync(path.join(ROOT, "_dev", "rigs")).map((f) => f.replace(/\.js$/, ""));
    console.log("usage: node _dev/tools/animate-still.js <rig> [--debug]\nrigs: " + rigs.join(", "));
    process.exit(1);
  }
  const rig = require(path.join(ROOT, "_dev", "rigs", name + ".js"));
  const stillPath = path.resolve(ROOT, rig.still);
  const still = asLayer(decodePng(stillPath), rig.mirror);
  const parts = splitStill(still, rig);
  const W = Math.ceil(still.w * rig.scale), H = Math.ceil(still.h * rig.scale);

  if (args.includes("--debug")) {
    const out = path.join(os.tmpdir(), name + "-parts.png");
    const cv = debugParts(parts, still.w, still.h);
    fs.writeFileSync(out, encodePng(still.w, still.h, cv.crop(0, 0, still.w, still.h)));
    console.log("wrote " + out);
    return;
  }

  rig.sheets.forEach((s) => {
    if (!MOTIONS[s.motion]) throw new Error("no motion " + s.motion + "; there are " + Object.keys(MOTIONS).join(", "));
    if (MOTIONS[s.motion].needsArm && !parts.hasArm) throw new Error(s.motion + " needs the rig's arm outline");
  });

  // One cell for every sheet: every frame of every sheet drawn, and the
  // cell the box around all of them, a few pixels spare, so a fist drawn
  // back or thrown out is never cut off.
  const drawn = rig.sheets.map((s) => MOTIONS[s.motion].poses.map((pose) => drawPose(parts, rig, pose, W, H)));
  let x0 = W, x1 = 0, y0 = H;
  drawn.flat().forEach((cv) => {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (cv.d[(y * W + x) * 4 + 3] < 0.02) continue;
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y);
      }
    }
  });
  const CELL = { x: x0 - 3, y: Math.max(0, y0 - 3), w: x1 - x0 + 7 };
  CELL.h = H - CELL.y;
  const dir = path.dirname(stillPath);
  rig.sheets.forEach((s, n) => {
    const frames = drawn[n].map((cv) => cv.crop(CELL.x, CELL.y, CELL.w, CELL.h));
    const out = sheet(frames, CELL.w, CELL.h, 4);
    fs.writeFileSync(path.join(dir, s.file), encodePng(out.W, out.H, out.out));
  });

  // The numbers: his height in the still, standing, whatever a frame
  // does, so he is one size; and headroom for the breath and the lean
  // that lift his hair above that. One set for every sheet.
  const top = Math.round(rig.top * rig.scale) - CELL.y;
  console.log("every sheet: columns: 4, contentTop: " + top +
    ", contentHeight: " + Math.round((rig.ground + 1 - rig.top) * rig.scale) +
    ", footX: " + Math.round(rig.footX * rig.scale - CELL.x) + ", headroom: " + top);
  rig.sheets.forEach((s) => {
    const m = MOTIONS[s.motion];
    console.log("  " + path.posix.join(path.dirname(rig.still).replace(/\\/g, "/"), s.file) + "  " + s.motion +
      ": frames: " + m.poses.length + ", fps: " + m.fps +
      (m.knockoutFrame != null ? ", knockoutFrame: " + m.knockoutFrame : ""));
  });
}

main();
