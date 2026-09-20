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
  // music and sfx are the two sound switches (Block 30). Both default on:
  // a device that has never opened settings should sound like the game.
  settings: { textSize: "md", music: true, sfx: true },

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
      guestBtn: document.getElementById("shell-guest"),
      titleNote: document.getElementById("shell-title-note"),
      titleSettingsBtn: document.getElementById("shell-title-settings"),
      resumeBtn: document.getElementById("shell-resume"),
      pauseSettingsBtn: document.getElementById("shell-pause-settings"),
      logoutBtn: document.getElementById("shell-logout"),
      settingsBack: document.getElementById("shell-settings-back"),
      textSizeGroup: document.getElementById("shell-textsize"),
      musicGroup: document.getElementById("shell-music"),
      sfxGroup: document.getElementById("shell-sfx"),
      logoutConfirm: document.getElementById("shell-logout-yes"),
      logoutCancel: document.getElementById("shell-logout-no"),
      logoutNote: document.getElementById("shell-logout-note"),
      box: document.getElementById("shell-box"),
      inventoryBack: document.getElementById("shell-inventory-back"),
      inventoryNote: document.getElementById("shell-inventory-note"),
      slots: document.getElementById("shell-slots"),
      items: document.getElementById("shell-items"),
      balance: document.getElementById("shell-balance"),
      invDetail: document.getElementById("shell-inv-detail"),
      shopDetail: document.getElementById("shell-shop-detail"),
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
    if (this.el.guestBtn) {
      this.el.guestBtn.addEventListener("click", () => this._onGuestStart());
    }
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
    // module absent neither main-UI button appears (game.js gates their
    // visibility the same way), and every other screen behaves exactly
    // as it did before Block 10.
    //
    // Block 25 gave each screen exactly one way in from play: its own
    // main-UI button, plus an opensShop NPC for the shop. The pause
    // menu no longer carries Imbentaryo and the inventory no longer
    // carries Tindahan, so there is no chain of screens to back out of
    // and "back" always means back to the world.
    if (window.Inventory) {
      this.el.inventoryBack.addEventListener("click", () =>
        this._closeInventory()
      );
      this.el.items.addEventListener("click", (e) => this._onInventoryTap(e));
      this.el.slots.addEventListener("click", (e) => this._onInventoryTap(e));
      this.el.invDetail.addEventListener("click", (e) => this._onInventoryAction(e));

      this.el.shopBack.addEventListener("click", () => this._closeShop());
      this.el.shopList.addEventListener("click", (e) => this._onShopTap(e));
      this.el.shopDetail.addEventListener("click", (e) => this._onShopAction(e));

      if (this.el.mainInventoryBtn) {
        this.el.mainInventoryBtn.addEventListener("click", () =>
          this._openInventory()
        );
      }
      if (this.el.mainShopBtn) {
        this.el.mainShopBtn.addEventListener("click", () => this._openShop(null));
      }

      // inventory.js owns the state and tells the screen when it moved,
      // including when it puts an optimistic change back after a failed
      // write. The shell only ever draws what it is told.
      Inventory.onChange(() => {
        if (this.state === "inventory") this._renderInventory();
        if (this.state === "shop") this._renderShop();
      });

      // game.js tells us when an NPC that opens the shop (opensShop:
      // true, Tindero) was pressed.
      if (window.Game && Game.onShopRequest) {
        Game.onShopRequest((sellerId) => this._openShop(sellerId));
      }
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

    this.el.musicGroup.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-music]");
      if (!btn) return;
      this.settings.music = btn.dataset.music === "on";
      this._applySettings();
      this._saveSettings();
    });

    this.el.sfxGroup.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-sfx]");
      if (!btn) return;
      this.settings.sfx = btn.dataset.sfx === "on";
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

  // Block 14. Guest skips the login box entirely rather than showing
  // it and then bypassing it, which is why this does not reuse
  // _onStart. Setting entered here before calling into game.js is
  // the same trick _onStart plays for a real login: by the time
  // enterAsGuest calls back into awaitEntry, this.entered is already
  // true, so awaitEntry drops straight into _enterWorld() instead of
  // waiting on a Magpatuloy tap that would never come.
  _onGuestStart() {
    if (this.entered) return; // already on the way in; ignore a second tap
    this.entered = true;
    if (window.Game && window.Game.enterAsGuest) {
      window.Game.enterAsGuest();
    }
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
      // Checked as booleans rather than truthiness, so a settings value
      // saved before Block 30, which has neither key, keeps the defaults
      // instead of reading as off.
      if (parsed && typeof parsed.music === "boolean") {
        this.settings.music = parsed.music;
      }
      if (parsed && typeof parsed.sfx === "boolean") {
        this.settings.sfx = parsed.sfx;
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

    const music = this.settings.music !== false;
    const sfx = this.settings.sfx !== false;
    this.el.musicGroup.querySelectorAll("[data-music]").forEach((btn) => {
      btn.classList.toggle("active", (btn.dataset.music === "on") === music);
    });
    this.el.sfxGroup.querySelectorAll("[data-sfx]").forEach((btn) => {
      btn.classList.toggle("active", (btn.dataset.sfx === "on") === sfx);
    });

    // The engine owns what gets silenced; this only owns the choice.
    // Called on start-up too, before the world is entered, so no sound
    // can play once against a setting that says off.
    if (window.Game && Game.setAudio) Game.setAudio({ music, sfx });
  },

  // -----------------------------------------------------------
  // Inventory and shop (rebuilt in Block 25)
  //
  // Two wide panels with the same anatomy: a list on the left (the
  // worn slots and owned items, or the goods for sale) and the
  // selected item on the right, with the one action that item allows
  // under it. Selecting and acting are two taps on purpose. A Grade 8
  // student tapping a tile to find out what it is must not eat the
  // last apple or spend their barya by doing so, and the detail pane
  // is where the effect is explained before it happens.
  //
  // Each panel is reached only from its own main-UI button (and the
  // shop from an opensShop NPC), never from pause and never from each
  // other, so opening pauses the world and back resumes it. The world
  // stops for the whole visit, so an effect can never change under a
  // running frame.
  //
  // Everything is redrawn whole on every change. The lists are a
  // handful of items on a screen that is only open while the game is
  // paused, so the simple thing costs nothing and cannot drift out of
  // step with Inventory's state.
  // -----------------------------------------------------------

  SLOT_ICONS: { weapon: "i-blade", accessory: "i-star", outfit: "i-shirt" },

  invSelected: null,
  shopSelected: null,
  shopSeller: null, // the NPC whose stock is shown; null is the general stock

  // The symbol an item falls back to. An item may name its own
  // (icon: "i-apple"); otherwise its slot's, or a scroll for a quest
  // item, or the bag.
  _itemIcon(item) {
    if (item && item.icon) return item.icon;
    if (item && Inventory.isQuest(item)) return "i-scroll";
    if (item && this.SLOT_ICONS[item.slot]) return this.SLOT_ICONS[item.slot];
    return "i-bag";
  },

  _slotIcon(slot) {
    return this.SLOT_ICONS[slot] || "i-bag";
  },

  // An item's picture: its img if that file exists, its symbol if not.
  // This is the one place a missing image does NOT become the dashed
  // placeholder box. A tile is too small for a box that names a file,
  // and a screen of those teaches nothing; the symbol still says what
  // kind of thing it is. The filename is kept in the title attribute so
  // the artist can still find out what is owed. A failed path is
  // remembered, so a redraw does not flash the broken image again.
  _artFailed: new Set(),

  _itemArt(item, extraClass) {
    const art = document.createElement("span");
    art.className = "inv-art" + (extraClass ? " " + extraClass : "");
    art.appendChild(makeIcon(this._itemIcon(item)));

    const src = item && item.img;
    if (src && !this._artFailed.has(src)) {
      art.title = src;
      const img = document.createElement("img");
      img.alt = "";
      img.src = assetUrl(src);
      img.onload = () => art.classList.add("inv-art-loaded");
      img.onerror = () => {
        this._artFailed.add(src);
        img.remove();
      };
      art.appendChild(img);
    } else if (src) {
      art.title = src;
    }
    return art;
  },

  // A button built the house way: icon and label, label in .lbl.
  _actionButton(id, icon, label, extraClass) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = id;
    btn.className = "shell-btn " + (extraClass || "shell-btn-primary") + " inv-action";
    btn.appendChild(makeIcon(icon));
    const lbl = document.createElement("span");
    lbl.className = "lbl";
    lbl.textContent = label;
    btn.appendChild(lbl);
    return btn;
  },

  _note(el, text, good) {
    if (!el) return;
    el.textContent = text || "";
    el.className = "shell-note" + (good ? " ok" : "");
  },

  // The part of both detail panes that describes an item: picture,
  // name, what kind it is, what it says about itself, and what it does.
  _detailHeader(item) {
    const wrap = document.createDocumentFragment();

    const top = document.createElement("div");
    top.className = "inv-detail-top";
    top.appendChild(this._itemArt(item, "inv-art-large"));

    const titles = document.createElement("div");
    titles.className = "inv-detail-titles";
    const name = document.createElement("div");
    name.className = "inv-detail-name";
    name.textContent = item.name;
    const chip = document.createElement("span");
    chip.className = "inv-chip" + (Inventory.isQuest(item) ? " inv-chip-quest" : "");
    chip.textContent = Inventory.kindLabel(item);
    titles.appendChild(name);
    titles.appendChild(chip);
    top.appendChild(titles);
    wrap.appendChild(top);

    if (item.description) {
      const desc = document.createElement("p");
      desc.className = "inv-detail-desc";
      desc.textContent = item.description;
      wrap.appendChild(desc);
    }

    const lines = Inventory.effectLines(item);
    if (lines.length) {
      const list = document.createElement("ul");
      list.className = "inv-effects";
      lines.forEach((text) => {
        const li = document.createElement("li");
        li.textContent = text;
        list.appendChild(li);
      });
      wrap.appendChild(list);
    }

    return wrap;
  },

  _emptyDetail(el, text) {
    el.innerHTML = "";
    const p = document.createElement("p");
    p.className = "inv-detail-empty";
    p.textContent = text;
    el.appendChild(p);
  },

  // A tile in either list.
  _tile(item, attr, selected) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "inv-tile" + (selected ? " inv-tile-selected" : "");
    btn.dataset[attr] = item.id;
    btn.appendChild(this._itemArt(item));
    const lbl = document.createElement("span");
    lbl.className = "lbl";
    lbl.textContent = item.name;
    btn.appendChild(lbl);
    return btn;
  },

  _badge(btn, text, kind) {
    const b = document.createElement("span");
    b.className = "inv-badge" + (kind ? " inv-badge-" + kind : "");
    b.textContent = text;
    btn.appendChild(b);
  },

  // -- Inventory ------------------------------------------------

  _openInventory() {
    if (!window.Inventory) return;
    if (!this._pauseForScreen()) return;
    this.state = "inventory";
    this._note(this.el.inventoryNote, "");
    this._renderInventory();
    this._showPanel("inventory");
  },

  _closeInventory() {
    if (this.state !== "inventory") return;
    this._resumeFromScreen();
  },

  // Both screens pause the world themselves, since neither is reached
  // through the pause menu any more. setPaused refuses during the
  // stage cutscene, the same guard openPause honours.
  _pauseForScreen() {
    if (this.state !== "playing") return false;
    if (!window.Game) return false;
    if (!Game.setPaused(true)) return false;
    Game.setUiBlocked(true);
    this.el.overlay.classList.remove("hidden");
    return true;
  },

  _resumeFromScreen() {
    this.state = "playing";
    this.el.overlay.classList.add("hidden");
    if (window.Game) {
      Game.setUiBlocked(false);
      Game.setPaused(false);
    }
    this._applyOrientation();
  },

  // Keeps a selection that still exists; otherwise the first owned
  // item, so the right-hand pane is never blank while there is
  // something to show.
  _pickInventorySelection() {
    const owned = Inventory.ownedItems();
    if (!owned.some((item) => item.id === this.invSelected)) {
      const first =
        owned.find((i) => Inventory.isPermanent(i)) ||
        owned.find((i) => Inventory.isConsumable(i)) ||
        owned[0];
      this.invSelected = first ? first.id : null;
    }
  },

  _renderInventory() {
    if (!window.Inventory || !this.el.slots) return;

    this.el.balance.textContent = String(Inventory.balance());
    this._pickInventorySelection();

    // The three slots. A filled slot is a button that selects what is
    // in it; an empty one is disabled and says so.
    this.el.slots.innerHTML = "";
    Inventory.SLOTS.forEach((slot) => {
      const item = Inventory.item(Inventory.equipped(slot.id));
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "inv-slot" +
        (item ? " inv-slot-filled" : " inv-slot-empty") +
        (item && item.id === this.invSelected ? " inv-tile-selected" : "");
      btn.dataset.slot = slot.id;
      if (item) btn.dataset.itemId = item.id;
      btn.disabled = !item;

      if (item) btn.appendChild(this._itemArt(item));
      else {
        const art = document.createElement("span");
        art.className = "inv-art inv-art-empty";
        art.appendChild(makeIcon(this._slotIcon(slot.id)));
        btn.appendChild(art);
      }

      const lbl = document.createElement("span");
      lbl.className = "lbl";
      const label = document.createElement("span");
      label.className = "inv-slot-label";
      label.textContent = slot.label;
      const value = document.createElement("span");
      value.className = "inv-slot-value";
      value.textContent = item ? item.name : "Walang nakasuot";
      lbl.appendChild(label);
      lbl.appendChild(value);
      btn.appendChild(lbl);

      this.el.slots.appendChild(btn);
    });

    // Owned items in one grid, ordered by group: what can be worn, then
    // what can be used, then what the story will take. One grid rather
    // than three headed sections because a phone held sideways has no
    // height for three headings; the corner badge on each tile
    // (Nakasuot, a count, Misyon) and the chip in the detail pane carry
    // the group instead.
    this.el.items.innerHTML = "";
    const owned = Inventory.ownedItems();

    const section = document.createElement("div");
    section.className = "inv-section";
    const heading = document.createElement("div");
    heading.className = "shell-label";
    heading.textContent = "Bitbit";
    section.appendChild(heading);

    if (!owned.length) {
      const empty = document.createElement("div");
      empty.className = "inv-empty";
      empty.textContent = "Walang gamit pa. Bumili sa Tindahan.";
      section.appendChild(empty);
    } else {
      const grid = document.createElement("div");
      grid.className = "inv-grid";
      const rank = (i) =>
        Inventory.isPermanent(i) ? 0 : Inventory.isConsumable(i) ? 1 : 2;
      owned
        .map((item, at) => ({ item, at }))
        .sort((a, b) => rank(a.item) - rank(b.item) || a.at - b.at)
        .forEach(({ item }) => {
          const tile = this._tile(item, "itemId", item.id === this.invSelected);
          if (Inventory.isWorn(item.id)) {
            tile.classList.add("inv-tile-worn");
            this._badge(tile, "Nakasuot", "worn");
          } else if (Inventory.isConsumable(item)) {
            this._badge(tile, "×" + Inventory.count(item.id), "count");
          } else if (Inventory.isQuest(item)) {
            tile.classList.add("inv-tile-quest");
            this._badge(tile, "Misyon", "quest");
          }
          grid.appendChild(tile);
        });
      section.appendChild(grid);
    }
    this.el.items.appendChild(section);

    this._renderInventoryDetail();
  },

  _renderInventoryDetail() {
    const el = this.el.invDetail;
    const item = Inventory.item(this.invSelected);
    if (!item) {
      this._emptyDetail(el, "Pumili ng gamit para makita dito.");
      return;
    }

    el.innerHTML = "";
    el.appendChild(this._detailHeader(item));

    if (Inventory.isConsumable(item)) {
      const count = document.createElement("div");
      count.className = "inv-detail-count";
      count.textContent =
        `Bitbit: ${Inventory.count(item.id)} / ${Inventory.maxStack(item)}`;
      el.appendChild(count);
    }

    if (Inventory.isPermanent(item)) {
      const worn = Inventory.isWorn(item.id);
      const btn = worn
        ? this._actionButton("shell-inv-action", "i-cross", "Tanggalin", "shell-btn-ghost")
        : this._actionButton("shell-inv-action", "i-check", "Isuot");
      btn.dataset.action = worn ? "unequip" : "equip";
      btn.dataset.itemId = item.id;
      el.appendChild(btn);
    } else if (Inventory.isConsumable(item)) {
      const blocker = Inventory.useBlocker(item.id);
      const btn = this._actionButton(
        "shell-inv-action",
        this._itemIcon(item),
        blocker || "Gamitin"
      );
      btn.dataset.action = "use";
      btn.dataset.itemId = item.id;
      btn.disabled = Boolean(blocker);
      el.appendChild(btn);
    } else {
      // A quest item has nothing to do from here. Said plainly rather
      // than shown as a disabled button, which would look broken.
      const hint = document.createElement("p");
      hint.className = "inv-detail-hint";
      hint.textContent = "Itago ito. Ibibigay sa tamang tauhan sa tamang oras.";
      el.appendChild(hint);
    }
  },

  _onInventoryTap(e) {
    const btn = e.target.closest("[data-item-id]");
    if (!btn || !window.Inventory || this.state !== "inventory") return;
    this.invSelected = btn.dataset.itemId;
    this._note(this.el.inventoryNote, "");
    this._renderInventory();
  },

  // Not awaited for the screen's sake: Inventory applies the change to
  // memory and fires its listener before the write leaves, so the
  // screen has already moved. The result only decides the note.
  _onInventoryAction(e) {
    const btn = e.target.closest("[data-action]");
    if (!btn || btn.disabled || !window.Inventory) return;
    const id = btn.dataset.itemId;
    const action = btn.dataset.action;
    const item = Inventory.item(id);
    this._note(this.el.inventoryNote, "");

    let pending;
    if (action === "use") pending = Inventory.use(id);
    else if (action === "equip") pending = Inventory.equip(id);
    else if (action === "unequip") pending = Inventory.unequip(item.slot);
    else return;

    pending.then((ok) => {
      if (this.state !== "inventory") return;
      if (!ok) {
        this._note(this.el.inventoryNote, "Hindi na-save. Suriin ang koneksyon.");
      } else if (action === "use") {
        const heal = item && item.use && item.use.heal;
        this._note(
          this.el.inventoryNote,
          heal ? `Nagbalik ng ${heal} puso.` : "Ginamit.",
          true
        );
      }
      this._renderInventory();
    });
  },

  // -- Shop -----------------------------------------------------

  // sellerId is the NPC that opened it, or null for the corner button;
  // it decides which stock is listed (Inventory.forSale).
  _openShop(sellerId) {
    if (!window.Inventory) return;
    if (!this._pauseForScreen()) return;
    this.shopSeller = sellerId || null;
    this.state = "shop";
    this._note(this.el.shopNote, "");
    this._renderShop();
    this._showPanel("shop");
  },

  _closeShop() {
    if (this.state !== "shop") return;
    this._resumeFromScreen();
  },

  // Every item for sale, owned or not. An owned permanent item stays
  // listed with a tick rather than disappearing, so a student can see
  // what they already have instead of wondering where it went.
  _renderShop() {
    if (!window.Inventory || !this.el.shopList) return;

    this.el.shopBalance.textContent = String(Inventory.balance());

    const goods = Inventory.forSale(this.shopSeller);
    if (!goods.some((item) => item.id === this.shopSelected)) {
      this.shopSelected = goods.length ? goods[0].id : null;
    }

    this.el.shopList.innerHTML = "";

    if (!goods.length) {
      const empty = document.createElement("div");
      empty.className = "inv-empty";
      empty.textContent = "Walang paninda ngayon.";
      this.el.shopList.appendChild(empty);
    } else {
      const section = document.createElement("div");
      section.className = "inv-section";
      const label = document.createElement("div");
      label.className = "shell-label";
      label.textContent = "Mabibili";
      const grid = document.createElement("div");
      grid.className = "inv-grid";

      goods.forEach((item) => {
        const tile = this._tile(item, "shopId", item.id === this.shopSelected);
        const ownedPermanent = !Inventory.isConsumable(item) && Inventory.owns(item.id);
        if (ownedPermanent) {
          tile.classList.add("inv-tile-owned");
          this._badge(tile, "Nasa iyo", "owned");
        } else {
          this._badge(tile, String(item.price || 0), "price");
        }
        if (Inventory.isQuest(item) && !ownedPermanent) {
          tile.classList.add("inv-tile-quest");
        }
        grid.appendChild(tile);
      });

      section.appendChild(label);
      section.appendChild(grid);
      this.el.shopList.appendChild(section);
    }

    this._renderShopDetail();
  },

  _renderShopDetail() {
    const el = this.el.shopDetail;
    const item = Inventory.item(this.shopSelected);
    if (!item) {
      this._emptyDetail(el, "Pumili ng paninda para makita dito.");
      return;
    }

    el.innerHTML = "";
    el.appendChild(this._detailHeader(item));

    if (Inventory.isConsumable(item)) {
      const count = document.createElement("div");
      count.className = "inv-detail-count";
      count.textContent = `Bitbit: ${Inventory.count(item.id)} / ${Inventory.maxStack(item)}`;
      el.appendChild(count);
    }

    const blocker = Inventory.buyBlocker(item.id);
    const price = item.price || 0;
    const btn = this._actionButton(
      "shell-shop-action",
      blocker === "Nasa iyo na" ? "i-check" : "i-coins",
      blocker || `Bilhin: ${price} barya`
    );
    btn.dataset.buyId = item.id;
    btn.disabled = Boolean(blocker);
    el.appendChild(btn);
  },

  _onShopTap(e) {
    const btn = e.target.closest("[data-shop-id]");
    if (!btn || !window.Inventory || this.state !== "shop") return;
    this.shopSelected = btn.dataset.shopId;
    this._note(this.el.shopNote, "");
    this._renderShop();
  },

  _onShopAction(e) {
    const btn = e.target.closest("[data-buy-id]");
    if (!btn || btn.disabled || !window.Inventory) return;
    const item = Inventory.item(btn.dataset.buyId);
    this._note(this.el.shopNote, "");

    Inventory.buy(btn.dataset.buyId).then((bought) => {
      if (this.state !== "shop") return;
      this._renderShop();
      this._note(
        this.el.shopNote,
        bought ? `Binili: ${item ? item.name : ""}` : "Hindi natuloy ang pagbili.",
        bought
      );
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
    // Inventory and shop are laid out in two columns and need the
    // width a phone held sideways actually has; every other panel is a
    // single column of buttons and keeps the narrow box.
    if (this.el.box) {
      this.el.box.classList.toggle("shell-box-wide", name === "inventory" || name === "shop");
    }
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
