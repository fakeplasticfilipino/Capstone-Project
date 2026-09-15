// =============================================================
// MACARIO — content/items.js
//
// Mansanas is the first real item since the reset (see git history
// and TRACKER.md, Blocks done, for the two granted equipment items
// and two purchasable outfits that used to be here and why they were
// cleared) and the first consumable ever: bought from Tindero, in the
// kutsero scene (content/act1.js), then given to Kabayo, at which
// point it is gone — not equipped, not kept. kind: "consumable" items
// carry no slot at all (see CLAUDE.md, Item data format): nothing to
// wear, so no equip step, and its effect applies from the moment it
// is owned rather than from being worn. Kabayo's gift.onComplete is
// what actually consumes it, Inventory.consume("mansanas") — see
// content/act1.js.
//
// buyFlag is still what content/act1.js's gift button gates on
// (requiresFlag), set the moment this is bought (inventory.js, buy());
// the engine's gift system only ever reads state.flags, so it has no
// way to ask Inventory.owns() directly, consumable or not.
//
// Read the header this file used to carry (git history, or
// TRACKER.md) before writing further items in: it explains why item
// ids are plain text keys with no foreign key behind them, why only
// ownership is stored rather than the catalogue itself, and why
// cosmetics must never carry an effect field.
// =============================================================

window.ITEMS = [
  {
    id: "mansanas",
    name: "Mansanas",
    description: "Malaking mansanas mula kay Tindero. Para sa kabayo ng kutsero.",
    kind: "consumable",
    price: 5,
    img: "Assets/Mansanas.png",
    // Applies for as long as Mansanas is owned (inventory.js, effects()),
    // not from being equipped — a consumable has no slot to equip it
    // into. Ends the moment it is consumed: giving it to Kabayo is
    // worth 5 barya and a max heart while it lasts, not forever.
    effect: { maxHealthBonus: 1 },
    // Set the moment it is bought (inventory.js, buy()), not on
    // consumption — Kabayo's gift button gates on this rather than on
    // Inventory.owns(), since the engine's gift system only ever reads
    // state.flags.
    buyFlag: "binilhAngMansanas",
  },
];
