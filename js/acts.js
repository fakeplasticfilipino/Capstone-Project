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
  // They were set a little above what a careful first run of the old
  // Act I outpost cost (before Block 52), so both terms discriminate
  // without bottoming out; today's Act I (the fights and the guarded
  // pamphlet run) costs about the same.
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
  // the shop reachable inside one class period. (Act I itself turns the
  // drip off, objectiveCurrency: false, since Block 52: it counts barya
  // as a story goal, and pays the whole award on completion.)
  //
  // NOTHING NEW IS STORED to make this idempotent. The amount already
  // dripped is the per-objective rate times objectives_done, and
  // objectives_done is already in act_progress, so a student who
  // reloads cannot be paid twice for the same objective.
  // -----------------------------------------------------------

  COMPLETION_POOL: 50, // matches the completion weight in scoreFor

  // Block 52. An act may declare objectiveCurrency: false to switch the
  // drip off. Act I counts barya as a story goal (Mag-ipon ng pera,
  // countCurrency), and barya paid for finishing a step would move that
  // count without the story having paid him anything. Nothing is lost:
  // complete() pays the whole score at the end, since what was dripped
  // is then zero.
  perObjective(total) {
    if (!total) return 0;
    const act = this.getAct(this.current);
    if (act && act.objectiveCurrency === false) return 0;
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

  // The teacher's Talaan papers for an act (Block 70), handed to the
  // engine, which lays them at the act's fixed places. Not awaited by
  // its callers: the papers arrive when they arrive, and the engine lays
  // them the moment they do. A failed read leaves the act without
  // papers, which is what an act the teacher has not written for looks
  // like anyway.
  async loadTalaan(n) {
    if (!window.Game || !Game.setHintPool || typeof sb === "undefined") return;
    try {
      const { data, error } = await sb
        .from("talaan_entries")
        .select("slot, title, body")
        .eq("act_number", n);
      if (error) throw error;
      Game.setHintPool(n, (data || []).map((r) => ({ slot: r.slot, title: r.title, text: r.body })));
    } catch (err) {
      console.error("talaan_entries read failed:", err);
    }
  },

  // Called once after login, after loadProgressMap() and after the
  // save has been restored. Ensures a row exists for the act the
  // student is actually in, then resumes whatever state that row
  // was left in.
  async syncStart(actNumber) {
    if (!currentUserId) return;

    this.current = this.resolveAct(actNumber);
    this.loadTalaan(this.current);
    // A score sat offline and kept on the phone is sent now (Scan S3).
    if (window.Assessment && Assessment.flushPending) Assessment.flushPending();
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

      // Block 68. The barya held as play begins, so a replay can put
      // the purse back where the act found it. Kept under a "__" flag,
      // which a replay does not clear.
      const startKey = "__startCurrency_" + n;
      if (typeof state.flags[startKey] !== "number" && window.Game) {
        state.flags[startKey] = Game.currency();
        markDirty();
      }

      await this.setStatus("playing");
      await this.checkObjectives();
    } finally {
      this._flowRunning = false;
    }
  },

  // Scan S4. A guest writes nothing, so checkObjectives and finishAct
  // never run for one, and a guest who finished Act I was left in the
  // pulungan with "Wala nang gawain." Called from markDirty (game.js)
  // for a guest only: once every objective of the act on screen is done,
  // it shows the act's end, without a test or the next act, and the
  // button goes back to the title screen.
  guestCheck() {
    if (currentUserId || this._guestEnded) return;
    if (!(window.Game && Game.isGuest && Game.isGuest())) return;
    const act = (typeof currentActData !== "undefined" && currentActData) || null;
    const n = act && act.number;
    if (!n || act.holdOpen) return;
    const total = this.objectivesFor(n).length;
    if (!total || this.countDone(n) < total) return;
    this._guestEnded = true;
    // After the act's own last card has faded, not over it.
    setTimeout(() => {
      this._screen({
        eyebrow: `Natapos: ${ACT_ORDINALS[n] || "Yugto " + n}`,
        title: "Wakas",
        body: "Natapos mo ang yugtong ito bilang bisita. Hindi naitatala ang laro ng bisita, " +
          "kaya walang pagsusulit. Mag-log in para maitala ang iyong paglalaro.",
        button: "Bumalik sa simula",
      }).then(() => location.reload());
    }, 1500);
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
    // Block 56. An act may declare holdOpen while its story is still being
    // written: every objective can be done without the act finishing or
    // the post-test opening. Honest where the old trick (an objective whose
    // flag nothing sets) put a task on screen nobody could do.
    const held = Boolean((this.getAct(n) || {}).holdOpen);
    if (done >= total && this.status === "playing" && !held) {
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
        // Block 68. A post-test below the pass mark offers a replay.
        // retake is true only after a replay (its flag survives a
        // reload), so reloading on the result cannot buy another try.
        const retakeKey = "__retakePost_" + n;
        const result = await Assessment.runTest(n, "post", { retake: Boolean(state.flags[retakeKey]) });
        if (result && result.passed === false && Assessment.askReplay) {
          const replay = await Assessment.askReplay(n, result);
          if (replay) {
            this._flowRunning = false;
            await this.replayAct(n);
            return;
          }
        }
        if (state.flags[retakeKey]) {
          delete state.flags[retakeKey];
          markDirty();
        }
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

  // Block 68. Plays the act again from the start after a failed
  // post-test, at the instructor's direction. The story's flags are
  // cleared, except what was earned to keep: glossary entries
  // (salita_), hints found (pahiwatig_), the engine's own "__" flags,
  // and any the act names in keepFlagsOnReplay (a best score). The
  // barya go back to what they were when the act's play began, the
  // counters restart, and act_progress goes back to playing: the one
  // place the client moves that row backwards, and only from a
  // failed post-test. The pre-test is not sat again; the post-test is,
  // as a new attempt.
  async replayAct(n) {
    const act = this.getAct(n);
    if (!act) return;
    const keepNamed = new Set(act.keepFlagsOnReplay || []);
    const kept = {};
    Object.keys(state.flags).forEach((k) => {
      if (/^(salita_|pahiwatig_|__)/.test(k) || keepNamed.has(k)) kept[k] = state.flags[k];
    });
    Object.keys(state.flags).forEach((k) => delete state.flags[k]);
    Object.assign(state.flags, kept);
    state.flags["__retakePost_" + n] = true;

    if (window.Game) {
      const start = state.flags["__startCurrency_" + n];
      const target = typeof start === "number" ? start : 0;
      const now = Game.currency();
      if (now > target) Game.spendCurrency(now - target);
      else if (now < target) Game.addCurrency(target - now);
      if (Game.resetStats) Game.resetStats();
    }

    // Scan S7. What the story handed over is given again by the story.
    if (window.Inventory && Inventory.revoke) {
      const back = Inventory.catalogue().filter((it) => it.replayRemoves);
      for (const it of back) await Inventory.revoke(it.id);
    }

    this.current = n;
    this.status = "playing";
    this._lastDone = 0;
    if (this.progress[n]) {
      this.progress[n].status = "playing";
      this.progress[n].objectives_done = 0;
    }
    if (currentUserId) {
      const { error } = await sb
        .from("act_progress")
        .update({ status: "playing", objectives_done: 0, updated_at: new Date().toISOString() })
        .eq("student_id", currentUserId)
        .eq("act_number", n);
      if (error) console.error("act_progress replay write failed:", error);
    }

    clearQuests();
    loadAct(act);
    markDirty();
    await saveProgress();

    await this.showActTitle(n);
    enterWorldScripts();
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
    this.loadTalaan(n);

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
  // unchanged, only the location moves. Content calls this from an
  // NPC's onComplete when a conversation should change the location.
  //
  // Fades to black rather than swapping instantly (fadeToScene, in
  // game.js, reusing the same #blackout element and timings the stage
  // cutscene already uses). Awaited, so the save that follows writes
  // the NEW scene's id, not the one the player is fading out of.
  //
  // placement, optional, is { x, facing } in the new scene (Block 34),
  // for a doorway that should land at the matching door rather than at
  // the scene's startX.
  async gotoScene(sceneId, placement) {
    await fadeToScene(sceneId, placement);
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

      // The label span, not the button: the button holds an icon.
      setLabel(btn, opts.button || "Magpatuloy");
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
