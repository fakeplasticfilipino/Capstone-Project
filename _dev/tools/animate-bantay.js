// =============================================================
// MACARIO — _dev/tools/animate-bantay.js
//
// Makes the bantay's walk and his shot out of the one still the
// proponent delivered (assets/sprites/enemies/bantay.png, a guardia
// civil side on, facing right, rifle at order arms). Nothing is drawn
// from nothing except the muzzle flash and its smoke: the still is cut
// into its parts and the parts are moved, the way a paper cut-out
// puppet is, so every pixel of the soldier is the artist's own.
//
// The parts, all found in the still by position and colour:
//
//   rifle      the brown stock, the grey barrel and bayonet and their
//              dark outline, inside a band that follows the rifle down
//              the picture (RIFLE_AXIS). The piece of it hidden behind
//              his hand is filled in from the wood just above and below
//              the hand, so the rifle can slide through his grip.
//   hand       the hand that grips it, drawn over the rifle.
//   torso      everything above the coat's hem.
//   legs       everything below it, split at the knee into a thigh and
//              a shin (boot included), each turned about its own joint.
//
// Walk, 8 frames: each leg swings about the hip and bends at the knee
// while it swings forward; the second leg is the same leg, half a cycle
// later and darkened, because a figure seen side on at attention shows
// one leg over the other. Whichever foot is lowest is put on the ground,
// so the body rises over the planted leg and dips between steps by
// itself. The rifle is carried a little off the ground and sways with
// the step.
//
// Shoot, 7 frames: the rifle comes down through his hand to the hip
// (0, 1), aims (2), fires (3, a flash at the muzzle), kicks back and up
// (4, 5) and settles, smoking (6). His other arm, the far one, reaches
// out from behind his coat to hold the barrel from frame 1: a sleeve in
// the coat's own navy, outline and cuff, darkened as the far side, with
// his own hand turned under the barrel. The engine holds frame 2 while
// he aims and plays 3 to 6 once for every shot (game.js,
// guardShootFrame).
//
// Hit, 4 frames (Block 75): the blow rocks him back on his heels. His
// body tips back about the hip, head, arm and rifle with it, the far
// foot steps back to catch him, and he comes upright again over the
// last frames. The engine plays it once while he staggers, and holds
// its second frame, leaning furthest back, as he topples when he goes
// down (game.js, guardHitFrame).
//
// Run:  node _dev/tools/animate-bantay.js
//
// Writes:
//   assets/sprites/enemies/bantay-walk.png   8 frames, 4 by 2
//   assets/sprites/enemies/bantay-shoot.png  7 frames, 4 by 2
//   assets/sprites/enemies/bantay-hit.png    4 frames, 4 by 1
// and prints the numbers for content/enemies.js (bantay). Bump
// ASSET_VERSION in js/game.js after rerunning it.
//
// Depends on nothing outside Node, like draw-siga.js, because the
// proponent's computer has Node and no Python.
// =============================================================

"use strict";

const fs = require("fs");
const path = require("path");
const { decodePng, encodePng } = require("./lib/png.js");
// The cut-out puppet itself, shared with animate-still.js (Blocks 96, 97).
const { blankLayer, dropSpecks, I, compose, move, turn, apply, Canvas, sheet } = require("./lib/puppet.js");

const ROOT = path.join(__dirname, "..", "..");
const SRC = path.join(ROOT, "assets/sprites/enemies/bantay.png");
const OUT_WALK = path.join(ROOT, "assets/sprites/enemies/bantay-walk.png");
const OUT_SHOOT = path.join(ROOT, "assets/sprites/enemies/bantay-shoot.png");
const OUT_HIT = path.join(ROOT, "assets/sprites/enemies/bantay-hit.png");

// -------------------------------------------------------------
// Where things are in the still, in its own pixels. Read off the
// picture with measure-sprite.js and a zoomed crop, not guessed.
// -------------------------------------------------------------

