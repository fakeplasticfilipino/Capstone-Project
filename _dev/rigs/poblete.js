// =============================================================
// MACARIO — _dev/rigs/poblete.js
//
// Pascual Poblete (Block 133), the writer who founds the Partido
// Nacionalista with Macario and brings in the Sedition Law, in Act III:
// the artist's still, delivered on black (Act3_PascualPoblete.png, 1024
// by 1536), keyed and shrunk to 548 tall as Block 129's were. Side on,
// facing right, drawn in mid-stride with a book in his hand. A stride
// cannot be turned into a standing breath or a walk cycle without new
// art, so he takes breathe only (the breath and the nod, no sway and no
// legs), and the scene carries him in as it is. How to read a rig:
// _dev/rigs/siga-2.js.
//
// Run:  node _dev/tools/animate-still.js poblete
// =============================================================

module.exports = {
  still: "assets/sprites/characters/poblete-still.png",
  mirror: false,
  scale: 0.55,

  top: 6,                  // the top of his hair
  ground: 542,             // his soles
  footX: 127,              // the middle of his stride
  soles: [4, 250],

  joints: {
    neck: [123, 73],
    shoulder: [100, 105],  // unused: no arm parts
    elbow: [100, 200],
    fist: [110, 300],
    hip: [120, 330],
    knee: [115, 450],
  },

  cuts: {
    headBottom: 79,        // the top of his collar
    torsoTop: 74,
    torsoBottom: 404,      // the coat's hem
    legTop: 394,
    thighBottom: 462,
    shinTop: 444,
  },

  outlines: {},

  // Written beside the still. Content: content/act3.js (POBLETE).
  sheets: [
    { file: "poblete.png", motion: "breathe" },
  ],
};
