// =============================================================
// MACARIO — content/items.js
//
// The item catalogue, as pure data. Only ownership is stored
// (player_inventory, player_equipment); the definitions live here
// because they hold no secret. See CLAUDE.md, Item data format, for
// every field, and inventory.js's header for how each kind behaves.
//
// Three groups, which is how the inventory screen sorts them:
//
//   Permanent: kind "equipment" (any slot: "weapon", shown as Sandata,
//   "accessory", shown as Anting-anting, or "outfit", shown as Damit)
//   or kind "cosmetic" (slot "outfit"). Bought or granted once, kept,
//   worn. Equipment carries `effect` and, in the outfit slot, may also
//   carry `sheets`; a cosmetic carries `sheets` and never an effect.
//
//   soldBy (optional) names the NPC whose shop sells it. Without it an
//   item is general stock (the corner shop button).
//
//   replayRemoves (optional): the story hands it over, so a replay of
//   the act after a failed post-test takes it back (Inventory.revoke,
//   Scan S7) and the story hands it over again. givenInAct (Block 121)
//   names that act: a replay of any other act leaves it alone.
//
//   Consumable: kind "consumable". Stacks up to maxStack (default 5).
//   Gamitin applies `use` once and spends one.
//
//   Quest: kind "quest". Carried until the story takes it
//   (Inventory.consume). Listed in Tindahan only while `forQuest` is
//   an open quest.
//
// Block 52 emptied the catalogue with the Act I rewrite, and Block 82
// brought back the one item Act I ships, the stage clothes. Block 121
// put a small general stock back on the corner shop button (below). The harness
// fixture still carries every kind, so the shop, equipment, consumables
// and quest items stay tested. The ids "mansanas" and "mansanas-kabayo"
// (the old apples) must not be reused for a different item. There are
// no item tile pictures; a tile shows the item's symbol (CLAUDE.md,
// Icons), and one drawn later goes in assets/items/, lowercase. A
// permanent item takes this shape:
//
//   {
//     id: "sibat", name: "Sibat", kind: "equipment", slot: "weapon",
//     description: "...", price: 20, img: "assets/items/sibat.png",
//     effect: { projectileSpeedMult: 1.5 },
//   },
//
// Item ids are plain text keys with no foreign key behind them, so an
// id must never be reused for a different item: an old save's row
// would silently become the new one.
// =============================================================

