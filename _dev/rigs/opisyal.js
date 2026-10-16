// =============================================================
// MACARIO — _dev/rigs/opisyal.js
//
// The Opisyal (Block 135), the American officer at the plaza's table in
// Act III: the artist's still, delivered on black (Act3_Opisyales.png),
// keyed with key-still.js. Side on, facing right, standing (the script
// has him seated: he stands behind the table), his gloves in his hand.
// Idle only.
// How to read a rig: _dev/rigs/siga-2.js.
//
// Run:  node _dev/tools/animate-still.js opisyal
// =============================================================

module.exports = {
  still: "assets/sprites/characters/opisyal-still.png",
  mirror: false,
  scale: 0.55,

  top: 4,
  ground: 543,
  footX: 63,
  soles: [23, 118],

  joints: {
    neck: [80, 88],
    shoulder: [55, 115],
    elbow: [55, 210],
    fist: [70, 310],
    hip: [70, 335],
    knee: [65, 415],
  },

  cuts: {
    headBottom: 95,
    torsoTop: 88,
    torsoBottom: 340,
    legTop: 330,
    thighBottom: 427,
    shinTop: 409,
  },

  outlines: {
  },

  sheets: [
    { file: "opisyal.png", motion: "idle" },
  ],
};
