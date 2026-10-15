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

  // Block 133. One cell each for a standing sheet and its walk, as the
  // tool printed them.
  const ISKO_CELL = { columns: 4, contentTop: 5, contentHeight: 295, footX: 90, headroom: 5 };
  const MANLILIMBAG_CELL = { columns: 4, contentTop: 6, contentHeight: 295, footX: 80, headroom: 6 };
  const TAGAPAGBALITA_CELL = { columns: 4, contentTop: 6, contentHeight: 295, footX: 73, headroom: 6 };
  const MONTALAN_CELL = { columns: 4, contentTop: 12, contentHeight: 296, footX: 84, headroom: 12 };

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

  // Block 133. Tondo's street, which every act walks: the artist's
  // paintings of 12 October 2026, one to each of its ten panels (1450
  // wide each; game.js, buildPanelBackdrop), and their night versions,
  // laid instead while a scene is night (nightPanels). The artist
  // numbered them 1 to 5, 9 and 10; 4 is the theatre's front and 10 the
  // row with the barbershop, so they stand in the slots where the
  // entablado (panel 10) and the Barbero (panel 4) already are, and
  // nobody on the street had to move. Six to eight were not delivered,
  // so 2, 5 and 3 fill those slots again. Night has 1 to 6, the sixth
  // with no day painting yet; the theatre's night (4) is panel 10's.
  const day = (n) => "assets/backgrounds/act1/street-" + n + ".jpg";
  const night = (n) => "assets/backgrounds/act1/street-" + n + "-night.jpg";
  window.STREET = {
    day: ["01", "02", "03", "10", "05", "09", "02", "05", "03", "04"].map(day),
    night: ["01", "02", "03", "06", "05", "03", "02", "06", "05", "04"].map(night),
    // The night paintings' own sky at their top edge, measured, for the
    // strip above them on a tall screen (panelSky's night twin).
    nightSky: "#02153a",
  };

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

    // Block 133. The artist's stills of the people who return in Acts II
    // to IV, delivered on black and keyed (Block 129's way), animated by
    // animate-still.js (rigs isko.js, manlilimbag.js, tagapagbalita.js,
    // montalan.js, carreon.js): each standing sheet, and a walk for those
    // a scene walks on or off (the name with Walk), one cell for both.
    // Isko, Macario's man in Acts II to IV (Block 113; here since 117).
    isko: { src: "assets/sprites/characters/isko.png", frames: 8, fps: 4, ...ISKO_CELL },
    iskoWalk: { src: "assets/sprites/characters/isko-walk.png", frames: 8, fps: 12, ...ISKO_CELL },
    // The Katipunan's printer, Acts II to IV.
    manlilimbag: { src: "assets/sprites/characters/manlilimbag.png", frames: 8, fps: 4, ...MANLILIMBAG_CELL },
    manlilimbagWalk: { src: "assets/sprites/characters/manlilimbag-walk.png", frames: 8, fps: 12, ...MANLILIMBAG_CELL },
    // The messenger, Acts II to IV.
    tagapagbalita: { src: "assets/sprites/characters/tagapagbalita.png", frames: 8, fps: 4, ...TAGAPAGBALITA_CELL },
    tagapagbalitaWalk: { src: "assets/sprites/characters/tagapagbalita-walk.png", frames: 8, fps: 12, ...TAGAPAGBALITA_CELL },
    // Julian Montalan, the Katagalugan's general, Acts III and IV.
    montalan: { src: "assets/sprites/characters/montalan.png", frames: 8, fps: 4, ...MONTALAN_CELL },
    montalanWalk: { src: "assets/sprites/characters/montalan-walk.png", frames: 8, fps: 12, ...MONTALAN_CELL },
    // Francisco Carreón, the Katagalugan's Vice President, Acts III and
    // IV: he only stands.
    carreon: {
      src: "assets/sprites/characters/carreon.png", frames: 8, fps: 4, columns: 4,
      contentTop: 5, contentHeight: 297, footX: 32, headroom: 5,
    },

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