window.ITEMS = [
  // Block 82. The stage clothes come back, as the same item the id meant
  // before Block 52: the costume the Mananahi sewed and Macario first
  // wore as Don Rodrigo. The direktor tells him to go home in them after
  // Principe Baldovino, and hands them over (Inventory.grant, then
  // equip, from content/act1.js). A guardia civil takes a player standing
  // still in them five times as long to notice (stillDetectionMult 0.2,
  // Block 38's number): an actor resting in costume is nothing to look
  // at twice. Not for sale (price 0). No tile picture: the tile shows the
  // Damit symbol, and no art is owed for it. No sheets: Macario looks the
  // same in them until the artist draws the costume.
  {
    id: "damit-entablado", name: "Damit-Pangteatro", kind: "equipment", slot: "outfit",
    description: "Ang damit na tinahi ng Mananahi, suot mula pa kay Don Rodrigo. " +
      "Habang nakatayo ka nang tahimik, mas matagal kang mapapansin ng guardia civil.",
    price: 0,
    effect: { stillDetectionMult: 0.2 },
    replayRemoves: true, // Scan S7: a replay starts without them
    givenInAct: 1, // Block 121: and only a replay of Act I
    // Block 85. A stand-in until the costume is drawn: Macario warmed
    // toward the gold of a stage costume, so a student can see it is on.
    tint: "sepia(0.55) saturate(1.6) hue-rotate(-12deg) brightness(1.05)",
  },
  // Block 117. Act III: a taho seller's clothes from the theatre's trunk,
  // which Maryam gives him in 1899 (Inventory.grant, then equip, from
  // content/act3.js), so the American sentries in Manila do not know
  // him. Standing still in them he is all but invisible to a sentry
  // (0.1): nobody looks twice at a vendor. Worn in the outfit slot, in
  // place of the stage clothes, until he swears never to cut his hair at
  // Morong and puts his own clothes back on. Not for sale. No tile
  // picture, no sheets and, since Block 118, no tint: at the proponent's
  // word nothing stands in for art not drawn, so Macario looks himself
  // in it until the clothes are drawn.
  {
    id: "balatkayo", name: "Balatkayo ng Magtataho", kind: "equipment", slot: "outfit",
    description: "Damit ng magtataho mula sa baul ng entablado. Walang tumitingin nang dalawang " +
      "beses sa isang tindero: habang nakatayo ka nang tahimik, halos hindi ka mapansin ng mga bantay.",
    price: 0,
    effect: { stillDetectionMult: 0.1 },
    replayRemoves: true,
    givenInAct: 3,
  },

  // Block 121. The general stock, on the corner shop button: what barya
  // are for (objective 2). Only effects the engine already has, each
  // tested by the harness's fixture. Not sold while the act is saving
  // toward a sum (a step with countCurrency, Act I's for Nanay), so the
  // shop cannot spend what the story needs (Inventory.forSale). Priced
  // against what an act pays (CLAUDE.md, Standing decisions): an act
  // pays 50 to 100 on completion, so every student who finishes Act I
  // can buy the anting-anting, and a strong run the pulbura. No tile
  // pictures: a tile shows the item's symbol, by design, and nothing is
  // owed. Names and descriptions ours. PLACEHOLDER, all three.
  {
    // PLACEHOLDER. The herb every barrio knew for a cough and a wound.
    id: "lagundi", name: "Dahon ng Lagundi", kind: "consumable",
    description: "Dinikdik na dahon, pantapal sa sugat. Gamitin para maibalik ang isang puso.",
    price: 5,
    icon: "i-heart",
    use: { heal: 1 },
    maxStack: 3,
  },
  {
    // PLACEHOLDER. The Katipuneros and Sakay's men wore them into battle.
    id: "anting-anting", name: "Anting-anting", kind: "equipment", slot: "accessory",
    description: "Isinusuot ng mga Katipunero sa labanan. Habang suot mo, may dagdag kang isang puso.",
    price: 50,
    effect: { maxHealthBonus: 1 },
  },
  {
    // PLACEHOLDER. Finer powder for his pistol: a faster shot, and so the
    // next one sooner (one in flight at a time), for the long fights.
    id: "pulbura", name: "Pinong Pulbura", kind: "equipment", slot: "weapon",
    description: "Pinong pulbura para sa pistola. Habang dala mo, mas mabilis ang iyong putok.",
    price: 90,
    effect: { projectileSpeedMult: 1.5 },
  },
  {
    // PLACEHOLDER. The bolo (Block 145): worn in the Sandata slot, his
    // punch becomes a slash, the same blow on the same frame. No effect:
    // only the sheet changes (_dev/tools/skeleton.js, --ship). General
    // stock at 60, the proponent's price (24 Oct 2026): between the
    // anting-anting and the pulbura, and in the same slot as the pulbura,
    // so a student chooses the blade or the faster shot. The blade in his
    // hand is owed (ART.md, assets/sprites/player/itak.png).
    id: "itak", name: "Itak", kind: "equipment", slot: "weapon", icon: "i-blade",
    description: "Isang itak na pantaga. Habang dala mo, taga ang iyong atake sa halip na suntok.",
    price: 60,
    sheets: {
      melee: {
        src: "assets/sprites/player/macario-slash.png", frames: 12, fps: 24, columns: 8,
        loop: false, contact: 6, cocked: 3,
        // Block 151: the blade drawn, a bigger cell for its back-swing.
        contentTop: 110, contentHeight: 240, footX: 180, headroom: 110,
      },
    },
  },
  // PLACEHOLDER. Block 148. The first skin: the uniform of the President
  // and Generalissimo of the Republika ng Katagalugan (1902), the
  // proponent's still on Macario's template, every move written by
  // _dev/tools/skeleton.js (--still, --ship). A cosmetic: it changes how
  // he looks and nothing else. General stock at 80, between the itak
  // and the pulbura, so a strong run of one act buys it. Worn in the
  // Damit slot, it takes the place of the story's clothes until put back
  // on (the disguise's stillness goes with them). With the itak worn,
  // the slash is the itak's own sheet, in Macario's camisa: a weapon's
  // sheets go over the outfit's (Inventory.applyOutfit).
  (() => {
    const cell = { columns: 8, contentTop: 10, contentHeight: 240, footX: 80, headroom: 10 };
    const sheet = (move, more) => Object.assign(
      { src: "assets/sprites/player/macario-heneral-" + move + ".png" }, more, cell);
    return {
      id: "uniporme-heneral", name: "Uniporme ng Heneral", kind: "cosmetic", slot: "outfit", icon: "i-shirt",
      description: "Ang uniporme ng Pangulo at Heneralisimo ng Republika ng Katagalugan. " +
        "Pampaganda lamang: walang dagdag na lakas.",
      price: 80,
      sheets: {
        idle: sheet("idle", { frames: 16, fps: 8 }),
        walk: sheet("walk", { frames: 8, fps: 12 }),
        // The shot's own cell (js/game.js, SHOOT_CELL), the pistol drawn.
        shootAim: Object.assign(sheet("shoot", { frames: 12, fps: 8, startFrame: 0, endFrame: 2, loop: false }),
          { contentTop: 34, headroom: 34 }),
        shootFire: Object.assign(sheet("shoot", { frames: 12, fps: 18, startFrame: 3, endFrame: 11, loop: false,
          muzzle: { x: 194, y: 85 } }), { contentTop: 34, headroom: 34 }),
        melee: sheet("melee", { frames: 12, fps: 24, loop: false, contact: 6, cocked: 2 }),
        cross: sheet("cross", { frames: 12, fps: 24, loop: false, contact: 6 }),
        kick: sheet("kick", { frames: 12, fps: 24, loop: false, contact: 6 }),
        jumpRise: Object.assign(sheet("jump", { frames: 6, fps: 14, startFrame: 0, endFrame: 3, loop: false }), { columns: 6 }),
        jumpFall: Object.assign(sheet("jump", { frames: 6, fps: 14, startFrame: 4, endFrame: 4, loop: false }), { columns: 6 }),
        jumpLand: Object.assign(sheet("jump", { frames: 6, fps: 14, startFrame: 5, endFrame: 5, loop: false }), { columns: 6 }),
      },
    };
  })(),
];
