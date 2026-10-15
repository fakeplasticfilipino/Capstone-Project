// =============================================================
// MACARIO — _dev/rigs/isko.js
//
// Isko (Block 133), one of the three sworn in at the end of Act I and
// Macario's man in Acts II to IV: the artist's still, delivered on black
// (isko_BatangKatipunero.png, 1024 by 1536), keyed and shrunk to 548
// tall as Block 129's were. Side on, facing right; he runs on and off
// and stands to talk: idle and walk, with the near arm cut so his hand
// swings rather than riding on his trousers. How to read a rig:
// _dev/rigs/siga-2.js and CLAUDE.md, Animating a character from one
// still. Coordinates read off a 10px grid at three times.
//
// Run:  node _dev/tools/animate-still.js isko
// =============================================================

module.exports = {
  still: "assets/sprites/characters/isko-still.png",
  mirror: false,
  scale: 0.55,

  top: 5,                  // the point of the salakot
  ground: 540,             // his soles
  footX: 68,               // the middle of his ankles
  soles: [47, 124],

  joints: {
    neck: [90, 96],
    shoulder: [70, 120],
    elbow: [70, 222],      // at the rolled cuff
    fist: [86, 312],
    hip: [78, 245],
    knee: [74, 400],
  },

  cuts: {
    headBottom: 104,
    torsoTop: 96,
    torsoBottom: 246,      // under the waistband
    legTop: 236,
    thighBottom: 412,
    shinTop: 394,
  },

  outlines: {
    // The upper arm, from the shoulder to the rolled cuff.
    sleeve: [[46, 118], [58, 106], [78, 106], [92, 120], [96, 160], [94, 226], [48, 226], [44, 170]],
    // The forearm and the hand.
    arm: [[52, 222], [92, 222], [90, 240], [86, 262], [96, 285], [101, 300], [100, 318],
      [91, 327], [78, 327], [68, 312], [63, 292], [57, 270], [51, 250]],
    // The tapis over his far shoulder hangs behind him, clear of his legs.
    overLegs: [{ clear: true, outline: [[2, 200], [44, 200], [44, 266], [2, 266]] }],
  },

  // His side, behind the sleeve, is the shirt's cream, and behind the
  // forearm, where it crosses the waistband, the waistband's purple.
  sideColour: (r, g, b) => (r > 170 && g / r > 0.85 && b / r > 0.7) || (r > 45 && r < 150 && b > g),
  // Behind his hand, below the waist, is the trousers' purple.
  legColour: (r, g, b) => r > 45 && r < 150 && b > g,

  // Written beside the still. Content: content/people.js (ISKO).
  sheets: [
    { file: "isko.png", motion: "idle" },
    { file: "isko-walk.png", motion: "walk" },
  ],
};
