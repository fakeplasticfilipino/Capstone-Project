// =============================================================
// MACARIO — shell.js (Block 7)
//
// Every screen that is not the game world: the title screen, the
// pause screen, settings, and logout.
//
// LOAD ORDER: last in index.html, after acts.js and assessment.js.
// This file reads window.Game and may read window.Acts; nothing is
// allowed to depend on it in return.
//
// NOT OPTIONAL, unlike assessment.js. That file can be absent and
// the act flow degrades honestly to playing then completed. A
// missing shell means no way into the game at all, so nothing
// should guard on window.Shell in imitation of the
// window.Assessment pattern. The single exception is the awaitEntry
// call in enterGameAsUser, which is guarded only because a missing
// shell would otherwise hang the login on a promise nothing can
// resolve; the reasoning is written out at the call site.
//
// THE ENTRY GATE
// A student with a stored session used to be dropped straight into
// the world. Now enterGameAsUser builds the world, then calls
// awaitEntry() and waits. That wait is the whole reason this file
// can exist without touching the login sequence: the act lookup,
// the save restore and the saveReady flag all run exactly as
// before, and only the pre-act flow is held back.
//
// Holding it back is the point. Acts.syncStart resumes the trivia
// card and the pre-test, and those open an overlay of their own.
// Left to run underneath, a student would tap Magpatuloy straight
// into a test already in progress.
// =============================================================

