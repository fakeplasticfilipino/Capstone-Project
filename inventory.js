// =============================================================
// MACARIO — inventory.js (Block 10, rebuilt in Block 25)
//
// Owns player_inventory and player_equipment, and is the only file
// that reads or writes either. shell.js draws the inventory and shop
// screens from what this holds; game.js receives the resulting
// effects as plain numbers (Game.setEffects) and heals through
// Game.heal, and never learns that an item exists.
//
// LOAD ORDER: after acts.js, which calls it, and before shell.js,
// which renders it.
//
// OPTIONAL, the same way assessment.js is. acts.js checks
// window.Inventory before calling, and shell.js hides both main-UI
// buttons without it, so a page that fails to load this file still
// plays an act end to end and still records a study's worth of data.
//
// THREE GROUPS OF ITEM (see CLAUDE.md, Item data format):
//
//   Permanent, kind "equipment" or "cosmetic". Owned once, kept, and
//   worn in one of the three slots below. Equipment carries an effect
//   that applies only while worn; a cosmetic (the Damit slot) carries
//   sprite sheets and never an effect.
//
//   Consumable, kind "consumable". No slot. Stacks: a student can
//   carry several, counted in player_inventory.quantity. Does nothing
//   while carried. Gamitin (use) applies its `use` effect once and
//   spends one. A use that would do nothing (healing at full health)
//   is refused rather than wasted, the same rule a heart pickup
//   already follows.
//
//   Quest, kind "quest". No slot, no use, never stacks. Exists to be
//   handed over by the story, which calls consume(id) at that moment.
//   Sold only while the quest it belongs to is open.
//
// WRITES ARE OPTIMISTIC, unlike act_progress and unlike the session
// rows. The screen changes first and the row follows; a failure puts
// the screen back and the caller says so. Items are not study data.
//
// GUESTS (Block 14) get the whole system in memory and nothing
// written. Before this rebuild every write path returned early for a
// guest, which meant a guest could never buy the apple Kabayo's quest
// needs and the kutsero scene could not be finished without an
// account. A guest's items are gone when the tab closes, exactly like
// the rest of a guest's play.
// =============================================================

