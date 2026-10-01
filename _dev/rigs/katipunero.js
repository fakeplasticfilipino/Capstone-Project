// =============================================================
// MACARIO — _dev/rigs/katipunero.js
//
// The Katipunero, the older of the two men who find Macario in the
// wings (Block 98): the artist's still of a man with a moustache in a
// salakot, a camisa with the sleeves rolled, a striped shawl over his
// shoulders, purple trousers to the calf and sandals. He walks on and off
// the stage and stands to talk: idle and walk. Rig for
// _dev/tools/animate-still.js; how to read it: _dev/rigs/siga-2.js and
// CLAUDE.md, Animating a character from one still.
//
// The still already faces right, so mirror is false and every
// coordinate is the still's own, read off zoomed crops with a 10px grid.
// It is a tall still (876px), so it is drawn at 0.46 to come out about
// the size of the others.
//
// Run:  node _dev/tools/animate-still.js katipunero
// =============================================================

module.exports = {
  still: "assets/sprites/characters/katipunero-still.png",
  mirror: false,
  scale: 0.46,

  top: 91,                 // the top of the salakot
  ground: 966,             // his soles
  footX: 330,              // the middle of his ankles
  soles: [295, 426],

  joints: {
    neck: [340, 240],
    shoulder: [318, 278],
    elbow: [320, 445],     // under the rolled cuff
    fist: [362, 585],
    hip: [345, 520],
    knee: [335, 665],
  },

  cuts: {
    headBottom: 250,
    torsoTop: 240,
    torsoBottom: 484,
    legTop: 472,
    thighBottom: 675,
    shinTop: 655,
  },

  outlines: {
    // The upper arm, from the shoulder to the bottom of the rolled cuff,
    // in front of the shawl that hangs down his back.
    sleeve: [[282, 280], [295, 262], [315, 255], [340, 258], [352, 275],
      [356, 300], [356, 445], [278, 445]],
    // The forearm and hand.
    arm: [[296, 443], [350, 443], [356, 470], [368, 510], [380, 540],
      [387, 580], [385, 617], [339, 618], [333, 580], [321, 540], [305, 500], [295, 470]],
    // The far sandal's toes, above and beyond the near foot.
    farFoot: (x, y) => y >= 900 && y < 933 && x >= 378,
  },

  sideColour: (r, g) => r > 170 && g / r > 0.78,

  sheets: [
    { file: "katipunero.png", motion: "idle" },
    { file: "katipunero-walk.png", motion: "walk" },
  ],
};