const Shell = {
  el: {},

  // title -> auth -> playing, with paused, settings and inventory
  // hanging off playing. Kept as one string rather than several
  // booleans so an impossible combination cannot be represented.
  state: "title",

  // The engine has reached the gate and the world is built.
  ready: false,

  // The student has taken the gate. Set on the title tap, which on
  // the no-session path happens long before the engine is ready.
  entered: false,

  entryPromise: null,
  entryResolve: null,
  loadTimer: null,
  settingsReturn: "title",

  // ---- Settings ----
  // localStorage rather than the database. These are a device
  // preference, not student data: they do not belong in the teacher
  // dashboard, and keeping them local avoids both a schema change
  // and a round trip on a phone chosen for being slow.
  STORAGE_KEY: "macario:settings",
  settings: { textSize: "md" },

  // -----------------------------------------------------------
  // Setup
  // -----------------------------------------------------------

  init() {
    this._cache();
    this._loadSettings();
    this._applySettings();
    this._bind();

    // Nothing in the world should respond while a shell screen is
    // up. uiBlocked is the existing flag for exactly this, already
    // used by assessment.js, so there is no second concept here.
    if (window.Game) Game.setUiBlocked(true);

    this._watchOrientation();

    this._showPanel("title");
    this.el.overlay.classList.remove("hidden");
    this._probeSession();
  },

  _cache() {
    if (this.el.overlay) return;
    this.el = {
      overlay: document.getElementById("shell"),
      panels: {
        title: document.getElementById("shell-title"),
        pause: document.getElementById("shell-pause"),
        settings: document.getElementById("shell-settings"),
        inventory: document.getElementById("shell-inventory"),
        shop: document.getElementById("shell-shop"),
        logout: document.getElementById("shell-logout-confirm"),
        reset: document.getElementById("shell-reset-confirm"),
      },
      startBtn: document.getElementById("shell-start"),
      titleNote: document.getElementById("shell-title-note"),
      titleSettingsBtn: document.getElementById("shell-title-settings"),
      resumeBtn: document.getElementById("shell-resume"),
      pauseSettingsBtn: document.getElementById("shell-pause-settings"),
      logoutBtn: document.getElementById("shell-logout"),
      settingsBack: document.getElementById("shell-settings-back"),
      textSizeGroup: document.getElementById("shell-textsize"),
      logoutConfirm: document.getElementById("shell-logout-yes"),
      logoutCancel: document.getElementById("shell-logout-no"),
      logoutNote: document.getElementById("shell-logout-note"),
      inventoryOpen: document.getElementById("shell-inventory-open"),
      inventoryBack: document.getElementById("shell-inventory-back"),
      inventoryNote: document.getElementById("shell-inventory-note"),
      slots: document.getElementById("shell-slots"),
      items: document.getElementById("shell-items"),
      balance: document.getElementById("shell-balance"),
      shopOpen: document.getElementById("shell-shop-open"),
      shopBack: document.getElementById("shell-shop-back"),
      shopList: document.getElementById("shell-shop-list"),
      shopNote: document.getElementById("shell-shop-note"),
      shopBalance: document.getElementById("shell-shop-balance"),
      pauseBtn: document.getElementById("btn-pause"),
      mainInventoryBtn: document.getElementById("btn-inventory"),
      mainShopBtn: document.getElementById("btn-shop"),
      settingsNote: document.getElementById("shell-settings-note"),
      resetBtn: document.getElementById("shell-reset"),
      resetConfirm: document.getElementById("shell-reset-yes"),
      resetCancel: document.getElementById("shell-reset-no"),
      resetNote: document.getElementById("shell-reset-note"),
    };
  },

  _bind() {
    this.el.startBtn.addEventListener("click", () => this._onStart());
    this.el.titleSettingsBtn.addEventListener("click", () =>
      this._openSettings("title")
    );

    this.el.pauseBtn.addEventListener("click", () => this.openPause());
    this.el.resumeBtn.addEventListener("click", () => this.closePause());
    this.el.pauseSettingsBtn.addEventListener("click", () =>
      this._openSettings("pause")
    );
    this.el.logoutBtn.addEventListener("click", () =>
      this._showPanel("logout")
    );

    // The only guard on window.Inventory in this file, and it is the
    // same shape as the act flow's guard on window.Assessment: with the
    // module absent the button never appears, and every other screen
    // behaves exactly as it did before Block 10.
    //
    // Two entry points now feed the same two panels: the pause-menu
    // buttons (unchanged) and the main-UI buttons added in Block 13,
    // which jump straight in from "playing" without pausing first.
    // _openInventory/_openShop take which one asked so the matching
    // close can undo exactly that, rather than assuming pause.
    if (window.Inventory) {
      this.el.inventoryOpen.classList.remove("hidden");
      this.el.inventoryOpen.addEventListener("click", () =>
        this._openInventory("paused")
      );
      this.el.inventoryBack.addEventListener("click", () =>
        this._closeInventory()
      );
      this.el.items.addEventListener("click", (e) => this._onItemTap(e));

      this.el.shopOpen.addEventListener("click", () =>
        this._openShop("inventory")
      );
      this.el.shopBack.addEventListener("click", () => this._closeShop());
      this.el.shopList.addEventListener("click", (e) => this._onBuyTap(e));

      // Main-UI buttons, next to #btn-pause. Visibility rides along
      // with the movement controls (game.js), gated the same way, so
      // this only ever needs to bind the click.
      if (this.el.mainInventoryBtn) {
        this.el.mainInventoryBtn.addEventListener("click", () =>
          this._openInventory("playing")
        );
      }
      if (this.el.mainShopBtn) {
        this.el.mainShopBtn.addEventListener("click", () =>
          this._openShop("playing")
        );
      }

      // inventory.js owns the state and tells the screen when it moved,
      // including when it puts an optimistic change back after a failed
      // write. The shell only ever draws what it is told.
      Inventory.onChange(() => {
        this._renderInventory();
        if (this.state === "shop") this._renderShop();
      });
    }

    this.el.settingsBack.addEventListener("click", () => this._closeSettings());

    // Not guarded on window.Inventory. The wipe happens in one
    // database call that clears all seven tables, so it neither needs
    // that module nor cares whether it loaded.
    this.el.resetBtn.addEventListener("click", () => this._openReset());
    this.el.resetCancel.addEventListener("click", () =>
      this._showPanel("settings")
    );
    this.el.resetConfirm.addEventListener("click", () => this._resetData());
    this.el.logoutCancel.addEventListener("click", () =>
      this._showPanel("pause")
    );
    this.el.logoutConfirm.addEventListener("click", () => this._logout());

    this.el.textSizeGroup.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-size]");
      if (!btn) return;
      this.settings.textSize = btn.dataset.size;
      this._applySettings();
      this._saveSettings();
    });

    // Escape both opens and closes, which is what every player will
    // try first. It deliberately does nothing outside playing and
    // paused, so it cannot dismiss the title screen or a test.
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (this.state === "playing") this.openPause();
      else if (this.state === "paused") this.closePause();
      else if (this.state === "settings") this._closeSettings();
      else if (this.state === "inventory") this._closeInventory();
      else if (this.state === "shop") this._closeShop();
    });

  },

  // -----------------------------------------------------------
  // Orientation
  //
  // The rotate notice itself is drawn by CSS, so there is no state
  // here that can leave it up on a screen that has already been
  // turned. This only mirrors the same media query into uiBlocked,
  // which is what stops guards patrolling and hazards biting behind
  // a screen the student cannot see past.
  //
  // It touches uiBlocked ONLY while the state is playing. A quiz, a
  // shell panel or the login box already blocks the world, and
  // clearing the flag here would unblock it underneath one of them.
  // -----------------------------------------------------------

  PORTRAIT_QUERY: "(orientation: portrait) and (max-width: 900px)",

  isPortrait() {
    if (!window.matchMedia) return false;
    return window.matchMedia(this.PORTRAIT_QUERY).matches;
  },

  _applyOrientation() {
    if (this.state !== "playing") return;
    if (!window.Game) return;
    Game.setUiBlocked(this.isPortrait());
  },

  _watchOrientation() {
    const apply = () => this._applyOrientation();
    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);
  },

  // -----------------------------------------------------------
  // Entry gate
  // -----------------------------------------------------------

  // Decides what the title button offers. A student with no stored
  // session gets Magsimula straight away and is handed to the login
  // box. One with a session waits for the engine, because until
  // awaitEntry is called there is no world to continue into.
  async _probeSession() {
    let session = null;
    try {
      const { data } = await sb.auth.getSession();
      session = data ? data.session : null;
    } catch (err) {
      // A failed probe is not fatal. Offering Magsimula puts the
      // login box in front of the student, which is recoverable;
      // leaving them on a loading label is not.
      console.error("Shell session probe failed:", err);
    }

    if (!session) {
      this._setStart("Magsimula", true);
      return;
    }

    if (this.ready) return; // the engine got here first

    this._setStart("Naglo-load...", false);

    // A session that never produces a world. A wrong profile row, a
    // dropped connection mid-login, anything that makes
    // enterGameAsUser return early: all of them leave awaitEntry
    // uncalled and this screen disabled forever. On a low-end phone
    // on mobile data that is a realistic afternoon, so it gets an
    // exit rather than a spinner.
    this.loadTimer = setTimeout(() => {
      if (this.ready) return;
      this.el.startBtn.dataset.action = "reload";
      this._setStart("Subukan Ulit", true);
      this.el.titleNote.textContent =
        "Matagal ang pagbukas ng laro. Suriin ang koneksyon.";
    }, 12000);
  },

  // Called by enterGameAsUser once the act is loaded, the save is
  // restored and saves are unblocked. Resolves when the student has
  // taken the gate, which may already have happened.
  awaitEntry() {
    this._cache();
    this.ready = true;
    clearTimeout(this.loadTimer);

    if (this.entered) {
      // The no-session path: the student tapped Magsimula, logged
      // in, and is already through. Nothing to wait for.
      this._enterWorld();
      return Promise.resolve();
    }

    // Clears any Subukan Ulit offer the load timer put here. A world
    // that arrives late is still a world, and the button must enter
    // it rather than reload the page out from under it.
    delete this.el.startBtn.dataset.action;
    this._setStart("Magpatuloy", true);
    this.el.titleNote.textContent = "";

    if (!this.entryPromise) {
      this.entryPromise = new Promise((resolve) => {
        this.entryResolve = resolve;
      });
    }
    return this.entryPromise;
  },

  _onStart() {
    if (this.el.startBtn.dataset.action === "reload") {
      window.location.reload();
      return;
    }

    this.entered = true;

    if (this.ready) {
      this._enterWorld();
      if (this.entryResolve) {
        this.entryResolve();
        this.entryResolve = null;
      }
      return;
    }

    // No stored session. game.js already has the login box on the
    // page underneath this screen, so uncovering it is the whole of
    // the handover. uiBlocked stays set: authGated blocks the world
    // anyway, and clearing it here would only be a second flag
    // saying the same thing.
    this.state = "auth";
    this.el.overlay.classList.add("hidden");
  },

  _enterWorld() {
    this.state = "playing";
    this.el.overlay.classList.add("hidden");
    if (window.Game) Game.setUiBlocked(false);
    this._applyOrientation();
  },

  // -----------------------------------------------------------
  // Pause
  // -----------------------------------------------------------

  openPause() {
    if (this.state !== "playing") return;
    if (!window.Game) return;

    // setPaused refuses during the stage cutscene, because that
    // sequence runs on awaited timers no flag in the engine can
    // suspend. It reports the refusal, so the screen is never opened
    // over a game that did not actually stop.
    if (!Game.setPaused(true)) return;

    this.state = "paused";
    Game.setUiBlocked(true);
    this._showPanel("pause");
    this.el.overlay.classList.remove("hidden");
  },

  closePause() {
    if (this.state !== "paused") return;
    this.state = "playing";
    this.el.overlay.classList.add("hidden");
    if (window.Game) {
      Game.setUiBlocked(false);
      Game.setPaused(false);
    }
    this._applyOrientation();
  },

  // -----------------------------------------------------------
  // Settings
  // -----------------------------------------------------------

  // Reachable from the title screen and from pause, and the same
  // screen in both cases. It remembers which one it came from
  // rather than assuming, since backing out of settings into the
  // wrong screen is how a student ends up unable to resume.
  _openSettings(from) {
    if (this.el.settingsNote) {
      this.el.settingsNote.textContent = "";
      this.el.settingsNote.className = "shell-note";
    }
    this._refreshResetOffer();
    this.settingsReturn = from;
    this.state = "settings";
    this._showPanel("settings");
    this.el.overlay.classList.remove("hidden");
  },

  _closeSettings() {
    if (this.settingsReturn === "pause") {
      this.state = "paused";
      this._showPanel("pause");
    } else {
      this.state = "title";
      this._showPanel("title");
    }
  },

  _loadSettings() {
    try {
      const raw = window.localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.textSize === "string") {
        this.settings.textSize = parsed.textSize;
      }
    } catch (err) {
      // Private browsing throws on localStorage rather than
      // returning null, and a corrupt value throws on parse. Neither
      // is worth interrupting a lesson for; the defaults are fine.
      console.warn("Settings could not be read:", err);
    }
  },

  _saveSettings() {
    try {
      window.localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(this.settings)
      );
    } catch (err) {
      console.warn("Settings could not be saved:", err);
    }
  },

  _applySettings() {
    const size = ["sm", "md", "lg"].includes(this.settings.textSize)
      ? this.settings.textSize
      : "md";
    this.settings.textSize = size;

    document.body.classList.remove("text-sm", "text-md", "text-lg");
    document.body.classList.add("text-" + size);

    const buttons = this.el.textSizeGroup.querySelectorAll("[data-size]");
    buttons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.size === size);
    });
  },

  // -----------------------------------------------------------
  // Inventory
  //
  // Reached two ways since Block 13: through pause, as before, or
  // directly from its own main-UI button next to #btn-pause, which
  // skips the pause screen entirely. Either way the game stops for
  // the whole visit, so an effect can never change under a running
  // frame; a direct open pauses it itself instead of relying on
  // openPause having already done so.
  //
  // invReturn records which door was used, because the two need
  // different ways back out: from pause, back means pause; opened
  // directly, back means resume.
  // -----------------------------------------------------------

  _openInventory(from) {
    if (!window.Inventory) return;
    if (from === "playing") {
      if (this.state !== "playing") return;
      if (!window.Game) return;
      // setPaused refuses during the stage cutscene, the same guard
      // openPause honours; see the comment there.
      if (!Game.setPaused(true)) return;
      Game.setUiBlocked(true);
      this.el.overlay.classList.remove("hidden");
      this.invReturn = "playing";
    } else {
      if (this.state !== "paused") return;
      this.invReturn = "paused";
    }
    this.state = "inventory";
    this._renderInventory();
    this._showPanel("inventory");
  },

  // Back to pause if pause is where this visit started; the student
  // paused to get here, and resuming out from under them would hide
  // the effect they just equipped before they saw the hearts change.
  // Back to the world, fully resumed, if the main-UI button opened it
  // directly, since there was never a pause screen to return to.
  _closeInventory() {
    if (this.state !== "inventory") return;
    if (this.invReturn === "playing") {
      this.state = "playing";
      this.el.overlay.classList.add("hidden");
      if (window.Game) {
        Game.setUiBlocked(false);
        Game.setPaused(false);
      }
      this._applyOrientation();
    } else {
      this.state = "paused";
      this._showPanel("pause");
    }
  },

  // Slots first, then everything owned. Both are redrawn whole rather
  // than patched: the list is two items long on a screen that is only
  // ever open while the game is paused, so the simple thing costs
  // nothing and cannot drift out of step with Inventory's state.
  // One symbol per slot. A fourth slot added to content later gets the
  // bag rather than nothing, which is the same rule the placeholder
  // box follows for a missing sprite: show something labelled.
  SLOT_ICONS: { weapon: "i-blade", accessory: "i-star", outfit: "i-shirt" },

  _slotIcon(slot) {
    return this.SLOT_ICONS[slot] || "i-bag";
  },

  _renderInventory() {
    if (!window.Inventory) return;
    if (!this.el.slots) return;

    this.el.inventoryNote.textContent = "";
    this.el.balance.textContent = String(Inventory.balance());

    this.el.slots.innerHTML = "";
    Inventory.SLOTS.forEach((slot) => {
      const item = Inventory.item(Inventory.equipped(slot.id));

      const row = document.createElement("div");
      row.className = "inv-slot";

      const label = document.createElement("span");
      label.className = "inv-slot-label";
      label.appendChild(makeIcon(this._slotIcon(slot.id)));
      const labelText = document.createElement("span");
      labelText.textContent = slot.label;
      label.appendChild(labelText);

      const value = document.createElement("span");
      value.className = item ? "inv-slot-filled" : "inv-slot-empty";
      value.textContent = item ? item.name : "Wala";

      row.appendChild(label);
      row.appendChild(value);
      this.el.slots.appendChild(row);
    });

    this.el.items.innerHTML = "";
    const owned = Inventory.ownedItems();

    if (!owned.length) {
      const empty = document.createElement("div");
      empty.className = "inv-empty";
      empty.textContent = "Wala ka pang gamit.";
      this.el.items.appendChild(empty);
      return;
    }

    owned.forEach((item) => {
      const worn = Inventory.equipped(item.slot) === item.id;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "inv-item" + (worn ? " inv-item-worn" : "");
      btn.dataset.itemId = item.id;

      // The slot's symbol, so a row says what kind of thing it is
      // before the student reads the name. Outfit art does not exist
      // yet, so this is also the only picture on the row.
      btn.appendChild(makeIcon(this._slotIcon(item.slot)));

      const body = document.createElement("div");
      body.className = "inv-item-body";

      const name = document.createElement("div");
      name.className = "inv-item-name";
      name.textContent = item.name;

      const action = document.createElement("span");
      action.className = "inv-item-action";
      action.textContent = worn ? "Tanggalin" : "Isuot";
      name.appendChild(action);

      const desc = document.createElement("div");
      desc.className = "inv-item-desc";
      desc.textContent = item.description || "";

      body.appendChild(name);
      body.appendChild(desc);
      btn.appendChild(body);
      this.el.items.appendChild(btn);
    });
  },

  // Tapping what you are wearing takes it off; tapping anything else
  // puts it on. One gesture, which is as much as a Grade 8 student on
  // a phone should have to learn for a screen this small.
  //
  // Not awaited. Inventory applies the change to memory and fires its
  // listener before the write leaves, so the screen has already moved;
  // awaiting here would only add a stall on a slow connection. The
  // failure path re-fires the listener with the old state, and the
  // note below is what tells the student it did not take.
  _onItemTap(e) {
    const btn = e.target.closest("[data-item-id]");
    if (!btn || !window.Inventory) return;

    Inventory.toggle(btn.dataset.itemId).then((wrote) => {
      if (this.state !== "inventory") return;
      this.el.inventoryNote.textContent = wrote
        ? ""
        : "Hindi na-save. Suriin ang koneksyon.";
    });
  },

  // -----------------------------------------------------------
  // Shop
  //
  // Reached three ways since Block 13: off the inventory panel (the
  // original path — the pause screen already carries four buttons at
  // a width where a fifth starts to push the logout button off a
  // phone), or directly from its own main-UI button, which — like
  // direct-entry inventory — pauses the world itself and skips both
  // pause and inventory.
  //
  // shopReturn mirrors invReturn: back means inventory if that is
  // where this visit came from, or a full resume if the main-UI
  // button opened it straight from the world.
  // -----------------------------------------------------------

  _openShop(from) {
    if (!window.Inventory) return;
    if (from === "playing") {
      if (this.state !== "playing") return;
      if (!window.Game) return;
      if (!Game.setPaused(true)) return;
      Game.setUiBlocked(true);
      this.el.overlay.classList.remove("hidden");
      this.shopReturn = "playing";
    } else {
      if (this.state !== "inventory") return;
      this.shopReturn = "inventory";
    }
    this.state = "shop";
    this._renderShop();
    this._showPanel("shop");
  },

  _closeShop() {
    if (this.state !== "shop") return;
    if (this.shopReturn === "playing") {
      this.state = "playing";
      this.el.overlay.classList.add("hidden");
      if (window.Game) {
        Game.setUiBlocked(false);
        Game.setPaused(false);
      }
      this._applyOrientation();
    } else {
      this.state = "inventory";
      this._renderInventory();
      this._showPanel("inventory");
    }
  },

  // Every priced item, owned or not. An owned one stays on the list
  // marked as owned rather than disappearing, so a student can see
  // what they already have instead of wondering where it went.
  //
  // A row whose art has not been drawn yet is still bought and still
  // worn. The missing sheet falls back to the dashed placeholder the
  // same way every other missing image in this game does, which is
  // one behaviour to explain rather than two.
  _renderShop() {
    if (!window.Inventory) return;
    if (!this.el.shopList) return;

    this.el.shopNote.textContent = "";

    const balance = Inventory.balance();
    this.el.shopBalance.textContent = String(balance);

    this.el.shopList.innerHTML = "";

    Inventory.forSale().forEach((item) => {
      const owned = Inventory.owns(item.id);
      const price = item.price || 0;
      const affordable = balance >= price;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "inv-item" + (owned ? " inv-item-owned" : "");
      btn.dataset.buyId = item.id;
      btn.disabled = owned || !affordable;

      // A tick on what is already owned, the slot's symbol on what is
      // not. The row's state is then readable before the price is.
      btn.appendChild(makeIcon(owned ? "i-check" : this._slotIcon(item.slot)));

      const body = document.createElement("div");
      body.className = "inv-item-body";

      const name = document.createElement("div");
      name.className = "inv-item-name";
      name.textContent = item.name;

      const action = document.createElement("span");
      action.className = "inv-item-action";
      action.textContent = owned
        ? "Pag-aari"
        : affordable
        ? `Bilhin: ${price}`
        : `Kulang: ${price}`;
      name.appendChild(action);

      const desc = document.createElement("div");
      desc.className = "inv-item-desc";
      desc.textContent = item.description || "";

      body.appendChild(name);
      body.appendChild(desc);
      btn.appendChild(body);
      this.el.shopList.appendChild(btn);
    });
  },

  _onBuyTap(e) {
    const btn = e.target.closest("[data-buy-id]");
    if (!btn || !window.Inventory) return;

    Inventory.buy(btn.dataset.buyId).then((bought) => {
      if (this.state !== "shop") return;
      this._renderShop();
      this.el.shopNote.textContent = bought
        ? ""
        : "Hindi natuloy ang pagbili.";
    });
  },

  // -----------------------------------------------------------
  // Reset
  //
  // A full wipe: every row this student owns in all seven tables,
  // through reset_my_play_data() in schema v5. The account, its class
  // enrolment and its password survive, so the student stays logged
  // in and starts the game from the very beginning.
  //
  // NOT DOABLE FROM THE CLIENT, and that is the point. A browser
  // cannot delete an assessment score: the table has a select policy
  // and an insert policy and nothing else, which is what makes one
  // attempt per act per test type mean what it says. The function is
  // security definer, takes no arguments, and refuses any caller not
  // on the list inside it, so a study account cannot wipe itself by
  // tapping, by editing this file, or from the console.
  //
  // The button is hidden unless can_reset_my_data() says yes. That is
  // a courtesy so a student is not offered something that will be
  // refused; the refusal in the database is the guarantee.
  // -----------------------------------------------------------

  // Asked once, on the way into settings rather than at login: it is
  // one round trip and this screen is opened while the game is paused,
  // so the wait costs nothing anyone will feel. A failure leaves the
  // button hidden, which is the safe way to be wrong.
  async _refreshResetOffer() {
    if (!this.el.resetBtn) return;
    this.el.resetBtn.classList.add("hidden");
    if (!window.Game || !Game.isSignedIn()) return;

    try {
      const { data, error } = await sb.rpc("can_reset_my_data");
      if (error) throw error;
      if (data === true) this.el.resetBtn.classList.remove("hidden");
    } catch (err) {
      console.warn("Reset availability could not be read:", err);
    }
  },

  _openReset() {
    this.el.resetNote.textContent = "";
    this.el.resetNote.className = "shell-note";
    this.el.resetConfirm.disabled = false;
    this.el.resetCancel.disabled = false;
    this._showPanel("reset");
  },

  // Awaited, and then the page is reloaded rather than repainted.
  //
  // Reloading is not laziness. After the wipe there is no
  // game_progress row and no act_progress row, and every module in
  // memory is still holding the state of a student who no longer
  // exists in the database. Rebuilding all of that in place would
  // mean a reset path through every file, each one a chance to leave
  // something behind. A reload runs the real login sequence, which
  // already knows how to start a student who has never played.
  //
  // Game.stopSaving() first, or the debounce, the autosave and the
  // beforeunload flush each put part of the old student straight
  // back between the wipe and the reload.
  async _resetData() {
    this.el.resetConfirm.disabled = true;
    this.el.resetCancel.disabled = true;
    this.el.resetNote.className = "shell-note";
    this.el.resetNote.textContent = "Binubura...";

    if (window.Game && Game.stopSaving) Game.stopSaving();

    try {
      const { error } = await sb.rpc("reset_my_play_data");
      if (error) throw error;
    } catch (err) {
      console.error("Reset failed:", err);
      this.el.resetConfirm.disabled = false;
      this.el.resetCancel.disabled = false;
      this.el.resetNote.textContent =
        /NOT_ALLOWED/.test(String(err && err.message))
          ? "Hindi pinapayagan ang pagbura sa account na ito."
          : "Hindi natuloy ang pagbura. Suriin ang koneksyon.";
      // Saving stays off. The student is being invited to retry, and
      // a write in between would be a write on behalf of a student
      // the next attempt is about to delete anyway.
      return;
    }

    // The device settings go with it. This is the only part of a
    // student's state that never reaches the database, so a wipe
    // that left it behind would not be a fresh start.
    try {
      window.localStorage.removeItem(this.STORAGE_KEY);
    } catch (err) {
      console.warn("Settings could not be cleared:", err);
    }

    this.el.resetNote.className = "shell-note ok";
    this.el.resetNote.textContent = "Tapos na. Magsisimula ulit ang laro...";
    window.setTimeout(() => window.location.reload(), 600);
  },

  // -----------------------------------------------------------
  // Logout
  // -----------------------------------------------------------

  async _logout() {
    this.el.logoutConfirm.disabled = true;
    this.el.logoutCancel.disabled = true;
    this.el.logoutNote.textContent = "Sine-save ang laro...";

    // saveProgress is debounced by 800ms. Signing out in the second
    // after an objective registers would drop it, and a shared
    // classroom phone is exactly where logout gets used one second
    // after something happened.
    try {
      if (window.Game) await Game.flushSave();
    } catch (err) {
      console.error("Save flush before logout failed:", err);
    }

    try {
      await sb.auth.signOut();
    } catch (err) {
      console.error("Sign out failed:", err);
    }

    // A full reload rather than a return to the title screen.
    //
    // The engine holds a great deal of per-student state: currentUserId,
    // the quest list, state.flags, health, position, Acts.current, the
    // act_progress map, and whichever act's world is currently built.
    // Returning to the title screen means resetting every one of them,
    // and the failure mode of missing one is the worst this project
    // has: the next student on the same phone sees the previous
    // student's progress. On a shared device in a classroom that is not
    // a hypothetical. A reload resets all of it by construction, and
    // costs one cached page load.
    window.location.reload();
  },

  // -----------------------------------------------------------
  // Panels
  // -----------------------------------------------------------

  _showPanel(name) {
    Object.keys(this.el.panels).forEach((key) => {
      const panel = this.el.panels[key];
      if (panel) panel.classList.toggle("hidden", key !== name);
    });
  },

  // The label span rather than the button, which now holds an icon.
  // Subukan Ulit reloads the page, so it takes the reset arrow: the
  // play triangle would promise a world that is not there yet.
  _setStart(label, enabled) {
    setLabel(this.el.startBtn, label);
    setIcon(
      this.el.startBtn,
      this.el.startBtn.dataset.action === "reload" ? "i-reset" : "i-play"
    );
    this.el.startBtn.disabled = !enabled;
  },
};

window.Shell = Shell;

// Registered rather than called, for the same reason the auth
// bootstrap in game.js is: this file is last in the document, but
// the elements it caches are above it and the engine it talks to
// must have finished parsing.
document.addEventListener("DOMContentLoaded", () => Shell.init());
