// =============================================================
// MACARIO — _dev/tools/animate-player.js
//
// Animates Macario, the player, from one still. The same paper cut-out
// puppet as animate-still.js (lib/puppet.js), but built for a character
// who is under the camera every second rather than one passing by:
//
//   more parts      the hair that hangs below his head, the shirt's hem,
//                   a foot that stays flat on the ground and lifts at the
//                   heel, and a far arm (the near one drawn again,
//                   darker, behind him), as well as the head, torso,
//                   upper arm, forearm, thigh and shin the NPCs have.
//   joint caps      the forearm, the shin and the thigh carry a disc of
//                   their own colour at the joint, so a bent elbow or
//                   knee never shows a notch.
//   feet that grip  a leg is placed by its ankle (two-bone IK, the knee
//                   forward), not by angles, so a planted foot stays
//                   put on the clip's own ground (the stride, below).
//   follow-through  the hair and the hem are springs driven by how the
//                   body moves, run over three cycles so a loop's last
//                   frame leads into its first without a hitch.
//   eased keys      clips are written as smooth curves (cosines, Hermite
//                   splines), never straight lines between poses.
//
// animate-still.js is left exactly as it was, so no NPC's sheet changes.
// fillHoles, inPolygon and boxOf are copied from it for that reason.
//
// The stride. A clip that moves him says how far its ground goes by a
// frame (step, in still px), and a planted foot moves back by exactly
// that, so his feet never skid against the clip itself. To match the
// game's ground as well, step would be SPEED's 300 world px a second
// over fps; that fits a run but not a walk (see CLIPS.walk), so the
// walk keeps its own pace and the tool prints both speeds.
//
// The clips (CLIPS, below):
//
//   idle   24 frames at 12, looped (2 s): a slow breath, the weight
//          settling, the arms and the hair barely moving.
//   walk   20 frames at 30, looped (0.67 s, two steps): the NPCs' walk
//          (animate-still.js), drawn with more frames.
//
// Run:  node _dev/tools/animate-player.js <rig>            e.g. macario
//       node _dev/tools/animate-player.js <rig> --debug    the cut parts,
//                                                          apart and tinted
//       node _dev/tools/animate-player.js <rig> --frames   every frame as
//                                                          its own PNG too
//
// Writes the rig's sheets beside its still and prints the numbers for
// the content, then node _dev/tools/prepare.js as for any sheet.
// =============================================================

"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { decodePng, encodePng, writeSheet } = require("./lib/png.js");
const { blankLayer, dropSpecks, compose, move, turn, invert, apply, Canvas, sheet } = require("./lib/puppet.js");

const ROOT = path.join(__dirname, "..", "..");
const FAR_SHADE = 0.62;
const DISPLAY_HEIGHT = 134;   // game.js: the character's height in world px
const WORLD_SPEED = 300;      // game.js: SPEED 5 per 60fps frame
const PAD = 160;              // margin round the still, for trailing hair
const SIM_STEPS = 24;         // spring substeps per frame
const COLUMNS = 6;

// -------------------------------------------------------------
// Copied from animate-still.js (see the header).
// -------------------------------------------------------------

function inPolygon(pts, x, y) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

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

// -------------------------------------------------------------
// Cutting the still into parts.
// -------------------------------------------------------------

const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const angleOf = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);
const DEG = 180 / Math.PI;

// The x of the near leg's front edge at y, from the rig's [y, x] list.
function edgeAt(edge, y) {
  if (y <= edge[0][0]) return edge[0][1];
  for (let i = 1; i < edge.length; i++) {
    if (y <= edge[i][0]) {
      const [y0, x0] = edge[i - 1], [y1, x1] = edge[i];
      return x0 + ((x1 - x0) * (y - y0)) / (y1 - y0);
    }
  }
  return edge[edge.length - 1][1];
}

// A disc of a part's own colour at a joint, under what is already there:
// filled from the part's solid pixels, so a bent joint has no notch.
function addCap(layer, [cx, cy], r, keep) {
  const { w, d } = layer;
  const added = [];
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 > r * r || (keep && !keep(x, y))) continue;
      const i = (y * w + x) * 4;
      if (d[i + 3] > 200) continue;
      d[i + 3] = 255;
      added.push(y * w + x);
    }
  }
  const set = new Set(added);
  fillHoles(layer, (x, y) => set.has(y * w + x));
}

