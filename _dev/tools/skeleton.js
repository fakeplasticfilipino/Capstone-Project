// =============================================================
// MACARIO — _dev/tools/skeleton.js
//
// Animates the player from one still by bending the picture, not by
// cutting it into rigid pieces. The still is split into a few layers
// (the far arm, the far leg, the near leg, the body, the near arm), each
// layer is covered by a fine mesh of triangles, every corner of the mesh
// is tied to the bones near it with weights that fade from one bone to
// the next, and a pose moves the bones and drags the mesh with them.
// An elbow or a knee therefore bends as a curve, as cloth over a joint
// does, with no notch, no seam and no gap between parts.
//
// The legs are placed by their feet (two-bone IK, the knee forward): a
// clip says where each foot is, and a foot on the ground stays exactly
// where it was put, moving back at the speed the game moves him, so it
// never skates. The motion is written from how people move (the stance
// and swing of a stride, the drop of the hips as a foot takes the
// weight, the arms against the legs), with every curve eased and every
// amount held small: what a player sees all game should look calm, not
// busy.
//
// The skeleton (bones, outlines, which pixels go to which layer) is a
// file per character, _dev/player-lab/<name>.js. The clips are here and
// are every skeleton's, so a skin painted on the same template gets the
// same motion.
//
// Run:  node _dev/tools/skeleton.js <name>            the sheets and their numbers
//       node _dev/tools/skeleton.js <name> --debug    the working picture with
//                                                     the bones and outlines,
//                                                     and each layer apart
//       node _dev/tools/skeleton.js <name> --still=<png>   a skin on the template
//       node _dev/tools/skeleton.js <name> --ship     also writes the clips the
//                                                     skeleton names in ship into
//                                                     assets/sprites/player/,
//                                                     shrunk, for the game
// =============================================================

"use strict";

const fs = require("fs");
const path = require("path");
const { decodePng, encodePng, writeSheet } = require("./lib/png.js");

const ROOT = path.join(__dirname, "..", "..");

// The game's numbers the clips have to agree with (js/game.js).
const GAME = {
  displayHeight: 134,   // DISPLAY_HEIGHT: his height in world px
  walkSpeed: 300,       // SPEED 5 a frame at 60fps, world px a second
};

// The sheets: the figure about 240px tall, the height he is drawn on a
// desktop at --zoom 1.75 and on a phone's dense screen, rendered at
// twice that and averaged down so every edge is smooth.
const OUT = {
  figure: 240,
  cellW: 200,
  cellH: 256,
  anchorX: 80,          // the hip stands here in the cell
  groundY: 250,         // the soles stand here
  supersample: 2,
};

const rad = (d) => d * Math.PI / 180;
const deg = (r) => r * 180 / Math.PI;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const smoother = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * t * (t * (t * 6 - 15) + 10));
const TAU = Math.PI * 2;

function rot(x, y, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [x * c - y * s, x * s + y * c];
}

function inPoly(pts, x, y) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function segDist(px, py, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy;
  const t = l ? clamp(((px - a[0]) * dx + (py - a[1]) * dy) / l, 0, 1) : 0;
  return Math.hypot(px - a[0] - t * dx, py - a[1] - t * dy);
}

// ---------------------------------------------------------------
// The still: cropped and shrunk by area averaging, kept premultiplied
// (r, g, b already times alpha, 0..1) so sampling between pixels never
// pulls a dark fringe in from the transparent background.
// ---------------------------------------------------------------
function loadStill(file, sk) {
  const p = decodePng(file);
  const [cx, cy, cw, ch] = sk.crop;
  const f = sk.shrink;
  const W = Math.floor(cw / f), H = Math.floor(ch / f);
  const px = new Float32Array(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let dy = 0; dy < f; dy++) {
        for (let dx = 0; dx < f; dx++) {
          const sx = cx + x * f + dx, sy = cy + y * f + dy;
          if (sx < 0 || sy < 0 || sx >= p.width || sy >= p.height) continue;
          const j = (sy * p.width + sx) * 4, A = p.rgba[j + 3] / 255;
          r += p.rgba[j] / 255 * A; g += p.rgba[j + 1] / 255 * A; b += p.rgba[j + 2] / 255 * A; a += A;
        }
      }
      const i = (y * W + x) * 4, n = f * f;
      px[i] = r / n; px[i + 1] = g / n; px[i + 2] = b / n; px[i + 3] = a / n;
    }
  }
  return { W, H, px };
}

// ---------------------------------------------------------------
// The layers' pictures. Each is the still with only its own pixels, and
// what is hidden behind the parts in front painted in: the jacket behind
// the arm (so the arm can swing away from it), the trousers under the
// jacket and under the hand (so a leg can swing out from under them).
// ---------------------------------------------------------------
function buildTextures(sk, img) {
  const { W, H, px } = img;
  const N = W * H;
  const lum = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const a = px[i * 4 + 3];
    lum[i] = a > 0 ? (0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]) / a * 255 : 0;
  }
  const inArm = new Uint8Array(N), inLeg = new Uint8Array(N);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      inArm[y * W + x] = inPoly(sk.arm, x + 0.5, y + 0.5) ? 1 : 0;
      inLeg[y * W + x] = inPoly(sk.leg, x + 0.5, y + 0.5) ? 1 : 0;
    }
  }
  const solid = (i) => px[i * 4 + 3] > 0.004;
  const dark = (i) => lum[i] < sk.darkLuma;
  const hair = (i, y) => y < sk.hairAbove && dark(i);
  // Skin is warm: red well over blue. The trousers and the shoes are
  // nearly grey, so this is what tells the hand from them where they meet.
  const skin = (i) => {
    const a = px[i * 4 + 3];
    if (a <= 0) return false;
    const r = px[i * 4] / a, g = px[i * 4 + 1] / a, b = px[i * 4 + 2] / a;
    return r > 0.25 && r > b * 1.7 && r - g > 0.12;
  };
  // Trouser and shoe: dark and below the hair; below the jacket and the
  // hand, everything is.
  const trouser = (i, y) => y >= sk.hairAbove + 40 && (dark(i) || y > sk.hemY + 12);

  const arm = new Float32Array(N * 4), leg = new Float32Array(N * 4), body = new Float32Array(N * 4);
  const copy = (dst, i) => { for (let k = 0; k < 4; k++) dst[i * 4 + k] = px[i * 4 + k]; };
  const armSrc = new Uint8Array(N), legSrc = new Uint8Array(N), bodySrc = new Uint8Array(N);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!solid(i)) continue;
      // A drawing with outlines (the NPCs' style) rings the sleeve and the
      // hand in near-black: inside the arm's outline that black is the
      // arm's own line, not hair or trouser, and must move with it.
      const line = sk.outlineLuma && lum[i] < sk.outlineLuma;
      if (inArm[i] && (line || (!hair(i, y) && !(trouser(i, y) && !skin(i))))) { copy(arm, i); armSrc[i] = 1; continue; }
      // Above the hem, a near-black line is the jacket's own (the edges of
      // its slits, its hem), so it stays on the jacket; the trouser seen
      // through a slit is dark grey and goes with the leg.
      if (trouser(i, y) && !(line && y <= sk.hemY + 2)) {
        // Not inside the arm's outline: what is there is the hand's soft
        // edge, which copied into the hidden trouser leaves pale flecks.
        // The trouser under the hand is painted in instead.
        if (inLeg[i] && !inArm[i]) { copy(leg, i); legSrc[i] = 1; }
        continue;   // the far leg's pixels: replaced by the far leg
      }
      copy(body, i); bodySrc[i] = 1;
    }
  }

  // The jacket behind the arm, painted in from the jacket round it (not
  // from the hair, which would smear dark into it), down to the hem.
  const bodyHole = new Uint8Array(N), jacket = new Uint8Array(N);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (inArm[i] && !bodySrc[i] && y < sk.hemY) bodyHole[i] = 1;
      // Only solid cloth: not a half-transparent edge, and not the warm
      // fringe a cut-out drawing can leave along an edge, which painted in
      // would smear pink across the jacket.
      const A = px[i * 4 + 3];
      if (bodySrc[i] && !dark(i) && A > 0.95 && (px[i * 4] - px[i * 4 + 1]) / A < 0.12) jacket[i] = 1;
    }
  }
  fillRows(body, W, H, bodyHole, jacket);

  // The trousers above the hem (under the jacket) and under the hand.
  const legHole = new Uint8Array(N);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (inLeg[i] && !legSrc[i] && (y < sk.hemY + 24 || inArm[i])) legHole[i] = 1;
    }
  }
  fillUp(leg, W, H, legHole, legSrc, sk.hemY);

  return { arm, leg, body };
}

