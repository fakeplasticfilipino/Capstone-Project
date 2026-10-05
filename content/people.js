// =============================================================
// MACARIO — content/people.js
//
// Block 113. The art of the people who live in more than one act, each
// described once, the way content/enemies.js describes every fighter
// once: window.PEOPLE.nanay, PEOPLE.kasama and so on. Act I and Act II
// both read from here, so a sheet re-measured or redrawn is changed in
// one place.
//
// Why a file of its own: the act files are plain scripts that share one
// global scope, so a second act cannot declare const NANAY beside Act
// I's (a SyntaxError that blanks the game), and reading Act I's own
// constants from Act II would break the day Act I is swapped for the
// harness's fixture. A plain object on window is neither.
//
// Pure data, loaded before content/act1.js (index.html, teacher.html,
// and the content check in _dev/tools/lib/checks.js). Every sheet was
// measured with _dev/tools/measure-sprite.js; the comments on each are
// where it came from. Who appears only in one act (the siga, the
// Sultan) stays in that act's file.
// =============================================================

(function () {
  // Nanay (Block 101): the proponent's still of her side on, facing
  // right, animated by _dev/tools/animate-still.js (rig _dev/rigs/
  // nanay.js) to stand with the calm idle and to walk, a short step under
  // the long skirt. One cell for both, so she does not slide when she
  // stops.
  const NANAY_CELL = { columns: 4, contentTop: 13, contentHeight: 396, footX: 67, headroom: 13 };

  // The Katipunero and the Kasama (Block 98): the artist's stills,
  // animated by animate-still.js (rigs katipunero.js, kasama.js):
  // standing with a breath, a sway and a nod; walking when a scene walks
  // them on or off. The art faces right.
  const stillAnimated = (name, cell) => ({
    idle: { src: `assets/sprites/characters/${name}.png`, frames: 8, fps: 4, ...cell },
    walk: { src: `assets/sprites/characters/${name}-walk.png`, frames: 8, fps: 12, ...cell },
  });

  // The proponent's stills drawn facing the front (Blocks 101, 102),
  // standing still: only people drawn side on are animated.
  const frontStill = (name, contentTop, contentHeight, footX) =>
    ({ src: `assets/sprites/characters/${name}.png`, frames: 1, fps: 1, contentTop, contentHeight, footX });

  window.PEOPLE = {
    nanay: { src: "assets/sprites/characters/nanay.png", frames: 8, fps: 4, ...NANAY_CELL },
    nanayWalk: { src: "assets/sprites/characters/nanay-walk.png", frames: 8, fps: 12, ...NANAY_CELL },

    // The Kutsero (Block 101): facing the front, rope and whip.
    kutsero: frontStill("kutsero", 37, 512, 519),
    // The Mananahi (Block 98): the artist's still, facing the front.
    mananahi: frontStill("mananahi", 32, 515, 521),
    // The Barbero (Block 101): facing the front, comb and scissors.
    barbero: frontStill("barbero", 19, 529, 514),
    // Maryam (Block 101): facing the front, a head wrap.
    maryam: frontStill("maryam", 47, 495, 511),
    // The three who took the pamphlets (Block 102).
    mangingisda: frontStill("mangingisda", 22, 524, 517),
    tabakera: frontStill("tabakera", 29, 508, 511),
    karpintero: frontStill("karpintero", 26, 512, 514),

    // The direktor (Block 98): the artist's still of an old man with a
    // cane, breathing and nodding only, so the cane stays on the ground.
    direktor: {
      src: "assets/sprites/characters/direktor.png", frames: 8, fps: 4, columns: 4,
      contentTop: 5, contentHeight: 413, footX: 77, headroom: 5,
    },

    katipunero: stillAnimated("katipunero",
      { columns: 4, contentTop: 7, contentHeight: 403, footX: 131, headroom: 7 }),
    kasama: stillAnimated("kasama",
      { columns: 4, contentTop: 8, contentHeight: 404, footX: 119, headroom: 8 }),

    // Isko (Block 113), Macario's man in Acts II and III, owed (ART.md):
    // a placeholder box until drawn. Here since Block 117, as he returns.
    isko: { src: "assets/sprites/characters/isko.png", frames: 1, fps: 1 },

    // The Kutsero's horse (Block 100): the proponent's still of a saddled
    // bay, animated by _dev/tools/animate-kabayo.js to dip his head and
    // tuck his tail, a horse at rest. Here since Block 120, when he comes
    // back in Act IV with the carriage; Act I and its grooming game read
    // him from here.
    kabayo: {
      src: "assets/sprites/characters/kabayo.png", frames: 12, fps: 6, columns: 4,
      contentTop: 4, contentHeight: 262, footX: 115, headroom: 4,
    },

    // The Mabalasig (Block 101): the proponent's still, side on, idle only.
    mabalasig: {
      src: "assets/sprites/characters/mabalasig.png", frames: 8, fps: 4, columns: 4,
      contentTop: 7, contentHeight: 394, footX: 73, headroom: 7,
    },
  };
})();
