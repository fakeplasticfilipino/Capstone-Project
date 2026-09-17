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
//   Permanent: kind "equipment" (slot "weapon", shown as Sandata, or
//   "accessory", shown as Anting-anting) or kind "cosmetic" (slot
//   "outfit", shown as Damit). Bought or granted once, kept, worn.
//   Equipment carries `effect`; a cosmetic carries `sheets` and never
//   an effect.
//
//   Consumable: kind "consumable". Stacks up to maxStack (default 5).
//   Gamitin applies `use` once and spends one.
//
//   Quest: kind "quest". Carried until the story takes it
//   (Inventory.consume). Listed in Tindahan only while `forQuest` is
//   an open quest.
//
// No permanent items ship yet. The two granted equipment items and two
// outfits an earlier pass carried were cleared with the Act I reset,
// because they were content decisions made ahead of the source
// material (see TRACKER.md). A permanent item, when one is decided,
// takes this shape:
//
//   {
//     id: "sibat", name: "Sibat", kind: "equipment", slot: "weapon",
//     description: "...", price: 20, img: "Assets/Items/Sibat.png",
//     effect: { projectileSpeedMult: 1.5 },
//   },
//
// Item ids are plain text keys with no foreign key behind them, so an
// id must never be reused for a different item: an old save's row
// would silently become the new one.
// =============================================================

window.ITEMS = [
  // Something to eat. Sold by Tindero in the kutsero scene
  // (content/act1.js), and the first thing that makes a lost heart
  // recoverable outside a pickup, which matters in a scene with a
  // hazard in the road.
  {
    id: "mansanas",
    name: "Mansanas",
    description: "Sariwang mansanas mula kay Tindero. Kainin para magbalik ng lakas.",
    kind: "consumable",
    price: 5,
    img: "Assets/Mansanas.png",
    icon: "i-apple", // shown until Mansanas.png exists
    use: { heal: 1 },
    maxStack: 5,
  },

  // The apple the horse is waiting for. A separate item from the one
  // above on purpose (Block 25): with a single Mansanas a student could
  // eat the only apple the quest needed, and "the apple for the horse"
  // is clearer on the screen than an apple that is sometimes food and
  // sometimes an errand. Sold only while bilhan_mansanas is open, and
  // taken by Kabayo's gift, which is gated on buyFlag.
  {
    id: "mansanas-kabayo",
    name: "Mansanas para sa kabayo",
    description: "Malaking mansanas na ipinabili para sa kabayo ng kutsero.",
    kind: "quest",
    price: 5,
    img: "Assets/Mansanas.png",
    icon: "i-apple",
    forQuest: "bilhan_mansanas",
    buyFlag: "binilhAngMansanas",
  },
];
