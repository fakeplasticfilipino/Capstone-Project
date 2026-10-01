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
//            Sheets: animation (the walk), attackAnimation, and since
//            Block 96 hitAnimation, as a guard's.
//
// Both take blows the same way (game.js, takeBlow): a slide, a flash,
// a stagger, and at no hp the topple and the fade.
//
// Every sheet is measured with _dev/tools/measure-sprite.js and checked
// with _dev/tools/preview-sheet.js. Loaded before content/act1.js,
// which reads the art for the Sultan from here, and before game.js.
// =============================================================

// The three siga of the opening (Block 87), all the artist's: one still
// each (siga-N-still.png), cut up and moved by _dev/tools/animate-still.js
// (rigs: _dev/rigs/siga-1.js, siga-2.js, siga-3.js; Blocks 96 to 98)
// into a walk, a punch and a flinch, broad on purpose so they read on a
// phone. A boy's four sheets share one cell and one set of numbers
// (SIGA_CELLS, from the tool). The attack plays once per strike: he
// draws the fist back through frames 0 to 2, the red !, and throws it on
// frame 3, a third of a second in, as the dash starts (game.js,
// ATTACK_TELL_MS, ENEMY_DASH_MS); 8 frames at 10 last the tell, the dash
// and the follow-through. The flinch's 4 frames at 12 last his stagger
// (ENEMY_STAGGER_MS), and frame 1, leaning furthest back, is held as he
// falls. size keeps the three heights the opening gave them against
// Macario's 127 (displayHeight), whatever a sheet measures: the leader
// is Macario's height, the big one taller, the small one shorter.
// content/act1.js reads both from here for the opening's walk-on.
const SIGA_CELLS = {
  1: { columns: 4, contentTop: 7, contentHeight: 398, footX: 132, headroom: 7 },
  2: { columns: 4, contentTop: 7, contentHeight: 405, footX: 149, headroom: 7 },
  3: { columns: 4, contentTop: 8, contentHeight: 401, footX: 136, headroom: 8 },
};
const KAWAL_CELL = { columns: 4, contentTop: 6, contentHeight: 366, footX: 113, headroom: 6 };
const sigaFighter = (n, size, hp) => ({
  kind: "enemy",
  hp,
  displayHeight: Math.round(134 * size / 127),
  animation: {
    src: `assets/sprites/characters/siga-${n}-walk.png`, frames: 8, fps: 12, ...SIGA_CELLS[n],
  },
  attackAnimation: {
    src: `assets/sprites/characters/siga-${n}-attack.png`, frames: 8, fps: 10, ...SIGA_CELLS[n],
  },
  hitAnimation: {
    src: `assets/sprites/characters/siga-${n}-hit.png`, frames: 4, fps: 12, ...SIGA_CELLS[n],
    knockoutFrame: 1,
  },
});

window.ENEMY_TYPES = {
  siga1: sigaFighter(1, 127, 2),
  siga2: sigaFighter(2, 137, 2),
  siga3: sigaFighter(3, 115, 1),

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

  // The Sultan's soldier in the play (Block 59). Since Block 101 the
  // proponent's still (kawal-still.png), a turban, a kris and a shield,
  // drawn three-quarter, animated by _dev/tools/animate-still.js (rig
  // _dev/rigs/kawal.js): he marches (each leg lifted in turn), strikes
  // with the thrust, his whole body behind the blade since both hands are
  // full (frames 0 to 2 the red !, 3 the blow, as the siga's punch), and
  // flinches with the hit. One cell for all three.
  kawal: {
    kind: "enemy",
    hp: 2,
    animation: { src: "assets/sprites/enemies/kawal-walk.png", frames: 8, fps: 10, ...KAWAL_CELL },
    attackAnimation: { src: "assets/sprites/enemies/kawal-attack.png", frames: 8, fps: 10, ...KAWAL_CELL },
    hitAnimation: {
      src: "assets/sprites/enemies/kawal-hit.png", frames: 4, fps: 12, ...KAWAL_CELL, knockoutFrame: 1,
    },
  },
};
