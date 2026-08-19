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

  // performance_score, the weighted sum the paper asks for: objective
  // completion, stealth effectiveness and combat efficiency.
  //
  //   score = 50 * completion + 25 * survival + 25 * stealth
  //
  // Completion carries half the weight on purpose. A student who
  // finishes every objective scores at least 50 however badly they
  // played, because completion is what the pre-test and post-test
  // measure against and the performance score should not contradict
  // them. A student who plays flawlessly and finishes nothing also
  // scores 50, which is the honest reading of that: skill demonstrated,
  // nothing learned.
  //
  // Time is recorded but NOT scored. A timer rewards skipping the
  // dialogue, which is the entire lesson.
  //
  // The two budgets below are CHOSEN, NOT MEASURED. This project will
  // never collect the playtesting data to justify a different pair, and
  // saying so is better than implying the numbers came from somewhere.
  // They sit a little above what a careful first run of the Act I
  // outpost costs, so both terms discriminate without bottoming out.
  DAMAGE_BUDGET: 6,
  DETECTION_BUDGET: 5,

  scoreFor(done, total, stats) {
    if (!total) return 0; // a stub act scores nothing and writes nothing

    const s = stats || { damageTaken: 0, detections: 0 };
    const completion = done / total;

    // Clamped, so heavy damage floors the term at zero rather than
    // dragging the whole score negative.
    const survival = 1 - Math.min(1, (s.damageTaken || 0) / this.DAMAGE_BUDGET);
    const stealth = 1 - Math.min(1, (s.detections || 0) / this.DETECTION_BUDGET);

    const score = 50 * completion + 25 * survival + 25 * stealth;
    return Math.round(score * 10) / 10; // one decimal place
  },

  // The engine holds the counters. This is the only place that reads
  // them, and it tolerates a missing Game so the file still works if
  // game.js ever fails to load.
  currentStats() {
    if (window.Game && Game.stats) return Game.stats();
    return { damageTaken: 0, detections: 0, playMs: 0 };
  },

  // -----------------------------------------------------------
  // Currency
  //
  // An act pays exactly its rounded performance score, in two parts
  // that sum to it.
  //
  // The completion term of the score is worth 50, so the drip below
  // is that term paid as it is earned, one objective at a time, and
  // the payment at the end is the survival and stealth half. It
  // explains itself to a student in a sentence: you are paid for
  // what you finish, and paid again for how well you did it.
  //
  // Paying during the act rather than only at the end is what makes
  // the shop reachable inside one class period. Act I has five
  // objectives, so a student holds 50 before the outpost is over,
  // which is the price of the cheaper outfit.
  //
  // NOTHING NEW IS STORED to make this idempotent. The amount already
  // dripped is the per-objective rate times objectives_done, and
  // objectives_done is already in act_progress, so a student who
  // reloads cannot be paid twice for the same objective.
  // -----------------------------------------------------------

  COMPLETION_POOL: 50, // matches the completion weight in scoreFor

  perObjective(total) {
    if (!total) return 0;
    return Math.floor(this.COMPLETION_POOL / total);
  },

  award(amount, toast) {
    const n = Math.max(0, Math.round(amount || 0));
    if (!n) return 0;
    if (!window.Game || !Game.addCurrency) return 0;
    Game.addCurrency(n);
    if (toast && typeof showToast === "function") {
      showToast(`+${n} barya`);
    }
    return n;
  },

  // -----------------------------------------------------------
  // Sessions
  //
  // acts.js is the only writer, because acts.js owns the act
  // lifecycle. Nothing in the game ever reads these rows back.
  //
  // Every write here is fire and forget. A telemetry write that
  // fails, or that is slow on a bad connection, must never block
  // gameplay or surface an error to a student.
  //
  // A NULL ended_at means the session was abandoned rather than
  // finished: the tab was closed, the battery died, the period
  // ended. That is data, not a defect. There is deliberately no
  // beforeunload handler closing these; beforeunload is unreliable
  // on mobile Chrome, which is the target device, and a
  // half-working close would make NULL mean two different things
  // instead of one honest one.
  // -----------------------------------------------------------

  _sessionId: null,
  _lastAward: 0,

  async startSession(n) {
    if (!currentUserId) return;

    // The id is generated here rather than read back from the
    // insert, which saves a round trip on a phone. The column
    // still defaults to gen_random_uuid() for anything else that
    // ever inserts.
    const id =
      window.crypto && crypto.randomUUID
        ? crypto.randomUUID()
        : "sess-" + Date.now() + "-" + Math.random().toString(16).slice(2);

    this._sessionId = id;

    try {
      const { error } = await sb.from("game_sessions").insert({
        id,
        student_id: currentUserId,
        act_number: n,
        started_at: new Date().toISOString(),
      });
      if (error) console.error("game_sessions insert failed:", error);
    } catch (err) {
      console.error("game_sessions insert threw:", err);
    }
  },

  async endSession() {
    if (!currentUserId || !this._sessionId) return;
    const id = this._sessionId;
    this._sessionId = null;

    try {
      const { error } = await sb
        .from("game_sessions")
        .update({ ended_at: new Date().toISOString() })
        .eq("id", id);
      if (error) console.error("game_sessions close failed:", error);
    } catch (err) {
      console.error("game_sessions close threw:", err);
    }
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

    // A resuming student opens a session too. Sessions are per act
    // ENTRY rather than per login, so a student who reloads mid-act
    // produces a second row with the first left open. Both rows are
    // correct and both are legible.
    //
    // The counters are NOT reset here. They were restored from
    // save_state a moment ago, and zeroing them is precisely the bug
    // that persisting them exists to prevent.
    await this.startSession(this.current);

    // Equipment belongs to the student rather than to the act, so it
    // loads once per login rather than on every act entry. equip()
    // applies its own effect the moment it runs, so nothing downstream
    // needs a second sync.
    //
    // Both calls are guarded. inventory.js is optional the same way
    // assessment.js is: without it the act flow is untouched and the
    // study still collects everything it needs.
    if (window.Inventory) {
      await Inventory.sync();
      await Inventory.grantForAct(this.current);
    }

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
      const stats = this.currentStats();
      const payload = {
        student_id: currentUserId,
        act_number: n,
        objectives_total: total,
        objectives_done: done,
        performance_score: this.scoreFor(done, total, stats),
        damage_taken: stats.damageTaken,
        detections: stats.detections,
        elapsed_ms: Math.round(stats.playMs),
        updated_at: new Date().toISOString(),
      };

      const { error } = await sb
        .from("act_progress")
        .upsert(payload, { onConflict: "student_id,act_number" });

      if (error) {
        console.error("act_progress write failed:", error);
        return; // leave _lastDone alone so the next save retries
      }

      // AFTER the write returned without error, and before _lastDone
      // moves. A failed write returns above without touching _lastDone
      // so the next save retries the objective; paying out before that
      // point would pay for the retry as well.
      //
      // _lastDone of -1 means this session does not yet know what the
      // student had already finished, and therefore does not know what
      // has already been paid for. It pays nothing and records the
      // baseline instead.
      //
      // That guard is load bearing rather than defensive. saveProgress
      // calls this on its own cadence, and the debounced save fires
      // between saveReady and syncStart on every login. Without it, a
      // student resuming an act four objectives in is paid forty barya
      // for those four objectives again, every single time they log in.
      // The harness caught exactly that.
      //
      // Nothing is lost on the enterAct path, where _lastDone is also
      // -1: a freshly entered act has no objectives done, so there is
      // nothing owed at that moment anyway.
      if (this._lastDone >= 0) {
        this.award(this.perObjective(total) * (done - this._lastDone), true);
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

      // AFTER the completion write, deliberately. A student who
      // closes the tab on an optional form has already had their act
      // recorded and their post-test graded. The other ordering loses
      // a completed act to a form the student was free to skip, which
      // is indefensible in a study where each student gets one
      // attempt.
      //
      // Guarded the same way the tests are, so an assessment.js
      // without it, or none at all, collapses the flow to complete
      // then transition exactly as before.
      if (window.Assessment && Assessment.runFeedback) {
        try {
          await Assessment.runFeedback(n);
        } catch (err) {
          // Never let an optional form stand between a student and
          // the transition screen they just earned.
          console.error("feedback flow failed:", err);
        }
      }

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

    const stats = this.currentStats();

    const { error } = await sb.from("act_progress").upsert(
      {
        student_id: currentUserId,
        act_number: n,
        status: "completed",
        objectives_total: total,
        objectives_done: done,
        performance_score: this.scoreFor(done, total, stats),
        damage_taken: stats.damageTaken,
        detections: stats.detections,
        elapsed_ms: Math.round(stats.playMs),
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

    // Whatever the act owes beyond what the objectives already paid.
    // Floored at zero: a student who took enough damage to zero both
    // the survival and stealth terms has already been paid the whole
    // score by the drip, and an act must never claw currency back.
    //
    // Held for the transition screen rather than toasted, because the
    // completion write is followed by the post-test and the feedback
    // form, and a toast fired now would be gone before the student
    // looks at the world again.
    const dripped = this.perObjective(total) * done;
    this._lastAward = this.award(
      Math.max(0, this.scoreFor(done, total, stats) - dripped),
      false
    );

    await this.endSession();

    console.log(
      `Act ${n} completed: ${done}/${total} objectives, ` +
        `score ${this.scoreFor(done, total, stats)}, ` +
        `${stats.damageTaken} damage, ${stats.detections} detections`
    );
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

    // Close the outgoing act's session before the counters that
    // belong to it are thrown away.
    await this.endSession();

    // Counters are per act. Reset before the world is built, so
    // nothing that happens during loadAct can be charged to the
    // student.
    if (window.Game && Game.resetStats) Game.resetStats();

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

    await this.startSession(n);

    // Whatever this act's content says it hands over. A no-op after the
    // first entry, and the unique constraint on (student_id, item_id) is
    // the real guarantee behind that rather than the memory check.
    if (window.Inventory) await Inventory.grantForAct(n);

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

    // Read once and cleared, so a transition shown twice does not claim
    // the award twice.
    const award = this._lastAward || 0;
    this._lastAward = 0;

    const earned = award ? `Nakakuha ka ng ${award} barya. ` : "";

    if (!nextAct) {
      await this._screen({
        eyebrow: `Natapos: ${ACT_ORDINALS[fromAct] || "Yugto " + fromAct}`,
        title: "Wakas",
        body:
          earned +
          "Natapos mo ang buong kuwento. Maraming salamat sa paglalaro.",
        button: "",
      });
      return;
    }

    await this._screen({
      eyebrow: `Natapos: ${ACT_ORDINALS[fromAct] || "Yugto " + fromAct}`,
      title: "Magaling!",
      body: `${earned}Susunod: ${nextAct.titleTagalog || nextAct.title}`,
      button: `Magpatuloy sa ${ACT_ORDINALS[next] || "Yugto " + next}`,
    });

    await this.enterAct(next);
  },
};

window.Acts = Acts;
