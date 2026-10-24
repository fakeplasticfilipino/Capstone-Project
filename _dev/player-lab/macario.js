// =============================================================
// MACARIO — _dev/player-lab/macario.js
//
// Macario's skeleton for _dev/tools/skeleton.js: where his bones are in
// the still, how the still is split into layers, and what the sheets
// are called. The still is Macario drawn in the NPCs' own style (clean
// outlines, flat shading; ART.md's prompt, 24 Oct 2026), which replaced
// the realistic painting the same day (Block 145). A skin painted on the
// same template (the same pose, the same canvas, the same scale) uses
// this file as it is, with only still changed.
//
// Every coordinate is in the working picture: the still cropped to
// crop and shrunk by shrink (so 210 x 745 for the 1024 x 1536 template),
// read off zoomed crops with a 10px grid. node _dev/tools/skeleton.js
// macario --debug writes that picture with the bones and outlines drawn
// on, to check them by eye. Near-black pixels inside the arm's outline
// are the drawing's own lines and go with the arm (outlineLuma).
// =============================================================

module.exports = {
  still: "_dev/player-lab/macario-still.png",
  crop: [290, 40, 420, 1490],   // x, y, w, h in the template
  shrink: 2,

  ground: 734,                  // his soles

  joints: {
    hip: [100, 362],            // the pelvis; the root, and the thighs' pivot
    chest: [100, 262],          // the upper back bends about this
    neck: [112, 116],           // the head turns about this
    headTop: [122, 20],
    nape: [72, 150],            // the hair hanging down his back swings from here
    hairTip: [40, 292],
    shoulder: [74, 172],
    elbow: [78, 295],
    wrist: [113, 402],
    handTip: [118, 450],
    knee: [96, 533],
    ankle: [88, 708],
    heel: [68, 737],            // the foot rocks on this as it lands...
    ball: [150, 733],           // ...and on this as it pushes off
    toe: [182, 736],
    hem: [100, 432],            // the jacket's skirt hangs from the hip to here
  },

  // The near arm, sleeve and hand: drawn in front of everything, and
  // drawn again behind him, darker, as the far arm. Hair inside it stays
  // with the body.
  arm: [[72, 151], [98, 153], [110, 173], [115, 207], [113, 250], [111, 290],
    [109, 318], [118, 343], [130, 358], [132, 398], [138, 410], [141, 428],
    [134, 450], [120, 457], [104, 453], [96, 438], [94, 410], [83, 407],
    [79, 368], [70, 350], [64, 328], [58, 300], [53, 240], [54, 180],
    [60, 162]],

  // The near leg, from above the hip (under the jacket, filled with
  // trouser) down round the near shoe. Its front edge runs down the
  // crease where the far leg shows; the far leg and shoe are left out
  // and replaced by this leg drawn again, darker.
  leg: [[56, 338], [152, 338], [152, 440], [141, 500], [136, 550], [131, 590],
    [123, 640], [120, 690], [128, 698], [150, 708], [170, 718], [176, 730], [176, 745], [58, 745],
    [60, 700], [55, 600], [57, 500], [58, 440]],

  darkLuma: 100,                // trousers, shoes and hair are darker than this
  hairAbove: 330,               // dark pixels above this are hair, not trouser
  hemY: 426,                    // the jacket ends here
  outlineLuma: 34,              // near-black: the drawing's outlines
  farShade: 0.68,               // the far arm and leg, darkened
  farLegOffset: 16,             // the far foot stands this far ahead at rest

  // Every clip is written here too, for the test page.
  out: "_dev/player-lab/out",
  clips: ["idle", "walk", "melee", "cross", "kick", "shoot", "jump", "slash"],
  // Written into assets/sprites/player/ by --ship: every sheet the game
  // uses of him (js/game.js, BASE_SPRITE_SHEETS; the bolo's slash,
  // content/items.js). Since Block 145 this is the player's art.
  ship: ["idle", "walk", "melee", "cross", "kick", "shoot", "jump", "slash"],

  // What he holds. The itak (a bolo) is the artist's picture, owed
  // (ART.md): drawn pointing right, handle at the left, on transparency.
  // Until it exists the slash is drawn without it.
  props: {
    itak: {
      src: "assets/sprites/player/itak.png",
      bone: "hand",
      grip: [120, 432],       // where his fist closes on the handle
      angle: 12,              // at rest the blade points forward, a little down
      length: 230,            // butt to point, working px (about 56 cm on him)
      handle: 0.2,            // the part of that behind his fist
    },
  },
};
