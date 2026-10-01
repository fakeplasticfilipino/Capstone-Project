// =============================================================
// MACARIO — _dev/tools/animate-siga.js
//
// Makes the big siga's four sheets out of the one still the proponent
// delivered (assets/sprites/characters/siga-2-still.png: a young man
// side on in a rolled-sleeve camisa, a red sash, brown trousers and
// sandals). The same paper cut-out puppet as animate-bantay.js
// (lib/puppet.js): the still is cut into its parts and the parts are
// moved, so every pixel of him is the artist's own, except where a part
// has moved off something it covered; that is filled from the colours
// around it (fillHoles).
//
// The still faces left and the game's art faces right, so he is
// mirrored first, and every coordinate below is in the mirrored still.
//
// The parts:
//
//   sleeve   the upper arm in its rolled sleeve, turned about the
//            shoulder. The shirt behind it is filled in, so the arm
//            can be thrown forward off his side.
//   arm      the bare forearm and the hand, below the sleeve, turned
//            about the elbow and carried by the sleeve.
//   head     above the collar, nodded about the neck.
//   torso    the shirt, the sleeve, the sash, and the end of the sash
//            hanging over the trousers.
//   legs     the trousers and the near sandal, split at the knee into a
//            thigh and a shin, each turned about its own joint. The far
//            sandal, which peeks out behind, is cut away: the far leg is
//            the same leg drawn again half a step later and darkened,
//            as the bantay's is.
//
// The motion is broad on purpose (the proponent: "simple but verbose"),
// so it reads on a phone where he is a hundred pixels tall:
//
//   siga-2.png         standing, 8 frames: a deep breath that lifts his
//                      chest and shoulders, and a slow cocky nod.
//   siga-2-walk.png    8 frames: a swagger. Long strides, the arm
//                      swinging against the near leg, the body riding
//                      up over the planted foot.
//   siga-2-attack.png  8 frames, played once per strike (content's
//                      attackAnimation): 0 to 2 he leans back and draws
//                      his fist back, which is the red "!" (game.js,
//                      ATTACK_TELL_MS); 3 he lunges and throws it, arm
//                      straight out, with streaks behind the fist; 4
//                      and 5 hold it; 6 and 7 bring him back.
//   siga-2-hit.png     4 frames: his head snaps back, his body tips
//                      back, the far foot steps back to catch him, and
//                      he comes upright. Frame 1, leaning furthest
//                      back, is held as he topples (knockoutFrame).
//
// All four share one cell, so all four share one set of numbers, and he
// is one size and stands on one spot whatever he does. He is drawn at
// three quarters of the still's size (SCALE): about the bantay's 394
// pixels, enough for a phone, and a quarter of the memory.
//
// Run:  node _dev/tools/animate-siga.js
//       node _dev/tools/animate-siga.js --debug   (the cut parts, to the
//                                                  system's temp folder)
//
// Writes the four sheets beside the still and prints the numbers for
// content/act1.js (SIGA) and content/enemies.js (siga2). Bump
// ASSET_VERSION in js/game.js after rerunning it.
// =============================================================

"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { decodePng, encodePng } = require("./lib/png.js");
const { blankLayer, dropSpecks, I, compose, move, turn, apply, Canvas, sheet } = require("./lib/puppet.js");

const ROOT = path.join(__dirname, "..", "..");
const DIR = path.join(ROOT, "assets/sprites/characters");
const SRC = path.join(DIR, "siga-2-still.png");
const OUT = {
  idle: path.join(DIR, "siga-2.png"),
  walk: path.join(DIR, "siga-2-walk.png"),
  attack: path.join(DIR, "siga-2-attack.png"),
  hit: path.join(DIR, "siga-2-hit.png"),
};

// -------------------------------------------------------------
// Where things are in the mirrored still, in its own pixels. Read off
// zoomed crops with a 10px grid, not guessed.
// -------------------------------------------------------------

const TOP = 15;              // the top of his hair
const GROUND = 554;          // his soles
const FOOT_X = 512;          // where he stands: the middle of his ankles
const NECK = [512, 114];     // the head nods about this
const HEAD_BOTTOM = 118;     // the head is cut from above here...
const TORSO_TOP = 110;       // ...and the collar drawn over it from here
const SHOULDER = [486, 142];
const ELBOW = [486, 236];    // under the rolled sleeve's cuff
const FIST = [516, 324];     // the middle of the hand
const HIP = [505, 318];
const KNEE = [505, 410];
const LEG_TOP = 296;         // the legs are cut from here down...
const TORSO_BOTTOM = 306;    // ...and the shirt drawn over them to here
const THIGH_BOTTOM = 418;    // the thigh overlaps the shin at the knee
const SHIN_TOP = 402;

