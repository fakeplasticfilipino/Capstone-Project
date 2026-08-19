// =============================================================
// MACARIO — inventory.js (Block 10)
//
// Owns player_inventory and player_equipment, and is the only file
// that reads or writes either. shell.js draws the screen from what
// this holds; game.js receives the resulting effects as plain
// numbers and never learns that an item exists.
//
// LOAD ORDER: after acts.js, which calls it, and before shell.js,
// which renders it.
//
// OPTIONAL, the same way assessment.js is. acts.js checks
// window.Inventory before calling, and shell.js hides the inventory
// button without it, so a page that fails to load this file still
// plays an act end to end and still records a study's worth of data.
// That is the test that matters: equipment is a stated objective,
// but the assessment flow is the finding.
//
// WRITES ARE OPTIMISTIC, unlike act_progress and unlike the session
// rows. The screen changes first and the row follows; a failure puts
// the screen back and says so. Equipment is not study data, and a
// student on a classroom phone should not watch a spinner to put on
// an amulet. act_progress gets the opposite treatment for the
// opposite reason.
// =============================================================

const Inventory = {
  // Slots the inventory screen draws, in order. "outfit" exists in the
  // item format and in the database, and is deliberately absent here:
  // Block 11 adds the cosmetics that would go in it, and a slot with
  // nothing that can ever fill it is a dead row on a 412px screen.
  SLOTS: [
    { id: "weapon", label: "Sandata" },
    { id: "accessory", label: "Anting-anting" },
  ],

  ownedIds: [],
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
  // Catalogue
  // -----------------------------------------------------------

  catalogue() {
    return Array.isArray(window.ITEMS) ? window.ITEMS : [];
  },

  item(id) {
    return this.catalogue().find((entry) => entry.id === id) || null;
  },

  owns(id) {
    return this.ownedIds.indexOf(id) !== -1;
  },

  equipped(slot) {
    return this.equipment[slot] || null;
  },

  // Owned items that still exist in the catalogue, in catalogue order
  // so the screen does not reshuffle itself between visits. An id with
  // no definition is dropped rather than drawn as a blank row.
  ownedItems() {
    return this.catalogue().filter((entry) => this.owns(entry.id));
  },

  // -----------------------------------------------------------
  // Loading
  //
  // Called once per login, from Acts.syncStart. Equipment belongs to
  // the student rather than to the act, and equip() applies its own
  // effect the moment it runs, so there is no second load point and
  // no per-act round trip.
  // -----------------------------------------------------------

  async sync() {
    this.ownedIds = [];
    this.equipment = {};
    this.loaded = false;

    if (!currentUserId) return;

    try {
      const [inv, eq] = await Promise.all([
        sb.from("player_inventory").select("item_id").eq("student_id", currentUserId),
        sb
          .from("player_equipment")
          .select("slot, item_id")
          .eq("student_id", currentUserId),
      ]);

      if (inv.error) console.error("player_inventory read failed:", inv.error);
      else (inv.data || []).forEach((row) => this.ownedIds.push(row.item_id));

      if (eq.error) console.error("player_equipment read failed:", eq.error);
      else {
        (eq.data || []).forEach((row) => {
          // An equipped item the student no longer owns, or one whose
          // definition has been deleted from the content file, is
          // ignored rather than repaired. The row is harmless and
          // rewriting a student's save to tidy it up is not.
          if (this.item(row.item_id)) this.equipment[row.slot] = row.item_id;
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
  // Granting
  //
  // Block 10 has no shop, so the items arrive on entering the act
  // that content says grants them. Block 11 adds currency and a
  // purchase path beside this, not instead of it.
  //
  // Idempotent twice over: the in-memory check skips the round trip
  // on re-entry, and the upsert on (student_id, item_id) means even a
  // student whose memory state was lost cannot end up with two rows.
  // The unique constraint is the real guarantee; this only saves the
  // request.
  // -----------------------------------------------------------

  async grantForAct(n) {
    if (!currentUserId) return;

    const due = this.catalogue().filter(
      (entry) => entry.grantedOnAct === n && !this.owns(entry.id)
    );
    if (!due.length) return;

    // Applied to memory first, so the screen is right even if the
    // write is still in flight when the student opens it.
    due.forEach((entry) => this.ownedIds.push(entry.id));
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
        due.forEach((entry) => {
          const at = this.ownedIds.indexOf(entry.id);
          if (at !== -1) this.ownedIds.splice(at, 1);
        });
        this._changed();
      }
    } catch (err) {
      console.error("player_inventory grant threw:", err);
    }
  },

  // -----------------------------------------------------------
  // Equipping
  // -----------------------------------------------------------

  // Resolves to true when the row was written. The screen has already
  // moved by the time this returns either way; the return value is
  // for the harness and for the note the shell shows on failure.
  async equip(id) {
    const item = this.item(id);
    if (!item || !this.owns(id)) return false;
    if (!currentUserId) return false;

    const slot = item.slot;
    const previous = this.equipment[slot] || null;
    if (previous === id) return true;

    this.equipment[slot] = id;
    this.applyEffects();
    this._changed();

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

  // Unequipping is a delete rather than a null item_id, because the
  // column is not null and an empty slot is the absence of a row.
  async unequip(slot) {
    const previous = this.equipment[slot] || null;
    if (!previous) return true;
    if (!currentUserId) return false;

    delete this.equipment[slot];
    this.applyEffects();
    this._changed();

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

  // Convenience for the screen: tapping the item you are wearing takes
  // it off, tapping any other one puts it on.
  async toggle(id) {
    const item = this.item(id);
    if (!item) return false;
    if (this.equipped(item.slot) === id) return this.unequip(item.slot);
    return this.equip(id);
  },

  // -----------------------------------------------------------
  // Effects
  //
  // Reduced to plain numbers here, so game.js receives a shape it can
  // apply without knowing what produced it. Bonuses add, multipliers
  // multiply, and an item with neither contributes nothing, which is
  // what makes a cosmetic a cosmetic.
  // -----------------------------------------------------------

  effects() {
    const total = { maxHealthBonus: 0, projectileSpeedMult: 1 };

    Object.keys(this.equipment).forEach((slot) => {
      const item = this.item(this.equipment[slot]);
      if (!item || !item.effect) return;

      if (typeof item.effect.maxHealthBonus === "number") {
        total.maxHealthBonus += item.effect.maxHealthBonus;
      }
      if (typeof item.effect.projectileSpeedMult === "number") {
        total.projectileSpeedMult *= item.effect.projectileSpeedMult;
      }
    });

    return total;
  },

  applyEffects() {
    if (window.Game && Game.setEffects) Game.setEffects(this.effects());
  },
};

window.Inventory = Inventory;