// A box blur of a layer's colours, r pixels each way (alpha ignored).
function boxBlur(layer, r) {
  const { w, h, d } = layer, out = new Float32Array(d.length), tmp = new Float32Array(d.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (let c = 0; c < 3; c++) {
        let s = 0, n = 0;
        for (let k = -r; k <= r; k++) { const xx = x + k; if (xx < 0 || xx >= w) continue; s += d[(y * w + xx) * 4 + c]; n++; }
        tmp[(y * w + x) * 4 + c] = s / n;
      }
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (let c = 0; c < 3; c++) {
        let s = 0, n = 0;
        for (let k = -r; k <= r; k++) { const yy = y + k; if (yy < 0 || yy >= h) continue; s += tmp[(yy * w + x) * 4 + c]; n++; }
        out[(y * w + x) * 4 + c] = s / n;
      }
    }
  }
  return out;
}

function splitStill(still, rig) {
  const { w: W, h: H, d } = still;
  const at = (x, y) => (y * W + x) * 4;
  const { cuts, outlines, joints } = rig;
  const inArm = (x, y) => inPolygon(outlines.arm, x, y);
  const inHair = (x, y) => inPolygon(outlines.hair, x, y);
  const inFoot = (x, y) => inPolygon(outlines.foot, x, y);
  const px = (x, y) => d.subarray(at(x, y), at(x, y) + 4);

  // The arm, and the body with the arm's place filled in: his side
  // (cream) above the hem, the trousers below it.
  const arm = blankLayer(W, H), body = blankLayer(W, H);
  const armMask = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!d[at(x, y) + 3]) continue;
      if (inArm(x, y)) { armMask[y * W + x] = 1; arm.d.set(px(x, y), at(x, y)); }
      body.d.set(px(x, y), at(x, y));
    }
  }
  dropSpecks(arm, 40);
  // The hole is the arm's outline and two pixels round it, so the soft
  // edge of the hand left outside the outline goes too.
  const hole = new Uint8Array(W * H);
  for (let y = 2; y < H - 2; y++) {
    for (let x = 2; x < W - 2; x++) {
      let on = 0;
      for (let dy = -2; dy <= 2 && !on; dy++) for (let dx = -2; dx <= 2; dx++) if (armMask[(y + dy) * W + x + dx]) { on = 1; break; }
      hole[y * W + x] = on;
    }
  }
  const side = rig.sideColour, leg = rig.legColour;
  fillHoles(body, (x, y) => hole[y * W + x] && y < cuts.hemBottom,
    (x, y) => { const p = px(x, y); return y < cuts.hemBottom && !hole[y * W + x] && side(p[0], p[1], p[2]); });
  fillHoles(body, (x, y) => hole[y * W + x] && y >= cuts.hemBottom,
    (x, y) => { const p = px(x, y); return y >= cuts.hemBottom && !hole[y * W + x] && leg(p[0], p[1], p[2]); });
  // A fill is smooth, and a smooth patch on a woven shirt shows the
  // moment the arm leaves it. The sleeve that covered it is the same
  // cloth: its fine grain (what differs from a blur of it), softened and
  // with its strong lines (the crease, the cuff) left out, is laid over
  // the fill.
  const blur = boxBlur(still, 6);
  for (let y = 0; y < cuts.hemBottom; y++) {
    for (let x = 0; x < W; x++) {
      const i = at(x, y);
      if (!hole[y * W + x] || !armMask[y * W + x] || !body.d[i + 3]) continue;
      const p = px(x, y);
      if (!side(p[0], p[1], p[2])) continue;
      for (let c = 0; c < 3; c++) {
        const grain = Math.max(-14, Math.min(14, d[i + c] - blur[i + c]));
        body.d[i + c] = Math.max(0, Math.min(255, Math.round(body.d[i + c] + 0.7 * grain)));
      }
    }
  }

  // The hair below the head, apart; nothing is behind it.
  const hair = blankLayer(W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = at(x, y);
      if (!body.d[i + 3] || !inHair(x, y)) continue;
      hair.d.set(body.d.subarray(i, i + 4), i);
      body.d.fill(0, i, i + 4);
    }
  }
  dropSpecks(hair, 40);

  // Head, and the torso with its hem; the slit cut out where the
  // trousers show through it.
  const head = blankLayer(W, H), torso = blankLayer(W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = at(x, y);
      if (!body.d[i + 3]) continue;
      const p = body.d.subarray(i, i + 4);
      if (y < cuts.headBottom) head.d.set(p, i);
      if (y >= cuts.torsoTop && y < cuts.hemBottom) {
        // The trousers, where they show in the slit or under the hem's
        // edge, are the legs', not the shirt's.
        if (p[0] < 70 && (y >= cuts.legTop || inPolygon(outlines.slit, x, y))) continue;
        if (leg(p[0], p[1], p[2]) && inPolygon(outlines.slit, x, y)) continue;
        torso.d.set(p, i);
      }
    }
  }
  dropSpecks(torso, 40);

  // The near leg: below the hem, left of its front edge, not the shoe.
  // Under the hem it is made up: a disc about the hip and the band above
  // the hem, filled from the trousers, so a thigh swung forward or back
  // never shows its cut top.
  const legs = blankLayer(W, H);
  const edge = (y) => edgeAt(rig.nearLegEdge, y);
  for (let y = cuts.legTop; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = at(x, y);
      if (!body.d[i + 3] || x >= edge(y) || inFoot(x, y)) continue;
      const p = body.d.subarray(i, i + 4);
      if (y < cuts.hemBottom && !leg(p[0], p[1], p[2])) continue;
      if (y > rig.joints.ankle[1] + 4) continue; // the far shoe, by the near one
      legs.d.set(p, i);
    }
  }
  const [hx, hy] = joints.hip;
  const under = (x, y) => (y >= cuts.legTop - 30 && y < cuts.hemBottom + 6 && x > 50 && x < edge(y))
    || (x - hx) ** 2 + (y - hy) ** 2 < 44 * 44;
  const added = new Set();
  for (let y = cuts.legTop - 40; y < cuts.hemBottom + 10; y++) {
    for (let x = 0; x < W; x++) {
      const i = at(x, y);
      if (!under(x, y) || legs.d[i + 3] > 200) continue;
      legs.d[i + 3] = 255;
      added.add(y * W + x);
    }
  }
  fillHoles(legs, (x, y) => added.has(y * W + x), (x, y) => {
    const i = at(x, y);
    return y >= cuts.hemBottom && leg(legs.d[i], legs.d[i + 1], legs.d[i + 2]);
  });
  dropSpecks(legs, 40);

  const thigh = blankLayer(W, H), shin = blankLayer(W, H), foot = blankLayer(W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = at(x, y);
      if (legs.d[i + 3]) {
        const p = legs.d.subarray(i, i + 4);
        if (y < cuts.thighBottom) thigh.d.set(p, i);
        if (y >= cuts.shinTop) shin.d.set(p, i);
      }
      if (body.d[i + 3] && inFoot(x, y)) foot.d.set(body.d.subarray(i, i + 4), i);
    }
  }
  // The knee's cap on the shin, the ankle's on the foot (under the
  // trouser's hem, so a foot turned up never shows a gap above it).
  addCap(shin, joints.knee, 30, (x, y) => x < edge(y) + 2);
  addCap(foot, [joints.ankle[0] + 6, joints.ankle[1] + 2], 20, (x, y) => y > joints.ankle[1] - 14);

  // The arm, upper and lower, apart at the elbow; the forearm carries
  // the elbow's cap under the sleeve's end.
  const sleeve = blankLayer(W, H), forearm = blankLayer(W, H);
  const elbowY = joints.elbow[1];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = at(x, y);
      if (!arm.d[i + 3]) continue;
      const p = arm.d.subarray(i, i + 4);
      if (y < elbowY + 2) sleeve.d.set(p, i);
      if (y >= elbowY - 6) forearm.d.set(p, i);
    }
  }
  addCap(forearm, joints.elbow, 29);
  return { head, hair, torso, thigh, shin, foot, sleeve, forearm };
}