// The jacket behind the arm: each row of the hole runs from the jacket
// at its left to the jacket at its right (or carries one side across
// where there is only one), then the rows are softened into each other
// so no band shows.
function fillRows(tex, W, H, hole, source) {
  const filled = new Uint8Array(W * H);
  const edge = (y, x, step) => {
    let r = 0, g = 0, b = 0, n = 0;
    for (let k = 1; k <= 8 && n < 3; k++) {
      const xx = x + step * k;
      if (xx < 0 || xx >= W) break;
      const j = y * W + xx;
      if (!source[j]) continue;
      const a = tex[j * 4 + 3];
      r += tex[j * 4] / a; g += tex[j * 4 + 1] / a; b += tex[j * 4 + 2] / a; n++;
    }
    return n ? [r / n, g / n, b / n] : null;
  };
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!hole[y * W + x]) continue;
      let x1 = x;
      while (x1 + 1 < W && hole[y * W + x1 + 1]) x1++;
      const L = edge(y, x, -1), R = edge(y, x1, 1);
      for (let xx = x; xx <= x1; xx++) {
        const c = L && R ? L.map((v, k) => lerp(v, R[k], (xx - x + 1) / (x1 - x + 2))) : L || R;
        if (!c) continue;
        const i = (y * W + xx) * 4;
        tex[i] = c[0]; tex[i + 1] = c[1]; tex[i + 2] = c[2]; tex[i + 3] = 1;
        filled[y * W + xx] = 1;
      }
      x = x1;
    }
  }
  // Rows with nothing either side take the row above.
  for (let y = 1; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (hole[i] && !filled[i] && filled[i - W]) {
        for (let k = 0; k < 4; k++) tex[i * 4 + k] = tex[(i - W) * 4 + k];
        filled[i] = 1;
      }
    }
  }
  for (let pass = 0; pass < 2; pass++) {
    const next = tex.slice();
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (!filled[i]) continue;
        let r = 0, g = 0, b = 0, n = 0;
        for (let dy = -6; dy <= 6; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
            const j = ny * W + nx;
            if (!filled[j]) continue;
            r += tex[j * 4]; g += tex[j * 4 + 1]; b += tex[j * 4 + 2]; n++;
          }
        }
        next[i * 4] = r / n; next[i * 4 + 1] = g / n; next[i * 4 + 2] = b / n;
      }
    }
    tex.set(next);
  }
}

// The trousers hidden under the jacket and the hand: each column carries
// its trouser up from below, mirrored, so the folds run on as they do.
function fillUp(tex, W, H, hole, source, hemY) {
  for (let x = 0; x < W; x++) {
    let y0 = -1;
    for (let y = hemY - 40; y < H; y++) {
      const i = y * W + x;
      if (hole[i]) { y0 = -1; continue; }
      if (y0 < 0 && source[i] && tex[i * 4 + 3] > 0.9 && y > hemY - 40) {
        let ok = true;
        for (let k = 1; k <= 3; k++) if (y + k >= H || !source[(y + k) * W + x]) ok = false;
        if (ok) { y0 = y; break; }
      }
    }
    if (y0 < 0) continue;
    for (let y = y0 - 1; y >= 0; y--) {
      const i = y * W + x;
      if (!hole[i]) continue;
      let sy = y0 + (y0 - y);
      while (sy >= H || !source[sy * W + x]) sy = Math.max(y0, sy - 7);
      const j = sy * W + x;
      const a = tex[j * 4 + 3];
      tex[i * 4] = tex[j * 4] / a; tex[i * 4 + 1] = tex[j * 4 + 1] / a; tex[i * 4 + 2] = tex[j * 4 + 2] / a; tex[i * 4 + 3] = 1;
    }
  }
  // A column with no trouser under it (beside the leg) takes its neighbour's.
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (!hole[i] || tex[i * 4 + 3] > 0.5) continue;
        const j = x > 0 && tex[(i - 1) * 4 + 3] > 0.5 ? i - 1 : x + 1 < W && tex[(i + 1) * 4 + 3] > 0.5 ? i + 1 : -1;
        if (j >= 0) for (let k = 0; k < 4; k++) tex[i * 4 + k] = tex[j * 4 + k];
      }
    }
  }
}

// ---------------------------------------------------------------
// Bones. Each turns about its head; a child is carried by its parent.
// The far arm and leg are the near ones' bones again, posed apart.
// ---------------------------------------------------------------
function buildBones(sk) {
  const J = sk.joints;
  const list = [
    ["root", null, J.hip, J.hem],
    ["spine", "root", J.hip, J.chest],
    ["chest", "spine", J.chest, J.neck],
    ["head", "chest", J.neck, J.headTop],
    ["hair", "head", J.nape, J.hairTip],
    ["upper", "chest", J.shoulder, J.elbow],
    ["fore", "upper", J.elbow, J.wrist],
    ["hand", "fore", J.wrist, J.handTip],
    ["farUpper", "chest", J.shoulder, J.elbow],
    ["farFore", "farUpper", J.elbow, J.wrist],
    ["farHand", "farFore", J.wrist, J.handTip],
    ["thigh", "root", J.hip, J.knee],
    ["shin", "thigh", J.knee, J.ankle],
    ["foot", "shin", J.ankle, J.toe],
    ["farThigh", "root", J.hip, J.knee],
    ["farShin", "farThigh", J.knee, J.ankle],
    ["farFoot", "farShin", J.ankle, J.toe],
  ];
  const bones = list.map(([name, parent, head, tail]) => ({
    name, parent, head, tail,
    rest: Math.atan2(tail[1] - head[1], tail[0] - head[0]),
    len: Math.hypot(tail[0] - head[0], tail[1] - head[1]),
  }));
  const by = {};
  for (const b of bones) by[b.name] = b;
  return { bones, by };
}

// pose: { bone: { r (degrees), x, y } }, all optional. Returns each
// bone's world turn A and where its head is now, H.
function solve(B, pose) {
  const W = {};
  for (const b of B.bones) {
    const p = pose[b.name] || {};
    const r = rad(p.r || 0);
    if (!b.parent) {
      W[b.name] = { A: r, H: [b.head[0] + (p.x || 0), b.head[1] + (p.y || 0)] };
    } else {
      const P = W[b.parent], pb = B.by[b.parent];
      const [dx, dy] = rot(b.head[0] - pb.head[0], b.head[1] - pb.head[1], P.A);
      W[b.name] = { A: P.A + r, H: [P.H[0] + dx + (p.x || 0), P.H[1] + dy + (p.y || 0)] };
    }
  }
  return W;
}

