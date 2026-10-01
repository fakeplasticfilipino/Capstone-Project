// =============================================================
// MACARIO — _dev/rigs/kawal.js
//
// The Sultan's soldier, the kawal of the play (Block 101): the
// proponent's still of a man in a white turban, a green tunic with a red
// sash, a wavy kris in one hand and a round wooden shield on the other
// arm, brown trousers to the calf and sandals. Drawn three-quarter, so
// he walks the march (legSplit) and strikes with the thrust, his whole
// body behind the blade, since both his hands are full; and flinches
// with the hit. Rig for _dev/tools/animate-still.js; how to read it:
// _dev/rigs/siga-2.js and CLAUDE.md, Animating a character from one
// still.
//
// Every coordinate is the still's own (mirror false), read off zoomed
// crops with a 10px grid.
//
// Run:  node _dev/tools/animate-still.js kawal
// =============================================================

module.exports = {
  still: "assets/sprites/enemies/kawal-still.png",
  mirror: false,
  scale: 0.75,
  legSplit: 518,

  top: 49,                 // the top of the turban
  ground: 536,             // his soles
  footX: 525,              // where he stands (measure-sprite.js)
  soles: [450, 598],

  joints: {
    neck: [520, 145],
    shoulder: [470, 175],  // unused: no arm parts
    elbow: [455, 250],
    fist: [465, 318],
    hip: [520, 350],
    knee: [520, 440],
  },

  cuts: {
    headBottom: 154,
    torsoTop: 140,
    torsoBottom: 350,
    legTop: 340,
    thighBottom: 450,
    shinTop: 435,
  },

  outlines: {
    overLegs: [
      // The kris's blade, held across both legs: over the trousers,
      // filled under; past them, cut clear.
      [[462, 318], [500, 325], [535, 338], [575, 360], [592, 368], [592, 404],
        [585, 398], [550, 380], [515, 364], [480, 348], [458, 336]],
      { clear: true, outline: [[592, 360], [612, 378], [645, 398], [642, 416], [615, 412], [592, 404]] },
      // The bottom of the shield, over the far leg's hip.
      [[572, 330], [634, 330], [630, 350], [612, 364], [588, 364], [574, 350]],
    ],
  },

  sheets: [
    { file: "kawal-walk.png", motion: "march" },
    { file: "kawal-attack.png", motion: "thrust" },
    { file: "kawal-hit.png", motion: "hit" },
  ],
};