// -------------------------------------------------------------
// Drawing, with a warp for the hair and the hem: every source row is
// shifted by shift(sy) = [dx, dy] before it is sampled, so the part
// bends rather than turns. Canvas.draw's arithmetic otherwise.
// -------------------------------------------------------------

function drawWarped(cv, layer, m, shade, shift, reach) {
  if (!shift) return cv.draw(layer, m, shade);
  const inv = invert(m);
  const corners = [[-reach, -reach], [layer.w + reach, -reach], [-reach, layer.h + reach],
    [layer.w + reach, layer.h + reach]].map((p) => apply(m, p));
  const x0 = Math.max(0, Math.floor(Math.min(...corners.map((p) => p[0]))));
  const x1 = Math.min(cv.w - 1, Math.ceil(Math.max(...corners.map((p) => p[0]))));
  const y0 = Math.max(0, Math.floor(Math.min(...corners.map((p) => p[1]))));
  const y1 = Math.min(cv.h - 1, Math.ceil(Math.max(...corners.map((p) => p[1]))));
  const L = layer.d, W = layer.w, H = layer.h;
  const get = (x, y, out) => {
    if (x < 0 || y < 0 || x >= W || y >= H) { out[0] = out[1] = out[2] = out[3] = 0; return; }
    const i = (y * W + x) * 4, a = L[i + 3] / 255;
    out[0] = (L[i] / 255) * a; out[1] = (L[i + 1] / 255) * a; out[2] = (L[i + 2] / 255) * a; out[3] = a;
  };
  const p00 = [0, 0, 0, 0], p10 = [0, 0, 0, 0], p01 = [0, 0, 0, 0], p11 = [0, 0, 0, 0];
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      let [sx, sy] = apply(inv, [x + 0.5, y + 0.5]);
      // The shift belongs to the source row the pixel came from; two
      // rounds of the lookup are enough for the gentle bends used here.
      let [dx, dy] = shift(sy);
      [dx, dy] = shift(sy - dy);
      sx -= dx; sy -= dy;
      const fx = sx - 0.5, fy = sy - 0.5;
      const ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
      get(ix, iy, p00); get(ix + 1, iy, p10); get(ix, iy + 1, p01); get(ix + 1, iy + 1, p11);
      const w00 = (1 - tx) * (1 - ty), w10 = tx * (1 - ty), w01 = (1 - tx) * ty, w11 = tx * ty;
      const sa = p00[3] * w00 + p10[3] * w10 + p01[3] * w01 + p11[3] * w11;
      if (sa <= 0.002) continue;
      const o = (y * cv.w + x) * 4, keep = 1 - sa;
      for (let c = 0; c < 3; c++) {
        const s = (p00[c] * w00 + p10[c] * w10 + p01[c] * w01 + p11[c] * w11) * shade;
        cv.d[o + c] = s + cv.d[o + c] * keep;
      }
      cv.d[o + 3] = sa + cv.d[o + 3] * keep;
    }
  }
}

