// =============================================================
// MACARIO — _dev/rigs/gomez.js
//
// Dominador Gómez (Block 151), in Act IV: the artist's still from the
// Drive (DominadorGomez.png, 17 Oct 2026), on black, keyed with
// key-still.js. Side on, facing right, standing, a white suit and a hat,
// a book in his hand. He walks into the camp and stands to talk: idle
// and walk.
// How to read a rig: _dev/rigs/siga-2.js.
//
// Run:  node _dev/tools/animate-still.js gomez
// =============================================================

module.exports = {
  still: "_dev/stills/characters/gomez-still.png",
  mirror: false,
  scale: 0.55,

  top: 4,
  ground: 544,
  footX: 55,
  soles: [11, 112],

  joints: {
    neck: [75, 95],
    shoulder: [40, 125],
    elbow: [40, 210],
    fist: [60, 285],
    hip: [55, 290],
    knee: [55, 410],
  },

  cuts: {
    headBottom: 100,
    torsoTop: 92,
    torsoBottom: 302,
    legTop: 292,
    thighBottom: 422,
    shinTop: 404,
  },

  outlines: {
  },

  sheets: [
    { file: "gomez.png", motion: "idle" },
    { file: "gomez-walk.png", motion: "walk" },
  ],
};
