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
//   item is general stock (the corner button, Tindero).
//
//   Consumable: kind "consumable". Stacks up to maxStack (default 5).
//   Gamitin applies `use` once and spends one.
//
//   Quest: kind "quest". Carried until the story takes it
//   (Inventory.consume). Listed in Tindahan only while `forQuest` is
//   an open quest.
//
// Block 52 emptied the catalogue with the Act I rewrite: the two apples
// and the stage clothes belonged to scenes that are gone (the Tindero's
// stall, Kabayo, the Mananahi). Their tile pictures stay in
// assets/items/, and the harness fixture still carries every kind, so
// the shop, equipment, consumables and quest items stay tested. The ids
// "mansanas", "mansanas-kabayo" and "damit-entablado" must not be reused
// for a different item. A permanent item takes this shape:
//
//   {
//     id: "sibat", name: "Sibat", kind: "equipment", slot: "weapon",
//     description: "...", price: 20, img: "assets/Items/Sibat.png",
//     effect: { projectileSpeedMult: 1.5 },
//   },
//
// Item ids are plain text keys with no foreign key behind them, so an
// id must never be reused for a different item: an old save's row
// would silently become the new one.
// =============================================================

window.ITEMS = [
  // Empty until the new Act I's story needs something to buy, wear or
  // hand over.
];
