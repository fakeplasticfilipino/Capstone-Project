// =============================================================
// MACARIO — _dev/rigs/villafuerte.js
//
// León Villafuerte (Block 149), in Act IV: the proponent's picture of
// 25 Oct 2026 (mga-opisyal.png, the first of two), cut out and shrunk to
// 548 tall. Side on, facing right, a dark uniform with a sash whose
// fringed end hangs at his hip. He stands beside Macario and talks: idle
// only, the sash's end cloth over the legs.
// How to read a rig: _dev/rigs/siga-2.js.
//
// Run:  node _dev/tools/animate-still.js villafuerte
// =============================================================

module.exports = {
  still: "_dev/stills/characters/villafuerte-still.png",
  mirror: false,
  scale: 0.55,

  top: 3,
  ground: 544,
  footX: 57,
  soles: [24, 116],

  joints: {
    neck: [72, 76],
    shoulder: [45, 110],
    elbow: [45, 200],
    fist: [62, 305],
    hip: [55, 300],
    knee: [55, 410],
  },

  cuts: {
    headBottom: 82,
    torsoTop: 74,
    torsoBottom: 300,
    legTop: 290,
    thighBottom: 422,
    shinTop: 404,
  },

  outlines: {
    // The sash's fringed end, hanging past the tunic.
    overLegs: [[[0, 290], [64, 290], [64, 346], [0, 346]]],
  },

  sheets: [
    { file: "villafuerte.png", motion: "idle" },
  ],
};
