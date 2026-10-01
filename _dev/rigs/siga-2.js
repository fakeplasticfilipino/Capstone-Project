// =============================================================
// MACARIO — _dev/rigs/siga-2.js
//
// The big siga's rig for _dev/tools/animate-still.js (Blocks 96, 97):
// where his joints are in the artist's still, where it is cut, and which
// sheets to write. The first rig, and the one to copy for a new
// character (CLAUDE.md, Animating a character from one still).
//
// The still is a young man side on in a rolled-sleeve camisa, a red
// sash, brown trousers and sandals, facing left. The game's art faces
// right, so mirror is true and every coordinate below is in the
// MIRRORED still, in its own pixels, read off zoomed crops with a 10px
// grid (and checked with --debug), not guessed.
//
// Run:  node _dev/tools/animate-still.js siga-2
// =============================================================

module.exports = {
  still: "assets/sprites/characters/siga-2-still.png",
  mirror: true,
  // Drawn at three quarters of the still: about the bantay's 394 pixels,
  // enough for a phone, and a quarter of the memory.
  scale: 0.75,

  top: 15,                 // the top of his hair
  ground: 554,             // his soles
  footX: 512,              // where he stands: the middle of his ankles
  soles: [476, 556],       // the soles' span, to find the lowest foot

  joints: {
    neck: [512, 114],      // the head nods about this
    shoulder: [486, 142],
    elbow: [486, 236],     // under the rolled sleeve's cuff
    fist: [516, 324],      // the middle of the hand, where streaks trail
    hip: [505, 318],
    knee: [505, 410],
  },

  cuts: {
    headBottom: 118,       // the head is cut from above here...
    torsoTop: 110,         // ...and the collar drawn over it from here
    torsoBottom: 306,      // the shirt is drawn over the legs to here...
    legTop: 296,           // ...and the legs are cut from here down
    thighBottom: 418,      // the thigh overlaps the shin at the knee
    shinTop: 402,
  },

  outlines: {
    // The upper arm, from the shoulder's seam to the bottom of the cuff.
    sleeve: [[460, 150], [466, 136], [478, 129], [494, 128], [506, 136],
      [511, 150], [511, 236], [460, 236]],
    // The forearm and hand, from under the cuff down to the fingertips,
    // traced along the dark line that edges them.
    arm: [[467, 231], [503, 231], [510, 257], [517, 274], [529, 295],
      [533, 304], [533, 343], [499, 344], [496, 312], [491, 293], [479, 262], [465, 240]],
    // The end of the sash, hanging over the trousers beside the hand.
    overLegs: [[503, 300], [550, 300], [549, 374], [511, 374], [501, 344]],
    // The far sandal: everything of the feet above this line, right of
    // the near ankle, is the far foot's toes, strap and ankle.
    farFoot: (x, y) => y >= 495 && y <= 538 && x >= 504 && y < 525 + (x - 504) * 0.22,
  },

  // His side, behind the sleeve, is the shirt's beige: not the sash's
  // red or his neck, which would band it.
  sideColour: (r, g) => r > 170 && g / r > 0.78,

  // Written beside the still. Content: content/act1.js (SIGA[2].idle)
  // and content/enemies.js (siga2, SIGA_2_CELL).
  sheets: [
    { file: "siga-2.png", motion: "idle" },
    { file: "siga-2-walk.png", motion: "walk" },
    { file: "siga-2-attack.png", motion: "attack" },
    { file: "siga-2-hit.png", motion: "hit" },
  ],
};
