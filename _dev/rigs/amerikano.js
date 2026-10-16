// =============================================================
// MACARIO — _dev/rigs/amerikano.js
//
// The amerikano (Block 135), the American soldier of Acts III and IV's
// fights and sentries: the artist's still, delivered on black
// (Act3_SundalongAmericano.png), keyed with key-still.js. Side on, facing
// right, a rifle with a bayonet held upright in front of him, a pack on
// his back. He stands guard (the sentinela), walks, lunges with the
// bayonet (thrust, for full hands) and flinches. The rifle's lower half
// is cloth over the legs: filled where it crosses them, clear beyond.
// How to read a rig: _dev/rigs/siga-2.js.
//
// Run:  node _dev/tools/animate-still.js amerikano
// =============================================================

module.exports = {
  still: "assets/sprites/enemies/amerikano-still.png",
  mirror: false,
  scale: 0.55,

  top: 4,
  ground: 543,
  footX: 83,
  soles: [49, 144],

  joints: {
    neck: [121, 93],
    shoulder: [95, 125],
    elbow: [100, 210],
    fist: [125, 290],
    hip: [90, 305],
    knee: [95, 425],
  },

  cuts: {
    headBottom: 99,
    torsoTop: 92,
    torsoBottom: 310,
    legTop: 300,
    thighBottom: 432,
    shinTop: 414,
  },

  outlines: {
    overLegs: [
      // The rifle, traced tight: wider took his trousers with it.
      [[126, 305], [144, 305], [141, 420], [138, 527], [109, 527], [114, 420]],
    ],
  },

  sheets: [
    { file: "amerikano.png", motion: "idle" },
    { file: "amerikano-walk.png", motion: "walk" },
    { file: "amerikano-attack.png", motion: "thrust" },
    { file: "amerikano-hit.png", motion: "hit" },
  ],
};
