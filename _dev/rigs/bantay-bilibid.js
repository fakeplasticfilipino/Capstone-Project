// =============================================================
// MACARIO — _dev/rigs/bantay-bilibid.js
//
// A Filipino guard of Bilibid prison (Block 135), Acts III and IV: the
// artist's still, delivered on black (Act3_FilipinoGuardOfBilibid_.png),
// keyed with key-still.js. Side on, facing right, a rifle with a bayonet
// held upright in front of him. He walks to the cell and stands to give
// his news: idle and walk. His hand stays on his body and the rifle's
// lower half, in front of his legs, is cloth over the legs, so his legs
// stride behind it.
// How to read a rig: _dev/rigs/siga-2.js.
//
// Run:  node _dev/tools/animate-still.js bantay-bilibid
// =============================================================

module.exports = {
  still: "assets/sprites/characters/bantay-bilibid-still.png",
  mirror: false,
  scale: 0.55,

  top: 4,
  ground: 543,
  footX: 50,
  soles: [18, 110],

  joints: {
    neck: [80, 85],
    shoulder: [55, 110],
    elbow: [60, 200],
    fist: [85, 280],
    hip: [55, 295],
    knee: [55, 405],
  },

  cuts: {
    headBottom: 90,
    torsoTop: 84,
    torsoBottom: 300,
    legTop: 290,
    thighBottom: 418,
    shinTop: 400,
  },

  outlines: {
    overLegs: [
      [[103, 296], [116, 296], [111, 418], [107, 513], [81, 513], [84, 470], [92, 418]],
    ],
  },

  sheets: [
    { file: "bantay-bilibid.png", motion: "idle" },
    { file: "bantay-bilibid-walk.png", motion: "walk" },
  ],
};