// ---------------------------------------------------------------
// Meshes. A grid of triangles over each layer's pixels, every corner
// weighted to the layer's bones by how near it is to each (the inverse
// fourth power of the distance), so a corner beside a joint is shared
// between both bones and the bend there is smooth.
// ---------------------------------------------------------------
function buildMesh(tex, W, H, B, boneNames, grid) {
  const nx = Math.ceil(W / grid) + 1, ny = Math.ceil(H / grid) + 1;
  const index = new Int32Array(nx * ny).fill(-1);
  const verts = [], tris = [];
  const vert = (i, j) => {
    const k = j * nx + i;
    if (index[k] < 0) { index[k] = verts.length; verts.push([i * grid, j * grid]); }
    return index[k];
  };
  for (let j = 0; j < ny - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      let any = false;
      for (let y = j * grid - 1; y <= (j + 1) * grid && !any; y++) {
        for (let x = i * grid - 1; x <= (i + 1) * grid && !any; x++) {
          if (x >= 0 && y >= 0 && x < W && y < H && tex[(y * W + x) * 4 + 3] > 0.004) any = true;
        }
      }
      if (!any) continue;
      const a = vert(i, j), b = vert(i + 1, j), c = vert(i + 1, j + 1), d = vert(i, j + 1);
      tris.push([a, b, c], [a, c, d]);
    }
  }
  const weights = verts.map(([x, y]) => {
    const ws = boneNames.map((n) => {
      const b = B.by[n];
      return 1 / Math.pow(segDist(x, y, b.head, b.tail) + 1.5, 4);
    });
    const sum = ws.reduce((s, w) => s + w, 0);
    return ws.map((w) => w / sum);
  });
  return { verts, tris, weights };
}

// ---------------------------------------------------------------
// Drawing. Each layer's mesh posed and drawn back to front into a
// premultiplied canvas at twice the sheet's size, every pixel sampled
// from its layer's picture between pixels (bilinear).
// ---------------------------------------------------------------
function sample(tex, W, H, u, v, out) {
  const x = u - 0.5, y = v - 0.5;
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
  out[0] = out[1] = out[2] = out[3] = 0;
  for (let k = 0; k < 4; k++) {
    const sx = x0 + (k & 1), sy = y0 + (k >> 1);
    if (sx < 0 || sy < 0 || sx >= W || sy >= H) continue;
    const w = ((k & 1) ? fx : 1 - fx) * ((k >> 1) ? fy : 1 - fy);
    const i = (sy * W + sx) * 4;
    out[0] += tex[i] * w; out[1] += tex[i + 1] * w; out[2] += tex[i + 2] * w; out[3] += tex[i + 3] * w;
  }
}

function drawLayer(canvas, CW, CH, layer, world, map) {
  const { mesh, tex, W, H, bones, shade } = layer;
  const posed = mesh.verts.map(([x, y], vi) => {
    let px = 0, py = 0;
    const ws = mesh.weights[vi];
    for (let k = 0; k < bones.length; k++) {
      const w = ws[k];
      if (w < 1e-4) continue;
      const b = layer.boneRest[k], Wb = world[bones[k]];
      const [dx, dy] = rot(x - b.head[0], y - b.head[1], Wb.A);
      px += w * (Wb.H[0] + dx); py += w * (Wb.H[1] + dy);
    }
    return map(px, py);
  });
  const s = [0, 0, 0, 0];
  for (const [ia, ib, ic] of mesh.tris) {
    const A = posed[ia], Bp = posed[ib], C = posed[ic];
    const ua = mesh.verts[ia], ub = mesh.verts[ib], uc = mesh.verts[ic];
    const area = (Bp[0] - A[0]) * (C[1] - A[1]) - (Bp[1] - A[1]) * (C[0] - A[0]);
    if (Math.abs(area) < 1e-6) continue;
    const x0 = Math.max(0, Math.floor(Math.min(A[0], Bp[0], C[0])));
    const x1 = Math.min(CW - 1, Math.ceil(Math.max(A[0], Bp[0], C[0])));
    const y0 = Math.max(0, Math.floor(Math.min(A[1], Bp[1], C[1])));
    const y1 = Math.min(CH - 1, Math.ceil(Math.max(A[1], Bp[1], C[1])));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const px = x + 0.5, py = y + 0.5;
        const l1 = ((C[0] - A[0]) * (py - A[1]) - (C[1] - A[1]) * (px - A[0])) / -area;
        const l2 = ((Bp[0] - A[0]) * (py - A[1]) - (Bp[1] - A[1]) * (px - A[0])) / area;
        const l0 = 1 - l1 - l2;
        if (l0 < -1e-5 || l1 < -1e-5 || l2 < -1e-5) continue;
        sample(tex, W, H, l0 * ua[0] + l1 * ub[0] + l2 * uc[0], l0 * ua[1] + l1 * ub[1] + l2 * uc[1], s);
        if (s[3] <= 0.001) continue;
        const i = (y * CW + x) * 4, k = 1 - s[3];
        canvas[i] = s[0] * shade + canvas[i] * k;
        canvas[i + 1] = s[1] * shade + canvas[i + 1] * k;
        canvas[i + 2] = s[2] * shade + canvas[i + 2] * k;
        canvas[i + 3] = s[3] + canvas[i + 3] * k;
      }
    }
  }
}

// ---------------------------------------------------------------
// Legs by their feet. A foot is given as the point it rocks on (the heel
// as it lands, the ball as it pushes off) and how far it is turned; the
// ankle follows, and the hip and the ankle place the knee, forward.
// ---------------------------------------------------------------
function footAt(sk, pivotName, pivotAt, turn) {
  const J = sk.joints, p = J[pivotName];
  const [dx, dy] = rot(J.ankle[0] - p[0], J.ankle[1] - p[1], rad(turn));
  return [pivotAt[0] + dx, pivotAt[1] + dy];
}

function legIK(B, hip, ankle, parentA, names, footTurn) {
  const [tn, sn, fn] = names;
  const T = B.by[tn], S = B.by[sn];
  const L1 = T.len, L2 = S.len;
  const dx = ankle[0] - hip[0], dy = ankle[1] - hip[1];
  const d = clamp(Math.hypot(dx, dy), Math.abs(L1 - L2) + 1, L1 + L2 - 0.5);
  const base = Math.atan2(dy, dx);
  const bend = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const t = base - bend;   // the knee forward, toward +x, where he faces
  const knee = [hip[0] + L1 * Math.cos(t), hip[1] + L1 * Math.sin(t)];
  const s = Math.atan2(ankle[1] - knee[1], ankle[0] - knee[0]);
  const At = t - T.rest, As = s - S.rest;
  return {
    [tn]: { r: deg(At - parentA) },
    [sn]: { r: deg(As - At) },
    [fn]: { r: footTurn - deg(As) },
  };
}

