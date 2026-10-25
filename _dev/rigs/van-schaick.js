// =============================================================
// MACARIO — _dev/rigs/van-schaick.js
//
// Colonel Louis Van Schaick (Block 151), in Act IV: the artist's still
// from the Drive (Van_Schaick.png, 17 Oct 2026), on black, keyed with
// key-still.js. Side on, facing right, standing straight in a dress
// uniform, the sabre's hilt and strap by his hand. He receives Macario
// at the sala: idle only, the strap cloth over the legs.
// How to read a rig: _dev/rigs/siga-2.js.
//
// Run:  node _dev/tools/animate-still.js van-schaick
// =============================================================

module.exports = {
  still: "_dev/stills/characters/van-schaick-still.png",
  mirror: false,
  scale: 0.55,

  top: 4,
  ground: 544,
  footX: 65,
  soles: [35, 125],

  joints: {
    neck: [85, 92],
    shoulder: [55, 120],
    elbow: [50, 210],
    fist: [45, 290],
    hip: [65, 292],
    knee: [65, 415],
  },

  cuts: {
    headBottom: 96,
    torsoTop: 88,
    torsoBottom: 292,
    legTop: 282,
    thighBottom: 425,
    shinTop: 408,
  },

  outlines: {
    // The sabre's strap and hilt, hanging by his hand over the thigh.
    overLegs: [[[22, 280], [62, 280], [62, 378], [22, 378]]],
  },

  sheets: [
    { file: "van-schaick.png", motion: "idle" },
  ],
};