const GROUND = 443;          // his soles
// The rifle's centre line, top to bottom. The bayonet stands straight
// up; the rifle below it leans back toward the butt by his right foot.
const RIFLE_AXIS = [
  [297, 48], [297, 118], [290, 150], [281, 200], [274, 245],
  [269, 300], [262, 350], [256, 400], [254, 418],
];
const RIFLE_BUTT = [254, 416];
const RIFLE_MUZZLE = [297, 119];   // where the barrel ends and the bayonet starts
const HAND_BOX = { x0: 262, x1: 294, y0: 234, y1: 278 };  // his grip
const HIDDEN_BY_HAND = [232, 280]; // rows where the hand covers the rifle
const LEG_TOP = 270;         // the legs are cut from here down...
const TORSO_BOTTOM = 284;    // ...and the coat drawn over them to here
const HIP = [238, 282];
const KNEE = [233, 352];
const THIGH_BOTTOM = 358;    // the thigh overlaps the shin at the knee
const SHIN_TOP = 348;

function axisX(y) {
  if (y <= RIFLE_AXIS[0][1]) return RIFLE_AXIS[0][0];
  for (let i = 1; i < RIFLE_AXIS.length; i++) {
    const [x0, y0] = RIFLE_AXIS[i - 1], [x1, y1] = RIFLE_AXIS[i];
    if (y <= y1) return x0 + ((x1 - x0) * (y - y0)) / (y1 - y0);
  }
  return RIFLE_AXIS[RIFLE_AXIS.length - 1][0];
}

// -------------------------------------------------------------
// Layers: straight-alpha RGBA, the size of the still.
// -------------------------------------------------------------


function splitStill(img) {
  const { width: W, height: H, rgba } = img;
  const at = (x, y) => (y * W + x) * 4;
  const isSkin = (r, g, b) => r > 120 && g > 70 && g / r > 0.56 && g / r < 0.78 && b / r > 0.3 && b / r < 0.6;

  const rifle = blankLayer(W, H), hand = blankLayer(W, H), body = blankLayer(W, H);
  const kind = new Uint8Array(W * H); // 0 body, 1 rifle, 2 hand

  // The hand first: its skin, and the dark outline touching that skin.
  const skin = new Uint8Array(W * H);
  for (let y = HAND_BOX.y0; y <= HAND_BOX.y1; y++) {
    for (let x = HAND_BOX.x0; x <= HAND_BOX.x1; x++) {
      const i = at(x, y);
      if (rgba[i + 3] > 0 && isSkin(rgba[i], rgba[i + 1], rgba[i + 2])) skin[y * W + x] = 1;
    }
  }
  const nearSkin = (x, y) => {
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      if (skin[(y + dy) * W + x + dx]) return true;
    }
    return false;
  };

  // The band the rifle can be in: the bayonet and its ring at the top,
  // a narrow stock down past the hand, and the butt widening at the foot.
  const inBand = (x, y) => {
    if (y < 44 || y > 418) return false;
    const ax = axisX(y);
    const [left, right] = y < 150 ? [12, 7] : y < 350 ? [8, 8] : [14, 11];
    return x >= ax - left && x <= ax + right;
  };
  // Two passes. The rifle's own colours first: wood (warm and not the
  // red of his cuff) and metal (grey). Then its dark outline and soft
  // edge, only where they touch those, so the black of his belt and the
  // outline of his coat beside it stay his.
  const core = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = at(x, y);
      if (!rgba[i + 3] || !inBand(x, y) || skin[y * W + x]) continue;
      const r = rgba[i], g = rgba[i + 1], b = rgba[i + 2];
      const wood = r > b + 15 && r >= 40 && g > r * 0.42;
      const metal = Math.abs(r - g) < 14 && Math.abs(g - b) < 16 && r > 70 && y < 404;
      if (wood || metal) core[y * W + x] = 1;
    }
  }
  const nearCore = (x, y, reach) => {
    for (let dy = -reach; dy <= reach; dy++) for (let dx = -reach; dx <= reach; dx++) {
      if (core[(y + dy) * W + x + dx]) return true;
    }
    return false;
  };

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = at(x, y);
      const a = rgba[i + 3];
      if (!a) continue;
      const r = rgba[i], g = rgba[i + 1], b = rgba[i + 2];
      const inHand = x >= HAND_BOX.x0 && x <= HAND_BOX.x1 && y >= HAND_BOX.y0 && y <= HAND_BOX.y1;
      let k = 0;
      if (inHand && (skin[y * W + x] || (Math.max(r, g, b) < 70 && nearSkin(x, y)))) {
        k = 2;
      } else if (core[y * W + x]) {
        k = 1;
      } else if (inBand(x, y) && nearCore(x, y, 2)) {
        const navy = b > r + 8;
        const red = r > 90 && g < r * 0.45;
        // Below the butt's heel his boot shows through; it is black and grey.
        const boot = y >= 404 && Math.abs(r - b) < 6 && Math.max(r, g, b) < 90;
        if (!navy && !red && !boot) k = 1;
      }
      kind[y * W + x] = k;
      const layer = k === 1 ? rifle : k === 2 ? hand : body;
      layer.d.set(rgba.subarray(i, i + 4), i);
    }
  }
  dropSpecks(body, 40);

  // The rifle behind the hand, filled in along the rifle from the wood
  // on either side of the grip.
  const [ya, yb] = HIDDEN_BY_HAND;
  for (let y = ya + 1; y < yb; y++) {
    const t = (y - ya) / (yb - ya);
    for (let v = -16; v <= 12; v++) {
      const x = Math.round(axisX(y) + v);
      const i = at(x, y);
      if (rifle.d[i + 3] > 200) continue;
      const ia = at(Math.round(axisX(ya) + v), ya), ib = at(Math.round(axisX(yb) + v), yb);
      const aa = rifle.d[ia + 3], ab = rifle.d[ib + 3];
      if (!aa && !ab) continue;
      const alpha = aa * (1 - t) + ab * t;
      if (alpha < 8) continue;
      for (let c = 0; c < 3; c++) {
        const ca = rifle.d[ia + c] * aa, cb = rifle.d[ib + c] * ab;
        rifle.d[i + c] = Math.round((ca * (1 - t) + cb * t) / alpha);
      }
      rifle.d[i + 3] = Math.round(alpha);
    }
  }

  // The body split at the coat's hem.
  const torso = blankLayer(W, H), thigh = blankLayer(W, H), shin = blankLayer(W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = at(x, y);
      if (!body.d[i + 3]) continue;
      const p = body.d.subarray(i, i + 4);
      if (y < TORSO_BOTTOM) torso.d.set(p, i);
      if (y >= LEG_TOP && y < THIGH_BOTTOM) thigh.d.set(p, i);
      if (y >= SHIN_TOP) shin.d.set(p, i);
    }
  }
  return { rifle, hand, torso, thigh, shin };
}