// ---------------------------------------------------------------
// A clip written as key poses on given frames, eased between them
// (smoothstep, so every move starts and stops softly). A key lists only
// what it moves; anything a key leaves out is 0 there. Legs are
// { near: { forward, knee }, far: {...} } as the walk's are.
//
// Follow-through: each part of the body is played a little behind the
// part that moves it (DRAG, in frames): the forearm after the upper arm,
// the hand after the forearm, the head after the chest, the hair last of
// all. A body whose parts all arrive on the same frame is what reads as
// stiff; this is the overlap an animator draws by hand.
const DRAG = { chest: 0.3, head: 0.7, hair: 1.5, fore: 0.35, hand: 0.7, farFore: 0.35, farHand: 0.7 };

function keyed(frames, keys, drag = DRAG) {
  const flat = (k) => {
    const out = {};
    for (const [bone, v] of Object.entries(k.body || {})) for (const [f, n] of Object.entries(v)) out["body." + bone + "." + f] = n;
    for (const [leg, v] of Object.entries(k.legs || {})) for (const [f, n] of Object.entries(v)) out["legs." + leg + "." + f] = n;
    return out;
  };
  const fk = keys.map((k) => ({ f: k.f, v: flat(k), ease: k.ease }));
  const names = [...new Set(fk.flatMap((k) => Object.keys(k.v)))];
  const valueAt = (n, f) => {
    f = Math.max(0, f);
    let i = 0;
    while (i < fk.length - 2 && f >= fk[i + 1].f) i++;
    const a = fk[i], b = fk[Math.min(i + 1, fk.length - 1)];
    let u = b.f > a.f ? clamp((f - a.f) / (b.f - a.f), 0, 1) : 0;
    // A key may ask to be arrived at fast (a blow): eased in only, with
    // no slowing down into it.
    u = b.ease === "in" ? u * u : smooth(u);
    return lerp(a.v[n] || 0, b.v[n] || 0, u);
  };
  return (t) => {
    const f = t * frames;
    const pose = { body: {}, legs: { near: { forward: 0, knee: 0 }, far: { forward: 0, knee: 0 } } };
    for (const n of names) {
      const [part, who, field] = n.split(".");
      if (part === "body") (pose.body[who] = pose.body[who] || {})[field] = valueAt(n, f - (drag[who] || 0));
      else pose.legs[who][field] = valueAt(n, f);
    }
    return pose;
  };
}

