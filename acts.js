// =============================================================
// MACARIO — acts.js (Block 2.3)
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
//   locked -> playing -> completed
//
// The schema also allows trivia, pretest, and posttest. Those are
// deliberately unused here; Block 3 inserts them either side of
// playing. Adding them now would mean writing states nothing can
// currently exit.
//
// WRITE POLICY
// checkObjectives() is invoked from saveProgress() in game.js
// rather than after each individual flag change. saveProgress is
// already debounced at 800ms and backstopped by a 10 second
// interval, so this piggybacks on existing write batching instead
// of introducing a second, competing one. The function early
// returns when the objective count has not moved, so the common
// case costs nothing.
// =============================================================

const Acts = {
  // Act data files register themselves here. Blocks 2.4 adds 2, 3, 4.
  registry: {
    1: window.ACT_1,
  },

  current: 1,
  status: "playing",

  // Caches the last objectives_done value written, so an unchanged
  // count does not produce a redundant round trip on every save.
  _lastDone: -1,

  // Prevents overlapping writes if a save fires while one is still
  // in flight. Last write wins is fine here, but concurrent upserts
  // to the same primary key are not worth the risk.
  _writing: false,

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
  // Lifecycle
  // -----------------------------------------------------------

  // Called once after login and after the save has been restored.
  // Ensures an act_progress row exists and reflects reality, then
  // performs a catch-up count from the flags that were just loaded.
  async syncStart() {
    if (!currentUserId) return;

    const n = this.current;
    const total = this.objectivesFor(n).length;

    const { data: existing, error } = await sb
      .from("act_progress")
      .select("status, objectives_done")
      .eq("student_id", currentUserId)
      .eq("act_number", n)
      .maybeSingle();

    if (error) {
      console.error("act_progress read failed:", error);
      return;
    }

    if (!existing) {
      const { error: insertError } = await sb.from("act_progress").insert({
        student_id: currentUserId,
        act_number: n,
        status: "playing",
        objectives_total: total,
        objectives_done: 0,
        performance_score: 0,
        started_at: new Date().toISOString(),
      });
      if (insertError) console.error("act_progress insert failed:", insertError);
      this.status = "playing";
    } else if (existing.status === "completed") {
      // Never downgrade a finished act. A student reopening a
      // completed act should not reset their own record.
      this.status = "completed";
      this._lastDone = existing.objectives_done;
    } else {
      this.status = "playing";
      this._lastDone = existing.objectives_done;
    }

    await this.checkObjectives();
  },

  // Recounts objectives from state.flags and writes only if the
  // count moved. Auto-completes the act when everything is done.
  async checkObjectives() {
    if (!currentUserId) return;
    if (this._writing) return;

    const n = this.current;
    const objectives = this.objectivesFor(n);
    const total = objectives.length;
    if (!total) return;

    const done = this.countDone(n);
    if (done === this._lastDone) return; // nothing changed

    this._writing = true;
    try {
      const finished = done >= total;

      const payload = {
        student_id: currentUserId,
        act_number: n,
        objectives_total: total,
        objectives_done: done,
        performance_score: this.scoreFor(done, total),
        updated_at: new Date().toISOString(),
      };

      // Only move to completed. Never move back out of it.
      if (finished && this.status !== "completed") {
        payload.status = "completed";
        payload.completed_at = new Date().toISOString();
      } else if (this.status !== "completed") {
        payload.status = "playing";
      }

      const { error } = await sb
        .from("act_progress")
        .upsert(payload, { onConflict: "student_id,act_number" });

      if (error) {
        console.error("act_progress write failed:", error);
        return; // leave _lastDone alone so the next save retries
      }

      this._lastDone = done;

      if (finished && this.status !== "completed") {
        this.status = "completed";
        console.log(
          `Act ${n} completed: ${done}/${total} objectives, score ${payload.performance_score}`
        );
      }
    } finally {
      this._writing = false;
    }
  },

  // Explicit completion, for acts that end on an event rather than
  // on the objective count reaching its total. Unused in Act I,
  // where the Katipunero conversation is the fourth objective, but
  // Acts II through IV may end on a cutscene instead.
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
  },
};

window.Acts = Acts;
