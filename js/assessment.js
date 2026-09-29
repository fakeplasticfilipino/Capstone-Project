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
// THE QUESTIONS ARE IN THE GAME (Block 68)
// At the instructor's direction the answer key is no longer a secret.
// The questions and their answers are read whole, from the
// assessment_items table when the teacher has put questions there
// (teacher.html, Mga Tanong) and from content/questions.js when it has
// none or cannot be reached, and this file grades the test itself and
// writes the score. Before Block 68 the key never left the database
// (get_assessment_items and submit_assessment, schema v2); both
// functions are still there and unused.
//
// ATTEMPTS
// The pre-test is sat once: a student who reloads after it moves on.
// The post-test has a pass mark (QUESTIONS[n].passing, 75% unless the
// content says otherwise). A student below it is offered a replay of
// the act and another try (acts.js, finishAct); every try is its own
// row in assessment_scores, numbered by attempt, which needs schema
// 006. Without 006 the first try of each test is still recorded as
// before and a second is reported, not lost silently.
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
  // icon is a symbol id from the sprite in index.html. cloneNode
  // carries the <use> across, so only its href moves; writing
  // textContent here would have thrown the whole icon away, which is
  // what it did before the label got its own span.
  _onButton(label, handler, icon) {
    const btn = this.el.btn;
    const fresh = btn.cloneNode(true);
    setLabel(fresh, label);
    setIcon(fresh, icon || "i-check");
    // cloneNode carries the disabled state across. A message screen
    // shown straight after an unanswered question would otherwise
    // render a button that cannot be tapped, with nothing on screen
    // to explain why. Screens that want it disabled set it after.
    fresh.disabled = false;
    btn.replaceWith(fresh);
    this.el.btn = fresh;
    fresh.addEventListener("click", handler);
  },

  _onBack(handler, icon) {
    const back = this.el.back;
    const fresh = back.cloneNode(true);
    setIcon(fresh, icon || "i-back");
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

    // Block 68. The built-in card when the database has none.
    if (!fact) fact = this._bank(actNumber).trivia || null;

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
  //
  // Resolves with { score, max, passed, attempt } for the try that
  // counts (the one just sat, or an earlier one when there is nothing
  // to sit), or null when the act has no questions. opts.retake lets a
  // post-test be sat again after a failed one; acts.js sets it only
  // after a replay of the act, so a reload cannot buy a free retry.
  // -----------------------------------------------------------
  DEFAULT_PASSING: 0.75,

  _bank(actNumber) {
    return (window.QUESTIONS && window.QUESTIONS[actNumber]) || {};
  },

  passingFor(actNumber) {
    const p = Number(this._bank(actNumber).passing);
    return p > 0 && p <= 1 ? p : this.DEFAULT_PASSING;
  },

  _result(actNumber, testType, row) {
    const score = Number(row.score);
    const max = Number(row.max_score);
    return {
      score, max, attempt: Number(row.attempt) || 1,
      passed: testType !== "post" || (max > 0 && score / max >= this.passingFor(actNumber)),
    };
  },

  async runTest(actNumber, testType, opts) {
    // Every public entry point caches its own elements. runTest used
    // to rely on runTrivia having run first, which held on a fresh
    // act and broke on resume: a student who reloaded during the
    // pre-test skipped the trivia card, so nothing had populated the
    // cache and the first render threw on an undefined element.
    this._cache();
    opts = opts || {};

    const label =
      testType === "pre" ? "Panimulang Pagsusulit" : "Panapos na Pagsusulit";

    // Earlier tries, checked BEFORE any question is shown, so nobody
    // answers ten questions that cannot be recorded.
    const tries = await this._existingScores(actNumber, testType);
    const last = tries.length ? tries[tries.length - 1] : null;

    if (last) {
      const earlier = this._result(actNumber, testType, last);
      // A passed test, or a pre-test at all, is done. A failed
      // post-test is sat again only when acts.js says the act was
      // replayed; otherwise it goes back to acts.js to offer the replay.
      if (earlier.passed || testType === "pre") {
        await this._message({
          eyebrow: label,
          title: "Naipasa na",
          body: testType === "pre"
            ? "Nasagutan mo na ang pagsusulit na ito. Isang beses lang ito maaaring sagutan."
            : "Nasagutan mo na ang pagsusulit na ito.",
          note: "Iskor mo: " + earlier.score + " ng " + earlier.max + ".",
          button: "Magpatuloy",
        });
        this._close();
        return earlier;
      }
      if (!opts.retake) {
        this._close();
        return earlier;
      }
    }

    const items = await this._loadItems(actNumber, testType, label);

    // _loadItems returns null when there is nothing to sit, having
    // already told the student why.
    if (!items) {
      this._close();
      return null;
    }

    // Block 85. A breath before the post-test: it used to open straight
    // over the act's last black card. One calm card, and the questions
    // wait for the student's tap. Not before the pre-test, which already
    // follows the trivia card.
    if (testType === "post") {
      await this._message({
        eyebrow: label,
        title: "Handa ka na ba?",
        body: "Tapos na ang yugtong ito. May " + items.length + " tanong tungkol sa iyong nilaro. " +
          "Huminga muna, at sagutin nang tapat.",
        button: "Handa na ako",
      });
    }

    const answers = await this._askAll(items, label);
    const result = await this._submit(actNumber, testType, items, answers, label, tries.length + 1);
    this._close();
    return result;
  },

  // The student's own tries at this test, oldest first. Students have
  // a select policy on their own rows, scoped by RLS to auth.uid().
  //
  // A failure here is deliberately not surfaced. The worst case is a
  // try that is then refused when written, which _submit reports.
  async _existingScores(actNumber, testType) {
    if (!currentUserId) return [];

    try {
      const { data, error } = await sb
        .from("assessment_scores")
        .select("*")
        .eq("student_id", currentUserId)
        .eq("act_number", actNumber)
        .eq("test_type", testType);
      if (error) throw error;
      return (data || []).slice().sort((a, b) => (Number(a.attempt) || 1) - (Number(b.attempt) || 1));
    } catch (err) {
      console.error("assessment_scores read failed:", err);
      return [];
    }
  },

  // The questions, with their answers: the teacher's, from the
  // database, when there are any; else the built-in bank. A failed
  // read falls back to the bank too, so a bad connection never stands
  // between a student and a test (Block 68).
  async _loadItems(actNumber, testType, label) {
    let rows = null;
    try {
      const res = await sb
        .from("assessment_items")
        .select("id, item_order, question, choices, correct_index")
        .eq("act_number", actNumber)
        .eq("test_type", testType)
        .order("item_order");
      if (res.error) throw res.error;
      rows = res.data;
    } catch (err) {
      console.error("assessment_items read failed, using the built-in questions:", err);
    }

    let items = (rows || [])
      .filter((r) => r && r.question && Array.isArray(r.choices) && r.choices.length)
      .sort((a, b) => Number(a.item_order) - Number(b.item_order))
      .map((r) => ({ id: String(r.id), question: r.question, choices: r.choices,
                     correct: Number(r.correct_index) }));

    if (!items.length) {
      items = (this._bank(actNumber)[testType] || []).map((q, i) => ({
        id: "q" + (i + 1), question: q.question, choices: q.choices, correct: Number(q.correct),
      }));
    }

    if (!items.length) {
      // Acts II to IV have no questions yet. Skipping is the right
      // call: an act should not be unreachable because a test that
      // does not exist cannot be taken.
      await this._message({
        eyebrow: label,
        title: "Walang pagsusulit",
        body: "Wala pang tanong na nakahanda para sa yugtong ito.",
        button: "Magpatuloy",
      });
      return null;
    }
    return items;
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

          // A lettered badge rather than a pictogram. There is no
          // icon for an arbitrary sentence, and four identical marks
          // would be decoration; A B C D is what the student is
          // being asked to choose between, and it gives the teacher
          // something to say out loud.
          const badge = document.createElement("span");
          badge.className = "qbadge";
          badge.textContent = "ABCDEFGH".charAt(i) || String(i + 1);
          btn.appendChild(badge);

          const text = document.createElement("span");
          text.className = "lbl";
          text.textContent = choice;
          btn.appendChild(text);

          btn.addEventListener("click", () => {
            answers[item.id] = i;
            render(); // repaint so the selection is visible
          });
          this.el.choices.appendChild(btn);
        });

        const answered = answers[item.id] !== undefined;

        // A tick on the last question and an arrow on the others, so
        // the button says whether one more screen is coming without
        // the student reading the label.
        this._onButton(
          isLast ? "Ipasa ang sagot" : "Susunod",
          () => {
            if (answers[item.id] === undefined) return;
            if (isLast) {
              resolve(answers);
            } else {
              index++;
              render();
            }
          },
          isLast ? "i-check" : "i-right"
        );
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

  // Grades the answers against the key the items carry, writes the
  // try, and shows the score. attempt 1 is written without the column,
  // so a database that has not run schema 006 records a first try
  // exactly as before.
  async _submit(actNumber, testType, items, answers, label, attempt) {
    const max = items.length;
    const score = items.filter((it) => answers[it.id] === it.correct).length;
    const row = {
      student_id: currentUserId,
      act_number: actNumber,
      test_type: testType,
      score,
      max_score: max,
    };
    if (attempt > 1) row.attempt = attempt;
    const result = this._result(actNumber, testType, Object.assign({ attempt }, row));

    for (;;) {
      let message = "";
      let saved = false;
      try {
        const { error } = await sb.from("assessment_scores").insert(row);
        if (error) throw error;
        saved = true;
      } catch (err) {
        message = ((err && (err.message || err.code)) || "") + "";
        console.error("assessment_scores insert failed:", err);
      }

      // A second try refused by a database still holding the old
      // one-attempt rule (schema 006 not run), or a try already written
      // from another tab. The score is shown; it is not stored again.
      const refused = !saved && /duplicate|unique|23505|attempt/i.test(message);

      if (saved || refused) {
        const pct = this.passingFor(actNumber);
        let note;
        if (testType === "pre") {
          note = "Simulan na natin ang yugto.";
        } else if (result.passed) {
          note = "Pumasa ka! Ang iskor na ito ay maihahambing sa panimulang pagsusulit.";
        } else {
          note = "Kailangan ng " + Math.ceil(pct * max) + " na tamang sagot para pumasa.";
        }
        if (refused) note += " (Hindi na naitala ang subok na ito.)";
        await this._message({
          eyebrow: label + (attempt > 1 ? " · Subok " + attempt : ""),
          title: testType === "pre" ? "Tapos na" : result.passed ? "Pumasa!" : "Hindi pumasa",
          body: "Iskor mo: " + score + " ng " + max + ".",
          note,
          noteIsError: testType === "post" && !result.passed,
          button: "Magpatuloy",
        });
        return result;
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
      if (!retry) return result;
    }
  },

  // Block 68. After a failed post-test: replay the act and try again,
  // or finish with the score as it is. Resolves true for a replay.
  // Both are offered as equals; finishing is not a punishment.
  askReplay(actNumber, result) {
    return new Promise((resolve) => {
      this._cache();
      const need = Math.ceil(this.passingFor(actNumber) * result.max);
      this.el.eyebrow.textContent = "Panapos na Pagsusulit";
      this.el.title.textContent = "Subukan ulit?";
      this.el.progress.textContent = "";
      this.el.question.textContent =
        "Nakakuha ka ng " + result.score + " ng " + result.max + ". Kailangan ng " + need +
        " para pumasa. Maaari mong ulitin ang yugto mula sa simula at sagutan muli ang pagsusulit.";
      this.el.question.className = "centered";
      this.el.choices.innerHTML = "";
      this.el.note.textContent = "";
      this.el.note.className = "";
      this._onButton("Ulitin ang Yugto", () => { this._close(); resolve(true); }, "i-reset");
      this._onBack(() => { this._close(); resolve(false); }, "i-check");
      setLabel(this.el.back, "Tapusin na");
      this._open();
    });
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
        btn.appendChild(makeIcon("i-star"));
        const num = document.createElement("span");
        num.className = "lbl";
        num.textContent = String(i);
        btn.appendChild(num);
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
      this._onBack(() => resolve(null), "i-cross");
      setLabel(this.el.back, "Laktawan");
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