// The upper arm, from the shoulder's seam to the bottom of the cuff.
const SLEEVE = [[460, 150], [466, 136], [478, 129], [494, 128], [506, 136],
  [511, 150], [511, 236], [460, 236]];
// The forearm and hand, from under the cuff down to the fingertips,
// traced along the dark line that edges them.
const ARM = [[467, 231], [503, 231], [510, 257], [517, 274], [529, 295],
  [533, 304], [533, 343], [499, 344], [496, 312], [491, 293], [479, 262], [465, 240]];
// The end of the sash, hanging over the trousers beside the hand.
const SASH_END = [[503, 300], [550, 300], [549, 374], [511, 374], [501, 344]];
// The far sandal: everything of the feet above this line, right of the
// near ankle, is the far foot's toes, strap and ankle.
const FAR_FOOT = (x, y) => y >= 495 && y <= 538 && x >= 504 && y < 525 + (x - 504) * 0.22;

const SCALE = 0.75;

function inPolygon(pts, x, y) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function mirrored(img) {
  const { width: W, height: H, rgba } = img;
  const out = blankLayer(W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      out.d.set(rgba.subarray(i, i + 4), (y * W + W - 1 - x) * 4);
    }
  }
  return out;
}

// Paints over the pixels of a layer that hole() names, keeping their
// alpha, with colour spread in from the pixels around them: each pass
// gives every unfilled hole pixel the average of its filled neighbours,
// so the shirt's beige reaches into the shirt and the trousers' brown
// into the trousers; then the hole is relaxed (each pixel the mean of
// its four neighbours, many times over) so what was spread in becomes
// an even blend rather than streaks. Soft rather than drawn, which at a
// hundred pixels tall is all it needs to be. source(x, y), if given,
// says which pixels around the hole may lend it their colour.
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
    // Only solid pixels lend colour: the faint edge of the drawing keeps
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
      const x = p % w, y = (p - x) / w;
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

function splitStill(still) {
  const { w: W, h: H, d } = still;
  const at = (x, y) => (y * W + x) * 4;

  // The arm: everything inside its traced outline.
  const arm = blankLayer(W, H), body = blankLayer(W, H);
  const armMask = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = at(x, y);
      if (!d[i + 3]) continue;
      const onArm = inPolygon(ARM, x, y);
      if (onArm) armMask[y * W + x] = 1;
      (onArm ? arm : body).d.set(d.subarray(i, i + 4), i);
    }
  }
  dropSpecks(arm, 40);
  // Under the arm: the shirt's hem, the sash and the trousers, spread in.
  body.d.forEach((_, i) => { if (i % 4 === 3 && armMask[i >> 2]) body.d[i] = d[i]; });
  // Behind the hand hangs the end of the sash: that part is filled from
  // the sash alone, so it reads as cloth rather than a smudge of sash
  // and trousers. The rest, from whatever is around it.
  fillHoles(body, (x, y) => armMask[y * W + x] && inPolygon(SASH_END, x, y),
    (x, y) => inPolygon(SASH_END, x, y));
  fillHoles(body, (x, y) => armMask[y * W + x] && !inPolygon(SASH_END, x, y));
  dropSpecks(body, 40);

  const sleeve = blankLayer(W, H);
  for (let y = 120; y < 240; y++) {
    for (let x = 455; x < 515; x++) {
      const i = at(x, y);
      if (body.d[i + 3] && inPolygon(SLEEVE, x, y)) sleeve.d.set(body.d.subarray(i, i + 4), i);
    }
  }
  // His side, behind the sleeve: the shirt's own beige, spread in, and
  // not the sash's red or his neck, which would band it.
  fillHoles(body, (x, y) => inPolygon(SLEEVE, x, y), (x, y) => {
    const i = at(x, y);
    return body.d[i] > 170 && body.d[i + 1] / body.d[i] > 0.78;
  });

  const head = blankLayer(W, H), torso = blankLayer(W, H), legs = blankLayer(W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = at(x, y);
      if (!body.d[i + 3]) continue;
      const p = body.d.subarray(i, i + 4);
      const sash = inPolygon(SASH_END, x, y);
      if (y < HEAD_BOTTOM) head.d.set(p, i);
      if (y >= TORSO_TOP && (y < TORSO_BOTTOM || sash)) torso.d.set(p, i);
      if (y >= LEG_TOP) legs.d.set(p, i);
    }
  }
  // The trousers under the end of the sash, which stays on the body.
  fillHoles(legs, (x, y) => y >= TORSO_BOTTOM && inPolygon(SASH_END, x, y));

  const thigh = blankLayer(W, H), shin = blankLayer(W, H);
  for (let y = LEG_TOP; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = at(x, y);
      if (!legs.d[i + 3]) continue;
      const p = legs.d.subarray(i, i + 4);
      if (y < THIGH_BOTTOM) thigh.d.set(p, i);
      if (y >= SHIN_TOP && !FAR_FOOT(x, y)) shin.d.set(p, i);
    }
  }
  dropSpecks(shin, 40);
  return { arm, sleeve, head, torso, thigh, shin };
}