// The clips. Each returns, for a moment t of its loop (0..1), the body's
// pose and where each foot is.
// ---------------------------------------------------------------
const CLIPS = {
  // Standing. Two seconds: a breath in and out, the weight easing a
  // little from one foot to the other and back, the head and the arms a
  // fraction behind the chest, the feet still. The NPCs' amounts
  // (animate-still.js, MOTIONS.idle): a 1.8 degree nod, the arms 2.
  idle: {
    frames: 16, fps: 8,
    pose(t, sk) {
      const b = Math.sin(TAU * t);                 // the breath
      const sway = Math.sin(TAU * t + 0.4);        // the weight
      return {
        body: {
          root: { x: 1.2 * sway, y: 0.8 + 0.4 * b },
          spine: { r: -0.6 * sway },
          chest: { r: -0.4 * b, y: -1.6 * b },
          head: { r: 1.8 * Math.sin(TAU * t - 0.5) },
          hair: { r: 1.2 * Math.sin(TAU * t - 1.2) },
          upper: { r: 1.6 * Math.sin(TAU * t - 0.6) },
          fore: { r: -1.4 * Math.sin(TAU * t - 1.0) },
          hand: { r: 1.2 * Math.sin(TAU * t - 1.4) },
          farUpper: { r: -2 + 1.2 * Math.sin(TAU * t - 0.9) },
          farFore: { r: -3 },
        },
        feet: {
          near: { pivot: "heel", at: sk.joints.heel, turn: 0 },
          far: { pivot: "heel", at: [sk.joints.heel[0] + sk.farLegOffset, sk.joints.heel[1]], turn: 0 },
        },
      };
    },
  },

  // On the move, made the way the NPCs' walk is (animate-still.js,
  // MOTIONS.walk, stride): each leg swings from the hip like a pendulum,
  // 24 degrees either way, the knee nearly straight while the leg carries
  // him and folding back only as it swings through, and the lower foot
  // set on the ground, which is all the rise and fall there is. The arms
  // hang and swing against the legs, as theirs do. Eight frames at 12,
  // their timing.
  //
  // Not by the feet, as the first try was (24 Oct 2026): placing the feet
  // and solving the knees bent him into a crouch and threw the swinging
  // knee up in front, which read as goofy beside the NPCs. His feet slide
  // against the game's ground as theirs do.
  walk: {
    frames: 8, fps: 12,
    pose(t) {
      const SWING = 24, KNEE = 46;
      const leg = (phase) => {
        const p = TAU * phase;
        const forward = SWING * Math.sin(p);
        const knee = 4 + KNEE * Math.pow(Math.max(0, Math.cos(p)), 1.6);
        return { forward, knee };
      };
      const near = leg(t), far = leg(t + 0.5);
      return {
        body: {
          spine: { r: 2 },
          head: { r: -1 + 1.5 * Math.sin(TAU * (t * 2 + 0.25)) },
          hair: { r: 1 + Math.sin(TAU * (t * 2 - 0.1)) },
          // Forward (a negative turn) while the near leg goes back.
          upper: { r: 0.8 * near.forward },
          fore: { r: 0.5 * near.forward - 2 },
          farUpper: { r: 0.8 * far.forward },
          farFore: { r: 0.5 * far.forward - 2 },
        },
        legs: { near, far },
      };
    },
  },

  // The punch (game.js, melee: played once per tap at 24, the blow
  // resolved on contact). The whole body throws it: he sinks and draws
  // the fist back to his ribs, the weight goes forward onto the front
  // foot, the shoulder leads and the elbow opens last, so the arm snaps
  // straight on the contact frame and carries a hair past it; the other
  // arm pulls back as the fist goes out; then he settles back. The
  // NPCs' attack (animate-still.js) at the player's speed.
  melee: {
    frames: 12, fps: 24, loop: false, contact: 6,
    pose: keyed(12, [
      { f: 0, body: { fore: { r: -2 } } },
      { f: 2, body: { root: { x: -6 }, spine: { r: -5 }, head: { r: 3 }, upper: { r: 22 }, fore: { r: -72 }, hand: { r: 6 },
          farUpper: { r: -14 }, farFore: { r: -40 }, hair: { r: -2 } },
        legs: { near: { forward: 2, knee: 14 }, far: { forward: -6, knee: 16 } } },
      { f: 4, body: { root: { x: 5 }, spine: { r: 3 }, head: { r: 0 }, upper: { r: -42 }, fore: { r: -58 }, hand: { r: 2 },
          farUpper: { r: 8 }, farFore: { r: -50 } },
        legs: { near: { forward: 11, knee: 14 }, far: { forward: -11, knee: 10 } } },
      { f: 6, ease: "in", body: { root: { x: 18 }, spine: { r: 9 }, head: { r: -6 }, upper: { r: -88 }, fore: { r: 16 }, hand: { r: -4 },
          farUpper: { r: 22 }, farFore: { r: -62 }, hair: { r: 2 } },
        legs: { near: { forward: 20, knee: 16 }, far: { forward: -16, knee: 6 } } },
      { f: 7, body: { root: { x: 19 }, spine: { r: 10 }, head: { r: -6 }, upper: { r: -90 }, fore: { r: 18 }, hand: { r: -6 },
          farUpper: { r: 23 }, farFore: { r: -62 }, hair: { r: 6 } },
        legs: { near: { forward: 20, knee: 17 }, far: { forward: -16, knee: 6 } } },
      { f: 9, body: { root: { x: 14 }, spine: { r: 6 }, head: { r: -4 }, upper: { r: -74 }, fore: { r: 2 }, hand: { r: -2 },
          farUpper: { r: 14 }, farFore: { r: -40 }, hair: { r: 4 } },
        legs: { near: { forward: 15, knee: 12 }, far: { forward: -12, knee: 6 } } },
      { f: 11, body: { root: { x: 4 }, spine: { r: 1 }, head: { r: -1 }, upper: { r: -12 }, fore: { r: -10 },
          farUpper: { r: 3 }, farFore: { r: -8 }, hair: { r: 1 } },
        legs: { near: { forward: 4, knee: 6 }, far: { forward: -4, knee: 6 } } },
    ]),
  },

  // The shot (game.js, shootAim then shootFire). Frames 0 to 2 bring the
  // arm up and level, the stance opening and the body leaning back a
  // little against the weight of the arm, the head dipping to sight along
  // it; frame 2 is held while the button is down. 3 to 11 are the shot,
  // from the instant it leaves: the kick goes up the arm into the
  // shoulder and the body, the hand rides highest, and everything comes
  // back down a touch too far before it settles. The pistol itself is
  // owed (no art but the artist's): his fist points where it will be,
  // and muzzle is where its tip goes.
  shoot: {
    frames: 12, fps: 8, fireFps: 18, loop: false, aim: [0, 2], fire: [3, 11], muzzleFrame: 2,
    pose: keyed(12, [
      { f: 0, body: { spine: { r: 1 }, upper: { r: -30 }, fore: { r: -32 }, hand: { r: 4 } },
        legs: { near: { forward: 5, knee: 7 }, far: { forward: -5, knee: 7 } } },
      { f: 1, body: { root: { x: -1 }, spine: { r: 0 }, head: { r: 1 }, upper: { r: -70 }, fore: { r: -6 }, hand: { r: 2 }, farUpper: { r: 4 }, farFore: { r: -8 } },
        legs: { near: { forward: 9, knee: 8 }, far: { forward: -9, knee: 7 } } },
      { f: 2, body: { root: { x: -2 }, spine: { r: -1 }, head: { r: 2 }, upper: { r: -88 }, fore: { r: 16 }, hand: { r: -2 }, farUpper: { r: 6 }, farFore: { r: -12 } },
        legs: { near: { forward: 10, knee: 8 }, far: { forward: -10, knee: 6 } } },
      { f: 3, ease: "in", body: { root: { x: -4 }, spine: { r: -3 }, chest: { r: -2 }, head: { r: 0 }, upper: { r: -99 }, fore: { r: 9 }, hand: { r: -16 },
          farUpper: { r: 8 }, farFore: { r: -12 }, hair: { r: 2 } },
        legs: { near: { forward: 10, knee: 8 }, far: { forward: -10, knee: 6 } } },
      { f: 4, body: { root: { x: -5 }, spine: { r: -4 }, chest: { r: -2.5 }, head: { r: -1 }, upper: { r: -103 }, fore: { r: 6 }, hand: { r: -22 },
          farUpper: { r: 9 }, farFore: { r: -12 }, hair: { r: 4 } },
        legs: { near: { forward: 10, knee: 9 }, far: { forward: -10, knee: 7 } } },
      { f: 6, body: { root: { x: -3 }, spine: { r: -2 }, chest: { r: -1 }, head: { r: 1 }, upper: { r: -93 }, fore: { r: 12 }, hand: { r: -8 },
          farUpper: { r: 7 }, farFore: { r: -12 }, hair: { r: 2 } },
        legs: { near: { forward: 10, knee: 8 }, far: { forward: -10, knee: 6 } } },
      { f: 8, body: { root: { x: -1.5 }, spine: { r: -0.5 }, head: { r: 2.5 }, upper: { r: -85 }, fore: { r: 18 }, hand: { r: 1 },
          farUpper: { r: 6 }, farFore: { r: -12 }, hair: { r: -1 } },
        legs: { near: { forward: 10, knee: 8 }, far: { forward: -10, knee: 6 } } },
      { f: 11, body: { root: { x: -2 }, spine: { r: -1 }, head: { r: 2 }, upper: { r: -88 }, fore: { r: 16 }, hand: { r: -2 }, farUpper: { r: 6 }, farFore: { r: -12 } },
        legs: { near: { forward: 10, knee: 8 }, far: { forward: -10, knee: 6 } } },
    ]),
  },

  // The jump (game.js, jumpRise, jumpFall, jumpLand, chosen by how he is
  // moving, not by time). 0 the push off the ground, legs driving, the
  // near arm swinging up and the far one back; 1 to 3 rising, the front knee drawn up, the back
  // leg folding under, the arms carried up and the hair still hanging
  // behind the rise; 4 coming down, the legs reaching for the ground, the
  // arms lifting for balance and the hair floating up; 5 the landing, the
  // knees and the back giving under the weight. The lower foot is set at
  // the bottom of the cell in every frame, so the engine's own height is
  // the only height: no frameBottoms needed.
  jump: {
    frames: 6, fps: 14, loop: false, rise: [0, 3], fall: [4, 4], land: [5, 5],
    pose: keyed(6, [
      { f: 0, body: { spine: { r: 6 }, head: { r: -2 }, upper: { r: -34 }, fore: { r: -30 }, farUpper: { r: 18 }, farFore: { r: -14 }, hair: { r: -3 } },
        legs: { near: { forward: -8, knee: 6 }, far: { forward: -16, knee: 14 } } },
      { f: 1, body: { spine: { r: 3 }, head: { r: -1 }, upper: { r: -58 }, fore: { r: -34 }, farUpper: { r: 26 }, farFore: { r: -18 }, hair: { r: -4 } },
        legs: { near: { forward: 38, knee: 50 }, far: { forward: -12, knee: 30 } } },
      { f: 2, body: { spine: { r: 4 }, head: { r: -1 }, upper: { r: -52 }, fore: { r: -42 }, farUpper: { r: 22 }, farFore: { r: -22 }, hair: { r: 0 } },
        legs: { near: { forward: 48, knee: 74 }, far: { forward: -6, knee: 54 } } },
      { f: 3, body: { spine: { r: 5 }, head: { r: -1 }, upper: { r: -44 }, fore: { r: -46 }, farUpper: { r: 16 }, farFore: { r: -24 }, hair: { r: 4 } },
        legs: { near: { forward: 50, knee: 80 }, far: { forward: 0, knee: 64 } } },
      { f: 4, body: { spine: { r: 1 }, head: { r: -2 }, upper: { r: -62 }, fore: { r: -18 }, farUpper: { r: 30 }, farFore: { r: -10 }, hair: { r: 10 } },
        legs: { near: { forward: 20, knee: 16 }, far: { forward: 4, knee: 22 } } },
      { f: 5, body: { spine: { r: 12 }, head: { r: -8 }, upper: { r: -28 }, fore: { r: -32 }, farUpper: { r: 12 }, farFore: { r: -20 }, hair: { r: 4 } },
        legs: { near: { forward: 34, knee: 70 }, far: { forward: 26, knee: 64 } } },
    ], {}),
  },

  // The slash, with the itak in the near hand (worn as the bolo item, in
  // place of the punch: same timing, 12 frames at 24, the blow on 6, so
  // game.js resolves it as it does the punch). He draws the blade up and
  // back over the shoulder as the tell, then brings it over and down in
  // one diagonal cut with the body behind it, the wrist turning over
  // last, a pale arc trailing the point (drawn, not art, as the NPCs'
  // slash is), and settles. The blade itself is the artist's (ART.md);
  // until it comes the cut is made empty-handed.
  slash: {
    frames: 12, fps: 24, loop: false, contact: 6, prop: "itak", arc: [5, 8],
    cell: { w: 300, h: 330, anchorX: 110, groundY: 320 },
    pose: keyed(12, [
      { f: 0, body: { fore: { r: -2 } } },
      { f: 1, body: { root: { x: -3 }, spine: { r: -3 }, head: { r: 2 }, upper: { r: -92 }, fore: { r: -88 }, hand: { r: 30 }, farUpper: { r: -10 }, farFore: { r: -16 } },
        legs: { near: { forward: 2, knee: 8 }, far: { forward: -4, knee: 9 } } },
      { f: 2, body: { root: { x: -6 }, spine: { r: -6 }, chest: { r: -2 }, head: { r: 3 }, upper: { r: -148 }, fore: { r: -72 }, hand: { r: 40 },
          farUpper: { r: -22 }, farFore: { r: -30 }, hair: { r: -2 } },
        legs: { near: { forward: 4, knee: 14 }, far: { forward: -8, knee: 16 } } },
      { f: 3, body: { root: { x: -7 }, spine: { r: -7 }, chest: { r: -2 }, head: { r: 3 }, upper: { r: -155 }, fore: { r: -78 }, hand: { r: 46 },
          farUpper: { r: -24 }, farFore: { r: -32 }, hair: { r: -2 } },
        legs: { near: { forward: 5, knee: 15 }, far: { forward: -8, knee: 16 } } },
      { f: 5, body: { root: { x: 6 }, spine: { r: 4 }, head: { r: 0 }, upper: { r: -118 }, fore: { r: -18 }, hand: { r: 18 },
          farUpper: { r: 4 }, farFore: { r: -40 } },
        legs: { near: { forward: 14, knee: 15 }, far: { forward: -12, knee: 10 } } },
      { f: 6, ease: "in", body: { root: { x: 17 }, spine: { r: 11 }, chest: { r: 2 }, head: { r: -6 }, upper: { r: -62 }, fore: { r: 10 }, hand: { r: -18 },
          farUpper: { r: 20 }, farFore: { r: -55 }, hair: { r: 3 } },
        legs: { near: { forward: 20, knee: 18 }, far: { forward: -16, knee: 8 } } },
      { f: 7, body: { root: { x: 18 }, spine: { r: 13 }, chest: { r: 2 }, head: { r: -7 }, upper: { r: -40 }, fore: { r: 14 }, hand: { r: -30 },
          farUpper: { r: 22 }, farFore: { r: -58 }, hair: { r: 7 } },
        legs: { near: { forward: 21, knee: 19 }, far: { forward: -16, knee: 8 } } },
      { f: 9, body: { root: { x: 14 }, spine: { r: 8 }, head: { r: -4 }, upper: { r: -32 }, fore: { r: 2 }, hand: { r: -12 },
          farUpper: { r: 12 }, farFore: { r: -36 }, hair: { r: 4 } },
        legs: { near: { forward: 15, knee: 13 }, far: { forward: -12, knee: 6 } } },
      { f: 11, body: { root: { x: 4 }, spine: { r: 2 }, head: { r: -1 }, upper: { r: -10 }, fore: { r: -8 }, hand: { r: 0 },
          farUpper: { r: 3 }, farFore: { r: -8 }, hair: { r: 1 } },
        legs: { near: { forward: 4, knee: 6 }, far: { forward: -4, knee: 6 } } },
    ]),
  },
};

