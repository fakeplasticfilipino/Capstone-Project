// =============================================================
// MACARIO — _dev/rigs/konstable.js
//
// The konstable, the Philippine Constabulary of Acts III and IV: the
// proponent's still of 24 Oct 2026 (ART.md's 1905 prompt), cropped and
// shrunk to 548 tall. Side on, facing right, a campaign hat, a khaki
// tunic to the hip, a cartridge belt, puttees, a rifle held across his
// body, the butt by his thigh. He stands guard (the bantay-konstable),
// walks, lunges with the rifle (thrust) and flinches. The stock and his
// hand below the tunic are cloth over the legs, as the amerikano's.
// How to read a rig: _dev/rigs/siga-2.js.
//
// Run:  node _dev/tools/animate-still.js konstable
// =============================================================

module.exports = {
  still: "_dev/stills/enemies/konstable-still.png",
  mirror: false,
  scale: 0.55,

  top: 5,
  ground: 542,
  footX: 52,
  soles: [30, 116],

  joints: {
    neck: [85, 86],
    shoulder: [52, 118],
    elbow: [40, 210],
    fist: [68, 285],
    hip: [60, 300],
    knee: [62, 422],
  },

  cuts: {
    headBottom: 94,
    torsoTop: 86,
    torsoBottom: 304,
    legTop: 296,
    thighBottom: 436,
    shinTop: 418,
  },

  outlines: {
    // The muzzle, near the height of his chin: the body's, not the head's.
    notHead: [[170, 0], [240, 0], [240, 110], [170, 110]],
    overLegs: [
      // The receiver, his hand round the wrist of the stock, the stock
      // down to the butt beside his thigh.
      [[48, 262], [100, 248], [104, 276], [90, 300], [68, 306], [40, 366], [30, 366],
        [12, 342], [45, 300]],
      // The butt beyond the back of his thigh.
      { outline: [[0, 320], [24, 320], [24, 372], [0, 372]], clear: true },
    ],
  },

  sheets: [
    { file: "konstable.png", motion: "idle" },
    { file: "konstable-walk.png", motion: "walk" },
    { file: "konstable-attack.png", motion: "thrust" },
    { file: "konstable-hit.png", motion: "hit" },
  ],
};
