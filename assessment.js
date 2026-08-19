// =============================================================
// MACARIO — assessment.js (Block 3)
//
// The trivia card, the pre-test, and the post-test.
//
// LOAD ORDER: after acts.js in index.html. acts.js sequences the
// act lifecycle and owns every act_progress write; this file owns
// the interface and the two RPC calls, and reports back by
// resolving a promise. It never writes act_progress itself.
//
// This file is OPTIONAL by design. acts.js checks window.Assessment
// before calling anything here, so the game runs without it, with
// the act flow collapsing to playing then completed.
//
// SECURITY
// The answer key never reaches this file. get_assessment_items is a
// security definer function that returns id, item_order, question
// and choices, and omits correct_index. Grading happens inside
// submit_assessment. There is nothing in this file, or in anything
// it holds in memory, that a student could read from developer
// tools to find an answer. Do not "optimise" this by fetching the
// items table directly; RLS blocks it anyway.
//
// ONE ATTEMPT
// The database enforces one attempt per student per act per test
// type, through a unique constraint and an explicit check that
// raises ALREADY_SUBMITTED. That is not an error condition here.
// A student who reloads the page after submitting should move on,
// not be shown the test again and not be shown a failure.
// =============================================================

const Assessment = {
  // ---- Elements ----
  el: {},

  _cache() {
    if (this.el.box) return;
    this.el = {
      overlay: document.getElementById("quiz"),
      box: document.getElementById("quiz-box"),
      eyebrow: document.getElementById("quiz-eyebrow"),
      title: document.getElementById("quiz-title"),
      progress: document.getElementById("quiz-progress"),
      question: document.getElementById("quiz-question"),
      choices: document.getElementById("quiz-choices"),
      note: document.getElementById("quiz-note"),
      btn: document.getElementById("quiz-btn"),
      back: document.getElementById("quiz-back"),
    };
  },

  _open() {
    this._cache();
    setUiBlocked(true);
    this.el.overlay.classList.remove("hidden");
  },

  _close() {
    this._cache();
    this.el.overlay.classList.add("hidden");
    this.el.choices.innerHTML = "";
    this.el.note.textContent = "";
    this.el.note.className = "";
    this.el.back.classList.add("hidden");
    setUiBlocked(false);
  },

  // Replaces the button's click handler outright rather than adding
  // another one. This screen is rebuilt on every question, and a
  // stale listener would advance two questions per tap.
  _onButton(label, handler) {
    const btn = this.el.btn;
    const fresh = btn.cloneNode(true);
    fresh.textContent = label;
    // cloneNode carries the disabled state across. A message screen
    // shown straight after an unanswered question would otherwise
    // render a button that cannot be tapped, with nothing on screen
    // to explain why. Screens that want it disabled set it after.
    fresh.disabled = false;
    btn.replaceWith(fresh);
    this.el.btn = fresh;
    fresh.addEventListener("click", handler);
  },

  _onBack(handler) {
    const back = this.el.back;
    const fresh = back.cloneNode(true);
    back.replaceWith(fresh);
    this.el.back = fresh;
    if (handler) {
      fresh.classList.remove("hidden");
      fresh.addEventListener("click", handler);
    } else {
      fresh.classList.add("hidden");
    }
  },

  // A single message with one button. Used for the trivia card, the
  // score screen, and every failure path, so that no branch can end
  // without the student having something to tap.
  _message(opts) {
    return new Promise((resolve) => {
      this._cache();
      this.el.eyebrow.textContent = opts.eyebrow || "";
      this.el.title.textContent = opts.title || "";
      this.el.progress.textContent = "";
      this.el.question.textContent = opts.body || "";
      this.el.question.className = "centered";
      this.el.choices.innerHTML = "";
      this.el.note.textContent = opts.note || "";
      this.el.note.className = opts.noteIsError ? "error" : "";
      this._onBack(null);
      this._onButton(opts.button || "Magpatuloy", () => resolve());
      this._open();
    });
  },

  // -----------------------------------------------------------
  // Trivia
  //
  // The proposal specifies a historical trivia fact before each
  // pre-test. An act with no trivia row resolves immediately rather
  // than showing an empty card.
  // -----------------------------------------------------------
  async runTrivia(actNumber) {
    this._cache();
    let fact = null;

    try {
      const { data, error } = await sb
        .from("act_trivia")
        .select("fact")
        .eq("act_number", actNumber)
        .maybeSingle();
      if (error) throw error;
      fact = data && data.fact;
    } catch (err) {
      // A missing trivia card is not worth blocking an act over.
      console.error("act_trivia read failed:", err);
    }

    if (!fact) {
      this._close();
      return;
    }

    await this._message({
      eyebrow: "Alam mo ba?",
      title: "Kaalaman sa Kasaysayan",
      body: fact,
      button: "Magpatuloy",
    });
    this._close();
  },

  // -----------------------------------------------------------
  // Pre-test and post-test
  // -----------------------------------------------------------
  async runTest(actNumber, testType) {
    // Every public entry point caches its own elements. runTest used
    // to rely on runTrivia having run first, which held on a fresh
    // act and broke on resume: a student who reloaded during the
    // pre-test skipped the trivia card, so nothing had populated the
    // cache and the first render threw on an undefined element.
    this._cache();

    const label =
      testType === "pre" ? "Panimulang Pagsusulit" : "Panapos na Pagsusulit";

    // Check for an existing attempt BEFORE showing any questions.
    //
    // submit_assessment raises ALREADY_SUBMITTED and that is still
    // the real guarantee, but discovering it at submit time means the
    // student has already answered all five questions for nothing.
    // A stale tab or a status left mid-write is enough to land here,
    // and re-sitting a test that cannot be recorded is the kind of
    // thing that gets reported as the app losing their answers.
    const existing = await this._existingScore(actNumber, testType);
    if (existing) {
      await this._message({
        eyebrow: label,
        title: "Naipasa na",
        body:
          "Naipasa mo na ang pagsusulit na ito. Isang beses lang ito maaaring sagutan.",
        note: "Iskor mo: " + existing.score + " ng " + existing.max_score + ".",
        button: "Magpatuloy",
      });
      this._close();
      return;
    }

    const items = await this._fetchItems(actNumber, testType, label);

    // _fetchItems returns null when there is nothing to sit, having
    // already told the student why.
    if (!items) {
      this._close();
      return;
    }

    const answers = await this._askAll(items, label);
    await this._submit(actNumber, testType, answers, label);
    this._close();
  },

  // Returns the student's own recorded score for this test, or null.
  // Students have a select policy on their own rows; this reads no
  // one else's data and cannot, because RLS scopes it to auth.uid().
  //
  // A failure here is deliberately not surfaced. The worst case is
  // that the student sits a test that then reports ALREADY_SUBMITTED,
  // which is the behaviour this exists to improve on, not to replace.
  async _existingScore(actNumber, testType) {
    if (!currentUserId) return null;

    try {
      const { data, error } = await sb
        .from("assessment_scores")
        .select("score, max_score")
        .eq("student_id", currentUserId)
        .eq("act_number", actNumber)
        .eq("test_type", testType)
        .maybeSingle();
      if (error) throw error;
      return data || null;
    } catch (err) {
      console.error("assessment_scores read failed:", err);
      return null;
    }
  },

  async _fetchItems(actNumber, testType, label) {
    for (;;) {
      let data = null;
      let failed = false;

      try {
        const res = await sb.rpc("get_assessment_items", {
          p_act_number: actNumber,
          p_test_type: testType,
        });
        if (res.error) throw res.error;
        data = res.data;
      } catch (err) {
        console.error("get_assessment_items failed:", err);
        failed = true;
      }

      if (failed) {
        // Offer a retry rather than stranding the student. Anything
        // that ends the flow here has to be a deliberate choice.
        let retry = false;
        await this._message({
          eyebrow: label,
          title: "Walang koneksyon",
          body: "Hindi makuha ang mga tanong. Suriin ang iyong koneksyon.",
          button: "Subukan Ulit",
        }).then(() => (retry = true));
        if (retry) continue;
      }

      if (!data || !data.length) {
        // Acts II to IV have no seeded items yet. Skipping is the
        // right call: an act should not be unreachable because a
        // test that does not exist cannot be taken.
        await this._message({
          eyebrow: label,
          title: "Walang pagsusulit",
          body: "Wala pang tanong na nakahanda para sa yugtong ito.",
          button: "Magpatuloy",
        });
        return null;
      }

      return data;
    }
  },

  // One question per screen. The target device is a low-end phone,
  // and five items on one scrolling page tests thumb stamina rather
  // than knowledge. Back is offered so an answer can be revised,
  // which matters when the same instrument is being used to claim a
  // learning gain.
  _askAll(items, label) {
    return new Promise((resolve) => {
      const answers = {};
      let index = 0;

      const render = () => {
        const item = items[index];
        const isLast = index === items.length - 1;

        this.el.eyebrow.textContent = label;
        this.el.title.textContent = "";
        this.el.progress.textContent =
          "Tanong " + (index + 1) + " ng " + items.length;
        this.el.question.textContent = item.question;
        this.el.question.className = "";
        this.el.note.textContent = "";
        this.el.note.className = "";

        this.el.choices.innerHTML = "";
        const choices = Array.isArray(item.choices) ? item.choices : [];
        choices.forEach((choice, i) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "quiz-choice";
          if (answers[item.id] === i) btn.classList.add("selected");
          btn.textContent = choice;
          btn.addEventListener("click", () => {
            answers[item.id] = i;
            render(); // repaint so the selection is visible
          });
          this.el.choices.appendChild(btn);
        });

        const answered = answers[item.id] !== undefined;

        this._onButton(isLast ? "Ipasa ang sagot" : "Susunod", () => {
          if (answers[item.id] === undefined) return;
          if (isLast) {
            resolve(answers);
          } else {
            index++;
            render();
          }
        });
        this.el.btn.disabled = !answered;

        this._onBack(
          index > 0
            ? () => {
                index--;
                render();
              }
            : null
        );

        this._open();
        this.el.box.scrollTop = 0;
      };

      render();
    });
  },

  async _submit(actNumber, testType, answers, label) {
    for (;;) {
      let result = null;
      let message = "";

      try {
        const res = await sb.rpc("submit_assessment", {
          p_act_number: actNumber,
          p_test_type: testType,
          p_answers: answers,
        });
        if (res.error) throw res.error;
        result = res.data;
      } catch (err) {
        message = (err && err.message) || "";
        console.error("submit_assessment failed:", err);
      }

      if (result) {
        await this._message({
          eyebrow: label,
          title: "Tapos na",
          body: "Iskor mo: " + result.score + " ng " + result.max_score + ".",
          note:
            testType === "pre"
              ? "Simulan na natin ang yugto."
              : "Ang iskor na ito ay maihahambing sa panimulang pagsusulit.",
          button: "Magpatuloy",
        });
        return;
      }

      // Expected, not a fault: the student submitted this test in an
      // earlier session and then reloaded. Acknowledge and move on.
      if (/ALREADY_SUBMITTED/i.test(message)) {
        await this._message({
          eyebrow: label,
          title: "Naipasa na",
          body: "Naipasa mo na ang pagsusulit na ito. Isang beses lang ito maaaring sagutan.",
          button: "Magpatuloy",
        });
        return;
      }

      if (/NO_ITEMS_CONFIGURED/i.test(message)) {
        await this._message({
          eyebrow: label,
          title: "Walang pagsusulit",
          body: "Wala pang tanong na nakahanda para sa yugtong ito.",
          button: "Magpatuloy",
        });
        return;
      }

      // Anything else is probably the network. The answers are still
      // in memory, so retrying costs the student nothing.
      let retry = false;
      await this._message({
        eyebrow: label,
        title: "Hindi naipasa",
        body: "Hindi maipasa ang iyong sagot. Suriin ang koneksyon at subukan ulit.",
        note: "Nakatago pa ang mga sagot mo.",
        noteIsError: true,
        button: "Subukan Ulit",
      }).then(() => (retry = true));
      if (!retry) return;
    }
  },
};

