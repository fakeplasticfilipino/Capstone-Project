// =============================================================
// MACARIO — acts.js (Blocks 2.3, 2.4, 2.5)
//
// The act flow controller. This is the ONLY file that writes to
// the act_progress table. game.js renders worlds and runs
// dialogue; it does not know what an "act" means. This does.
//
// LOAD ORDER: after game.js in index.html. Every call across the
// two files happens at runtime rather than at parse time, so this
// is about making the dependency direction obvious rather than
// about hoisting.
//
// STATE MACHINE
//   locked -> trivia -> pretest -> playing -> posttest -> completed
//
// The trivia, pretest, and posttest states are driven by
// assessment.js. That file is OPTIONAL: if it is not loaded, the
// flow collapses to locked -> playing -> completed and everything
// still works. This is what let Block 2 ship and be tested before
// Block 3 existed, and it is why the guards below check
// window.Assessment rather than assuming it.
//
// WRITE POLICY
// checkObjectives() is invoked from saveProgress() in game.js
// rather than after each individual flag change. saveProgress is
// already debounced at 800ms and backstopped by a 10 second
// interval, so this piggybacks on existing write batching instead
// of introducing a second, competing one. The function early
// returns when the objective count has not moved, so the common
// case costs nothing.
//
// PROGRESSION
// Acts unlock in order: act N requires act N-1 completed. The
// check runs against act_progress rather than against a flag, so
// it survives a reinstall and cannot be set from the console in a
// way that would survive a reload. This is a teaching tool rather
// than a competitive game, so that is proportionate; RLS is what
// protects the data that matters.
// =============================================================

const ACT_ORDINALS = {
  1: "Unang Yugto",
  2: "Ikalawang Yugto",
  3: "Ikatlong Yugto",
  4: "Ikaapat na Yugto",
};

