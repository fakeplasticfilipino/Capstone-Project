// =============================================================
// MACARIO — _dev/rigs/de-vega.js
//
// Lucio de Vega (Block 149), in Act IV: the proponent's picture of 25
// Oct 2026 (mga-opisyal.png, the second of two), cut out and shrunk to
// 548 tall. Side on, facing right, a worn plain uniform, drawn
// mid-stride. He stands with Macario to the end and walks to the
// scaffold: drawn walking, he only breathes standing (as Poblete's
// mid-stride still did), and walks by the march, each leg cut apart at
// legSplit and lifted in turn.
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
  footX: 140,
  soles: [5, 278],
  legSplit: 140,

  joints: {
    neck: [150, 80],
    shoulder: [110, 120],
    elbow: [100, 210],
    fist: [75, 315],
    hip: [140, 300],
    knee: [140, 420],
  },

  cuts: {
    headBottom: 88,
    torsoTop: 80,
    torsoBottom: 300,
    legTop: 290,
    thighBottom: 432,
    shinTop: 414,
  },

  outlines: {
  },

  sheets: [
    { file: "de-vega.png", motion: "breathe" },
    { file: "de-vega-walk.png", motion: "march" },
  ],
};