// -------------------------------------------------------------
// One pose, drawn. Every frame of every sheet is one of these:
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
//   push    how far he has moved forward (negative, back)
//   streaks the punch's motion lines behind the fist, 0 to 1
//
// The lower of the two feet is put on the ground, so a stride lowers
// him and a straight leg lifts him, by itself.
// -------------------------------------------------------------

const FAR_SHADE = 0.6;

function legMaps(leg) {
  const thigh = turn(HIP[0], HIP[1], -leg.thigh);
  return { thigh, shin: compose(thigh, turn(KNEE[0], KNEE[1], leg.knee)) };
}

function lowestSole(maps) {
  let y = -Infinity;
  for (let x = 476; x <= 556; x += 2) y = Math.max(y, apply(maps.shin, [x, GROUND - 1])[1]);
  return y;
}

const S = { a: SCALE, b: 0, c: 0, d: SCALE, e: 0, f: 0 };

function drawPose(parts, pose, W, H) {
  const p = Object.assign({ lean: 0, head: 0, breathe: 0, shoulder: 0, arm: 0, push: 0,
    near: { thigh: 0, knee: 0 }, far: { thigh: 0, knee: 0 } }, pose);
  const near = legMaps(p.near), far = legMaps(p.far);
  const drop = GROUND - Math.max(lowestSole(near), lowestSole(far));
  const ride = compose(S, move(p.push, drop));
  // The breath stretches the torso up from the waist, and carries the
  // head and the elbow up with it.
  const k = 1 + p.breathe;
  const stretch = { a: 1, b: 0, c: 0, d: k, e: 0, f: TORSO_BOTTOM * (1 - k) };
  const body = compose(ride, compose(turn(HIP[0], HIP[1], p.lean), stretch));
  const head = compose(body, turn(NECK[0], NECK[1], p.head));
  const sleeve = compose(body, turn(SHOULDER[0], SHOULDER[1], p.shoulder));
  const arm = compose(sleeve, turn(ELBOW[0], ELBOW[1], p.arm));

  const cv = new Canvas(W, H);
  cv.draw(parts.shin, compose(ride, far.shin), FAR_SHADE);
  cv.draw(parts.thigh, compose(ride, far.thigh), FAR_SHADE);
  cv.draw(parts.shin, compose(ride, near.shin));
  cv.draw(parts.thigh, compose(ride, near.thigh));
  cv.draw(parts.head, head);
  cv.draw(parts.torso, body);
  if (p.streaks) drawStreaks(cv, apply(arm, FIST), p.streaks);
  cv.draw(parts.arm, arm);
  cv.draw(parts.sleeve, sleeve);
  return cv;
}

// Three pale streaks trailing the fist, above and below the arm, the
// comic-strip sign of speed. Offsets in the still's pixels.
function drawStreaks(cv, [fx, fy], strength) {
  const lines = [[-24, 56], [22, 48], [36, 30]];
  lines.forEach(([dy, len]) => {
    const y = fy + dy * SCALE, x1 = fx - 4 * SCALE, x0 = x1 - len * SCALE * strength;
    cv.fill((x, yy) => x > x0 && x < x1 && Math.abs(yy - y) < 1.6 + 1.2 * (x - x0) / (x1 - x0),
      [255, 250, 232], 0.85, [x0 - 2, y - 4, x1 + 2, y + 4]);
  });
}

// -------------------------------------------------------------
// The four sheets, as poses.
// -------------------------------------------------------------

const wave = (t, phase = 0) => Math.sin(2 * Math.PI * (t + phase));

