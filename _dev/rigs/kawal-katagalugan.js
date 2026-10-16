// =============================================================
// MACARIO — _dev/rigs/kawal-katagalugan.js
//
// A fighter of the Republika ng Katagalugan (Block 135), Acts III and IV:
// the artist's still, delivered on black (Act3_KawalKatagalugan.png),
// keyed with key-still.js. Side on, facing right, a salakot, a bandolier,
// a rifle held low across his legs. He stands by the flag, drills and
// takes the rice: idle only, the rifle's barrel across his legs kept on
// his body.
// How to read a rig: _dev/rigs/siga-2.js.
//
// Run:  node _dev/tools/animate-still.js kawal-katagalugan
// =============================================================

module.exports = {
  still: "assets/sprites/characters/kawal-katagalugan-still.png",
  mirror: false,
  scale: 0.55,

  top: 4,
  ground: 543,
  footX: 102,
  soles: [75, 175],

  joints: {
    neck: [115, 95],
    shoulder: [90, 125],
    elbow: [80, 210],
    fist: [75, 282],
    hip: [100, 295],
    knee: [100, 420],
  },

  cuts: {
    headBottom: 100,
    torsoTop: 92,
    torsoBottom: 300,
    legTop: 290,
    thighBottom: 432,
    shinTop: 414,
  },

  outlines: {
    overLegs: [
      [[56, 294], [74, 294], [158, 466], [146, 472]],
    ],
  },

  sheets: [
    { file: "kawal-katagalugan.png", motion: "idle" },
  ],
};
