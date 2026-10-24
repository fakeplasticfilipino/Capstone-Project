// =============================================================
// MACARIO — _dev/rigs/montalan.js
//
// Julian Montalan (Block 133), the Katagalugan's general in Acts III and
// IV: the artist's still, delivered on black (Act3_JuianMontalan.png,
// 1024 by 1536), keyed and shrunk to 548 tall as Block 129's were. Side
// on, facing right, a bolo held low in his near hand. He stands, and
// comes up behind Macario in the fights: idle and walk. The hand and the
// hilt stay on his body; the blade, which crosses his trousers, is cloth
// over the legs, filled where it crosses them and clear beyond them, so
// it does not break off when a leg moves (CLAUDE.md, Animating a
// character from one still). How to read a rig: _dev/rigs/siga-2.js.
// Coordinates off a 10px grid at twice.
//
// Run:  node _dev/tools/animate-still.js montalan
// =============================================================

module.exports = {
  still: "_dev/stills/characters/montalan-still.png",
  mirror: false,
  scale: 0.55,

  top: 2,                  // the top of his hair
  ground: 539,             // his soles
  footX: 64,               // the middle of his ankles
  soles: [23, 135],

  joints: {
    neck: [85, 92],
    shoulder: [50, 120],   // unused: no arm parts
    elbow: [45, 200],
    fist: [45, 290],
    hip: [60, 300],
    knee: [55, 420],
  },

  cuts: {
    headBottom: 98,
    torsoTop: 90,
    torsoBottom: 302,      // his hand and the bolo's hilt stay on him
    legTop: 292,
    thighBottom: 432,
    shinTop: 414,
  },

  outlines: {
    overLegs: [
      // The blade over his trousers.
      [[36, 296], [60, 286], [95, 330], [106, 360], [106, 405], [95, 398], [70, 360], [38, 312]],
      // Its point, clear of them.
      { clear: true, outline: [[106, 352], [119, 385], [129, 417], [115, 418], [106, 406]] },
    ],
  },

  // Written beside the still. Content: content/people.js (MONTALAN).
  sheets: [
    { file: "montalan.png", motion: "idle" },
    { file: "montalan-walk.png", motion: "walk" },
  ],
};