// -------------------------------------------------------------
// The rifle's pose: turned so the line from butt to muzzle points at
// deg (0 is straight ahead, negative is up), held in his hand at the
// point `grip` pixels up from the butt, with that point at `at`.
// -------------------------------------------------------------

const RIFLE_DIR = (() => {
  const dx = RIFLE_MUZZLE[0] - RIFLE_BUTT[0], dy = RIFLE_MUZZLE[1] - RIFLE_BUTT[1];
  const len = Math.hypot(dx, dy);
  return { ux: dx / len, uy: dy / len, deg: (Math.atan2(dy, dx) * 180) / Math.PI };
})();
// Where the hand holds it in the still: the rifle's line at the hand.
const STILL_GRIP = (HAND_BOX.y0 + HAND_BOX.y1) / 2;
const STILL_GRIP_DIST = (RIFLE_BUTT[1] - STILL_GRIP) / -RIFLE_DIR.uy;
const HAND_AT = [RIFLE_BUTT[0] + RIFLE_DIR.ux * STILL_GRIP_DIST, RIFLE_BUTT[1] + RIFLE_DIR.uy * STILL_GRIP_DIST];

function riflePose(deg, grip, at) {
  const g = [RIFLE_BUTT[0] + RIFLE_DIR.ux * grip, RIFLE_BUTT[1] + RIFLE_DIR.uy * grip];
  return compose(move(at[0] - g[0], at[1] - g[1]), turn(g[0], g[1], deg - RIFLE_DIR.deg));
}

// -------------------------------------------------------------
// Walk
// -------------------------------------------------------------

const WALK_FRAMES = 8;
const SWING = 19;        // degrees either side of straight down, at the hip
const KNEE_BEND = 42;    // at the middle of the forward swing
const FAR_SHADE = 0.62;

function legMaps(phase) {
  const p = 2 * Math.PI * phase;
  const forward = SWING * Math.sin(p);
  // The knee folds while the leg swings forward (the sine rising) and is
  // nearly straight while it carries him.
  const swingingForward = Math.max(0, Math.cos(p));
  const knee = 4 + KNEE_BEND * Math.pow(swingingForward, 1.6);
  const thigh = turn(HIP[0], HIP[1], -forward);
  const shin = compose(thigh, turn(KNEE[0], KNEE[1], knee));
  return { thigh, shin };
}

