// =============================================================
// MACARIO — _dev/rigs/guro.js
//
// The Guro (Block 135), the teacher at Calle Gunao in Act III: the
// artist's still, delivered on black (guro.png), keyed with key-still.js.
// Side on, facing right, a book held to his chest. He stands and talks:
// idle only.
// How to read a rig: _dev/rigs/siga-2.js.
//
// Run:  node _dev/tools/animate-still.js guro
// =============================================================

module.exports = {
  still: "_dev/stills/characters/guro-still.png",
  mirror: false,
  scale: 0.55,

  top: 7,
  ground: 543,
  footX: 85,
  soles: [52, 164],

  joints: {
    neck: [92, 78],
    shoulder: [70, 105],
    elbow: [70, 190],
    fist: [90, 210],
    hip: [70, 295],
    knee: [70, 420],
  },

  cuts: {
    headBottom: 85,
    torsoTop: 78,
    torsoBottom: 300,
    legTop: 290,
    thighBottom: 432,
    shinTop: 414,
  },

  outlines: {
  },

  sheets: [
    { file: "guro.png", motion: "idle" },
  ],
};
