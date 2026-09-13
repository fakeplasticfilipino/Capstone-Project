// =============================================================
// MACARIO — content/items.js
//
// EMPTY, ON PURPOSE. Same reset as content/act1.js: the two granted
// equipment items and two purchasable outfits that used to be here
// are preserved in git history and in TRACKER.md's Blocks done. The
// shop, equip and effect mechanics they exercised (inventory.js,
// Acts.gotoScene, the effect fields on window.ITEMS entries) are
// unchanged and still fully tested — _dev/test.js keeps its own
// private item catalogue fixture for that, independent of whatever
// is actually shipped here — so nothing about the underlying
// mechanic was removed, only the content that gave it a name, a
// price and a Katipunan-themed reason to exist.
//
// Read the header this file used to carry (git history, or
// TRACKER.md) before writing real items back in: it explains why
// item ids are plain text keys with no foreign key behind them, why
// only ownership is stored rather than the catalogue itself, and why
// cosmetics must never carry an effect field.
// =============================================================

window.ITEMS = [];