// =============================================================
// FEEDBACK
//
// Optional and skippable. A required form after a post-test is
// answered by a student who wants to leave, which is worse than no
// data at all.
//
// Skipping writes NO ROW. Absence is the skip; there is no
// "declined" sentinel for a later reader to misinterpret.
//
// acts.js calls this AFTER the completion write, so a student who
// closes the tab here has already had their act recorded and their
// post-test graded.
//
// This resolves either way and never rejects. The caller does not
// care which happened, and must not be given a reason to.
// =============================================================

Assessment.FEEDBACK_MAX = 300;

Assessment.runFeedback = async function (actNumber) {
  this._cache();
  if (!currentUserId) return;

  // Checked before anything is rendered, for the reason already in
  // the pitfalls: the unique constraint is the real guarantee, but
  // discovering the clash at submit time means the student filled
  // the form for nothing.
  try {
    const { data, error } = await sb
      .from("feedback")
      .select("id")
      .eq("student_id", currentUserId)
      .eq("act_number", actNumber)
      .maybeSingle();
    if (!error && data) return; // already given
  } catch (err) {
    // A failed check is not a reason to block the transition
    // screen. Worst case the insert below hits the constraint and
    // is swallowed too.
    console.error("feedback check failed:", err);
  }

  const answer = await this._askFeedback();
  if (!answer) return; // skipped

  try {
    const { error } = await sb.from("feedback").insert({
      student_id: currentUserId,
      act_number: actNumber,
      rating: answer.rating,
      comment: answer.comment || null,
    });
    if (error) console.error("feedback insert failed:", error);
  } catch (err) {
    console.error("feedback insert threw:", err);
  }

  // Deliberately no confirmation screen on failure. A student
  // cannot act on "your feedback did not send", and the transition
  // screen is the reward for finishing the act.
};