// A clip's moment as the whole skeleton's pose: the body as given, the
// legs solved from the feet.
function poseAt(sk, B, clip, t) {
  const p = clip.pose(t, sk);
  const pose = Object.assign({}, p.body);
  const chains = [["near", ["thigh", "shin", "foot"]], ["far", ["farThigh", "farShin", "farFoot"]]];
  if (p.legs) {
    // Swung from the hip, then lowered (or raised) until the lower foot
    // stands on the ground. The foot follows half the shin's turn, so it
    // points down as the leg trails and lifts its toes as it reaches.
    for (const [key, [tn, sn, fn]] of chains) {
      const l = p.legs[key];
      pose[tn] = { r: -l.forward };
      pose[sn] = { r: l.knee };
      pose[fn] = { r: -0.5 * (l.knee - l.forward) };
    }
    pose.root = Object.assign({}, pose.root, { y: 0 });
    let W = solve(B, pose), low = -Infinity;
    for (const [, [, , fn]] of chains) {
      const F = W[fn], fb = B.by[fn];
      for (const q of [sk.joints.heel, sk.joints.ball, sk.joints.toe]) {
        const [dx, dy] = rot(q[0] - fb.head[0], q[1] - fb.head[1], F.A);
        low = Math.max(low, F.H[1] + dy);
      }
    }
    pose.root.y = sk.ground - low;
    return solve(B, pose);
  }
  const W = solve(B, pose);
  const hip = W.root.H, A = W.root.A;
  for (const [key, names] of chains) {
    const f = p.feet[key];
    const ankle = f.ankle || footAt(sk, f.pivot, f.at, f.turn);
    Object.assign(pose, legIK(B, hip, ankle, A, names, f.turn));
  }
  return solve(B, pose);
}

// ---------------------------------------------------------------
// The sheets.
// ---------------------------------------------------------------
function buildRig(sk, stillFile) {
  const img = loadStill(stillFile, sk);
  const tex = buildTextures(sk, img);
  const B = buildBones(sk);
  const grid = 5;
  const meshes = {
    arm: buildMesh(tex.arm, img.W, img.H, B, ["upper", "fore", "hand"], grid),
    leg: buildMesh(tex.leg, img.W, img.H, B, ["thigh", "shin", "foot"], grid),
    body: buildMesh(tex.body, img.W, img.H, B, ["root", "spine", "chest", "head", "hair"], grid),
  };
  const layer = (m, t, bones, shade) => ({
    mesh: meshes[m], tex: tex[t], W: img.W, H: img.H, bones, shade,
    boneRest: bones.map((n) => B.by[n]),
  });
  // Back to front.
  const layers = [
    layer("arm", "arm", ["farUpper", "farFore", "farHand"], sk.farShade),
    layer("leg", "leg", ["farThigh", "farShin", "farFoot"], sk.farShade),
    layer("leg", "leg", ["thigh", "shin", "foot"], 1),
    layer("body", "body", ["root", "spine", "chest", "head", "hair"], 1),
    layer("arm", "arm", ["upper", "fore", "hand"], 1),
  ];
  const props = {};
  for (const name of Object.keys(sk.props || {})) props[name] = loadProp(sk, name);
  return { img, tex, B, layers, props };
}

