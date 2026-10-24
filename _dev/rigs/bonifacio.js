// =============================================================
// MACARIO — _dev/rigs/bonifacio.js
//
// Andres Bonifacio, the Supremo, Act II (Block 129): the artist's still
// (delivered as Bonifacio.png), side on, facing right: short black hair,
// a red kerchief knotted at the neck, a cream shirt with rolled sleeves,
// a dark belt with a sword at his hip (only its hilt shows), brown
// trousers and tall boots. Delivered on black with no transparency, so
// the background was flooded out from the edges (key-black.py's way,
// through pixels no brighter than 2, which his black hair is not), then
// cropped to him and shrunk by area averaging to about 540 tall.
//
// He stands with the calm idle, walks the side-on stride, and at
// "Sugod!" throws his fist up over his head (the rally), played once
// by playGesture. Only the hilt of his sword is drawn, so he has no
// slash: it waits for a picture with the sword in his hand (ART.md).
// Rig for _dev/tools/animate-still.js; how to read it:
// _dev/rigs/siga-2.js and CLAUDE.md, Animating a character from one
// still.
//
// Every coordinate is the still's own (mirror false), read off zoomed
// crops with a 10px grid.
//
// Run:  node _dev/tools/animate-still.js bonifacio
// =============================================================

module.exports = {
  still: "_dev/stills/characters/bonifacio-still.png",
  mirror: false,
  // 0.55, as the kawal and the Sultan: the fist raised over his head
  // widens the one cell every sheet shares.
  scale: 0.55,

  top: 30,                 // the top of his hair
  ground: 568,             // his soles
  footX: 70,               // where he stands: the middle of his boots
  soles: [42, 125],

  joints: {
    neck: [92, 108],
    shoulder: [58, 135],
    elbow: [60, 232],      // under the rolled cuff
    fist: [83, 312],
    hip: [80, 285],
    knee: [78, 415],
  },

  cuts: {
    headBottom: 106,
    torsoTop: 98,
    torsoBottom: 258,      // the bottom of the belt
    legTop: 248,
    thighBottom: 430,
    shinTop: 412,
  },

  outlines: {
    // The upper arm, from the shoulder to the bottom of the rolled cuff.
    sleeve: [[33, 140], [45, 128], [62, 126], [78, 135], [82, 170], [82, 232], [34, 232], [30, 190]],
    // The forearm and the closed hand.
    arm: [[42, 228], [80, 228], [76, 250], [80, 280], [92, 292], [98, 305], [98, 322],
      [90, 330], [72, 330], [68, 318], [66, 300], [56, 280], [46, 258], [43, 240]],
    // The far boot's toe, out past the near one.
    farFoot: (x, y) => y >= 525 && y <= 552 && x >= 112,
  },

  // His side, behind the sleeve, is the shirt's cream: not the
  // kerchief's red or the belt.
  sideColour: (r, g, b) => r > 170 && g / r > 0.85 && b / r > 0.7,
  // Behind his hand, below the belt, is the trousers' dark brown.
  legColour: (r, g, b) => r > 25 && r < 110 && r > b,

  // Written beside the still. Content: content/act2.js (BONIFACIO).
  sheets: [
    { file: "bonifacio.png", motion: "idle" },
    { file: "bonifacio-walk.png", motion: "walk" },
    { file: "bonifacio-sugod.png", motion: "rally" },
  ],
};