// -------------------------------------------------------------
// One pose. Every frame is one of these:
//
//   x        the whole figure forward (negative, back), still px
//   hy       the hips and everything above them lowered, still px
//   lean     degrees about the hip; positive tips him forward
//   head     degrees about the neck, on top of the lean
//   breathe  the chest's rise, a stretch of the torso upward
//   near, far   each leg: { ankle: [x, y], foot } where the ankle goes
//            (still px, the ground at rig.ground) and the foot's turn
//            from flat, positive lifting the heel
//   armN, armF  each arm: { shoulder, elbow } in degrees; shoulder
//            positive swings it back, elbow negative bends it forward
//   hair, hem   [dx, dy] of the tip (hair) or the hem's edge, in screen
//            px, from the springs (simulate, below)
// -------------------------------------------------------------

function legIK(rig, hip, ankle) {
  const { joints } = rig;
  const L1 = dist(joints.hip, joints.knee), L2 = dist(joints.knee, joints.ankle);
  let D = dist(hip, ankle);
  const clamp = Math.max(0, D - (L1 + L2 - 0.5));
  D = Math.min(D, L1 + L2 - 0.5);
  const toward = angleOf(hip, ankle);
  const a = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + D * D - L2 * L2) / (2 * L1 * D))));
  const thighAng = toward - a; // the knee forward, toward +x
  const knee = [hip[0] + L1 * Math.cos(thighAng), hip[1] + L1 * Math.sin(thighAng)];
  const shinAng = angleOf(knee, ankle);
  const rest1 = angleOf(joints.hip, joints.knee), rest2 = angleOf(joints.knee, joints.ankle);
  const t1 = (thighAng - rest1) * DEG, t2 = (shinAng - rest2) * DEG - t1;
  return { t1, t2, clamp };
}

// Where the ankle is when the toe stays at toe and the heel is lifted by
// deg: the foot turned about the toe.
function ankleFromToe(rig, toe, deg) {
  const { ankle, toe: toe0 } = rig.joints;
  const r = deg / DEG, v = [ankle[0] - toe0[0], ankle[1] - toe0[1]];
  return [toe[0] + v[0] * Math.cos(r) - v[1] * Math.sin(r), toe[1] + v[0] * Math.sin(r) + v[1] * Math.cos(r)];
}