function renderFrame(sk, rig, world, clip, t) {
  const ss = OUT.supersample, cell = cellOf(clip);
  const CW = cell.w * ss, CH = cell.h * ss;
  const map = cellMap(sk, clip, ss);
  const canvas = new Float32Array(CW * CH * 4);
  // The prop goes in the near hand: over the body, under the fingers.
  rig.layers.forEach((l, i) => {
    if (i === rig.layers.length - 1 && clip && clip.prop) drawProp(canvas, CW, CH, rig.props[clip.prop], propAt(sk, world, clip.prop), map);
    drawLayer(canvas, CW, CH, l, world, map);
  });
  if (clip && clip.arc) {
    const f = Math.round(t * clip.frames);
    if (f >= clip.arc[0] && f <= clip.arc[1]) drawArc(canvas, CW, CH, sk, rig, clip, t, map);
  }
  // Averaged down to the sheet's size, and back to straight colour.
  const w = cell.w, h = cell.h, out = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let dy = 0; dy < ss; dy++) {
        for (let dx = 0; dx < ss; dx++) {
          const i = ((y * ss + dy) * CW + x * ss + dx) * 4;
          r += canvas[i]; g += canvas[i + 1]; b += canvas[i + 2]; a += canvas[i + 3];
        }
      }
      const o = (y * w + x) * 4;
      if (a > 0) {
        out[o] = clamp(Math.round(r / a * 255), 0, 255);
        out[o + 1] = clamp(Math.round(g / a * 255), 0, 255);
        out[o + 2] = clamp(Math.round(b / a * 255), 0, 255);
      }
      out[o + 3] = clamp(Math.round(a / (ss * ss) * 255), 0, 255);
    }
  }
  return out;
}

function writeClip(sk, rig, name, outDir, ship) {
  const clip = CLIPS[name], cell = cellOf(clip);
  const cols = Math.min(clip.frames, 8), rows = Math.ceil(clip.frames / cols);
  const SW = cell.w * cols, SH = cell.h * rows;
  const sheet = new Uint8Array(SW * SH * 4);
  let top = cell.h, bottom = 0, edge = false;
  for (let f = 0; f < clip.frames; f++) {
    const world = poseAt(sk, rig.B, clip, f / clip.frames);
    const px = renderFrame(sk, rig, world, clip, f / clip.frames);
    const ox = (f % cols) * cell.w, oy = Math.floor(f / cols) * cell.h;
    for (let y = 0; y < cell.h; y++) {
      for (let x = 0; x < cell.w; x++) {
        const s = (y * cell.w + x) * 4, d = ((oy + y) * SW + ox + x) * 4;
        for (let k = 0; k < 4; k++) sheet[d + k] = px[s + k];
        if (px[s + 3] > 0) {
          top = Math.min(top, y); bottom = Math.max(bottom, y + 1);
          if (x === 0 || y === 0 || x === cell.w - 1) edge = true;
        }
      }
    }
  }
  // Something drawn on the cell's edge has been cut off by it.
  if (edge) console.warn(`  ${name}: drawn to the edge of its cell; give the clip a bigger cell`);
  const file = path.join(outDir, `${sk.name}-${name}.png`);
  fs.writeFileSync(file, encodePng(SW, SH, sheet));
  if (ship) {
    const game = path.join(ROOT, "assets", "sprites", "player", `${sk.name}-${name}.png`);
    writeSheet(game, SW, SH, sheet);
    console.log("  shipped " + path.relative(ROOT, game).replace(/\\/g, "/"));
  }
  return {
    name, file: path.relative(ROOT, file).replace(/\\/g, "/"),
    frames: clip.frames, fps: clip.fps, columns: cols,
    // Every clip is fitted by the standing figure, not by its own frames,
    // so he is one size whatever he does and a foot carried back at the
    // ground's speed in the clip moves at it on screen too. drawnTop is
    // the highest anything is drawn, for checking it stays in the cell.
    contentTop: cell.groundY - OUT.figure, contentHeight: OUT.figure, footX: cell.anchorX,
    // A taller cell keeps what is drawn above his head (the raised blade)
    // as headroom, which game.js draws instead of cropping.
    ...(cell.groundY - OUT.figure > 0 && cellOf(null).groundY !== cell.groundY ? { headroom: cell.groundY - OUT.figure } : {}),
    drawnTop: top, drawnBottom: bottom,
    cellW: cell.w, cellH: cell.h,
    ...clipExtras(sk, rig, clip),
  };
}

// A clip's cell: the shared one, or its own for a move that reaches
// further (the slash's blade over his head and out in front).
function cellOf(clip) {
  const c = (clip && clip.cell) || {};
  return { w: c.w || OUT.cellW, h: c.h || OUT.cellH, anchorX: c.anchorX || OUT.anchorX, groundY: c.groundY || OUT.groundY };
}

// Where a point of the working picture lands in a sheet's cell, times k
// (the supersampling while drawing, 1 for the sheet itself).
function cellMap(sk, clip, k = 1) {
  const cell = cellOf(clip);
  const height = sk.ground - sk.joints.headTop[1] + 17;   // the top of his hair, not the joint
  const scale = OUT.figure / height * k;
  return (x, y) => [(x - sk.joints.hip[0]) * scale + cell.anchorX * k, (y - sk.ground) * scale + cell.groundY * k];
}

// A held prop (the itak): where its grip, its middle and its point are
// now, in the working picture, carried by its bone. The prop is drawn
// pointing right with its handle at the left; at rest it points angle
// degrees below level, handle (a fraction of length) behind the grip.
function propAt(sk, world, name) {
  const p = sk.props[name], b = world[p.bone], rest = sk.joints[p.bone === "hand" ? "wrist" : p.bone];
  const bone = { head: rest };
  const [gx, gy] = rot(p.grip[0] - bone.head[0], p.grip[1] - bone.head[1], b.A);
  const grip = [b.H[0] + gx, b.H[1] + gy];
  const a = rad(p.angle) + b.A, dir = [Math.cos(a), Math.sin(a)];
  const at = (k) => [grip[0] + dir[0] * p.length * k, grip[1] + dir[1] * p.length * k];
  return { grip, angle: a, butt: at(-p.handle), mid: at((1 - p.handle) * 0.4), tip: at(1 - p.handle), def: p };
}

// The prop's picture laid along it, sampled between pixels. Nothing is
// drawn while the picture is owed: no stand-in of ours (CLAUDE.md, no art
// that is not the artist's).
function drawProp(canvas, CW, CH, pic, prop, map) {
  if (!pic) return;
  const [bx, by] = map(...prop.butt), [tx, ty] = map(...prop.tip.map((v, i) => v + (prop.tip[i] - prop.butt[i]) * prop.def.handle / (1 - prop.def.handle)));
  const len = Math.hypot(tx - bx, ty - by), k = len / pic.width;
  const ux = (tx - bx) / len, uy = (ty - by) / len;   // along the prop
  const vx = -uy, vy = ux;                            // across it
  const half = pic.height * k / 2;
  const xs = [bx + vx * half, bx - vx * half, tx + vx * half, tx - vx * half];
  const ys = [by + vy * half, by - vy * half, ty + vy * half, ty - vy * half];
  const s = [0, 0, 0, 0];
  for (let y = Math.max(0, Math.floor(Math.min(...ys))); y <= Math.min(CH - 1, Math.ceil(Math.max(...ys))); y++) {
    for (let x = Math.max(0, Math.floor(Math.min(...xs))); x <= Math.min(CW - 1, Math.ceil(Math.max(...xs))); x++) {
      const dx = x + 0.5 - bx, dy = y + 0.5 - by;
      const u = (dx * ux + dy * uy) / k, v = (dx * vx + dy * vy) / k + pic.height / 2;
      if (u < 0 || v < 0 || u >= pic.width || v >= pic.height) continue;
      sample(pic.px, pic.width, pic.height, u, v, s);
      if (s[3] <= 0.001) continue;
      const i = (y * CW + x) * 4, q = 1 - s[3];
      canvas[i] = s[0] + canvas[i] * q; canvas[i + 1] = s[1] + canvas[i + 1] * q;
      canvas[i + 2] = s[2] + canvas[i + 2] * q; canvas[i + 3] = s[3] + canvas[i + 3] * q;
    }
  }
}

