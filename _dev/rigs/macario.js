// =============================================================
// MACARIO — _dev/rigs/macario.js
//
// Macario's rig for _dev/tools/animate-player.js: where his joints are
// in macario-still.png, where it is cut, and which clips to write. The
// player's own rig, not animate-still.js's: he has more parts (hair,
// the shirt's hem, a foot, the far arm) and his clips are keyframed and
// foot-locked rather than taken from MOTIONS.
//
// The still is the new model (new-macario-design.png, delivered 22 Oct
// 2026 with real transparency): side on, facing right, long loose hair,
// an embroidered camisa with a standing collar and side slits, dark
// trousers, leather shoes. Cleaned of stray specks, cropped to him and
// shrunk by area averaging to 720 tall (twice the sheets' 360), so
// every coordinate below is in that 187 x 720 picture, read off zoomed
// crops with a 10px grid, not guessed.
//
// The two trouser legs overlap in the still: the near leg (lit, on the
// left) covers the far one, whose front edge shows as a dark strip. The
// near leg is cut along that edge (nearLegEdge) and the far leg is the
// near one drawn again, darker, as animate-still.js does.
//
// Run:  node _dev/tools/animate-player.js macario
// =============================================================

module.exports = {
  still: "assets/sprites/player/macario-still.png",
  // The sheets are drawn at half the still: 360 tall.
  outScale: 0.5,

  top: 3,                  // the top of his hair
  ground: 718,             // his soles
  footX: 88,               // where he stands: under the hip

  joints: {
    neck: [110, 108],      // the head nods about this
    nape: [86, 104],       // the hanging hair swings from here
    shoulder: [66, 180],
    elbow: [68, 290],
    wrist: [98, 388],
    hip: [86, 405],        // the lean, and the thighs, turn about this
    knee: [84, 548],
    ankle: [78, 693],
    toe: [166, 716],       // the heel lifts about this
    heel: [58, 716],       // the foot lands on this
  },

  cuts: {
    headBottom: 112,       // the head is cut from above here...
    torsoTop: 104,         // ...and the collar drawn over it from here
    hemTop: 330,           // the shirt below this sways (the hem)
    hemBottom: 419,        // the shirt ends here
    legTop: 380,           // the legs are cut from here down (under the hem)
    thighBottom: 560,      // the thigh overlaps the shin at the knee
    shinTop: 536,
  },

  outlines: {
    // The hair that hangs below the head, behind the collar and the
    // shoulder, down to its tips.
    hair: [[0, 88], [86, 88], [87, 100], [84, 110], [72, 128], [54, 140],
      [42, 150], [34, 166], [31, 200], [33, 250], [0, 250]],
    // The whole near arm, from the cap of the sleeve round the shoulder,
    // down the crease in front, round the cuff and the hand, and back up
    // the sleeve's back edge.
    arm: [[35, 170], [45, 158], [60, 152], [78, 153], [92, 162], [100, 185],
      [101, 240], [100, 290], [106, 330], [112, 381], [118, 392], [123, 405],
      [122, 420], [114, 430], [106, 435], [96, 434], [90, 425], [87, 410],
      [84, 393], [78, 392], [66, 375], [60, 355], [49, 315], [42, 295],
      [38, 270], [35, 240], [32, 200]],
    // The slit in the shirt's side, where the trousers show through: cut
    // out of the shirt so the moving legs show there instead.
    slit: [[58, 346], [72, 346], [72, 419], [58, 419]],
    // The near shoe, below the trouser hem and under the far shoe.
    foot: [[48, 699], [70, 694], [92, 679], [110, 683], [130, 690], [150, 697],
      [166, 702], [178, 710], [174, 720], [48, 720]],
  },

  // The near leg's front edge, [y, x] down the leg: right of it is the
  // far leg's dark strip.
  nearLegEdge: [[380, 134], [420, 130], [440, 125], [500, 122], [550, 118],
    [600, 117], [660, 118], [700, 122]],

  // His side behind the sleeve is the shirt's cream: not the hair, not
  // the hand, not the trousers in the slit.
  sideColour: (r, g, b) => r > 150 && g / r > 0.82 && b / r > 0.7,
  // What may fill under the hand and above the hips: the trousers.
  legColour: (r, g, b) => r < 110 && g < 100 && b < 100,

  // Written beside the still. Content: js/game.js, BASE_SPRITE_SHEETS.
  clips: [
    { file: "macario-new-idle.png", clip: "idle" },
    { file: "macario-new-walk.png", clip: "walk" },
  ],
};
