// =============================================================
// MACARIO — _dev/rigs/siga-3.js
//
// The small siga (Block 98): the artist's still of a boy in a camisa
// with the sleeves rolled, a grey sash with a pouch hanging from it,
// long brown trousers rolled at the calf and wooden sandals. Rig for
// _dev/tools/animate-still.js; how to read it: _dev/rigs/siga-2.js and
// CLAUDE.md, Animating a character from one still.
//
// The still faces left, so mirror is true and every coordinate is in
// the MIRRORED still, read off zoomed crops with a 10px grid.
//
// Run:  node _dev/tools/animate-still.js siga-3
// =============================================================

module.exports = {
  still: "assets/sprites/characters/siga-3-still.png",
  mirror: true,
  scale: 0.75,

  top: 19,                 // the top of his hair
  ground: 552,             // his sole
  footX: 491,              // the middle of his ankle
  soles: [466, 556],

  joints: {
    neck: [510, 114],
    shoulder: [482, 145],
    elbow: [485, 242],     // under the rolled cuff
    fist: [495, 322],
    hip: [500, 318],
    knee: [497, 405],
  },

  cuts: {
    headBottom: 122,
    torsoTop: 114,
    torsoBottom: 310,
    legTop: 298,
    thighBottom: 412,
    shinTop: 396,
  },

  outlines: {
    // The upper arm, from the shoulder to the bottom of the rolled cuff.
    sleeve: [[460, 150], [468, 136], [482, 130], [498, 134], [504, 148],
      [505, 244], [458, 244]],
    // The forearm and hand, along the dark line that edges them.
    arm: [[466, 243], [502, 243], [503, 262], [503, 288], [511, 300],
      [515, 341], [480, 344], [477, 310], [472, 290], [465, 262]],
    // The pouch and the end of the sash, hanging over the trousers.
    overLegs: [[506, 296], [548, 296], [546, 336], [508, 336]],
  },

  sideColour: (r, g) => r > 170 && g / r > 0.78,

  sheets: [
    { file: "siga-3.png", motion: "idle" },
    { file: "siga-3-walk.png", motion: "walk" },
    { file: "siga-3-attack.png", motion: "attack" },
    { file: "siga-3-hit.png", motion: "hit" },
  ],
};
