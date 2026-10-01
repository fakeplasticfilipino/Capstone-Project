// =============================================================
// MACARIO — _dev/rigs/sultan.js
//
// The Sultan of the play (Block 101): the proponent's still of a young
// man in a feathered turban, a dark embroidered coat, a red cape to the
// calf, a kampilan held low across him, red trousers and sandals. He is
// drawn three-quarter, both legs side by side, so he walks the march
// (legSplit: each leg lifted in turn) rather than the side-on stride, and
// stands with the calm idle. His hands and the sword stay put. Rig for
// _dev/tools/animate-still.js; how to read it: _dev/rigs/siga-2.js and
// CLAUDE.md, Animating a character from one still.
//
// Every coordinate is the still's own (mirror false), read off zoomed
// crops with a 10px grid.
//
// Run:  node _dev/tools/animate-still.js sultan
// =============================================================

module.exports = {
  still: "assets/sprites/characters/sultan-still.png",
  mirror: false,
  scale: 0.75,
  legSplit: 507,           // between his legs

  top: 27,                 // the tips of the plumes
  ground: 536,             // his soles
  footX: 498,              // where he stands (measure-sprite.js)
  soles: [452, 600],

  joints: {
    neck: [525, 140],
    shoulder: [470, 175],  // unused: no arm parts
    elbow: [450, 260],
    fist: [450, 320],
    hip: [505, 360],
    knee: [505, 440],
  },

  cuts: {
    headBottom: 148,
    torsoTop: 136,
    torsoBottom: 362,      // the sash's fringe hangs over the trousers to here
    legTop: 352,
    thighBottom: 450,
    shinTop: 435,
  },

  outlines: {
    overLegs: [
      // The kampilan's blade, held across the near leg, with his hand:
      // over the trousers, filled under; past them, cut clear.
      [[460, 315], [510, 322], [560, 345], [578, 352], [578, 415], [540, 398],
        [490, 374], [458, 352]],
      { clear: true, outline: [[578, 340], [650, 380], [706, 418], [700, 442], [640, 440], [578, 415]] },
      // The cape, both sides, hanging clear of the legs.
      { clear: true, outline: [[388, 300], [455, 300], [462, 360], [458, 480], [388, 480]] },
      { clear: true, outline: [[566, 300], [615, 300], [615, 480], [570, 480]] },
    ],
  },

  sheets: [
    { file: "sultan.png", motion: "idle" },
    { file: "sultan-walk.png", motion: "march" },
  ],
};
