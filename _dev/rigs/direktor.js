// =============================================================
// MACARIO — _dev/rigs/direktor.js
//
// The direktor of the theatre company (Block 98): the artist's still of
// an old man with a white beard in a salakot and an embroidered camisa,
// a book (the play) under one arm and a cane in the other hand, blue
// trousers and sandals. He never walks in Act I and his hands are both
// full, so he only breathes and nods (the breathe motion): no sway, which
// would lift the cane off the ground, and no arm parts. Rig for
// _dev/tools/animate-still.js; how to read it: _dev/rigs/siga-2.js and
// CLAUDE.md, Animating a character from one still.
//
// The still faces left, so mirror is true and every coordinate is in
// the MIRRORED still, read off zoomed crops with a 10px grid.
//
// Run:  node _dev/tools/animate-still.js direktor
// =============================================================

module.exports = {
  still: "assets/sprites/characters/direktor-still.png",
  mirror: true,
  scale: 0.75,

  top: 7,                  // the point of the salakot
  ground: 557,             // his soles
  footX: 505,              // the middle of his feet
  soles: [450, 560],

  joints: {
    neck: [505, 112],      // the head, the salakot and the beard nod
    shoulder: [470, 140],  // unused: no arm parts
    elbow: [470, 230],
    fist: [590, 275],
    hip: [505, 340],
    knee: [510, 430],
  },

  cuts: {
    headBottom: 128,       // the beard runs down over the collar
    torsoTop: 108,
    torsoBottom: 322,      // the camisa's hem; the cane is cut here too,
    legTop: 312,           // and the breath stretches only above it
    thighBottom: 440,
    shinTop: 424,
  },

  // No sleeve or arm: his hands hold the book and the cane, and stay.
  outlines: {},

  sheets: [
    { file: "direktor.png", motion: "breathe" },
  ],
};