const IDLE = Array.from({ length: 8 }, (_, i) => {
  const t = i / 8;
  return {
    breathe: 0.05 * (1 + wave(t)) / 2,
    lean: 2.5 * wave(t, 0.5),
    head: 7 * wave(t, 0.15),
    shoulder: 5 * wave(t, 0.3),
    arm: 8 * wave(t, 0.3),
  };
});

const SWING = 24, KNEE_BEND = 46;
function stride(phase) {
  const p = 2 * Math.PI * phase;
  // The knee folds while the leg swings forward and is nearly straight
  // while it carries him, as the bantay's does.
  return { thigh: SWING * Math.sin(p), knee: 4 + KNEE_BEND * Math.pow(Math.max(0, Math.cos(p)), 1.6) };
}
const WALK = Array.from({ length: 8 }, (_, i) => {
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
});

const LUNGE = { near: { thigh: 26, knee: 22 }, far: { thigh: -24, knee: 4 } };
const ATTACK = [
  { lean: -5, head: -2, shoulder: 14, arm: 18, push: -3 },
  { lean: -9, head: -4, shoulder: 28, arm: 32, push: -6, near: { thigh: 6, knee: 10 } },
  { lean: -11, head: -5, shoulder: 34, arm: 40, push: -8, near: { thigh: 8, knee: 14 } },
  { lean: 13, head: 4, shoulder: -84, arm: -6, push: 26, ...LUNGE, streaks: 1 },
  { lean: 14, head: 4, shoulder: -86, arm: -6, push: 28, ...LUNGE, streaks: 0.45 },
  { lean: 13, head: 3, shoulder: -84, arm: -4, push: 28, ...LUNGE },
  { lean: 6, head: 1, shoulder: -40, arm: -18, push: 14, near: { thigh: 12, knee: 10 }, far: { thigh: -10, knee: 4 } },
  { lean: 2, head: 0, shoulder: -8, arm: -4, push: 4 },
];

const HIT = [
  { lean: -10, head: -9, shoulder: -16, arm: -14, push: -7, far: { thigh: -12, knee: 2 }, near: { thigh: 5, knee: 3 } },
  { lean: -17, head: -13, shoulder: -26, arm: -22, push: -12, far: { thigh: -18, knee: 2 }, near: { thigh: 7, knee: 4 } },
  { lean: -8, head: -5, shoulder: -12, arm: -10, push: -6, far: { thigh: -10, knee: 2 }, near: { thigh: 4, knee: 3 } },
  { lean: -2, head: -1, shoulder: -3, arm: -2, push: -1, far: { thigh: -3, knee: 2 }, near: { thigh: 1, knee: 2 } },
];

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
  const still = mirrored(decodePng(SRC));
  const parts = splitStill(still);
  const W = Math.ceil(still.w * SCALE), H = Math.ceil(still.h * SCALE);

  if (process.argv.includes("--debug")) {
    const out = path.join(os.tmpdir(), "siga-2-parts.png");
    const cv = debugParts(parts, still.w, still.h);
    fs.writeFileSync(out, encodePng(still.w, still.h, cv.crop(0, 0, still.w, still.h)));
    console.log("wrote " + out);
    return;
  }

  // One cell for all four sheets: every frame of every sheet drawn,
  // and the cell the box around all of them, a few pixels spare, so the
  // fist drawn back and the fist thrown out are never cut off.
  const drawn = [IDLE, WALK, ATTACK, HIT].map((poses) => poses.map((pose) => drawPose(parts, pose, W, H)));
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
  [OUT.idle, OUT.walk, OUT.attack, OUT.hit].forEach((file, n) => {
    const frames = drawn[n].map((cv) => cv.crop(CELL.x, CELL.y, CELL.w, CELL.h));
    const s = sheet(frames, CELL.w, CELL.h, 4);
    fs.writeFileSync(file, encodePng(s.W, s.H, s.out));
  });

  // The numbers: his height in the still, standing, whatever a frame
  // does, so he is one size; and headroom for the breath and the lean
  // that lift his hair above that.
  const top = Math.round(TOP * SCALE) - CELL.y;
  console.log("all four: columns 4, contentTop " + top +
    ", contentHeight " + Math.round((GROUND + 1 - TOP) * SCALE) +
    ", footX " + Math.round(FOOT_X * SCALE - CELL.x) + ", headroom " + top);
  console.log("frames: siga-2 8, -walk 8, -attack 8, -hit 4 (knockoutFrame 1)");
}

main();