function lowestSole(maps) {
  let y = -Infinity;
  for (let x = 206; x <= 264; x += 2) y = Math.max(y, apply(maps.shin, [x, GROUND - 1])[1]);
  return y;
}

function walkFrame(parts, i, W, H) {
  const t = i / WALK_FRAMES;
  const near = legMaps(t), far = legMaps(t + 0.5);
  // The lower foot stands on the ground; everything rides with it.
  const drop = GROUND - Math.max(lowestSole(near), lowestSole(far));
  const ride = move(0, drop);
  const cv = new Canvas(W, H);
  cv.draw(parts.shin, compose(ride, far.shin), FAR_SHADE);
  cv.draw(parts.thigh, compose(ride, far.thigh), FAR_SHADE);
  cv.draw(parts.shin, compose(ride, near.shin));
  cv.draw(parts.thigh, compose(ride, near.thigh));
  cv.draw(parts.torso, ride);
  // Carried clear of the swinging boots, and swaying with the step.
  const rifle = riflePose(RIFLE_DIR.deg + 2.2 * Math.sin(2 * Math.PI * t), STILL_GRIP_DIST - 26,
    [HAND_AT[0], HAND_AT[1] + drop]);
  cv.draw(parts.rifle, rifle);
  cv.draw(parts.hand, ride);
  return cv;
}

// -------------------------------------------------------------
// Shoot
// -------------------------------------------------------------

const HIP_GRIP = 60; // the hand at the stock's wrist, the butt at his hip
// deg of the rifle, how far up it he holds it, how far the kick moves
// him, and what is drawn at the muzzle.
const SHOT = [
  { deg: -52, grip: 124, kick: [0, 0] },
  { deg: -22, grip: 86, kick: [0, 0], far: 1 },
  { deg: 0, grip: HIP_GRIP, kick: [0, 0], far: 1 },
  { deg: 0, grip: HIP_GRIP, kick: [0, 0], far: 1, flash: 1 },
  { deg: -5, grip: HIP_GRIP, kick: [-9, -2], far: 1, flash: 0.35, smoke: 0 },
  { deg: -2, grip: HIP_GRIP, kick: [-4, -1], far: 1, smoke: 1 },
  { deg: 0, grip: HIP_GRIP, kick: [0, 0], far: 1, smoke: 2 },
];
// Where the far hand grips the barrel, measured from the butt, and
// where his far elbow is, behind the front of his coat.
const FAR_GRIP = 150;
const FAR_ELBOW = [258, 212];

function shootFrame(parts, step, W, H) {
  const cv = new Canvas(W, H);
  const at = [HAND_AT[0] + step.kick[0], HAND_AT[1] + step.kick[1]];
  const rifle = riflePose(step.deg, step.grip, at);

  // The far arm first, behind everything: a sleeve from his far elbow,
  // hidden behind his coat, out to the barrel, in the coat's own navy,
  // outline and cuff and darkened as the far side, with his hand turned
  // under the barrel. The one part of him that is not in the still.
  if (step.far) {
    const grip = apply(rifle, [RIFLE_BUTT[0] + RIFLE_DIR.ux * FAR_GRIP, RIFLE_BUTT[1] + RIFLE_DIR.uy * FAR_GRIP]);
    const hand = [grip[0] - 2, grip[1] + 7];
    const elbow = [FAR_ELBOW[0] + step.kick[0], FAR_ELBOW[1] + step.kick[1]];
    const shade = (c) => c.map((v) => v * FAR_SHADE);
    const ux = hand[0] - elbow[0], uy = hand[1] - elbow[1], len = Math.hypot(ux, uy);
    // Distance from the elbow along the arm (0 to 1) and across it.
    const onArm = (x, y) => {
      const t = ((x - elbow[0]) * ux + (y - elbow[1]) * uy) / (len * len);
      const across = Math.abs((x - elbow[0]) * uy - (y - elbow[1]) * ux) / len;
      return [t, across];
    };
    const sleeve = (grow) => (x, y) => {
      const [t, across] = onArm(x, y);
      return t > -0.05 && t < 0.93 && across < 12 - 3 * t + grow;
    };
    const box = [Math.min(elbow[0], hand[0]) - 20, Math.min(elbow[1], hand[1]) - 20,
      Math.max(elbow[0], hand[0]) + 20, Math.max(elbow[1], hand[1]) + 20];
    cv.fill(sleeve(1.5), shade([8, 12, 22]), 1, box);
    cv.fill(sleeve(0), shade([33, 40, 68]), 1, box);
    cv.fill((x, y) => { const [t, across] = onArm(x, y); return t > 0.72 && t < 0.93 && across < 10; },
      shade([140, 38, 40]), 1, box);
    const handStill = [HAND_AT[0] + 5, HAND_AT[1] + 4];
    cv.draw(parts.hand, compose(move(hand[0] - handStill[0], hand[1] - handStill[1]),
      turn(handStill[0], handStill[1], -70)), FAR_SHADE);
  }
  const still = move(step.kick[0] * 0.3, 0);
  cv.draw(parts.shin, I);
  cv.draw(parts.thigh, I);
  cv.draw(parts.torso, still);
  cv.draw(parts.rifle, rifle);
  cv.draw(parts.hand, move(at[0] - HAND_AT[0], at[1] - HAND_AT[1]));

  const muzzle = apply(rifle, RIFLE_MUZZLE);
  const dir = (step.deg * Math.PI) / 180;
  if (step.flash) drawFlash(cv, muzzle, dir, step.flash);
  if (typeof step.smoke === "number") drawSmoke(cv, muzzle, step.smoke);
  return { cv, muzzle: apply(riflePose(0, HIP_GRIP, HAND_AT), RIFLE_MUZZLE) };
}

