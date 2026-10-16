// =============================================================
// MACARIO — _dev/rigs/bagong-nakatira.js
//
// The Bagong Nakatira (Block 135), the stranger living in Nanay's house
// in Act III: the artist's still, delivered on black
// (Act3_BagongNakatira.png), keyed with key-still.js. Side on, facing
// right, a long skirt and a bundle at her hip. She stands and talks:
// idle only, her hands and the bundle on her body; stride is Nanay's.
// How to read a rig: _dev/rigs/siga-2.js.
//
// Run:  node _dev/tools/animate-still.js bagong-nakatira
// =============================================================

module.exports = {
  still: "assets/sprites/characters/bagong-nakatira-still.png",
  mirror: false,
  scale: 0.55,

  top: 4,
  ground: 543,
  footX: 80,
  soles: [41, 125],
  stride: 0.35,

  joints: {
    neck: [81, 82],
    shoulder: [70, 110],
    elbow: [75, 200],
    fist: [85, 300],
    hip: [80, 335],
    knee: [85, 440],
  },

  cuts: {
    headBottom: 87,
    torsoTop: 80,
    torsoBottom: 340,
    legTop: 330,
    thighBottom: 452,
    shinTop: 434,
  },

  outlines: {
  },

  sheets: [
    { file: "bagong-nakatira.png", motion: "idle" },
  ],
};
