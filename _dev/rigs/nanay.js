// =============================================================
// MACARIO — _dev/rigs/nanay.js
//
// Nanay (Block 101): the proponent's still of a woman side on, facing
// right, long hair down her back, a cream blouse, a blue tapis over a
// long pleated skirt, and sandals. She stands to talk and walks in the
// opening and home with Macario: idle and walk. Her arm hangs over the
// tapis and stays put (no arm parts). Her legs are under a skirt to the
// ankle, which cannot stride like trousers, so stride takes the walk's
// leg angles down to a third: the hem sways and the feet step. Rig for
// _dev/tools/animate-still.js; how to read it: _dev/rigs/siga-2.js and
// CLAUDE.md, Animating a character from one still.
//
// The still faces right, so mirror is false and every coordinate is the
// still's own, read off zoomed crops with a 10px grid.
//
// Run:  node _dev/tools/animate-still.js nanay
// =============================================================

module.exports = {
  still: "assets/sprites/characters/nanay-still.png",
  mirror: false,
  scale: 0.75,
  stride: 0.35,

  top: 17,                 // the top of her head
  ground: 544,             // her soles
  footX: 513,              // where she stands (measure-sprite.js)
  soles: [490, 572],

  joints: {
    neck: [522, 118],
    shoulder: [505, 140],  // unused: no arm parts
    elbow: [512, 220],
    fist: [530, 310],
    hip: [510, 330],
    knee: [508, 432],
  },

  cuts: {
    headBottom: 124,       // under the chin; the hair below stays on her back
    torsoTop: 112,
    torsoBottom: 336,      // the tapis and her hand are drawn over the skirt
    legTop: 322,
    thighBottom: 440,
    shinTop: 425,
  },

  outlines: {
    // The far sandal, behind and left of the near heel.
    farFoot: (x, y) => y >= 470 && x < 492,
  },

  sheets: [
    { file: "nanay.png", motion: "idle" },
    { file: "nanay-walk.png", motion: "walk" },
  ],
};
