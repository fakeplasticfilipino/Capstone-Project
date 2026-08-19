// =============================================================
// MACARIO — content/items.js (Block 10)
//
// The item catalogue. Pure data, in the content layer alongside the
// act files, and registered on window the same way they are.
//
// WHY THIS IS NOT A TABLE, when assessment items are one.
// assessment_items holds correct_index, which must never reach the
// browser. An item's name, price and sprite hold no secret and are
// identical for every student, so a database round trip on a low-end
// phone would buy nothing at all. Only OWNERSHIP is stored, in
// player_inventory and player_equipment.
//
// item ids are therefore text keys with no foreign key behind them.
// An item deleted from this file leaves an orphan ownership row that
// inventory.js ignores, which is the correct failure: a student's
// save is not corrupted by an edit to a content file.
//
// TWO EFFECTS, AND DELIBERATELY NO MORE. A faster spear and one extra
// heart are the whole design brief. Anything that needs a balance
// spreadsheet is out of scope for a capstone with a fixed date.
//
// price is what the shop charges. Zero reads as not for sale, which is
// what the two granted items carry. The outfits below are priced against
// what one act pays: an act awards its rounded performance score, 50 to
// 100, so every student who finishes one can afford the cheaper outfit
// and a strong run affords the better one.
//
// COSMETICS CHANGE THE SPRITE AND NOTHING ELSE. They carry no effect
// object at all, which is what keeps them cosmetic. An outfit replaces
// whichever of the three sheets it declares and leaves the rest alone,
// so a skin that only redraws the walk cycle is a complete outfit.
//
// The art does not exist yet. A missing sheet falls back to the dashed
// placeholder box showing the filename it wanted, exactly like every
// other missing image in this project, including Idle.png and Dead.png
// today. These filenames are one line of content each; rename them to
// whatever the artist actually delivers.
//
// grantedOnAct is what acts.js hands to Inventory.grantForAct, so the
// controller never names an item id itself. Content decides what a
// student owns; the controller only decides when.
// =============================================================

window.ITEMS = [
  {
    id: "sibat",
    name: "Magaan na Sibat",
    description:
      "Manipis at magaan. Mas mabilis lumipad kaysa sa bato, kaya mas maaga kang makakahanda sa susunod na pukol.",
    kind: "equipment",
    slot: "weapon",
    price: 0,
    img: "Assets/Sibat.png",
    grantedOnAct: 1,

    // Scales PROJECTILE_SPEED. The engine allows one projectile in
    // flight at a time, so a faster spear is also a more frequent one:
    // one lever, two improvements, and no new mechanic to explain to a
    // Grade 8 student.
    effect: { projectileSpeedMult: 1.5 },
  },

  {
    id: "agimat",
    name: "Agimat",
    description:
      "Anting-anting na dala ng maraming Katipunero. Nagbibigay ng lakas ng loob, at ng isang dagdag na puso.",
    kind: "equipment",
    slot: "accessory",
    price: 0,
    img: "Assets/Agimat.png",
    grantedOnAct: 1,
    effect: { maxHealthBonus: 1 },
  },

  {
    id: "damit-magsasaka",
    name: "Damit ng Magsasaka",
    description:
      "Payak na baro at salawal, tulad ng suot ng mga magsasaka sa Tondo.",
    kind: "cosmetic",
    slot: "outfit",
    price: 50,
    img: "Assets/Skin_Walk.png",

    // Same rig as the base walk cycle, because an alternate skin is drawn
    // over the same frames. Change the geometry here if the artist
    // delivers a sheet laid out differently.
    sheets: {
      walk: { src: "Assets/Skin_Walk.png", frames: 12, fps: 12, columns: 5 },
    },
  },

  {
    id: "damit-katipunero",
    name: "Uniporme ng Katipunero",
    description:
      "Ang kasuotan ng mga kasapi ng Katipunan. Hindi ito nagbabago ng laban, kundi ng anyo.",
    kind: "cosmetic",
    slot: "outfit",
    price: 90,
    img: "Assets/Skin_Uniporme_Walk.png",
    sheets: {
      walk: {
        src: "Assets/Skin_Uniporme_Walk.png",
        frames: 12,
        fps: 12,
        columns: 5,
      },
    },
  },
];
