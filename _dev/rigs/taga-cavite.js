// =============================================================
// MACARIO — _dev/rigs/taga-cavite.js
//
// The woman from Cavite (Block 149), in Act IV, who brings rice to the
// camp: the proponent's picture of 25 Oct 2026 (mag-ina.png, the first
// of two), cut out and shrunk to 548 tall. Side on, facing right, a
// faded baro't saya, a bundle of rice in her hand, drawn mid-stride
// under a long skirt. She walks on and stands: standing she only
// breathes, and she walks by the march with the legs cut below the
// skirt's hem (legTop), so only her feet step and the skirt stays whole.
// How to read a rig: _dev/rigs/siga-2.js.
//
// Run:  node _dev/tools/animate-still.js taga-cavite
// =============================================================

module.exports = {
  still: "_dev/stills/characters/taga-cavite-still.png",
  mirror: false,
  scale: 0.55,

  top: 3,
  ground: 544,
  footX: 140,
  soles: [5, 278],
  legSplit: 140,

  joints: {
    neck: [160, 100],
    shoulder: [125, 140],
    elbow: [125, 230],
    fist: [140, 320],
    hip: [140, 470],
    knee: [140, 505],
  },

  cuts: {
    headBottom: 108,
    torsoTop: 100,
    torsoBottom: 488,
    legTop: 478,
    thighBottom: 515,
    shinTop: 505,
  },

  outlines: {
  },

  sheets: [
    { file: "taga-cavite.png", motion: "breathe" },
    { file: "taga-cavite-walk.png", motion: "march" },
  ],
};