// A burst at the muzzle: a white core, a yellow flame and orange spikes,
// mostly forward.
function drawFlash(cv, [mx, my], dir, strength) {
  const ux = Math.cos(dir), uy = Math.sin(dir);
  const local = (x, y) => [(x - mx) * ux + (y - my) * uy, -(x - mx) * uy + (y - my) * ux];
  const star = (len, side, spread) => (x, y) => {
    const [u, v] = local(x, y);
    if (u < -side) return false;
    const r = Math.hypot(u, v), ang = Math.atan2(v, u);
    const k = Math.max(0, Math.cos(ang * 5)) ** 3;       // five points
    const reach = side + (u > 0 ? len * Math.max(0, Math.cos(ang)) ** spread : 0) + k * side;
    return r < reach;
  };
  const box = [mx - 50, my - 50, mx + 60, my + 50];
  cv.fill(star(40 * strength, 9 * strength, 3), [255, 150, 30], 0.85, box);
  cv.fill(star(26 * strength, 7 * strength, 4), [255, 214, 90], 0.95, box);
  cv.fill((x, y) => { const [u, v] = local(x, y); return (u / (9 * strength)) ** 2 + (v / (6 * strength)) ** 2 < 1; },
    [255, 252, 225], 1, box);
}

// Grey puffs drifting up and forward from the muzzle, thinning out.
function drawSmoke(cv, [mx, my], age) {
  const puffs = [[8, -4, 7], [18, -9, 9], [4, -14, 8], [26, -3, 6]];
  const grow = 1 + age * 0.45, rise = age * 8, alpha = [0.5, 0.38, 0.22][age];
  puffs.forEach(([dx, dy, r]) => {
    const cx = mx + dx + age * 6, cy = my + dy - rise, rr = r * grow;
    cv.fill((x, y) => (x - cx) ** 2 + (y - cy) ** 2 < rr * rr, [206, 204, 198], alpha,
      [cx - rr, cy - rr, cx + rr, cy + rr]);
  });
}

// -------------------------------------------------------------
// Hit
// -------------------------------------------------------------

// How far he tips back (degrees, about the hip), how far his far foot
// has stepped back to catch him and his near one come forward, and how
// far the blow has pushed him, frame by frame: the blow, the furthest
// lean, and two frames coming back.
const HIT = [
  { lean: 11, far: 12, near: -4, push: -5 },
  { lean: 18, far: 18, near: -6, push: -8 },
  { lean: 9, far: 10, near: -3, push: -4 },
  { lean: 3, far: 3, near: -1, push: -1 },
];