const Acts = {
  // Act data files register themselves on window; this is the
  // lookup the controller works from. An act missing from here is
  // simply not enterable, which is how a half-built act is kept
  // out of a student's way without special-casing anything.
  registry: {
    1: window.ACT_1,
    2: window.ACT_2,
    3: window.ACT_3,
    4: window.ACT_4,
  },

  current: 1,
  status: "playing",

  // act_number -> { status, objectives_done }. Populated once per
  // login by loadProgressMap(). Gating, resume, and the transition
  // screen all read from this rather than issuing their own
  // queries.
  progress: {},

  // Caches the last objectives_done value written, so an unchanged
  // count does not produce a redundant round trip on every save.
  _lastDone: -1,

  // Prevents overlapping writes if a save fires while one is still
  // in flight. Last write wins is fine here, but concurrent upserts
  // to the same primary key are not worth the risk.
  _writing: false,

  // Guards the multi-step sequences (trivia, tests, transition)
  // against being started twice. saveProgress fires on a timer, so
  // without this a second checkObjectives could open a second
  // post-test while the first is still on screen.
  _flowRunning: false,

  // -----------------------------------------------------------
  // Reads
  // -----------------------------------------------------------

  getAct(n) {
    return this.registry[n] || null;
  },

  objectivesFor(n) {
    const act = this.getAct(n);
    return (act && act.objectives) || [];
  },

  // An objective is done when its mapped story flag is truthy.
  countDone(n) {
    return this.objectivesFor(n).filter((o) => Boolean(state.flags[o.flag]))
      .length;
  },

  isCompleted(n) {
    const row = this.progress[n];
    return Boolean(row && row.status === "completed");
  },

  // Act 1 is always open. Every other act requires its predecessor
  // finished. An act with no data file is refused outright.
  canEnter(n) {
    if (!this.getAct(n)) return false;
    if (n <= 1) return true;
    return this.isCompleted(n - 1);
  },

  // The furthest act the student is entitled to be in. Used as the
  // fallback when a stored current_act is out of range, which can
  // happen to a save written by an older build.
  highestEnterable() {
    let best = 1;
    for (let n = 2; n <= 4; n++) {
      if (!this.canEnter(n)) break;
      best = n;
    }
    return best;
  },

  // Resolves a requested act number to one the student may enter.
  // Never throws and never returns something unloadable, because
  // the caller is on the login path and has nothing to fall back
  // to if this fails.
  resolveAct(requested) {
    const n = Number(requested);
    if (Number.isInteger(n) && this.canEnter(n)) return n;
    return this.highestEnterable();
  },

  // performance_score is currently completion only.
  //
  // When stealth and combat exist this becomes a weighted sum, with
  // completion as one term among three. It is worth being explicit
  // about that in the documentation, because "performance score"
  // implies more than completion percentage and a panel may ask.
  scoreFor(done, total) {
    if (!total) return 0;
    return Math.round((done / total) * 1000) / 10; // one decimal place
  },

  // -----------------------------------------------------------
  // Progress map
  // -----------------------------------------------------------

  // One query for every act the student has touched. game.js calls
  // this before deciding which act to load, because canEnter needs
  // the answers and the login path should not issue four separate
  // reads to get them.
  async loadProgressMap() {
    this.progress = {};
    if (!currentUserId) return;

    const { data, error } = await sb
      .from("act_progress")
      .select("act_number, status, objectives_done")
      .eq("student_id", currentUserId);

    if (error) {
      // Not fatal. An empty map means everything except Act I reads
      // as locked, which is the safe direction to fail in.
      console.error("act_progress read failed:", error);
      return;
    }

    (data || []).forEach((row) => {
      this.progress[row.act_number] = {
        status: row.status,
        objectives_done: row.objectives_done,
      };
    });
  },

  // -----------------------------------------------------------
  // Lifecycle
  // -----------------------------------------------------------

  // Called once after login, after loadProgressMap() and after the
  // save has been restored. Ensures a row exists for the act the
  // student is actually in, then resumes whatever state that row
  // was left in.
  async syncStart(actNumber) {
    if (!currentUserId) return;

    this.current = this.resolveAct(actNumber);
    await this._ensureRow(this.current);

    const row = this.progress[this.current];
    this.status = (row && row.status) || "playing";
    this._lastDone = row ? row.objectives_done : -1;

    await this.resume();
  },

  // Inserts a starting row for an act the student has not touched.
  // The starting state is trivia when the assessment module is
  // present and playing when it is not, so the row never claims a
  // state that nothing on the page can move it out of.
  async _ensureRow(n) {
    if (this.progress[n]) return;

    const startState = window.Assessment ? "trivia" : "playing";
    const total = this.objectivesFor(n).length;

    const { error } = await sb.from("act_progress").insert({
      student_id: currentUserId,
      act_number: n,
      status: startState,
      objectives_total: total,
      objectives_done: 0,
      performance_score: 0,
      started_at: new Date().toISOString(),
    });

    if (error) {
      console.error("act_progress insert failed:", error);
      return;
    }

    this.progress[n] = { status: startState, objectives_done: 0 };
  },

  // Writes a new state and keeps the local map in step. Completion
  // is handled by complete() rather than here, because it carries
  // extra columns.
  async setStatus(next) {
    if (!currentUserId) return;
    if (this.status === next) return;

    this.status = next;
    if (this.progress[this.current]) {
      this.progress[this.current].status = next;
    }

    const { error } = await sb
      .from("act_progress")
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq("student_id", currentUserId)
      .eq("act_number", this.current);

    if (error) console.error("act_progress status write failed:", error);
  },

  // Picks up whatever state the stored row was left in. Every
  // branch here has to terminate somewhere the student can act,
  // because this runs on the login path and a student stuck behind
  // an overlay has no way to report what happened.
  async resume() {
    switch (this.status) {
      case "trivia":
      case "pretest":
        await this.runPreActFlow();
        break;

      case "posttest":
        await this.finishAct();
        break;

      case "completed":
        // Finished this act in a previous session and never moved
        // on. Put the transition screen back up rather than
        // dropping them into a world with nothing left to do.
        this.showTransition(this.current);
        break;

      default:
        await this.checkObjectives();
    }
  },

  // Trivia card, then pre-test, then hand control to the player.
  // Both assessment steps are skipped wholesale when assessment.js
  // is absent, and individually when the act has no items seeded.
  async runPreActFlow() {
    if (this._flowRunning) return;
    this._flowRunning = true;

    try {
      const n = this.current;

      if (window.Assessment) {
        // A stored status of pretest means the trivia card was
        // already read in an earlier session. Do not show it again.
        if (this.status !== "pretest") {
          await this.setStatus("trivia");
          await Assessment.runTrivia(n);
        }
        await this.setStatus("pretest");
        await Assessment.runTest(n, "pre");
      }

      await this.setStatus("playing");
      await this.checkObjectives();
    } finally {
      this._flowRunning = false;
    }
  },

  // Recounts objectives from state.flags and writes only if the
  // count moved. Hands off to finishAct() when everything is done.
  async checkObjectives() {
    if (!currentUserId) return;
    if (this._writing) return;
    if (this.status === "completed") return;

    const n = this.current;
    const objectives = this.objectivesFor(n);
    const total = objectives.length;
    if (!total) return; // stub acts have nothing to count

    const done = this.countDone(n);
    if (done === this._lastDone) return; // nothing changed

    this._writing = true;
    try {
      const payload = {
        student_id: currentUserId,
        act_number: n,
        objectives_total: total,
        objectives_done: done,
        performance_score: this.scoreFor(done, total),
        updated_at: new Date().toISOString(),
      };

      const { error } = await sb
        .from("act_progress")
        .upsert(payload, { onConflict: "student_id,act_number" });

      if (error) {
        console.error("act_progress write failed:", error);
        return; // leave _lastDone alone so the next save retries
      }

      this._lastDone = done;
      if (this.progress[n]) this.progress[n].objectives_done = done;
    } finally {
      this._writing = false;
    }

    // Outside the write lock on purpose. finishAct runs the
    // post-test and the transition screen, which involve further
    // writes of their own.
    if (done >= total && this.status === "playing") {
      await this.finishAct();
    }
  },

  // Ends the current act: post-test, completion write, transition
  // screen. Safe to call from act content for an act that ends on
  // a cutscene rather than on the objective count, and safe to
  // call twice.
  async finishAct() {
    if (!currentUserId) return;
    if (this._flowRunning) return;
    this._flowRunning = true;

    try {
      const n = this.current;

      if (window.Assessment && this.status !== "completed") {
        await this.setStatus("posttest");
        await Assessment.runTest(n, "post");
      }

      await this.complete();
      this.showTransition(n);
    } finally {
      this._flowRunning = false;
    }
  },

  // The completion write. Only ever moves an act into completed,
  // never back out of it: a student reopening a finished act must
  // not reset their own record.
  async complete() {
    if (!currentUserId) return;
    if (this.status === "completed") return;

    const n = this.current;
    const total = this.objectivesFor(n).length;
    const done = this.countDone(n);

    const { error } = await sb.from("act_progress").upsert(
      {
        student_id: currentUserId,
        act_number: n,
        status: "completed",
        objectives_total: total,
        objectives_done: done,
        performance_score: this.scoreFor(done, total),
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id,act_number" }
    );

    if (error) {
      console.error("act_progress complete failed:", error);
      return;
    }

    this.status = "completed";
    this._lastDone = done;
    this.progress[n] = { status: "completed", objectives_done: done };

    console.log(`Act ${n} completed: ${done}/${total} objectives`);
  },

  // -----------------------------------------------------------
  // Moving between acts
  // -----------------------------------------------------------

  // Tears down the current world and builds the next one. This
  // replaces teleportToNewRoom(), which was a placeholder ending
  // that left the player in an empty room with no exit.
  async enterAct(n) {
    if (!this.canEnter(n)) {
      console.warn(`Act ${n} is locked or has no content file.`);
      return false;
    }

    const act = this.getAct(n);

    this.current = n;
    this.status = "locked";
    this._lastDone = -1;

    // The quest log is "Mga Gawain", the tasks in front of you now,
    // not a permanent record. Carrying Act I's completed entries
    // into Act II would make it useless by Act IV.
    clearQuests();

    loadAct(act);

    // Persist the move before anything can go wrong in the flow
    // below, so a student who closes the tab during the trivia
    // card still comes back to the right act.
    markDirty();
    await saveProgress();

    await this._ensureRow(n);
    this.status = this.progress[n].status;

    await this.showActTitle(n);
    await this.runPreActFlow();
    return true;
  },

  // Moves between scenes inside the current act. Distinct from
  // enterAct: the act, its objectives and its act_progress row are
  // unchanged, only the location moves. Act I uses this to send
  // Macario from the road to the outpost after the Katipunero.
  async gotoScene(sceneId) {
    loadScene(sceneId);
    markDirty();
    await saveProgress();
  },

  // -----------------------------------------------------------
  // Screens
  //
  // Both screens share one overlay in index.html. acts.js owns it
  // because both are act lifecycle events; assessment.js has its
  // own overlay for anything with questions on it.
  // -----------------------------------------------------------

  _screen(opts) {
    return new Promise((resolve) => {
      const overlay = document.getElementById("act-screen");
      const eyebrow = document.getElementById("act-screen-eyebrow");
      const title = document.getElementById("act-screen-title");
      const body = document.getElementById("act-screen-body");
      const btn = document.getElementById("act-screen-btn");

      eyebrow.textContent = opts.eyebrow || "";
      title.textContent = opts.title || "";
      body.textContent = opts.body || "";
      body.classList.toggle("hidden", !opts.body);

      btn.textContent = opts.button || "Magpatuloy";
      btn.classList.toggle("hidden", !opts.button);

      setUiBlocked(true);
      overlay.classList.remove("hidden");

      const done = () => {
        btn.removeEventListener("click", done);
        overlay.classList.add("hidden");
        setUiBlocked(false);
        resolve();
      };

      if (opts.button) {
        btn.addEventListener("click", done);
      } else {
        // A screen with no button is terminal: the run is over and
        // there is nothing further to advance to.
        resolve();
      }
    });
  },

  // Shown on entering an act, after the transition screen.
  showActTitle(n) {
    const act = this.getAct(n);
    if (!act) return Promise.resolve();

    return this._screen({
      eyebrow: ACT_ORDINALS[n] || `Yugto ${n}`,
      title: act.titleTagalog || act.title,
      body: act.developmentNotice || "",
      button: "Simulan",
    });
  },

  // Shown on finishing an act. Offers the next one, or closes out
  // the run when there is nothing after it.
  async showTransition(fromAct) {
    const next = fromAct + 1;
    const nextAct = this.getAct(next);

    if (!nextAct) {
      await this._screen({
        eyebrow: `Natapos: ${ACT_ORDINALS[fromAct] || "Yugto " + fromAct}`,
        title: "Wakas",
        body: "Natapos mo ang buong kuwento. Maraming salamat sa paglalaro.",
        button: "",
      });
      return;
    }

    await this._screen({
      eyebrow: `Natapos: ${ACT_ORDINALS[fromAct] || "Yugto " + fromAct}`,
      title: "Magaling!",
      body: `Susunod: ${nextAct.titleTagalog || nextAct.title}`,
      button: `Magpatuloy sa ${ACT_ORDINALS[next] || "Yugto " + next}`,
    });

    await this.enterAct(next);
  },
};

window.Acts = Acts;
