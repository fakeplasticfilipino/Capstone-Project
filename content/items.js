// =============================================================
// MACARIO — content/items.js
//
// Mansanas is the first real item since the reset (see git history
// and TRACKER.md, Blocks done, for the two granted equipment items
// and two purchasable outfits that used to be here and why they were
// cleared). It is bought from Tindero, in the kutsero scene
// (content/act1.js), then given away to Kabayo rather than worn —
// see CLAUDE.md, Decisions on record, for buyFlag, the one new field
// this needed: an item can declare a story flag to set in
// state.flags the moment it is bought, because Kabayo's gift button
// (requiresFlag) has no way to ask Inventory.owns() directly, and
// nothing before this item needed one to.
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
    kind: "equipment",
    slot: "accessory",
    price: 5,
    img: "Assets/Mansanas.png",
    effect: { maxHealthBonus: 1 },
    // Set the moment it is bought (inventory.js, buy()), not on equip —
    // Kabayo's gift button gates on this rather than on Inventory.owns(),
    // since the engine's gift system only ever reads state.flags. Wearing
    // it as an accessory still works exactly like any other item with a
    // maxHealthBonus; giving it away foregoes that in favor of finishing
    // the quest, which is the point of it being a gift rather than a kept
    // charm.
    buyFlag: "binilhAngMansanas",
  },
];