function poseMaps(rig, pose) {
  const { joints, cuts } = rig;
  const p = Object.assign({ x: 0, hy: 0, lean: 0, head: 0, breathe: 0,
    armN: { shoulder: 0, elbow: 0 }, armF: { shoulder: 0, elbow: 0 },
    hair: [0, 0], hem: [0, 0] }, pose);
  const R = move(PAD + p.x, PAD);
  const hipR = compose(R, move(0, p.hy));
  const k = 1 + p.breathe;
  const stretch = { a: 1, b: 0, c: 0, d: k, e: 0, f: cuts.hemBottom * (1 - k) };
  const body = compose(hipR, compose(turn(joints.hip[0], joints.hip[1], p.lean), stretch));
  const head = compose(body, turn(joints.neck[0], joints.neck[1], p.head));
  const hip = [joints.hip[0], joints.hip[1] + p.hy];
  const legs = {};
  let clamp = 0;
  for (const side of ["near", "far"]) {
    const L = p[side] || { ankle: joints.ankle, foot: 0 };
    // A leg is placed by its ankle (IK), or, as the NPCs' walk is, by
    // its angles: { thigh, knee }, thigh positive swinging it forward,
    // the foot turning with the shin.
    const ik = L.ankle ? legIK(rig, hip, L.ankle) : { t1: -L.thigh, t2: L.knee, clamp: 0 };
    // With angles, foot is the foot's turn from flat on the ground, not
    // from the shin: the NPCs' smaller feet can turn with the shin, but
    // his long shoes would stand him on tiptoe.

    clamp = Math.max(clamp, ik.clamp);
    const thigh = compose(hipR, turn(joints.hip[0], joints.hip[1], ik.t1));
    const shin = compose(thigh, turn(joints.knee[0], joints.knee[1], ik.t2));
    const foot = compose(shin, turn(joints.ankle[0], joints.ankle[1], (L.foot || 0) - ik.t1 - ik.t2));
    legs[side] = { thigh, shin, foot };
  }
  const arms = {};
  for (const [side, a] of [["near", p.armN], ["far", p.armF]]) {
    const sleeve = compose(body, turn(joints.shoulder[0], joints.shoulder[1], a.shoulder));
    const forearm = compose(sleeve, turn(joints.elbow[0], joints.elbow[1], a.elbow));
    arms[side] = { sleeve, forearm };
  }
  // grounded: the lower of the two soles put on the ground, so a stride
  // lowers him and a straight leg lifts him, by itself (animate-still.js).
  if (p.grounded) {
    let low = -Infinity;
    for (const side of ["near", "far"]) {
      for (let x = rig.joints.heel[0]; x <= rig.joints.toe[0]; x += 2) {
        low = Math.max(low, apply(legs[side].foot, [x, rig.ground - 1])[1] - PAD);
      }
    }
    return poseMaps(rig, Object.assign({}, pose, { grounded: false, hy: p.hy + rig.ground - 1 - low }));
  }
  return { p, R, body, head, legs, arms, clamp };
}

function drawPose(parts, rig, pose, W, H) {
  const { joints, cuts, outlines } = rig;
  const m = poseMaps(rig, pose);
  const { p } = m;
  const cv = new Canvas(W, H);

  // The hair's bend: the tip's offset, in the head's own frame, growing
  // from nothing at the nape to all of it at the tips.
  const hairTop = joints.nape[1], hairLen = Math.max(...outlines.hair.map((q) => q[1])) - hairTop;
  const local = (map, [dx, dy]) => {
    const inv = invert(map);
    return [inv.a * dx + inv.c * dy, inv.b * dx + inv.d * dy];
  };
  const hairTip = local(m.head, p.hair);
  const hairShift = (sy) => {
    const s = Math.max(0, Math.min(1, (sy - hairTop) / hairLen));
    const w = Math.pow(s, 1.5);
    return [hairTip[0] * w, hairTip[1] * w];
  };
  const hemEdge = local(m.body, p.hem);
  const hemShift = (sy) => {
    const s = Math.max(0, Math.min(1, (sy - cuts.hemTop) / (cuts.hemBottom - cuts.hemTop)));
    const w = Math.pow(s, 1.4);
    return [hemEdge[0] * w, hemEdge[1] * w];
  };
  const hairReach = Math.ceil(Math.hypot(...hairTip)) + 2;
  const hemReach = Math.ceil(Math.hypot(...hemEdge)) + 2;

  cv.draw(parts.forearm, m.arms.far.forearm, FAR_SHADE);
  cv.draw(parts.sleeve, m.arms.far.sleeve, FAR_SHADE);
  drawWarped(cv, parts.hair, m.head, 1, hairShift, hairReach);
  for (const side of ["far", "near"]) {
    const shade = side === "far" ? FAR_SHADE : 1, L = m.legs[side];
    cv.draw(parts.foot, L.foot, shade);
    cv.draw(parts.shin, L.shin, shade);
    cv.draw(parts.thigh, L.thigh, shade);
  }
  cv.draw(parts.head, m.head);
  drawWarped(cv, parts.torso, m.body, 1, hemShift, hemReach);
  cv.draw(parts.forearm, m.arms.near.forearm);
  cv.draw(parts.sleeve, m.arms.near.sleeve);
  return { cv, clamp: m.clamp, maps: m };
}

// -------------------------------------------------------------
// The springs. A tip hangs from an anchor that the body carries; it is
// pulled toward where it would rest (target) and pushed the other way
// by the anchor's acceleration, as hair is when the head drops and
// lifts. Run three times round a loop, keeping the last, so the end
// meets the start.
// -------------------------------------------------------------

