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
  arm: [[72, 151], [98, 153], [110, 173], [116, 207], [115, 250], [114, 290],
    [116, 318], [118, 340], [125, 357], [126, 398], [129, 410], [130, 430],
    [127, 448], [120, 456], [104, 453], [96, 438], [94, 410], [83, 407],
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
  hairBehind: 70,               // ...and only behind this x: in front, the sleeve's lines
  hemY: 426,                    // the jacket ends here
  outlineLuma: 34,              // near-black: the drawing's outlines
  farShade: 0.68,               // the far arm and leg, darkened
  farLegOffset: 16,             // the far foot stands this far ahead at rest

  // Skins on this template that read differently (Block 148): the
  // general's uniform is as dark as its trousers, so the hem alone tells
  // jacket from trouser (skeleton.js, darkJacket).
  // Block 154: the three story clothes, each fitted to the template by
  // _dev/tools/fit-skin.py first. hemY is where each one's shirt or tunic
  // ends; overLegs is cloth hanging over the legs that stays with the
  // body (the cape and the sash's tassels, the Katipunero's sash tail).
  skins: {
    "macario-heneral": { darkJacket: true },
    // The stage clothes: tunic and trousers are the same red, so the hem
    // alone tells them apart, and the tunic painted in behind the arm is
    // the red cloth round it.
    "macario-entablado": {
      darkJacket: true,
      hemY: 418,
      armMargin: 3,
      jacketCloth: (r, g, b) => r > 0.3 && r > g * 2.2,
      overLegs: [
        [[38, 170], [60, 170], [60, 330], [73, 345], [74, 492], [60, 486], [22, 466], [0, 446], [0, 300]],
        [[150, 284], [180, 284], [194, 380], [202, 440], [201, 472], [160, 472], [158, 330]],
      ],
      // The cuff is wider than the camisa's.
      arm: [[72, 151], [98, 153], [110, 173], [116, 207], [115, 250], [114, 290],
        [118, 318], [124, 334], [132, 348], [133, 398], [130, 412], [130, 430],
        [127, 448], [120, 456], [104, 453], [96, 438], [94, 412], [82, 407],
        [80, 368], [74, 350], [64, 328], [58, 300], [53, 240], [54, 180],
        [60, 162]],
    },
    // The camisa is tucked into the sash: the trousers start under it.
    "macario-katipunero": {
      hemY: 335,
      armMargin: 3,
      hairAbove: 300,
      // His arm is a white sleeve and bare skin: the red behind it is the
      // sash and the trousers.
      notArm: (r, g, b) => r > 0.35 && r > g * 2.2 && r > b * 2.2,
      // Painted in behind the arm: the camisa's white above the sash (not
      // the hair's brown highlights, which would streak it), the sash's
      // red from its top down.
      jacketCloth: (r, g, b, x, y) => y < 308 ? g > 0.7 && b > 0.62 : r > 0.35 && r > g * 2.2,
      overLegs: [
        [[157, 330], [174, 330], [189, 380], [201, 445], [197, 476], [168, 476], [160, 458], [161, 360]],
      ],
    },
    // The shirt hangs loose to a ragged hem.
    "macario-magtataho": {
      hemY: 384,
      armMargin: 3,
      // The faded shirt, not the hair's brown or the stains.
      jacketCloth: (r, g, b) => g > 0.62 && r - b < 0.22,
    },
  },

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
      handle: 0.3,            // the part of that behind his fist (the 28 Oct blade's longer grip)
    },
    // Block 151. The revolver of the shot, the artist's picture: grip
    // at the left, barrel pointing right. angle is at rest, with the arm
    // hanging; raised to aim, the barrel comes level with the arm.
    pistola: {
      src: "assets/sprites/player/pistola.png",
      bone: "hand",
      grip: [120, 432],
      angle: 80,
      length: 100,            // about 25 cm on him
      handle: 0.3,
    },
  },
};
