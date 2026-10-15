// =============================================================
// MACARIO — _dev/rigs/manlilimbag.js
//
// The Manlilimbag (Block 133), the Katipunan's printer in Acts II to
// IV: the artist's still, delivered on black (1024 by 1536), keyed and
// shrunk to 548 tall as Block 129's were. Side on, facing right, in a
// long inked apron. He walks to the press and stands to talk: idle and
// walk. His hand stays on his body (no arm parts) and the apron, which
// hangs over his thighs, is cloth over the legs, so his legs stride
// under it. How to read a rig: _dev/rigs/siga-2.js. Coordinates off a
// 10px grid at twice.
//
// Run:  node _dev/tools/animate-still.js manlilimbag
// =============================================================

module.exports = {
  still: "assets/sprites/characters/manlilimbag-still.png",
  mirror: false,
  scale: 0.55,

  top: 3,                  // the top of his hair
  ground: 539,             // his soles
  footX: 46,               // the middle of his ankles
  soles: [17, 101],

  joints: {
    neck: [73, 88],
    shoulder: [45, 120],   // unused: no arm parts
    elbow: [45, 205],
    fist: [55, 300],
    hip: [55, 318],
    knee: [45, 412],
  },

  cuts: {
    headBottom: 92,
    torsoTop: 86,
    torsoBottom: 322,      // his hand stays on him
    legTop: 312,
    thighBottom: 424,
    shinTop: 406,
  },

  outlines: {
    // The apron's hem, over the top of his trousers.
    overLegs: [[52, 318], [108, 318], [108, 386], [52, 386]],
  },

  // Written beside the still. Content: content/people.js (MANLILIMBAG).
  sheets: [
    { file: "manlilimbag.png", motion: "idle" },
    { file: "manlilimbag-walk.png", motion: "walk" },
  ],
};
