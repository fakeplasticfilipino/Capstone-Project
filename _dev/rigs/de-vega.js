// =============================================================
// MACARIO — _dev/rigs/de-vega.js
//
// Lucio de Vega (Block 149), in Act IV: the proponent's picture of 25
// Oct 2026 (de-vega-at-taga-cavite.png, the first of two; the first
// pair, drawn mid-stride, did not fit), cut out and shrunk to 548 tall.
// Side on, facing right, standing, a worn plain uniform. He stands with
// Macario to the end and walks to the scaffold: idle and walk.
// How to read a rig: _dev/rigs/siga-2.js.
//
// Run:  node _dev/tools/animate-still.js de-vega
// =============================================================

module.exports = {
  still: "_dev/stills/characters/de-vega-still.png",
  mirror: false,
  scale: 0.55,

  top: 3,
  ground: 544,
  footX: 52,
  soles: [20, 112],

  joints: {
    neck: [85, 78],
    shoulder: [50, 115],
    elbow: [45, 200],
    fist: [30, 320],
    hip: [60, 300],
    knee: [60, 410],
  },

  cuts: {
    headBottom: 84,
    torsoTop: 76,
    torsoBottom: 300,
    legTop: 290,
    thighBottom: 422,
    shinTop: 404,
  },

  outlines: {
  },

  sheets: [
    { file: "de-vega.png", motion: "idle" },
    { file: "de-vega-walk.png", motion: "walk" },
  ],
};