function simulate(anchors, targets, fps, { hz, damping }, loop) {
  const n = anchors.length, dt = 1 / fps / SIM_STEPS;
  const w = 2 * Math.PI * hz, c = 2 * damping * w;
  // The anchor between frames, on a periodic Catmull-Rom curve.
  const at = (list, t) => {
    const i = Math.floor(t), f = t - i;
    const g = (j) => list[loop ? ((j % n) + n) % n : Math.max(0, Math.min(n - 1, j))];
    const P0 = g(i - 1), P1 = g(i), P2 = g(i + 1), P3 = g(i + 2);
    return [0, 1].map((k) => 0.5 * ((2 * P1[k]) + (-P0[k] + P2[k]) * f +
      (2 * P0[k] - 5 * P1[k] + 4 * P2[k] - P3[k]) * f * f + (-P0[k] + 3 * P1[k] - 3 * P2[k] + P3[k]) * f * f * f));
  };
  let o = targets[0].slice(), v = [0, 0];
  const out = [];
  const rounds = loop ? 3 : 1;
  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < n; i++) {
      if (r === rounds - 1) out.push(o.slice());
      for (let s = 0; s < SIM_STEPS; s++) {
        const t = i + s / SIM_STEPS, h = 1 / SIM_STEPS;
        const a0 = at(anchors, t - h), a1 = at(anchors, t), a2 = at(anchors, t + h);
        const tg = at(targets, t);
        for (let k = 0; k < 2; k++) {
          const acc = (a2[k] - 2 * a1[k] + a0[k]) / (dt * dt);
          const f = -w * w * (o[k] - tg[k]) - c * v[k] - acc;
          v[k] += f * dt;
          o[k] += v[k] * dt;
        }
      }
    }
  }
  return out;
}

// -------------------------------------------------------------
// The clips.
// -------------------------------------------------------------

const TAU = 2 * Math.PI;
const ease = (t) => t * t * (3 - 2 * t);

// A cubic Hermite through keys [w, [x, y]] with Catmull-Rom tangents
// inside and the given tangents (per unit of w) at the two ends.
function hermite(keys, startTan, endTan) {
  const tan = keys.map((k, i) => {
    if (i === 0) return startTan;
    if (i === keys.length - 1) return endTan;
    const [w0, p0] = keys[i - 1], [w2, p2] = keys[i + 1];
    return [0, 1].map((c) => (p2[c] - p0[c]) / (w2 - w0));
  });
  return (w) => {
    let i = 0;
    while (i < keys.length - 2 && w > keys[i + 1][0]) i++;
    const [w0, p0] = keys[i], [w1, p1] = keys[i + 1], h = w1 - w0, t = (w - w0) / h;
    const h00 = 2 * t ** 3 - 3 * t ** 2 + 1, h10 = t ** 3 - 2 * t ** 2 + t, h01 = -2 * t ** 3 + 3 * t ** 2, h11 = t ** 3 - t ** 2;
    return [0, 1].map((c) => h00 * p0[c] + h10 * h * tan[i][c] + h01 * p1[c] + h11 * h * tan[i + 1][c]);
  };
}

// Hair at rest, with the head turned by deg: gravity pulls the tips back
// toward hanging straight, so the target undoes most of the turn.
function hairGravity(rig, deg) {
  const nape = rig.joints.nape, tipY = Math.max(...rig.outlines.hair.map((q) => q[1]));
  const v = [rig.joints.nape[0] - 30 - nape[0], tipY - nape[1]];
  const r = deg / DEG;
  const turned = [v[0] * Math.cos(r) - v[1] * Math.sin(r), v[0] * Math.sin(r) + v[1] * Math.cos(r)];
  return [(v[0] - turned[0]) * 0.75, (v[1] - turned[1]) * 0.75];
}