// Resolves with { rating, comment } on submit, or null on skip.
Assessment._askFeedback = function () {
  return new Promise((resolve) => {
    this._cache();

    let rating = 0;
    let comment = "";

    const render = () => {
      this.el.eyebrow.textContent = "Opsyonal";
      this.el.title.textContent = "Ano ang masasabi mo?";
      this.el.progress.textContent = "";
      this.el.question.textContent =
        "Gaano mo kagusto ang bahaging ito ng laro?";
      this.el.question.className = "centered";

      this.el.choices.innerHTML = "";

      // Five point scale, rendered as its own row so it does not
      // read as a multiple choice question.
      const scale = document.createElement("div");
      scale.className = "feedback-scale";
      for (let i = 1; i <= 5; i++) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "feedback-star" + (i <= rating ? " on" : "");
        btn.textContent = String(i);
        btn.setAttribute("aria-label", i + " sa 5");
        btn.addEventListener("click", () => {
          rating = i;
          render();
        });
        scale.appendChild(btn);
      }
      this.el.choices.appendChild(scale);

      const legend = document.createElement("div");
      legend.className = "feedback-legend";
      legend.innerHTML =
        "<span>Hindi masyado</span><span>Sobrang gusto</span>";
      this.el.choices.appendChild(legend);

      const box = document.createElement("textarea");
      box.className = "feedback-comment";
      box.rows = 3;
      box.maxLength = Assessment.FEEDBACK_MAX;
      box.placeholder = "May gusto ka bang idagdag? (opsyonal)";
      box.value = comment;
      this.el.choices.appendChild(box);

      const counter = document.createElement("div");
      counter.className = "feedback-counter";
      const paint = () => {
        counter.textContent =
          comment.length + " / " + Assessment.FEEDBACK_MAX;
      };
      paint();
      // Repainting the counter only, rather than calling render(),
      // because a full repaint on every keystroke would replace the
      // textarea and throw away the caret position.
      box.addEventListener("input", () => {
        comment = box.value.slice(0, Assessment.FEEDBACK_MAX);
        paint();
      });
      this.el.choices.appendChild(counter);

      this.el.note.textContent = "";
      this.el.note.className = "";

      this._onButton("Ipasa", () => {
        if (!rating) return;
        resolve({ rating, comment: comment.trim() });
      });
      this.el.btn.disabled = !rating;

      // Skip is offered as an equal, not as a way out styled to be
      // avoided. A skip button made deliberately unattractive is a
      // dark pattern, and this is a research instrument.
      this._onBack(() => resolve(null));
      this.el.back.textContent = "Laktawan";
      this.el.back.classList.add("feedback-skip");
    };

    render();
    this._open();
  }).then((result) => {
    this._close();
    return result;
  });
};

window.Assessment = Assessment;
