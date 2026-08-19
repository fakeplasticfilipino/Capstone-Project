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
    if (window.Inventory) {
      this.el.inventoryOpen.classList.remove("hidden");
      this.el.inventoryOpen.addEventListener("click", () =>
        this._openInventory()
      );
      this.el.inventoryBack.addEventListener("click", () =>
        this._closeInventory()
      );
      this.el.items.addEventListener("click", (e) => this._onItemTap(e));

      this.el.shopOpen.addEventListener("click", () => this._openShop());
      this.el.shopBack.addEventListener("click", () => this._closeShop());
      this.el.shopList.addEventListener("click", (e) => this._onBuyTap(e));

      // inventory.js owns the state and tells the screen when it moved,
      // including when it puts an optimistic change back after a failed
      // write. The shell only ever draws what it is told.
      Inventory.onChange(() => {
        this._renderInventory();
        if (this.state === "shop") this._renderShop();
      });
    }

    this.el.settingsBack.addEventListener("click", () => this._closeSettings());
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
      this._setStart("Subukan Ulit", true);
      this.el.startBtn.dataset.action = "reload";
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
  },

  // -----------------------------------------------------------
  // Settings
  // -----------------------------------------------------------

  // Reachable from the title screen and from pause, and the same
  // screen in both cases. It remembers which one it came from
  // rather than assuming, since backing out of settings into the
  // wrong screen is how a student ends up unable to resume.
  _openSettings(from) {
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
  // Reached from pause and from nowhere else. The mobile control
  // cluster already overflows the viewport at 412px, which is a known
  // problem scheduled for Block 12, and a sixth button in that row
  // would make a documented fault worse in order to save one tap.
  //
  // Opening it from pause also means the game is stopped for the whole
  // visit, so an effect can never change under a running frame.
  // -----------------------------------------------------------

  _openInventory() {
    if (!window.Inventory) return;
    if (this.state !== "paused") return; // pause is the only way in
    this.state = "inventory";
    this._renderInventory();
    this._showPanel("inventory");
  },

  // Back to pause rather than back to the world. The student paused to
  // get here, and resuming out from under them would hide the effect
  // they just equipped before they saw the hearts change.
  _closeInventory() {
    if (this.state !== "inventory") return;
    this.state = "paused";
    this._showPanel("pause");
  },

  // Slots first, then everything owned. Both are redrawn whole rather
  // than patched: the list is two items long on a screen that is only
  // ever open while the game is paused, so the simple thing costs
  // nothing and cannot drift out of step with Inventory's state.
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
      label.textContent = slot.label;

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

      btn.appendChild(name);
      btn.appendChild(desc);
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
  // A panel off the inventory rather than off pause. The two belong
  // together, and the pause screen already carries four buttons at a
  // width where a fifth starts to push the logout button off a phone.
  // -----------------------------------------------------------

  _openShop() {
    if (!window.Inventory) return;
    if (this.state !== "inventory") return;
    this.state = "shop";
    this._renderShop();
    this._showPanel("shop");
  },

  _closeShop() {
    if (this.state !== "shop") return;
    this.state = "inventory";
    this._renderInventory();
    this._showPanel("inventory");
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

      btn.appendChild(name);
      btn.appendChild(desc);
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

  _setStart(label, enabled) {
    this.el.startBtn.textContent = label;
    this.el.startBtn.disabled = !enabled;
  },
};

window.Shell = Shell;

// Registered rather than called, for the same reason the auth
// bootstrap in game.js is: this file is last in the document, but
// the elements it caches are above it and the engine it talks to
// must have finished parsing.
document.addEventListener("DOMContentLoaded", () => Shell.init());
