// =============================================================
// MACARIO — _dev/rigs/tagapagbalita.js
//
// The Tagapagbalita (Block 133), the messenger of Acts II to IV: the
// artist's still, delivered on black (1023 by 1537), keyed and shrunk to
// 548 tall as Block 129's were. Side on, facing right, a satchel at his
// hip and a roll of papers in his near hand. He runs in with news and
// stands to give it: idle and walk. The hand, the papers and the
// satchel stay on his body, as the Mabalasig's paper does: swung, the
// papers left a hole across his trousers that no fill could hide. How
// to read a rig: _dev/rigs/siga-2.js. Coordinates off a 10px grid at
// twice.
//
// Run:  node _dev/tools/animate-still.js tagapagbalita
// =============================================================

module.exports = {
  still: "_dev/stills/characters/tagapagbalita-still.png",
  mirror: false,
  scale: 0.55,

  top: 5,                  // the point of the salakot
  ground: 540,             // his soles
  footX: 70,               // the middle of his ankles
  soles: [45, 128],

  joints: {
    neck: [98, 88],
    shoulder: [72, 125],   // unused: no arm parts
    elbow: [68, 214],
    fist: [86, 300],
    hip: [76, 330],
    knee: [75, 415],
  },

  cuts: {
    headBottom: 98,
    torsoTop: 90,
    torsoBottom: 336,      // the hand, the papers and the satchel stay on him
    legTop: 326,
    thighBottom: 428,
    shinTop: 410,
  },

  outlines: {},

  // Written beside the still. Content: content/people.js (TAGAPAGBALITA).
  sheets: [
    { file: "tagapagbalita.png", motion: "idle" },
    { file: "tagapagbalita-walk.png", motion: "walk" },
  ],
};
