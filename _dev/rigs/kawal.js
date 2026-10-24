// =============================================================
// MACARIO — _dev/rigs/kawal.js
//
// The Sultan's soldier, the kawal of the play. Since Block 129 the
// artist's still (delivered as moro.png), side on, facing right: a white
// turban, a green tunic with a brown strap and a red sash, a wavy kris
// held low in his near hand, brown trousers rolled at the calf and
// sandals. The still was cropped to him and shrunk by area averaging to
// about 540 tall, like every other rig's, so the puppet's bilinear
// sampling never has to shrink pixel art by three. He walks the side-on
// stride, strikes with the slash (the kris raised over his head through
// the red !, brought down and forward) and flinches with the hit. The
// kris is traced into the arm, so it moves with his hand. Rig for
// _dev/tools/animate-still.js; how to read it: _dev/rigs/siga-2.js and
// CLAUDE.md, Animating a character from one still.
//
// Block 101's kawal was the proponent's three-quarter still with a
// shield (the march and the thrust); this rig replaces it whole.
//
// Every coordinate is the still's own (mirror false), read off zoomed
// crops with a 10px grid.
//
// Run:  node _dev/tools/animate-still.js kawal
// =============================================================

module.exports = {
  still: "_dev/stills/enemies/kawal-still.png",
  mirror: false,
  // Drawn at 0.55 of the still, not 0.75 (Block 129): the kris raised
  // over his head widens the one cell every sheet shares, and at 0.75
  // his three sheets were three and a half times the pixels of the old.
  scale: 0.55,

  top: 31,                 // the top of the turban
  ground: 568,             // his soles
  footX: 108,              // where he stands: the middle of his ankles
  soles: [80, 172],

  joints: {
    neck: [125, 114],
    shoulder: [80, 140],
    elbow: [78, 248],      // under the rolled cuff
    fist: [88, 315],
    tip: [257, 405],       // the kris's point, for the slash's arc
    hip: [112, 315],
    knee: [108, 445],
  },

  cuts: {
    headBottom: 120,
    torsoTop: 110,
    torsoBottom: 320,      // the tunic's hem and the sash's ends
    legTop: 305,
    thighBottom: 455,
    shinTop: 440,
  },

  outlines: {
    // The upper arm, from the shoulder to the bottom of the rolled cuff.
    sleeve: [[68, 132], [85, 129], [100, 140], [103, 180], [102, 228], [101, 250],
      [56, 250], [56, 214], [62, 170]],
    // The forearm, the hand and the whole kris: the pommel behind the
    // hand, the guard, and the wavy blade out to its point.
    arm: [[58, 246], [100, 246], [97, 270], [98, 290], [106, 300], [109, 310],
      [117, 303], [125, 306], [123, 317], [150, 332], [180, 347], [210, 364],
      [240, 384], [260, 403], [251, 409], [220, 400], [195, 383], [170, 375],
      [140, 358], [120, 353], [108, 356], [97, 352], [92, 340], [80, 339],
      [70, 331], [68, 322], [46, 323], [29, 316], [29, 297], [42, 291],
      [61, 291], [67, 294], [65, 270], [60, 252]],
    // Where the arm hangs clear of him, so nothing is filled in behind
    // it: the forearm's back edge, the hilt behind his hand, and the
    // blade past his trousers.
    armClear: [
      [[50, 246], [66, 246], [66, 290], [50, 290]],
      [[25, 286], [66, 286], [66, 318], [77, 318], [77, 345], [25, 345]],
      [[151, 322], [270, 322], [270, 415], [151, 415]],
    ],
    // The far sandal's toes, peeping out past the near foot.
    farFoot: (x, y) => x >= 161 && y >= 540 && y <= 562,
  },

  // His side, behind the sleeve, is the tunic's green: not the strap's
  // brown or the sash's red, which would band it.
  sideColour: (r, g, b) => g > r && g >= b && g > 70,

  // Written beside the still. Content: content/enemies.js (kawal,
  // KAWAL_CELL).
  sheets: [
    { file: "kawal-walk.png", motion: "walk" },
    { file: "kawal-attack.png", motion: "slash" },
    { file: "kawal-hit.png", motion: "hit" },
  ],
};