const CLIPS = {
  idle(rig) {
    const N = 24, fps = 12, { joints } = rig;
    const farAnkle = [joints.ankle[0] + 34, joints.ankle[1]];
    const poses = Array.from({ length: N }, (_, i) => {
      const t = i / N;
      return {
        breathe: 0.009 * (1 - Math.cos(TAU * t)) / 2,
        hy: 3 + 1.2 * (1 - Math.cos(TAU * t)) / 2,
        lean: 0.35 * Math.sin(TAU * (t + 0.6)),
        head: -0.7 * Math.sin(TAU * (t + 0.15)),
        near: { ankle: joints.ankle, foot: 0 },
        far: { ankle: farAnkle, foot: 0 },
        armN: { shoulder: 1.1 * Math.sin(TAU * (t + 0.3)), elbow: -1.6 * Math.sin(TAU * (t + 0.4)) },
        armF: { shoulder: -2, elbow: -6 },
      };
    });
    return { poses, fps, loop: true,
      hair: { hz: 1.6, damping: 0.35, target: (pose, t) => {
        const g = hairGravity(rig, pose.lean + pose.head);
        return [g[0] + 3 * Math.sin(TAU * (t + 0.2)), g[1]];
      } },
      hem: { hz: 3, damping: 0.6, target: (pose, t) => [0.8 * Math.sin(TAU * (t + 0.35)), 0] } };
  },

  // The walk is the NPCs' walk (animate-still.js, MOTIONS.walk), at the
  // proponent's word after three tries of our own (an easy run twice,
  // then a heel-to-toe walk on bent knees) that read wrong: long
  // strides with the legs nearly straight, the knee folding only as the
  // leg swings forward, the arm swinging against the near leg, the lower
  // foot always on the ground. Its 8 frames at 12 are drawn here as 20
  // at 30, the same 0.67 s stride, so the same walk plays smoother.
  // Like every NPC's, the feet slide a little in the game.
  walk(rig) {
    const N = 20, fps = 30;
    const SWING = 24, KNEE_BEND = 46;
    const stride = (phase) => {
      const q = TAU * phase;
      return { thigh: SWING * Math.sin(q), knee: 4 + KNEE_BEND * Math.pow(Math.max(0, Math.cos(q)), 1.6) };
    };
    const poses = Array.from({ length: N }, (_, i) => {
      const t = i / N, near = stride(t), far = stride(t + 0.5);
      // The foot flat while the leg carries him (its thigh swinging
      // back), the heel peeling up as it leaves, and the toe coming up to
      // meet the ground as the leg reaches forward.
      const footAt = (phase) => {
        const q = (((phase % 1) + 1) % 1) * 360;
        if (q >= 90 && q < 225) return 0;
        if (q >= 225 && q < 290) return 28 * ease((q - 225) / 65);
        const w = (q >= 290 ? q - 290 : q + 70) / 160; // 290 round to 90
        return 28 * (1 - ease(Math.min(1, w / 0.5))) - 8 * ease(Math.max(0, (w - 0.55) / 0.45));
      };
      near.foot = footAt(t);
      far.foot = footAt(t + 0.5);
      return {
        grounded: true,
        near, far,
        lean: 3,
        head: 3 * Math.sin(TAU * (t * 2 + 0.25)),
        // Against the near leg: forward while it swings back.
        armN: { shoulder: 0.8 * near.thigh, elbow: 0.5 * near.thigh },
        armF: { shoulder: 0.8 * far.thigh, elbow: 0.5 * far.thigh },
      };
    });
    return { poses, fps, loop: true,
      hair: { hz: 1.7, damping: 0.4, target: (pose) => {
        const g = hairGravity(rig, pose.lean + pose.head);
        return [g[0] - 6, g[1] - 2];
      } },
      hem: { hz: 3, damping: 0.55, target: () => [-2, 0] } };
  },
};

// The springs for a clip: the nape and the hem's middle, where the body
// carries them each frame, drive the hair and the hem.
function withSecondary(rig, clip) {
  const n = clip.poses.length;
  const naps = [], hems = [], hairT = [], hemT = [];
  clip.poses.forEach((pose, i) => {
    const m = poseMaps(rig, pose);
    naps.push(apply(m.head, rig.joints.nape));
    hems.push(apply(m.body, [rig.joints.hip[0], rig.cuts.hemBottom]));
    hairT.push(clip.hair.target(pose, i / n));
    hemT.push(clip.hem.target(pose, i / n));
  });
  const hair = simulate(naps, hairT, clip.fps, clip.hair, clip.loop);
  const hem = simulate(hems, hemT, clip.fps, clip.hem, clip.loop);
  return clip.poses.map((p, i) => Object.assign({}, p, { hair: hair[i], hem: hem[i] }));
}

// -------------------------------------------------------------

function asLayer(img) {
  const out = blankLayer(img.width, img.height);
  out.d.set(img.rgba);
  return out;
}

// Straight-alpha bytes shrunk by a whole factor, averaged with alpha.
function shrink(rgba, w, h, f) {
  const W = Math.floor(w / f), H = Math.floor(h / f), out = new Uint8Array(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < f; sy++) for (let sx = 0; sx < f; sx++) {
        const i = ((y * f + sy) * w + x * f + sx) * 4, al = rgba[i + 3];
        r += rgba[i] * al; g += rgba[i + 1] * al; b += rgba[i + 2] * al; a += al;
      }
      const o = (y * W + x) * 4;
      if (a) { out[o] = Math.round(r / a); out[o + 1] = Math.round(g / a); out[o + 2] = Math.round(b / a); }
      out[o + 3] = Math.round(a / (f * f));
    }
  }
  return { W, H, out };
}

