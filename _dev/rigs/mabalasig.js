// =============================================================
// MACARIO — _dev/rigs/mabalasig.js
//
// The Mabalasig, who conducts Macario's rite in the pulungan (Block
// 101): the proponent's still ("balisig (recruiter)") of a bearded man
// side on, facing right, in a salakot and a short-sleeved camisa with a
// cord belt and an anting-anting, a rolled paper in his hand and a bolo
// sheathed behind his hip with a red tassel, wide dark trousers and
// sandals. He only stands: idle, no walk, and his hands stay where they
// are (no arm parts). Rig for _dev/tools/animate-still.js; how to read
// it: _dev/rigs/siga-2.js and CLAUDE.md, Animating a character from one
// still.
//
// The still faces right, so mirror is false; it is a tall still (1024),
// drawn at 0.44 to come out the size of the others.
//
// Run:  node _dev/tools/animate-still.js mabalasig
// =============================================================

module.exports = {
  still: "assets/sprites/characters/mabalasig-still.png",
  mirror: false,
  scale: 0.44,

  top: 68,                 // the point of the salakot
  ground: 962,             // his soles
  footX: 356,              // where he stands (measure-sprite.js)
  soles: [285, 440],

  joints: {
    neck: [365, 225],
    shoulder: [320, 260],  // unused: no arm parts
    elbow: [320, 420],
    fist: [350, 580],
    hip: [340, 590],
    knee: [340, 760],
  },

  cuts: {
    headBottom: 236,       // under the beard; the collar is drawn over it
    torsoTop: 222,
    torsoBottom: 612,      // the paper, his hand and the sheath stay on him
    legTop: 598,
    thighBottom: 770,
    shinTop: 750,
  },

  outlines: {
    // The sheath and its tassel hang clear of the trousers, behind him.
    overLegs: [{ clear: true, outline: [[195, 520], [300, 520], [300, 600], [245, 680], [195, 680]] }],
    farFoot: (x, y) => y >= 878 && y < 925 && x >= 405,
  },

  sheets: [
    { file: "mabalasig.png", motion: "idle" },
  ],
};
