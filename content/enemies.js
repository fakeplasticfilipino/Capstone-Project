// =============================================================
// MACARIO — content/enemies.js
//
// The enemy catalogue (Block 76): every kind of enemy described once,
// its art and its numbers, the way content/items.js describes every
// item once. A scene or a script then places one by naming its type:
//
//   guards: [{ type: "bantay", id: "bantay-1", x: 700,
//              patrolFrom: 560, patrolTo: 1000 }]
//   spawnEnemies([{ type: "kawal", id: "kawal-1", x: 1260 }])
//
// Whatever the placement says wins over the type (a sentry's own
// detectRadius, a tougher soldier's hp), and a placement with no type
// is taken as it stands, which is how every act written before this
// file still works. The engine merges the two when it builds the scene
// or the fight (game.js, withEnemyType), and never learns what a type
// means beyond its fields.
//
// Two kinds, by what they do, which is also where they are placed:
//
//   guard    a scene's guards list. Patrols, sees (detectRadius), and
//            catches or, with shoots, turns hostile and fires. Sheets:
//            animation (standing), walkAnimation, shootAnimation,
//            hitAnimation. See CLAUDE.md, Act data format.
//   enemy    spawnEnemies, in a script. Walks at Macario and swings.
//            Sheets: animation (the walk), attackAnimation.
//
// Both take blows the same way (game.js, takeBlow): a slide, a flash,
// a stagger, and at no hp the topple and the fade.
//
// Every sheet is measured with _dev/tools/measure-sprite.js and checked
// with _dev/tools/preview-sheet.js. Loaded before content/act1.js,
// which reads the art for the Sultan from here, and before game.js.
// =============================================================

// The three siga of the opening (Block 87), on the walk sheets drawn in
// code (_dev/tools/draw-siga.js). They have no attack sheet: the lit-up
// warning before a swing is the tell. displayHeight keeps the three sizes
// the opening gave them (content/act1.js, sigaSheets).
const sigaFighter = (n, top, height, hp) => ({
  kind: "enemy",
  hp,
  displayHeight: Math.round(134 * height / 127),
  animation: {
    src: `assets/sprites/characters/siga-${n}-walk.png`, frames: 8, fps: 14, columns: 4,
    contentTop: top, contentHeight: height, footX: 128,
  },
});

window.ENEMY_TYPES = {
  siga1: sigaFighter(1, 61, 127, 2),
  siga2: sigaFighter(2, 51, 137, 2),
  siga3: sigaFighter(3, 73, 115, 1),

  // The guardia civil (Block 73). The still is the artist's (delivered
  // as Guard.png); the walk, the shot (Block 73) and the flinch (Block
  // 75) are made from it by _dev/tools/animate-bantay.js, which moves the
  // still's own parts. All four share his height in the still (394 of
  // it), so he is one size whatever he does; headroom shows the bayonet
  // above his helmet. The shot's aimFrame is the rifle levelled,
  // fireFrame the flash, and its muzzle is where the bullet leaves. The
  // flinch is in the walk's cells, so it has the walk's numbers; its
  // knockoutFrame, leaning furthest back, is held as he topples.
  bantay: {
    kind: "guard",
    shoots: true, hp: 2, speed: 1.3, detectRadius: 260,
    animation: {
      src: "assets/sprites/enemies/bantay.png", frames: 1, fps: 1,
      contentTop: 50, contentHeight: 394, footX: 238, headroom: 8,
    },
    walkAnimation: {
      src: "assets/sprites/enemies/bantay-walk.png", frames: 8, fps: 10, columns: 4,
      contentTop: 40, contentHeight: 394, footX: 128, headroom: 40,
    },
    shootAnimation: {
      src: "assets/sprites/enemies/bantay-shoot.png", frames: 7, fps: 14, columns: 4,
      contentTop: 20, contentHeight: 394, footX: 88, headroom: 20,
      aimFrame: 2, fireFrame: 3, muzzle: { x: 367, y: 226 },
    },
    hitAnimation: {
      src: "assets/sprites/enemies/bantay-hit.png", frames: 4, fps: 9, columns: 4,
      contentTop: 40, contentHeight: 394, footX: 128, headroom: 40, knockoutFrame: 1,
    },
  },

  // The Sultan's soldier in the play (Block 59), on the old moro-moro's
  // walk and sword sheets (Block 40): delivered as JPEGs on black, keyed
  // to PNGs, the attack sheet grounded by its standing frames, with
  // headroom for the raised sword. The Sultan himself walks on the same
  // walk sheet, as a decoration (content/act1.js).
  kawal: {
    kind: "enemy",
    hp: 2,
    animation: {
      src: "assets/sprites/enemies/muslim-walk.png", frames: 12, fps: 10,
      columns: 4, contentTop: 43, contentHeight: 70, footX: 72,
    },
    attackAnimation: {
      src: "assets/sprites/enemies/muslim-attack.png", frames: 15, fps: 24,
      columns: 4, contentTop: 30, contentHeight: 97, footX: 88, headroom: 29,
    },
  },
};
