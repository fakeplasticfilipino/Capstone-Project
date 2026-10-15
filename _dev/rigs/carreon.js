// =============================================================
// MACARIO — _dev/rigs/carreon.js
//
// Francisco Carreón (Block 133), the old Katipunero who is the
// Katagalugan's Vice President, in Acts III and IV: the artist's still,
// delivered on black (Act3_ FranciscoCarreón.png, 1024 by 1536), keyed
// and shrunk to 548 tall as Block 129's were. Side on, facing right. He
// stands and talks: idle only, his hands kept on his body. How to read
// a rig: _dev/rigs/siga-2.js.
//
// Run:  node _dev/tools/animate-still.js carreon
// =============================================================

module.exports = {
  still: "assets/sprites/characters/carreon-still.png",
  mirror: false,
  scale: 0.55,

  top: 4,                  // the top of his hair
  ground: 543,             // his soles
  footX: 55,               // the middle of his ankles
  soles: [18, 133],

  joints: {
    neck: [75, 88],
    shoulder: [50, 115],   // unused: no arm parts
    elbow: [50, 205],
    fist: [70, 295],
    hip: [60, 305],
    knee: [62, 425],
  },

  cuts: {
    headBottom: 94,        // the top of the standing collar
    torsoTop: 86,
    torsoBottom: 308,      // his hand stays on him
    legTop: 298,
    thighBottom: 437,
    shinTop: 419,
  },

  outlines: {},

  // Written beside the still. Content: content/people.js (CARREON).
  sheets: [
    { file: "carreon.png", motion: "idle" },
  ],
};
