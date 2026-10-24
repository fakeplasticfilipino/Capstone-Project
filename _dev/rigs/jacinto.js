// =============================================================
// MACARIO — _dev/rigs/jacinto.js
//
// Emilio Jacinto (Block 133), the Katipunan's writer, in Act II: the
// artist's still, delivered on black (Emilio_Jacinto.png, 1024 by 1536;
// a second, Emilio_Jacinto2.jpg, is kept aside), keyed and shrunk to
// 548 tall as Block 129's were. Side on, facing right, a book under his
// near hand. He stands and talks: idle only, his hand and the book
// kept on his body. How to read a rig: _dev/rigs/siga-2.js.
//
// Run:  node _dev/tools/animate-still.js jacinto
// =============================================================

module.exports = {
  still: "_dev/stills/characters/jacinto-still.png",
  mirror: false,
  scale: 0.55,

  top: 5,                  // the top of his hair
  ground: 543,             // his soles
  footX: 47,               // the middle of his ankles
  soles: [14, 113],

  joints: {
    neck: [67, 84],
    shoulder: [45, 110],   // unused: no arm parts
    elbow: [45, 200],
    fist: [55, 290],
    hip: [62, 310],
    knee: [60, 420],
  },

  cuts: {
    headBottom: 86,        // the top of the standing collar
    torsoTop: 80,
    torsoBottom: 312,      // his hand and the book stay on him
    legTop: 302,
    thighBottom: 432,
    shinTop: 414,
  },

  outlines: {},

  // Written beside the still. Content: content/act2.js (JACINTO).
  sheets: [
    { file: "jacinto.png", motion: "idle" },
  ],
};
