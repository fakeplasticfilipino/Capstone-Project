// =============================================================
// MACARIO — _dev/rigs/kasama.js
//
// The Kasama, the Katipunero's young companion (Block 98): the artist's
// still of a young man in a salakot over a red bandana, a red shirt with
// the sleeves rolled and a red neckerchief, a rope belt with a pouch and
// a sheathed bolo, long brown trousers and sandals. He walks on and off
// the stage, comes to Macario on the street, and stands to talk: idle
// and walk. Rig for _dev/tools/animate-still.js; how to read it:
// _dev/rigs/siga-2.js and CLAUDE.md, Animating a character from one
// still.
//
// The still already faces right, so mirror is false and every
// coordinate is the still's own, read off zoomed crops with a 10px grid.
// It is a tall still (898px), so it is drawn at 0.45.
//
// Run:  node _dev/tools/animate-still.js kasama
// =============================================================

module.exports = {
  still: "assets/sprites/characters/kasama-still.png",
  mirror: false,
  scale: 0.45,

  top: 68,                 // the top of the salakot
  ground: 965,             // his soles
  footX: 315,              // the middle of his ankles
  soles: [283, 441],

  joints: {
    neck: [330, 232],
    shoulder: [305, 275],
    elbow: [318, 445],     // under the rolled cuff
    fist: [340, 585],
    hip: [345, 510],
    knee: [340, 690],
  },

  cuts: {
    headBottom: 240,
    torsoTop: 230,
    torsoBottom: 472,
    legTop: 460,
    thighBottom: 700,
    shinTop: 680,
  },

  outlines: {
    // The upper arm, from the shoulder to the bottom of the rolled cuff.
    sleeve: [[275, 270], [285, 255], [305, 250], [330, 255], [340, 270],
      [344, 300], [346, 446], [270, 446]],
    // The forearm and hand.
    arm: [[288, 444], [346, 444], [348, 470], [350, 500], [360, 525],
      [366, 560], [364, 616], [318, 617], [310, 580], [304, 540], [296, 500], [289, 470]],
    overLegs: [
      // The pouch and the rope's ends, hanging from the belt.
      [[338, 468], [412, 468], [412, 548], [338, 548]],
      // The bolo's blade in its sheath, out behind his hip, clear of
      // his legs.
      { outline: [[287, 520], [289, 553], [252, 589], [228, 609], [211, 601], [225, 571], [259, 539]],
        clear: true },
    ],
    // The far sandal, above and beyond the near foot.
    farFoot: (x, y) => y >= 870 && x >= 356 && y < 919 + (x - 356) * 0.2,
  },

  // His side, behind the sleeve, is the red of his shirt.
  sideColour: (r, g, b) => r > 110 && g < r * 0.6 && b < r * 0.55,

  sheets: [
    { file: "kasama.png", motion: "idle" },
    { file: "kasama-walk.png", motion: "walk" },
  ],
};
