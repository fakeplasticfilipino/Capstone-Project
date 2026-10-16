// =============================================================
// MACARIO — _dev/rigs/poblete.js
//
// Pascual Poblete (Block 135, replacing Block 133's mid-stride still), in
// Act III: the artist's second still, delivered on black
// (Act3_PacualPoblete2.png), keyed with key-still.js. Side on, facing
// right, standing, a long coat and a book in his hand. He walks in with
// the Sedition Law and stands to talk: idle and walk, the coat's skirt
// cloth over the legs.
// How to read a rig: _dev/rigs/siga-2.js.
//
// Run:  node _dev/tools/animate-still.js poblete
// =============================================================

module.exports = {
  still: "assets/sprites/characters/poblete-still.png",
  mirror: false,
  scale: 0.55,

  top: 4,
  ground: 543,
  footX: 95,
  soles: [52, 158],

  joints: {
    neck: [106, 79],
    shoulder: [75, 110],
    elbow: [75, 200],
    fist: [85, 280],
    hip: [85, 300],
    knee: [85, 440],
  },

  cuts: {
    headBottom: 86,
    torsoTop: 80,
    torsoBottom: 300,
    legTop: 290,
    thighBottom: 445,
    shinTop: 427,
  },

  outlines: {
    overLegs: [
      [[20, 298], [160, 298], [160, 388], [20, 388]],
    ],
  },

  sheets: [
    { file: "poblete.png", motion: "idle" },
    { file: "poblete-walk.png", motion: "walk" },
  ],
};
