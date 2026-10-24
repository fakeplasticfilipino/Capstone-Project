// =============================================================
// MACARIO — _dev/rigs/sultan.js
//
// The Sultan of the play. Since Block 129 the artist's still (delivered
// as sultan.png), side on, facing right: a young man in a feathered red
// turban, a dark embroidered coat, a red cape hanging to the ground
// behind him, baggy red trousers and sandals, holding his sword in its
// scabbard by the throat, the hilt up in front of his hand and the
// scabbard trailing down behind him. He stands with the calm idle,
// walks the side-on stride, swings the sword overhead (the slash) and
// flinches with the hit, since Block 129 he fights Don Rodrigo himself.
// The hand, the hilt and the whole scabbard are traced into the arm.
//
// Because he holds it the other way round from the kawal (the long end
// trails behind his hand), the slash gives its own shoulder and elbow
// angles (arms, below), so it is the scabbard's length, not the
// pommel, that comes over the top. Rig for
// _dev/tools/animate-still.js; how to read it: _dev/rigs/siga-2.js and
// CLAUDE.md, Animating a character from one still.
//
// Block 101's Sultan was the proponent's three-quarter still with a
// kampilan (the march); this rig replaces it whole.
//
// Every coordinate is the still's own (mirror false), read off zoomed
// crops with a 10px grid.
//
// Run:  node _dev/tools/animate-still.js sultan
// =============================================================

module.exports = {
  still: "_dev/stills/characters/sultan-still.png",
  mirror: false,
  // 0.55, as the kawal (Block 129): the sword raised over his head
  // widens the one cell every sheet shares.
  scale: 0.55,

  top: 26,                 // the tips of the plumes
  ground: 535,             // his soles
  footX: 515,              // where he stands: the middle of his ankle
  soles: [487, 567],

  joints: {
    neck: [505, 135],
    shoulder: [525, 175],
    elbow: [522, 262],     // at the top of the cuff
    fist: [515, 328],
    tip: [392, 450],       // the scabbard's end, for the slash's arc
    hip: [515, 365],
    knee: [515, 440],
  },

  cuts: {
    headBottom: 140,
    torsoTop: 125,
    torsoBottom: 355,      // the coat's hem
    legTop: 345,
    thighBottom: 450,
    shinTop: 430,
  },

  outlines: {
    // The upper arm, in the coat's sleeve, down to the cuff.
    sleeve: [[500, 160], [530, 152], [548, 162], [555, 200], [553, 262], [495, 265], [497, 215]],
    // The cuff, the hand, the hilt up to its pommel, and the scabbard
    // down to its gold end.
    arm: [[495, 262], [552, 262], [560, 284], [575, 265], [588, 250], [600, 258],
      [598, 275], [580, 286], [572, 300], [575, 320], [572, 336], [570, 358],
      [552, 363], [532, 372], [514, 382], [476, 410], [442, 436], [407, 461],
      [385, 462], [384, 440], [406, 425], [436, 405], [466, 385], [490, 364],
      [497, 352], [496, 330], [494, 300], [493, 266]],
    // Where the arm hangs clear of him: the hilt and the scabbard's top,
    // out past his coat.
    armClear: [[557, 245], [605, 245], [605, 365], [557, 365]],
    // The cape, hanging behind his legs to the ground: on the body, and
    // nothing of the legs under it.
    overLegs: [{ clear: true, outline: [[310, 300], [476, 300], [476, 545], [310, 545]] }],
  },

  // His side, behind the sleeve, is the coat's dark blue.
  sideColour: (r, g, b) => b > r && b > g && b > 40,

  // Written beside the still. Content: content/act1.js (SULTAN,
  // SULTAN_CELL) and content/enemies.js (sultan).
  sheets: [
    { file: "sultan.png", motion: "idle" },
    { file: "sultan-walk.png", motion: "walk" },
    // The slash's frames, as shoulder and elbow: the hand rises behind
    // his head with the scabbard hanging back (0 to 2), and the
    // scabbard's length comes over the top and down in front (3 to 5).
    { file: "sultan-attack.png", motion: "slash",
      arms: [[70, -45], [140, -100], [200, -145], [-90, -29], [-55, -39], [-20, -49], [10, -30], [4, -6]] },
    { file: "sultan-hit.png", motion: "hit" },
  ],
};