const Inventory = {
  // Slots the inventory screen draws, in order. The ids are what
  // player_equipment.slot stores, so they are not renamed; the labels
  // are what the student reads.
  SLOTS: [
    { id: "weapon", label: "Sandata" },
    { id: "accessory", label: "Anting-anting" },
    { id: "outfit", label: "Damit" },
  ],

  // How many of one consumable a student may carry. Small on purpose:
  // a stack is a convenience, not a way to make a scene unlosable.
  DEFAULT_MAX_STACK: 5,

  counts: {}, // item id -> quantity owned
  equipment: {}, // slot -> item id
  loaded: false,

  // shell.js registers a re-render here. A callback rather than an
  // event, for the reason recorded in CLAUDE.md: shell.js binds inside
  // its own DOMContentLoaded handler, which runs after everything
  // else's, so anything dispatched earlier is sent to nobody.
  _listener: null,

  onChange(fn) {
    this._listener = typeof fn === "function" ? fn : null;
  },

  _changed() {
    if (this._listener) {
      try {
        this._listener();
      } catch (err) {
        console.error("Inventory listener failed:", err);
      }
    }
  },

  // -----------------------------------------------------------
  // Who is playing
  // -----------------------------------------------------------

  // True when there is somewhere to write. A guest plays in memory.
  _persists() {
    return Boolean(currentUserId);
  },

  // True when items can be used at all: a signed-in student or a guest.
  _active() {
    if (currentUserId) return true;
    return Boolean(window.Game && Game.isGuest && Game.isGuest());
  },

  // -----------------------------------------------------------
  // Catalogue
  // -----------------------------------------------------------

  catalogue() {
    return Array.isArray(window.ITEMS) ? window.ITEMS : [];
  },

  item(id) {
    return this.catalogue().find((entry) => entry.id === id) || null;
  },

  // The three groups, as the screens name them.
  isPermanent(item) {
    return Boolean(item) && (item.kind === "equipment" || item.kind === "cosmetic");
  },

  isConsumable(item) {
    return Boolean(item) && item.kind === "consumable";
  },

  isQuest(item) {
    return Boolean(item) && item.kind === "quest";
  },

  maxStack(item) {
    if (!this.isConsumable(item)) return 1;
    const n = Math.floor(Number(item.maxStack));
    return n > 0 ? n : this.DEFAULT_MAX_STACK;
  },

  count(id) {
    return this.counts[id] || 0;
  },

  owns(id) {
    return this.count(id) > 0;
  },

  equipped(slot) {
    return this.equipment[slot] || null;
  },

  isWorn(id) {
    const item = this.item(id);
    return this.isPermanent(item) && this.equipped(item.slot) === id;
  },

  // Owned items that still exist in the catalogue, in catalogue order
  // so the screen does not reshuffle itself between visits. An id with
  // no definition is dropped rather than drawn as a blank tile.
  ownedItems() {
    return this.catalogue().filter((entry) => this.owns(entry.id));
  },

  // What the shop lists. Everything with a price, except a quest item
  // whose quest is not open: "Mansanas para sa kabayo" on the shelf
  // before Macario has met the horse, or after he has fed it, would be
  // a spoiler in one case and a trap in the other. Owned permanent
  // items stay listed, marked as owned, so a student can see what they
  // already have rather than watching tiles disappear.
  //
  // Block 32. An item may name its seller, soldBy, an NPC id. A seller
  // with stock of its own lists only that stock: the Mananahi sells the
  // stage clothes and not apples. Everything without soldBy is the
  // general stock, listed by the corner button and by any seller that
  // has nothing of its own (Tindero). So the clothes are never on the
  // corner button, and never on a stall in the flashback.
  forSale(sellerId) {
    const priced = this.catalogue().filter((entry) => {
      if ((entry.price || 0) <= 0) return false;
      if (this.isQuest(entry) && entry.forQuest) return this.questOpen(entry.forQuest);
      return true;
    });
    const own = sellerId ? priced.filter((entry) => entry.soldBy === sellerId) : [];
    return own.length ? own : priced.filter((entry) => !entry.soldBy);
  },

  // Reads the engine's quest log. A quest that has been logged and is
  // not done is open.
  questOpen(questId) {
    if (typeof quests === "undefined" || !Array.isArray(quests)) return false;
    return quests.some((q) => q.id === questId && !q.done);
  },

  balance() {
    if (window.Game && Game.currency) return Game.currency();
    return 0;
  },

  // Why this item cannot be bought right now, or null if it can. The
  // shop screen shows the reason on the disabled button, so a student
  // is told what to do instead of being left with a grey tile.
  buyBlocker(id) {
    const item = this.item(id);
    if (!item) return "Hindi mabibili";
    if (!this._active()) return "Hindi mabibili";
    if (!this.isConsumable(item) && this.owns(id)) return "Nasa iyo na";
    if (this.isConsumable(item) && this.count(id) >= this.maxStack(item)) {
      return "Puno ang supot";
    }
    if (this.balance() < Math.max(0, item.price || 0)) return "Kulang na barya";
    return null;
  },

  // Why this consumable cannot be used right now, or null if it can.
  useBlocker(id) {
    const item = this.item(id);
    if (!this.isConsumable(item) || !this.owns(id)) return "Hindi magagamit";
    const use = item.use || {};
    if (typeof use.heal === "number" && use.heal > 0) {
      const hp = window.Game && Game.health ? Game.health() : null;
      if (hp && hp.health >= hp.max) return "Buo ang iyong puso";
    }
    return null;
  },

  // -----------------------------------------------------------
  // Loading
  //
  // Called once per login, from Acts.syncStart. Equipment belongs to
  // the student rather than to the act, so there is no per-act round
  // trip.
  // -----------------------------------------------------------

  async sync() {
    this.counts = {};
    this.equipment = {};
    this.loaded = false;

    if (!this._persists()) return;

    try {
      const [inv, eq] = await Promise.all([
        sb
          .from("player_inventory")
          .select("item_id, quantity")
          .eq("student_id", currentUserId),
        sb
          .from("player_equipment")
          .select("slot, item_id")
          .eq("student_id", currentUserId),
      ]);

      if (inv.error) console.error("player_inventory read failed:", inv.error);
      else {
        (inv.data || []).forEach((row) => {
          // A row written before quantities meant anything carries the
          // column default, 1. A zero row is a consumable used up by a
          // write that failed to delete; it is treated as not owned.
          const q = Math.floor(Number(row.quantity));
          const n = isFinite(q) ? q : 1;
          if (n > 0) this.counts[row.item_id] = n;
        });
      }

      if (eq.error) console.error("player_equipment read failed:", eq.error);
      else {
        (eq.data || []).forEach((row) => {
          // An equipped item the student no longer owns, or one whose
          // definition has been deleted from the content file, is
          // ignored rather than repaired. The row is harmless and
          // rewriting a student's save to tidy it up is not.
          const item = this.item(row.item_id);
          if (this.isPermanent(item) && item.slot === row.slot) {
            this.equipment[row.slot] = row.item_id;
          }
        });
      }

      this.loaded = true;
    } catch (err) {
      console.error("Inventory sync threw:", err);
    }

    this.applyEffects();
    this._changed();
  },

  // -----------------------------------------------------------
  // Quantity writes
  //
  // The single place a count reaches the database. A positive count
  // is an upsert on (student_id, item_id); zero is a delete, because a
  // row that says "owns none" is a row something will one day read as
  // owning one. Resolves true when written, or when there is nowhere
  // to write (a guest).
  // -----------------------------------------------------------

  async _writeCount(id, n) {
    if (!this._persists()) return true;
    try {
      let result;
      if (n > 0) {
        result = await sb
          .from("player_inventory")
          .upsert(
            { student_id: currentUserId, item_id: id, quantity: n },
            { onConflict: "student_id,item_id" }
          );
      } else {
        result = await sb
          .from("player_inventory")
          .delete()
          .eq("student_id", currentUserId)
          .eq("item_id", id);
      }
      if (result && result.error) throw result.error;
      return true;
    } catch (err) {
      console.error("player_inventory write failed:", err);
      return false;
    }
  },

  _setCount(id, n) {
    if (n > 0) this.counts[id] = n;
    else delete this.counts[id];
  },

  // -----------------------------------------------------------
  // Granting
  //
  // Items arrive on entering the act that content says grants them.
  // Idempotent twice over: the in-memory check skips the round trip on
  // re-entry, and the unique constraint on (student_id, item_id) means
  // even a student whose memory state was lost cannot end up with two
  // rows. Signed-in students only: a guest's act entry does not run
  // the act flow that calls this.
  // -----------------------------------------------------------

  async grantForAct(n) {
    if (!this._persists()) return;

    const due = this.catalogue().filter(
      (entry) => entry.grantedOnAct === n && !this.owns(entry.id)
    );
    if (!due.length) return;

    // Applied to memory first, so the screen is right even if the
    // write is still in flight when the student opens it.
    due.forEach((entry) => this._setCount(entry.id, 1));
    this._changed();

    const rows = due.map((entry) => ({
      student_id: currentUserId,
      item_id: entry.id,
      quantity: 1,
    }));

    try {
      const { error } = await sb
        .from("player_inventory")
        .upsert(rows, { onConflict: "student_id,item_id" });
      if (error) {
        console.error("player_inventory grant failed:", error);
        // Rolled back, so the next act entry tries again rather than
        // believing forever in an item the database never recorded.
        due.forEach((entry) => this._setCount(entry.id, 0));
        this._changed();
      }
    } catch (err) {
      console.error("player_inventory grant threw:", err);
    }
  },

  // -----------------------------------------------------------
  // Equipping
  // -----------------------------------------------------------

  // Resolves to true when the change took. The screen has already
  // moved by the time this returns either way.
  async equip(id) {
    const item = this.item(id);
    if (!this.isPermanent(item) || !this.owns(id)) return false;
    if (!this._active()) return false;

    const slot = item.slot;
    const previous = this.equipment[slot] || null;
    if (previous === id) return true;

    this.equipment[slot] = id;
    this.applyEffects();
    this._changed();

    if (!this._persists()) return true;

    try {
      const { error } = await sb.from("player_equipment").upsert(
        {
          student_id: currentUserId,
          slot: slot,
          item_id: id,
          equipped_at: new Date().toISOString(),
        },
        { onConflict: "student_id,slot" }
      );
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("player_equipment write failed:", err);
      if (previous) this.equipment[slot] = previous;
      else delete this.equipment[slot];
      this.applyEffects();
      this._changed();
      return false;
    }
  },

  // A delete rather than a null item_id, because the column is not
  // null and an empty slot is the absence of a row.
  async unequip(slot) {
    const previous = this.equipment[slot] || null;
    if (!previous) return true;
    if (!this._active()) return false;

    delete this.equipment[slot];
    this.applyEffects();
    this._changed();

    if (!this._persists()) return true;

    try {
      const { error } = await sb
        .from("player_equipment")
        .delete()
        .eq("student_id", currentUserId)
        .eq("slot", slot);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("player_equipment delete failed:", err);
      this.equipment[slot] = previous;
      this.applyEffects();
      this._changed();
      return false;
    }
  },

  // Wearing it takes it off; anything else puts it on. Refuses a
  // consumable or a quest item, which have no slot.
  async toggle(id) {
    const item = this.item(id);
    if (!this.isPermanent(item)) return false;
    if (this.equipped(item.slot) === id) return this.unequip(item.slot);
    return this.equip(id);
  },

  // -----------------------------------------------------------
  // Buying
  //
  // Currency is spent through the engine facade, because game.js owns
  // game_progress and is the only thing that writes it. The balance
  // check and the deduction are the same call, so there is no window
  // in which a second tap could spend the same coins.
  //
  // Optimistic, and refunded on a failed write. A student charged for
  // an item the database never recorded is the one failure here that
  // would actually matter to them.
  // -----------------------------------------------------------

  async buy(id) {
    const item = this.item(id);
    if (this.buyBlocker(id)) return false;

    const price = Math.max(0, item.price || 0);
    if (!window.Game || !Game.spendCurrency) return false;
    if (!Game.spendCurrency(price)) return false;

    const before = this.count(id);
    this._setCount(id, before + 1);

    // An item may declare buyFlag: a story flag set the moment the
    // purchase succeeds. A gift's requiresFlag can only read
    // state.flags, never Inventory.owns(), so a purchase the story
    // cares about flips a flag the way finishing a conversation does.
    // Set once; a flag already true is left alone.
    const flagToSet = item.buyFlag && !state.flags[item.buyFlag] ? item.buyFlag : null;
    if (flagToSet) state.flags[flagToSet] = true;

    this._changed();
    if (flagToSet) markDirty();

    const wrote = await this._writeCount(id, before + 1);
    if (wrote) return true;

    if (Game.addCurrency) Game.addCurrency(price);
    this._setCount(id, before);
    if (flagToSet) {
      delete state.flags[flagToSet];
      markDirty();
    }
    this._changed();
    return false;
  },

  // -----------------------------------------------------------
  // Using and consuming
  //
  // use(id) is the student's Gamitin: a consumable's effect, then one
  // fewer. consume(id) is the story's: one fewer and nothing else,
  // called by content at the moment an item is handed over (Kabayo's
  // gift, for "Mansanas para sa kabayo"). Both take one unit, both are
  // optimistic, and both put the unit back on a failed write.
  //
  // A use is applied to the engine before the write, and is NOT undone
  // if the write fails: a heart already drawn back onto the HUD and
  // then taken away again would read as damage. The unit is put back
  // instead, which is the student's gain rather than their loss.
  // -----------------------------------------------------------

  async use(id) {
    if (this.useBlocker(id)) return false;
    const item = this.item(id);
    const use = item.use || {};

    if (typeof use.heal === "number" && use.heal > 0) {
      if (!window.Game || !Game.heal || !Game.heal(use.heal)) return false;
    }

    return this._takeOne(id);
  },

  async consume(id) {
    const item = this.item(id);
    if (!item || this.isPermanent(item)) return false;
    if (!this.owns(id)) return false;
    return this._takeOne(id);
  },

  async _takeOne(id) {
    const before = this.count(id);
    this._setCount(id, before - 1);
    this._changed();

    const wrote = await this._writeCount(id, before - 1);
    if (wrote) return true;

    this._setCount(id, before);
    this._changed();
    return false;
  },

  // -----------------------------------------------------------
  // Effects
  //
  // Reduced to plain numbers, so game.js receives a shape it can apply
  // without knowing what produced it. Only WORN equipment contributes.
  // Bonuses add, multipliers multiply, and an item with neither
  // contributes nothing, which is what makes a cosmetic a cosmetic.
  //
  // Consumables used to contribute while merely carried (Block 22).
  // That is gone: a consumable now does its one thing when used, and
  // a stack of five apples that also meant five extra hearts would
  // make carrying the point rather than eating.
  // -----------------------------------------------------------

  effects() {
    const total = { maxHealthBonus: 0, projectileSpeedMult: 1, stillDetectionMult: 1 };

    Object.keys(this.equipment).forEach((slot) => {
      const item = this.item(this.equipment[slot]);
      if (!item || !item.effect) return;

      if (typeof item.effect.maxHealthBonus === "number") {
        total.maxHealthBonus += item.effect.maxHealthBonus;
      }
      if (typeof item.effect.projectileSpeedMult === "number") {
        total.projectileSpeedMult *= item.effect.projectileSpeedMult;
      }
      if (typeof item.effect.stillDetectionMult === "number") {
        total.stillDetectionMult *= item.effect.stillDetectionMult;
      }
    });

    return total;
  },

  applyEffects() {
    if (window.Game && Game.setEffects) Game.setEffects(this.effects());
    this.applyOutfit();
  },

  // The outfit slot changes the sprite and nothing else, so it is
  // applied beside the numeric effects rather than through them.
  applyOutfit() {
    if (!window.Game || !Game.setOutfit) return;
    const worn = this.item(this.equipped("outfit"));
    Game.setOutfit(worn && worn.sheets ? worn.sheets : null);
  },

  // -----------------------------------------------------------
  // Words for the screens
  //
  // Kept here rather than in shell.js because they describe item data,
  // and a new effect field added to content should need exactly one
  // file taught to say it.
  // -----------------------------------------------------------

  kindLabel(item) {
    if (!item) return "";
    if (this.isQuest(item)) return "Pang-misyon";
    if (this.isConsumable(item)) return "Gamit";
    const slot = this.SLOTS.find((s) => s.id === item.slot);
    return slot ? slot.label : "Kagamitan";
  },

  // One short line per effect, in Tagalog.
  effectLines(item) {
    const lines = [];
    if (!item) return lines;
    const e = item.effect || {};
    if (typeof e.maxHealthBonus === "number" && e.maxHealthBonus > 0) {
      lines.push(`+${e.maxHealthBonus} puso habang nakasuot`);
    }
    if (typeof e.projectileSpeedMult === "number" && e.projectileSpeedMult !== 1) {
      lines.push(`Paghagis ×${e.projectileSpeedMult} na bilis`);
    }
    if (typeof e.stillDetectionMult === "number" && e.stillDetectionMult < 1) {
      lines.push("Kapag nakatayo lang at hindi nakilos, mabagal ka lang mapapansin ng mga gwardya.");
    }
    const u = item.use || {};
    if (typeof u.heal === "number" && u.heal > 0) {
      lines.push(`Nagbabalik ng ${u.heal} puso`);
    }
    if (item.kind === "cosmetic") lines.push("Binabago ang itsura");
    if (this.isQuest(item)) lines.push("Kailangan sa isang misyon");
    return lines;
  },
};

window.Inventory = Inventory;
