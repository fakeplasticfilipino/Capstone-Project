// =============================================================
// MACARIO — _dev/rigs/taga-cavite.js
//
// The woman from Cavite (Block 149), in Act IV, who brings rice to the
// camp: the proponent's picture of 25 Oct 2026 (de-vega-at-taga-cavite.png,
// the second of two; the first, drawn mid-stride, did not fit), cut out
// and shrunk to 548 tall. Side on, facing right, standing, a baro't saya,
// the bundle of rice at her side. She walks on and stands: idle and
// walk, the short step under a long skirt (stride, Nanay's).
// How to read a rig: _dev/rigs/siga-2.js.
//
// Run:  node _dev/tools/animate-still.js taga-cavite
// =============================================================

module.exports = {
  still: "_dev/stills/characters/taga-cavite-still.png",
  mirror: false,
  scale: 0.55,
  stride: 0.35,

  top: 3,
  ground: 544,
  footX: 65,
  soles: [28, 108],

  joints: {
    neck: [95, 88],
    shoulder: [70, 130],
    elbow: [65, 210],
    fist: [65, 330],
    hip: [70, 330],
    knee: [70, 430],
  },

  cuts: {
    headBottom: 94,
    torsoTop: 86,
    torsoBottom: 336,
    legTop: 322,
    thighBottom: 440,
    shinTop: 425,
  },

  outlines: {
  },

  sheets: [
    { file: "taga-cavite.png", motion: "idle" },
    { file: "taga-cavite-walk.png", motion: "walk" },
  ],
};