// The pale arc behind a swung blade: the band between the prop's middle
// and its point over the last frame and a half, fading with age.
function drawArc(canvas, CW, CH, sk, rig, clip, t, map) {
  const steps = 8, back = 1.5 / clip.frames;
  const at = [];
  for (let i = 0; i <= steps; i++) {
    const w = poseAt(sk, rig.B, clip, Math.max(0, t - back * (1 - i / steps)));
    const p = propAt(sk, w, clip.prop);
    at.push({ mid: map(...p.mid), tip: map(...p.tip) });
  }
  for (let i = 1; i <= steps; i++) {
    const quad = [at[i - 1].mid, at[i - 1].tip, at[i].tip, at[i].mid];
    const alpha = 0.55 * Math.pow(i / steps, 1.4);
    const xs = quad.map((q) => q[0]), ys = quad.map((q) => q[1]);
    for (let y = Math.max(0, Math.floor(Math.min(...ys))); y <= Math.min(CH - 1, Math.ceil(Math.max(...ys))); y++) {
      for (let x = Math.max(0, Math.floor(Math.min(...xs))); x <= Math.min(CW - 1, Math.ceil(Math.max(...xs))); x++) {
        if (!inPoly(quad, x + 0.5, y + 0.5)) continue;
        const j = (y * CW + x) * 4, q = 1 - alpha;
        canvas[j] = alpha * 1.0 + canvas[j] * q; canvas[j + 1] = alpha * 0.98 + canvas[j + 1] * q;
        canvas[j + 2] = alpha * 0.91 + canvas[j + 2] * q; canvas[j + 3] = alpha + canvas[j + 3] * q;
      }
    }
  }
}

function loadProp(sk, name) {
  const p = sk.props && sk.props[name];
  const file = p && path.join(ROOT, p.src);
  if (!p || !fs.existsSync(file)) return null;
  const png = decodePng(file), px = new Float32Array(png.width * png.height * 4);
  for (let i = 0; i < png.width * png.height; i++) {
    const a = png.rgba[i * 4 + 3] / 255;
    px[i * 4] = png.rgba[i * 4] / 255 * a; px[i * 4 + 1] = png.rgba[i * 4 + 1] / 255 * a;
    px[i * 4 + 2] = png.rgba[i * 4 + 2] / 255 * a; px[i * 4 + 3] = a;
  }
  return { width: png.width, height: png.height, px };
}

// What game.js needs beyond the frames: the punch's contact frame, the
// shot's two parts and its muzzle, the jump's three parts.
function clipExtras(sk, rig, clip) {
  const x = {};
  if (clip.loop === false) x.loop = false;
  if (clip.contact != null) x.contact = clip.contact;
  for (const k of ["aim", "fire", "rise", "fall", "land"]) if (clip[k]) x[k] = clip[k];
  if (clip.fireFps) x.fireFps = clip.fireFps;
  if (clip.muzzleFrame != null) {
    const W = poseAt(sk, rig.B, clip, clip.muzzleFrame / clip.frames), h = rig.B.by.hand;
    const [dx, dy] = rot(h.tail[0] - h.head[0], h.tail[1] - h.head[1], W.hand.A);
    const [mx, my] = cellMap(sk, clip)(W.hand.H[0] + dx, W.hand.H[1] + dy);
    x.muzzle = { x: Math.round(mx), y: Math.round(my) };
  }
  return x;
}

// The working picture with the bones and the outlines drawn on, four
// times its size, and each layer's picture, for checking by eye.
function writeDebug(sk, rig, outDir) {
  const { img, tex, B } = rig;
  const s = 3, W = img.W * s, H = img.H * s;
  const pic = (src, file, marks) => {
    const out = new Uint8Array(W * H * 4);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (Math.floor(y / s) * img.W + Math.floor(x / s)) * 4, o = (y * W + x) * 4;
        const a = src[i + 3], bg = ((x >> 4) + (y >> 4)) & 1 ? 70 : 90;
        for (let k = 0; k < 3; k++) out[o + k] = Math.round(src[i + k] * 255 + bg * (1 - a));
        out[o + 3] = 255;
      }
    }
    const dot = (x, y, c) => {
      x = Math.round(x * s); y = Math.round(y * s);
      if (x >= 0 && y >= 0 && x < W && y < H) { const o = (y * W + x) * 4; out[o] = c[0]; out[o + 1] = c[1]; out[o + 2] = c[2]; }
    };
    const line = (a, b, c) => {
      const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * s);
      for (let k = 0; k <= n; k++) dot(lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n), c);
    };
    if (marks) {
      for (const poly of [[sk.arm, [0, 255, 255]], [sk.leg, [255, 0, 255]]]) {
        for (let k = 0; k < poly[0].length; k++) line(poly[0][k], poly[0][(k + 1) % poly[0].length], poly[1]);
      }
      for (const b of B.bones) if (!b.name.startsWith("far")) line(b.head, b.tail, [255, 255, 0]);
      for (const p of Object.values(sk.joints)) {
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) dot(p[0] + dx / s, p[1] + dy / s, [255, 40, 40]);
      }
      line([0, sk.ground], [img.W, sk.ground], [0, 255, 0]);
    }
    fs.writeFileSync(path.join(outDir, file), encodePng(W, H, out));
  };
  pic(img.px, `${sk.name}-debug-still.png`, true);
  pic(tex.body, `${sk.name}-debug-body.png`, false);
  pic(tex.arm, `${sk.name}-debug-arm.png`, false);
  pic(tex.leg, `${sk.name}-debug-leg.png`, false);
}

function main() {
  const args = process.argv.slice(2);
  const name = args.find((a) => !a.startsWith("--"));
  if (!name) { console.error("usage: node _dev/tools/skeleton.js <name> [--debug] [--still=<png>]"); process.exit(1); }
  const sk = Object.assign({ name }, require(path.join(ROOT, "_dev", "player-lab", name + ".js")));
  const stillArg = args.find((a) => a.startsWith("--still="));
  const still = path.join(ROOT, stillArg ? stillArg.slice(8) : sk.still);
  if (stillArg) sk.name = path.basename(still, ".png");
  const outDir = path.join(ROOT, sk.out);
  fs.mkdirSync(outDir, { recursive: true });
  const rig = buildRig(sk, still);
  if (args.includes("--debug")) {
    writeDebug(sk, rig, outDir);
    console.log("debug pictures in " + sk.out);
    return;
  }
  const ship = args.includes("--ship") ? sk.ship || [] : [];
  const report = sk.clips.map((c) => writeClip(sk, rig, c, outDir, ship.includes(c)));
  fs.writeFileSync(path.join(outDir, `${sk.name}.json`), JSON.stringify(report, null, 2));
  for (const r of report) {
    console.log(`${r.name}: ${r.file}  frames ${r.frames}, fps ${r.fps}, columns ${r.columns}, ` +
      `contentTop ${r.contentTop}, contentHeight ${r.contentHeight}, footX ${r.footX}`);
  }
}

if (require.main === module) main();

module.exports = { CLIPS, OUT, GAME };
