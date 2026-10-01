// =============================================================
// MACARIO — _dev/rigs/siga-1.js
//
// The leader of the three siga, the one who speaks (Block 98): the
// artist's still of a boy in a salakot, a camisa with the sleeves
// rolled, a checked shawl over his shoulders, a white sash, short brown
// trousers and sandals. Rig for _dev/tools/animate-still.js; how to read
// it: _dev/rigs/siga-2.js and CLAUDE.md, Animating a character from one
// still.
//
// The still faces left, so mirror is true and every coordinate is in
// the MIRRORED still, read off zoomed crops with a 10px grid.
//
// Run:  node _dev/tools/animate-still.js siga-1
// =============================================================

module.exports = {
  still: "assets/sprites/characters/siga-1-still.png",
  mirror: true,
  scale: 0.75,

  top: 18,                 // the top of the salakot
  ground: 547,             // his sole
  footX: 490,              // the middle of his ankle
  soles: [466, 548],

  joints: {
    neck: [510, 112],      // the head and the salakot nod about this
    shoulder: [485, 145],
    elbow: [487, 246],     // under the rolled cuff
    fist: [508, 322],
    hip: [497, 318],
    knee: [493, 425],      // at the rolled trouser leg
  },

  cuts: {
    headBottom: 120,
    torsoTop: 112,
    torsoBottom: 310,
    legTop: 298,
    thighBottom: 434,
    shinTop: 418,
  },

  outlines: {
    // The upper arm, from the shoulder to the bottom of the rolled cuff,
    // in front of the shawl that hangs down his back.
    sleeve: [[463, 150], [470, 134], [485, 128], [500, 132], [506, 145],
      [507, 248], [462, 248]],
    // The forearm and hand, along the dark line that edges them.
    arm: [[467, 247], [506, 247], [510, 270], [513, 290], [525, 300],
      [527, 344], [490, 347], [486, 306], [476, 286], [465, 262]],
    overLegs: [
      // The white sash's end, hanging beside the hand.
      [[505, 296], [546, 296], [544, 366], [512, 366], [503, 340]],
      // The shawl's hem, hanging down his back past the waist, clear
      // of his legs.
      { outline: [[432, 296], [468, 296], [468, 376], [432, 376]], clear: true },
    ],
  },

  sideColour: (r, g) => r > 170 && g / r > 0.78,

  sheets: [
    { file: "siga-1.png", motion: "idle" },
    { file: "siga-1-walk.png", motion: "walk" },
    { file: "siga-1-attack.png", motion: "attack" },
    { file: "siga-1-hit.png", motion: "hit" },
  ],
};
