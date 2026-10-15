// =============================================================
// MACARIO — _dev/rigs/alvarez.js
//
// Santiago Álvarez (Block 133), a general of the revolution and a
// founder of the Partido Nacionalista, in Act III: the artist's still,
// delivered on black (Act3_GeneralAlvarez.png, 1024 by 1536), keyed and
// shrunk to 548 tall as Block 129's were. Side on, facing right, his
// sword in its scabbard at his hip. He stands and talks: idle only, his
// hand on his body and the scabbard, which hangs down over his
// trousers, cloth over the legs. How to read a rig: _dev/rigs/siga-2.js.
//
// Run:  node _dev/tools/animate-still.js alvarez
// =============================================================

module.exports = {
  still: "assets/sprites/characters/alvarez-still.png",
  mirror: false,
  scale: 0.55,

  top: 5,                  // the top of his hair
  ground: 543,             // his soles
  footX: 48,               // the middle of his boots
  soles: [21, 113],

  joints: {
    neck: [70, 84],
    shoulder: [45, 110],   // unused: no arm parts
    elbow: [40, 200],
    fist: [45, 320],
    hip: [55, 330],
    knee: [60, 425],
  },

  cuts: {
    headBottom: 90,        // the top of the standing collar
    torsoTop: 84,
    torsoBottom: 340,      // his hand stays on him
    legTop: 330,
    thighBottom: 437,
    shinTop: 419,
  },

  outlines: {
    // The scabbard, hanging down over his trousers.
    overLegs: [[96, 296], [111, 298], [97, 370], [91, 433], [77, 433], [84, 370]],
  },

  // Written beside the still. Content: content/act3.js (ALVAREZ).
  sheets: [
    { file: "alvarez.png", motion: "idle" },
  ],
};