function debugParts(parts, W, H) {
  const order = ["hair", "head", "torso", "sleeve", "forearm", "thigh", "shin", "foot"];
  const tints = { hair: [1, 0.7, 1], head: [0.6, 1, 0.6], torso: [1, 1, 1], sleeve: [0.7, 0.9, 1],
    forearm: [1, 1, 0.4], thigh: [1, 0.6, 0.6], shin: [0.6, 0.6, 1], foot: [0.6, 1, 1] };
  const cv = new Canvas(W, H);
  order.forEach((name, n) => {
    const L = parts[name], t = tints[name], tinted = blankLayer(L.w, L.h);
    for (let i = 0; i < L.d.length; i += 4) {
      tinted.d[i] = L.d[i] * t[0]; tinted.d[i + 1] = L.d[i + 1] * t[1];
      tinted.d[i + 2] = L.d[i + 2] * t[2]; tinted.d[i + 3] = L.d[i + 3];
    }
    cv.draw(tinted, move(n * (L.w + 10), 0));
  });
  return cv;
}

function main() {
  const args = process.argv.slice(2);
  const name = args.find((a) => !a.startsWith("--"));
  if (!name) {
    console.log("usage: node _dev/tools/animate-player.js <rig> [--debug] [--frames]");
    process.exit(1);
  }
  const rig = require(path.join(ROOT, "_dev", "rigs", name + ".js"));
  const stillPath = path.resolve(ROOT, rig.still);
  const still = asLayer(decodePng(stillPath));
  const parts = splitStill(still, rig);

  if (args.includes("--debug")) {
    const DW = 8 * (still.w + 10), out = path.join(os.tmpdir(), name + "-parts.png");
    const cv = debugParts(parts, DW, still.h);
    fs.writeFileSync(out, encodePng(DW, still.h, cv.crop(0, 0, DW, still.h)));
    console.log("wrote " + out);
    return;
  }

  const W = still.w + 2 * PAD, H = still.h + PAD + 4;
  const made = rig.clips.map((c) => {
    if (!CLIPS[c.clip]) throw new Error("no clip " + c.clip + "; there are " + Object.keys(CLIPS).join(", "));
    const clip = CLIPS[c.clip](rig);
    const poses = withSecondary(rig, clip);
    const drawn = poses.map((pose) => drawPose(parts, rig, pose, W, H));
    const clamp = Math.max(...drawn.map((d) => d.clamp));
    if (clamp > 0.5) console.warn("  " + c.clip + ": a leg could not reach its ankle by " + clamp.toFixed(1) + " px; the feet will slide");
    return { c, clip, poses, drawn };
  });

  // One cell for every sheet, from every frame, on even pixels so the
  // halving lines up; the bottom is the ground.
  const F = Math.round(1 / rig.outScale);
  let x0 = W, x1 = 0, y0 = H;
  made.forEach(({ drawn }) => drawn.forEach(({ cv }) => {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (cv.d[(y * W + x) * 4 + 3] < 0.02) continue;
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y);
      }
    }
  }));
  const groundY = rig.ground + PAD;
  const cx = Math.floor((x0 - 4) / F) * F, cy = Math.floor((y0 - 4) / F) * F;
  const cw = Math.ceil((x1 + 5 - cx) / F) * F, ch = Math.ceil((groundY + 1 - cy) / F) * F;

  const dir = path.dirname(stillPath);
  const framesDir = path.join(os.tmpdir(), name + "-frames");
  if (args.includes("--frames")) fs.mkdirSync(framesDir, { recursive: true });
  made.forEach(({ c, drawn }) => {
    const frames = drawn.map(({ cv }, i) => {
      const s = shrink(cv.crop(cx, cy, cw, ch), cw, ch, F);
      if (args.includes("--frames")) {
        fs.writeFileSync(path.join(framesDir, c.clip + "-" + String(i).padStart(2, "0") + ".png"), encodePng(s.W, s.H, s.out));
      }
      return s.out;
    });
    const out = sheet(frames, cw / F, ch / F, COLUMNS);
    writeSheet(path.join(dir, c.file), out.W, out.H, out.out);
  });

  const top = Math.round((rig.top + PAD - cy) / F);
  console.log("cell " + cw / F + " x " + ch / F + "; every sheet: columns: " + COLUMNS +
    ", contentTop: " + top + ", contentHeight: " + Math.round((rig.ground + 1 - rig.top) / F) +
    ", footX: " + Math.round((rig.footX + PAD - cx) / F) + ", headroom: " + top);
  made.forEach(({ c, clip }) => {
    const src = path.posix.join(path.dirname(rig.still).replace(/\\/g, "/"), c.file);
    let line = "  " + src + "  " + c.clip + ": frames: " + clip.poses.length + ", fps: " + clip.fps +
      (clip.loop ? "" : ", loop: false");
    if (clip.step) {
      const v = (clip.step / clip.perWorld) * clip.fps;
      line += "  (the planted foot moves " + v.toFixed(0) + " world px a second; the game moves him " + WORLD_SPEED + ")";
    }
    console.log(line);
  });
  if (args.includes("--frames")) console.log("frames in " + framesDir);
}

main();
