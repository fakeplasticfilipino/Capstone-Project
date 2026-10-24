// =============================================================
// MACARIO — _dev/rigs/amerikano.js
//
// The amerikano, the American soldier of Acts III and IV's fights and
// sentries: the proponent's still of 24 Oct 2026 (ART.md's 1899 to 1906
// prompt), cropped and shrunk to 548 tall. Side on, facing right, a
// campaign hat, a blue flannel shirt, khaki and puttees, a rifle with
// its bayonet held across his body, the butt by his thigh. He stands
// guard (the sentinela), walks, lunges with the bayonet (thrust, for
// full hands) and flinches. The rifle's stock and his hand below the
// belt are cloth over the legs: filled where they cross them.
// How to read a rig: _dev/rigs/siga-2.js.
//
// Run:  node _dev/tools/animate-still.js amerikano
// =============================================================

module.exports = {
  still: "_dev/stills/enemies/amerikano-still.png",
  mirror: false,
  scale: 0.55,

  top: 6,
  ground: 543,
  footX: 62,
  soles: [37, 122],

  joints: {
    neck: [85, 82],
    shoulder: [55, 112],
    elbow: [52, 200],
    fist: [70, 295],
    hip: [62, 290],
    knee: [62, 418],
  },

  cuts: {
    headBottom: 88,
    torsoTop: 80,
    torsoBottom: 300,
    legTop: 285,
    thighBottom: 432,
    shinTop: 414,
  },

  outlines: {
    // The bayonet's point, as high as his face: the body's, not the head's.
    notHead: [[170, 0], [290, 0], [290, 95], [170, 95]],
    overLegs: [
      // The receiver, the hand round the wrist of the stock, the stock
      // down to the butt beside his thigh.
      [[50, 275], [104, 262], [106, 290], [88, 306], [66, 322], [33, 384], [25, 384],
        [5, 356], [46, 306]],
      // The butt beyond the back of his thigh: nothing of the legs there,
      // or the far leg carries a dark copy of it.
      { outline: [[0, 296], [39, 296], [39, 404], [0, 404]], clear: true },
    ],
  },

  sheets: [
    { file: "amerikano.png", motion: "idle" },
    { file: "amerikano-walk.png", motion: "walk" },
    { file: "amerikano-attack.png", motion: "thrust" },
    { file: "amerikano-hit.png", motion: "hit" },
  ],
};