function hitFrame(parts, step, W, H) {
  // The legs first: a negative swing is backward (legMaps' forward is
  // the other way round), with the knee nearly straight.
  const leg = (back) => {
    const thigh = turn(HIP[0], HIP[1], back);
    return { thigh, shin: compose(thigh, turn(KNEE[0], KNEE[1], 3)) };
  };
  const near = leg(step.near), far = leg(step.far);
  const drop = GROUND - Math.max(lowestSole(near), lowestSole(far));
  const ride = move(step.push, drop);
  // His body, head, arm and rifle tip back together about the hip.
  const body = compose(ride, turn(HIP[0], HIP[1], -step.lean));
  const cv = new Canvas(W, H);
  cv.draw(parts.shin, compose(ride, far.shin), FAR_SHADE);
  cv.draw(parts.thigh, compose(ride, far.thigh), FAR_SHADE);
  cv.draw(parts.shin, compose(ride, near.shin));
  cv.draw(parts.thigh, compose(ride, near.thigh));
  cv.draw(parts.torso, body);
  cv.draw(parts.rifle, compose(body, riflePose(RIFLE_DIR.deg, STILL_GRIP_DIST - 26, HAND_AT)));
  cv.draw(parts.hand, body);
  return cv;
}

// -------------------------------------------------------------

function main() {
  const img = decodePng(SRC);
  const parts = splitStill(img);
  // The drawing space runs past the still's right edge, for the rifle
  // levelled at the hip.
  const W = 700, H = img.height;

  // Walk cells: 280 by 440, from (110, 10); the raised rifle's bayonet
  // is the tallest thing in them.
  const WALK_CELL = { x: 110, y: 10, w: 280, h: 440 };
  const walk = [];
  for (let i = 0; i < WALK_FRAMES; i++) {
    walk.push(walkFrame(parts, i, W, H).crop(WALK_CELL.x, WALK_CELL.y, WALK_CELL.w, WALK_CELL.h));
  }
  const ws = sheet(walk, WALK_CELL.w, WALK_CELL.h, 4);
  fs.writeFileSync(OUT_WALK, encodePng(ws.W, ws.H, ws.out));

  // Shoot cells: 500 by 420, from (150, 30), wide enough for the rifle
  // and its flash.
  const SHOOT_CELL = { x: 150, y: 30, w: 500, h: 420 };
  const shots = [];
  let muzzle = null;
  for (const step of SHOT) {
    const f = shootFrame(parts, step, W, H);
    muzzle = f.muzzle;
    shots.push(f.cv.crop(SHOOT_CELL.x, SHOOT_CELL.y, SHOOT_CELL.w, SHOOT_CELL.h));
  }
  const ss = sheet(shots, SHOOT_CELL.w, SHOOT_CELL.h, 4);
  fs.writeFileSync(OUT_SHOOT, encodePng(ss.W, ss.H, ss.out));

  // Hit cells: the walk's, so the numbers are the walk's too.
  const hits = HIT.map((step) =>
    hitFrame(parts, step, W, H).crop(WALK_CELL.x, WALK_CELL.y, WALK_CELL.w, WALK_CELL.h));
  const hs = sheet(hits, WALK_CELL.w, WALK_CELL.h, 4);
  fs.writeFileSync(OUT_HIT, encodePng(hs.W, hs.H, hs.out));

  // The numbers for content/enemies.js. The soldier is sized by his own
  // height in the still (contentTop 50, 394 tall), whatever the rifle
  // does, so he is the same size walking, shooting and standing.
  const STILL_TOP = 50, STILL_HEIGHT = GROUND + 1 - 50, FOOT_X = 238;
  console.log("walk:  frames 8, columns 4, contentTop " + (STILL_TOP - WALK_CELL.y) +
    ", contentHeight " + STILL_HEIGHT + ", footX " + (FOOT_X - WALK_CELL.x) +
    ", headroom " + (STILL_TOP - WALK_CELL.y));
  console.log("hit:   frames 4, columns 4, the walk's contentTop, contentHeight, footX and headroom");
  console.log("shoot: frames 7, columns 4, contentTop " + (STILL_TOP - SHOOT_CELL.y) +
    ", contentHeight " + STILL_HEIGHT + ", footX " + (FOOT_X - SHOOT_CELL.x) +
    ", headroom " + (STILL_TOP - SHOOT_CELL.y) +
    ", muzzle { x: " + Math.round(muzzle[0] - SHOOT_CELL.x) + ", y: " + Math.round(muzzle[1] - SHOOT_CELL.y) + " }");
}

main();
