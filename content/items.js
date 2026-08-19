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
// price is carried but unused in Block 10, where both items are
// granted rather than sold. Block 11 adds currency, a shop, and the
// priced cosmetics that make the field mean something. Zero reads as
// "not for sale" until then.
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
];
