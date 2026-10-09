// =============================================================
// MACARIO — assessment.js (Block 3)
//
// The trivia card, the pre-test, and the post-test.
//
// LOAD ORDER: after acts.js in index.html. acts.js sequences the
// act lifecycle and owns every act_progress write; this file owns
// the interface, reads the questions and writes the scores (Block 68;
// it calls no RPC since), and reports back by resolving a promise. It
// never writes act_progress itself.
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

  // The label is set every time too (Scan S2): cloneNode carries the
  // last one across, so the replay's "Tapusin na" or the feedback's
  // "Laktawan" stayed on every later question's Back button.
  _onBack(handler, icon, label) {
    const back = this.el.back;
    const fresh = back.cloneNode(true);
    setIcon(fresh, icon || "i-back");
    setLabel(fresh, label || "Bumalik");
    fresh.classList.remove("feedback-skip");
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

    const attempt = tries.length + 1;
    const draftKey = this._draftKey(actNumber, testType, attempt);
    const answers = await this._askAll(items, label, draftKey);
    const result = await this._submit(actNumber, testType, items, answers, label, attempt, draftKey);
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
    await this.flushPending();
    const pending = this._readPending().filter((r) =>
      r.student_id === currentUserId && r.act_number === actNumber && r.test_type === testType);

    try {
      const { data, error } = await sb
        .from("assessment_scores")
        .select("*")
        .eq("student_id", currentUserId)
        .eq("act_number", actNumber)
        .eq("test_type", testType);
      if (error) throw error;
      return (data || []).concat(pending)
        .sort((a, b) => (Number(a.attempt) || 1) - (Number(b.attempt) || 1));
    } catch (err) {
      console.error("assessment_scores read failed:", err);
      return pending;
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
      .map((r, i) => ({ id: String(r.id), question: r.question, choices: r.choices,
                     correct: Number(r.correct_index),
                     order: Number(r.item_order) || i + 1 }));

    if (!items.length) {
      items = (this._bank(actNumber)[testType] || []).map((q, i) => ({
        id: "q" + (i + 1), question: q.question, choices: q.choices, correct: Number(q.correct),
        order: i + 1,
      }));
    }

    if (!items.length) {
      // No questions for this test: the teacher has not written any and
      // the built-in bank has none (every shipped act has built-in
      // questions since 9 Oct 2026; an act added later may not). Skipped,
      // since an act should not be unreachable because a test that does
      // not exist cannot be taken.
      //
      // Block 121. Said once, at the pre-test. An act with no questions
      // at all ends without a second "Walang pagsusulit": the student was
      // already told, and the same screen twice teaches nothing. An act
      // that has pre-test questions and no post-test ones (a gap in the
      // teacher's bank) still says so, since that one is news.
      if (testType === "post" && !(await this._hasAny(actNumber))) return null;
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

  // Block 121. Whether the act has any question at all, of either test:
  // the built-in bank, else one row in the database. A failed read says
  // yes, so the student is told rather than left wondering.
  async _hasAny(actNumber) {
    const bank = this._bank(actNumber);
    if ((bank.pre || []).length || (bank.post || []).length) return true;
    try {
      const res = await sb.from("assessment_items").select("id").eq("act_number", actNumber);
      if (res.error) throw res.error;
      return Boolean(res.data && res.data.length);
    } catch (err) {
      return true;
    }
  },

  // One question per screen. The target device is a low-end phone,
  // and five items on one scrolling page tests thumb stamina rather
  // than knowledge. Back is offered so an answer can be revised,
  // which matters when the same instrument is being used to claim a
  // learning gain.
  _askAll(items, label, draftKey) {
    return new Promise((resolve) => {
      const kept = this._readDraft(draftKey, items);
      const answers = kept ? kept.answers : {};
      let index = kept ? kept.index : 0;

      const render = () => {
        const item = items[index];
        const isLast = index === items.length - 1;
        this._writeDraft(draftKey, answers, index);

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
  async _submit(actNumber, testType, items, answers, label, attempt, draftKey) {
    const max = items.length;
    const score = items.filter((it) => answers[it.id] === it.correct).length;
    const row = {
      student_id: currentUserId,
      act_number: actNumber,
      test_type: testType,
      score,
      max_score: max,
      answers: this._answerRecord(items, answers),
    };
    if (attempt > 1) row.attempt = attempt;
    const result = this._result(actNumber, testType, Object.assign({ attempt }, row));

    for (;;) {
      let message = "";
      let saved = false;
      try {
        const { error } = await this._insertScore(row);
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
        this._clearDraft(draftKey);
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
      // in memory, so retrying costs the student nothing. Since Scan S3
      // there is a way on as well: the score is kept on the phone and
      // sent on the next login (flushPending), so a classroom with no
      // signal does not hold a student on this screen for good.
      const retry = await new Promise((resolve) => {
        this.el.eyebrow.textContent = label;
        this.el.title.textContent = "Hindi naipasa";
        this.el.progress.textContent = "";
        this.el.question.textContent = "Hindi maipasa ang iyong sagot. Suriin ang koneksyon at subukan ulit.";
        this.el.question.className = "centered";
        this.el.choices.innerHTML = "";
        this.el.note.textContent = "Nakatago pa ang mga sagot mo. Kung wala talagang internet, " +
          "ituloy muna: itatala ang iskor mo sa susunod na pag-log in.";
        this.el.note.className = "error";
        this._onButton("Subukan Ulit", () => resolve(true), "i-reset");
        this._onBack(() => resolve(false), "i-right", "Ituloy muna");
        this._open();
      });
      if (retry) continue;

      this._addPending(row);
      this._clearDraft(draftKey);
      await this._message({
        eyebrow: label + (attempt > 1 ? " · Subok " + attempt : ""),
        title: testType === "pre" ? "Tapos na" : result.passed ? "Pumasa!" : "Hindi pumasa",
        body: "Iskor mo: " + score + " ng " + max + ".",
        note: "Itatala ito sa susunod na may internet ka at mag-log in.",
        button: "Magpatuloy",
      });
      return result;
    }
  },

  // Block 128 (schema 012). Each answer beside the score, for the
  // dashboard's Questions report: the item's place in the test (o), the
  // choice (c), whether it was right (k) and the question as it was asked
  // (q), since a teacher may reword it later.
  _answerRecord(items, answers) {
    const out = {};
    items.forEach((it, i) => {
      if (answers[it.id] === undefined) return;
      out[it.id] = { o: it.order || i + 1, c: answers[it.id],
        k: answers[it.id] === it.correct ? 1 : 0, q: String(it.question || "").slice(0, 600) };
    });
    return out;
  },

  // Writes a score. A database without schema 012 refuses the answers
  // column; the score is what matters, so it is written again without
  // it rather than held back.
  async _insertScore(row) {
    let res = await sb.from("assessment_scores").insert(row);
    if (res.error && row.answers !== undefined &&
        /answers|PGRST204|42703/i.test((res.error.message || "") + " " + (res.error.code || ""))) {
      const plain = Object.assign({}, row);
      delete plain.answers;
      res = await sb.from("assessment_scores").insert(plain);
    }
    return res;
  },

  // -----------------------------------------------------------
  // Scores kept on the phone (Scan S3)
  //
  // A row that could not be written is kept in localStorage, per
  // student, and sent on the next login (Acts.syncStart) or before the
  // next test. A duplicate refused by the database means it already
  // arrived, so it is dropped too. Until it is sent it counts as sat:
  // _existingScores reads it, so the same test is not asked again.
  // -----------------------------------------------------------
  PENDING_KEY: "macario_pending_scores",

  // -----------------------------------------------------------
  // Answers kept through a reload (Block 128)
  //
  // A test's answers so far, and the question on screen, kept on the
  // phone under the student, the act, the test and the attempt, so a
  // reload or a dropped tab opens the test where it was rather than at
  // question one with every choice gone. Nothing is recorded until the
  // answers are sent, as before; this only spares the student the work.
  // Dropped the moment the try is saved or kept to send later. A kept
  // answer whose question has changed (the teacher edited the test in
  // between) or whose choice no longer exists is not restored.
  // -----------------------------------------------------------
  DRAFT_KEY: "macario_test_draft",

  _draftKey(actNumber, testType, attempt) {
    if (!currentUserId) return null;
    return [currentUserId, actNumber, testType, attempt].join("|");
  },

  _readDrafts() {
    try {
      const all = JSON.parse(localStorage.getItem(this.DRAFT_KEY) || "{}");
      return all && typeof all === "object" && !Array.isArray(all) ? all : {};
    } catch (e) {
      return {};
    }
  },

  _readDraft(key, items) {
    if (!key) return null;
    const draft = this._readDrafts()[key];
    if (!draft || typeof draft.answers !== "object" || !draft.answers) return null;
    const answers = {};
    items.forEach((item) => {
      const a = draft.answers[item.id];
      const n = Array.isArray(item.choices) ? item.choices.length : 0;
      if (Number.isInteger(a) && a >= 0 && a < n) answers[item.id] = a;
    });
    if (!Object.keys(answers).length) return null;
    // Back to the question he was on, but never past the first he had
    // not answered, so a question cannot be skipped by a reload.
    let index = Math.max(0, Math.min(Number(draft.index) || 0, items.length - 1));
    const firstOpen = items.findIndex((item) => answers[item.id] === undefined);
    if (firstOpen !== -1 && firstOpen < index) index = firstOpen;
    return { answers, index };
  },

  _writeDraft(key, answers, index) {
    if (!key) return;
    const all = this._readDrafts();
    all[key] = { answers, index };
    try {
      localStorage.setItem(this.DRAFT_KEY, JSON.stringify(all));
    } catch (e) { /* private window: the answers live in memory only */ }
  },

  _clearDraft(key) {
    if (!key) return;
    const all = this._readDrafts();
    if (!(key in all)) return;
    delete all[key];
    try {
      if (Object.keys(all).length) localStorage.setItem(this.DRAFT_KEY, JSON.stringify(all));
      else localStorage.removeItem(this.DRAFT_KEY);
    } catch (e) { /* nothing kept to clear */ }
  },

  _readPending() {
    try {
      const list = JSON.parse(localStorage.getItem(this.PENDING_KEY) || "[]");
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  },

  _writePending(list) {
    try {
      if (list.length) localStorage.setItem(this.PENDING_KEY, JSON.stringify(list));
      else localStorage.removeItem(this.PENDING_KEY);
    } catch (e) { /* private window: the score is shown, not kept */ }
  },

  _addPending(row) {
    const list = this._readPending();
    list.push(Object.assign({}, row));
    this._writePending(list);
  },

  // Block 121. The full reset (shell.js) drops this student's kept
  // scores: sent after the wipe, one would bring back a test the reset
  // took away. Another student's, on a shared phone, stay.
  forgetPending() {
    if (!currentUserId) return;
    this._writePending(this._readPending().filter((r) => r.student_id !== currentUserId));
    // Block 128. And his half-answered tests: after the wipe a new try is
    // attempt 1 again, which would pick up the old answers.
    Object.keys(this._readDrafts())
      .filter((k) => k.indexOf(currentUserId + "|") === 0)
      .forEach((k) => this._clearDraft(k));
  },

  async flushPending() {
    if (!currentUserId || this._flushing) return;
    const list = this._readPending();
    const mine = list.filter((r) => r.student_id === currentUserId);
    if (!mine.length) return;
    this._flushing = true;
    const left = list.filter((r) => r.student_id !== currentUserId);
    for (const row of mine) {
      try {
        const { error } = await this._insertScore(row);
        if (error && !/duplicate|unique|23505/i.test((error.message || error.code || "") + "")) throw error;
      } catch (err) {
        console.error("kept score not sent yet:", err);
        left.push(row);
      }
    }
    this._writePending(left);
    this._flushing = false;
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
      this._onBack(() => { this._close(); resolve(false); }, "i-check", "Tapusin na");
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
      this._onBack(() => resolve(null), "i-cross", "Laktawan");
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
