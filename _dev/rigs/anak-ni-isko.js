// =============================================================
// MACARIO — _dev/rigs/anak-ni-isko.js
//
// Isko's son (Block 149), about seven, in Act IV: the proponent's
// picture of 25 Oct 2026 (mag-ina.png, the second of two), cut out and
// shrunk to 548 tall. Side on, facing right, barefoot, a camisa and
// short trousers. He stands by his father: idle only. The content draws
// him at 80 tall (displayHeight), a little over half a man.
// How to read a rig: _dev/rigs/siga-2.js.
//
// Run:  node _dev/tools/animate-still.js anak-ni-isko
// =============================================================

module.exports = {
  still: "_dev/stills/characters/anak-ni-isko-still.png",
  mirror: false,
  scale: 0.55,

  top: 4,
  ground: 542,
  footX: 60,
  soles: [28, 118],

  joints: {
    neck: [92, 104],
    shoulder: [55, 150],
    elbow: [55, 250],
    fist: [75, 335],
    hip: [65, 300],
    knee: [65, 430],
  },

  cuts: {
    headBottom: 112,
    torsoTop: 104,
    torsoBottom: 290,
    legTop: 280,
    thighBottom: 440,
    shinTop: 422,
  },

  outlines: {
  },

  sheets: [
    { file: "anak-ni-isko.png", motion: "idle" },
  ],
};
