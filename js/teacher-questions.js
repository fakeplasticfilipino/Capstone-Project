// =============================================================
// MACARIO — teacher-questions.js (Block 68)
//
// The teacher's editor for the tests: every question of an act's
// pre-test or post-test, its choices and which one is right, and the
// trivia card shown before the pre-test. Requested by the instructor,
// together with moving the questions into the game (content/questions.js,
// js/assessment.js).
//
// It reads and writes assessment_items and act_trivia directly, which
// schema 006 allows a teacher (and nobody else) to do. When the
// database has no questions for a test, the editor starts from the
// game's built-in bank, so saving it is how a teacher first takes a
// test over. "Restore defaults" puts the built-in questions back in
// the editor; nothing is written until Save.
//
// Saving a test replaces its rows: the edited list is written in order
// over the old one (an upsert on act, test and order), then any row past
// its new last question is deleted, so reordering and removing need no
// bookkeeping. Until 6 Oct 2026 the old rows were deleted first and the
// list inserted after, and a dropped connection between the two left
// the test with no questions: Act I fell back to the built-in bank
// (another test mid-study) and Acts II to IV skipped theirs. Now a
// failure leaves the old test, or the new one with the old one's extra
// questions still at the end; either way the teacher is told and saves
// again.
//
// Since Block 160 (schema v17) a question has a type: one answer, several
// answers ticked as boxes (right only when exactly the right ones are
// ticked), true or false, or an essay, kept for the teacher and never
// scored. A database without the type columns still loads, every
// question one answer.
//
// Everything a teacher typed is written into inputs as values, never
// as HTML.
// =============================================================

const TeacherQuestions = {
  CHOICES: 4,
  TYPES: [
    ["single", "One answer"],
    ["multi", "Several answers (tick boxes)"],
    ["truefalse", "True or false"],
    ["essay", "Essay (not scored)"],
  ],
  TRUE_FALSE: ["Tama", "Mali"],
  items: [],
  loadedFromDb: false,

  init() {
    if (this.started) return;
    this.started = true;
    this.el = {
      act: document.getElementById("qe-act"),
      type: document.getElementById("qe-type"),
      list: document.getElementById("qe-list"),
      source: document.getElementById("qe-source"),
      add: document.getElementById("qe-add"),
      defaults: document.getElementById("qe-defaults"),
      save: document.getElementById("qe-save"),
      status: document.getElementById("qe-status"),
    };
    if (!this.el.list) return;
    this.el.act.addEventListener("change", () => this.load());
    this.el.type.addEventListener("change", () => this.load());
    this.el.add.addEventListener("click", () => {
      this.collect();
      this.items.push({ question: "", type: "single", choices: Array(this.CHOICES).fill(""), correct: 0 });
      this.render();
    });
    this.el.defaults.addEventListener("click", () => {
      this.useDefaults();
      this.setStatus("Restored the game's built-in questions. Press Save to use them.", "");
    });
    this.el.save.addEventListener("click", () => this.save());
    this.load();
  },

  act() { return Number(this.el.act.value) || 1; },
  type() { return this.el.type.value; },
  isTrivia() { return this.type() === "trivia"; },

  bank() {
    return (window.QUESTIONS && window.QUESTIONS[this.act()]) || {};
  },

  setStatus(text, kind) {
    this.el.status.textContent = text || "";
    this.el.status.className = "qe-status" + (kind ? " qe-" + kind : "");
  },

  useDefaults() {
    if (this.isTrivia()) {
      this.items = [{ trivia: this.bank().trivia || "" }];
    } else {
      this.items = (this.bank()[this.type()] || []).map((q) =>
        this.shape(q.question, q.type, q.choices, q.correct));
    }
    this.render();
  },

  // Block 160. One question as the editor holds it: correct is a
  // number, or for several answers a list.
  shape(question, type, choices, correct) {
    const t = this.TYPES.some(([id]) => id === type) ? type : "single";
    const list = t === "essay" ? [] : t === "truefalse" ? this.TRUE_FALSE.slice()
      : (Array.isArray(choices) ? choices.slice() : []);
    const key = t === "multi"
      ? (Array.isArray(correct) ? correct : [correct]).map(Number).filter((n) => Number.isInteger(n) && n >= 0)
      : Number(Array.isArray(correct) ? correct[0] : correct) || 0;
    return { question: question || "", type: t, choices: list, correct: key };
  },

  async load() {
    this.setStatus("Loading...", "");
    this.el.list.innerHTML = "";
    this.loadedFromDb = false;
    try {
      if (this.isTrivia()) {
        const { data, error } = await sb.from("act_trivia").select("fact")
          .eq("act_number", this.act()).maybeSingle();
        if (error) throw error;
        if (data && data.fact) {
          this.items = [{ trivia: data.fact }];
          this.loadedFromDb = true;
          this.render();
        } else {
          this.useDefaults();
        }
      } else {
        const read = (cols) => sb.from("assessment_items").select(cols)
          .eq("act_number", this.act()).eq("test_type", this.type()).order("item_order");
        let res = await read("id, item_order, question, choices, correct_index, item_type, correct_indexes");
        if (res.error) res = await read("id, item_order, question, choices, correct_index");
        const { data, error } = res;
        if (error) throw error;
        const rows = (data || []).slice().sort((a, b) => a.item_order - b.item_order);
        if (rows.length) {
          this.items = rows.map((r) => this.shape(r.question, r.item_type, r.choices,
            Array.isArray(r.correct_indexes) ? r.correct_indexes : r.correct_index));
          this.loadedFromDb = true;
          this.render();
        } else {
          this.useDefaults();
        }
      }
      this.setStatus("", "");
    } catch (err) {
      console.error("question load failed:", err);
      this.useDefaults();
      this.setStatus("Could not load questions from the database. Showing the built-in set.", "error");
    }
  },

  render() {
    const list = this.el.list;
    list.innerHTML = "";
    this.el.add.classList.toggle("hidden", this.isTrivia());
    this.el.source.textContent = this.loadedFromDb
      ? "From the database: this is what the game uses now."
      : "Nothing saved in the database yet; these are the game's built-in questions. Press Save to take them over.";

    if (this.isTrivia()) {
      const box = document.createElement("textarea");
      box.className = "qe-question qe-trivia";
      box.rows = 4;
      box.value = (this.items[0] && this.items[0].trivia) || "";
      box.setAttribute("aria-label", "Trivia card");
      list.appendChild(box);
      return;
    }

    this.items.forEach((item, i) => {
      const card = document.createElement("div");
      card.className = "qe-item";

      const head = document.createElement("div");
      head.className = "qe-item-head";
      const num = document.createElement("strong");
      num.textContent = "Question " + (i + 1);
      head.appendChild(num);
      const tools = document.createElement("div");
      [["↑", -1, "Move up"], ["↓", 1, "Move down"]].forEach(([label, dir, name]) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "btn-secondary qe-small";
        b.textContent = label;
        b.setAttribute("aria-label", name);
        b.disabled = (dir < 0 && i === 0) || (dir > 0 && i === this.items.length - 1);
        b.addEventListener("click", () => {
          this.collect();
          const j = i + dir;
          [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
          this.render();
        });
        tools.appendChild(b);
      });
      const del = document.createElement("button");
      del.type = "button";
      del.className = "btn-secondary qe-small qe-delete";
      del.textContent = "Remove";
      del.addEventListener("click", () => {
        this.collect();
        this.items.splice(i, 1);
        this.render();
      });
      tools.appendChild(del);
      head.appendChild(tools);
      card.appendChild(head);

      // Block 160. The question's type; a change redraws the card.
      const typeRow = document.createElement("label");
      typeRow.className = "qe-type-row";
      typeRow.textContent = "Type ";
      const typeSel = document.createElement("select");
      typeSel.className = "qe-item-type";
      this.TYPES.forEach(([id, name]) => {
        const o = document.createElement("option");
        o.value = id;
        o.textContent = name;
        typeSel.appendChild(o);
      });
      typeSel.value = item.type;
      typeSel.addEventListener("change", () => {
        this.collect();
        const it = this.items[i];
        const was = it.type;
        it.type = typeSel.value;
        if (it.type === "truefalse") { it.choices = this.TRUE_FALSE.slice(); it.correct = 0; }
        else if (it.type === "essay") { it.choices = []; it.correct = 0; }
        else {
          if (was === "truefalse" || was === "essay") it.choices = Array(this.CHOICES).fill("");
          it.correct = it.type === "multi"
            ? (Array.isArray(it.correct) ? it.correct : [it.correct])
            : (Array.isArray(it.correct) ? (it.correct[0] || 0) : it.correct);
        }
        this.render();
      });
      typeRow.appendChild(typeSel);
      card.appendChild(typeRow);

      const q = document.createElement("textarea");
      q.className = "qe-question";
      q.rows = 2;
      q.value = item.question;
      q.setAttribute("aria-label", "Question " + (i + 1));
      card.appendChild(q);

      if (item.type === "essay") {
        const note = document.createElement("p");
        note.className = "muted qe-essay-note";
        note.textContent = "Students write a few sentences. Not scored: kept for you to read on the student card, and left out of the score, the pass mark and the gain.";
        card.appendChild(note);
        list.appendChild(card);
        return;
      }

      const multi = item.type === "multi";
      const fixed = item.type === "truefalse";
      if (multi) {
        const note = document.createElement("p");
        note.className = "muted qe-essay-note";
        note.textContent = "Tick every right answer. A student is right only when they tick exactly these.";
        card.appendChild(note);
      }
      const choices = item.choices.slice();
      if (!fixed) while (choices.length < this.CHOICES) choices.push("");
      choices.forEach((choice, c) => {
        const row = document.createElement("label");
        row.className = "qe-choice";
        const radio = document.createElement("input");
        radio.type = multi ? "checkbox" : "radio";
        radio.name = "qe-correct-" + i;
        radio.className = "qe-correct";
        radio.checked = multi ? (Array.isArray(item.correct) && item.correct.includes(c)) : item.correct === c;
        radio.title = "Correct answer";
        row.appendChild(radio);
        const letter = document.createElement("span");
        letter.className = "qe-letter";
        letter.textContent = "ABCDEFGH".charAt(c);
        row.appendChild(letter);
        const input = document.createElement("input");
        input.type = "text";
        input.className = "qe-choice-text";
        input.value = choice;
        input.readOnly = fixed;
        input.setAttribute("aria-label", "Choice " + "ABCDEFGH".charAt(c));
        row.appendChild(input);
        card.appendChild(row);
      });

      list.appendChild(card);
    });
  },

  // Reads what is on screen back into this.items.
  collect() {
    if (this.isTrivia()) {
      const box = this.el.list.querySelector(".qe-trivia");
      this.items = [{ trivia: box ? box.value : "" }];
      return;
    }
    this.items = [...this.el.list.querySelectorAll(".qe-item")].map((card) => {
      const marks = [...card.querySelectorAll(".qe-correct")];
      const sel = card.querySelector(".qe-item-type");
      const type = sel ? sel.value : "single";
      return {
        question: card.querySelector(".qe-question").value,
        type,
        choices: [...card.querySelectorAll(".qe-choice-text")].map((x) => x.value),
        correct: type === "multi"
          ? marks.map((r, k) => (r.checked ? k : -1)).filter((k) => k >= 0)
          : Math.max(0, marks.findIndex((r) => r.checked)),
      };
    });
  },

  // Every question needs its text; every one but an essay at least two
  // choices and a right answer that is one of them (several answers: at
  // least one ticked). Empty choices are dropped and the right answers
  // moved with the ones that stay.
  validate() {
    const rows = [];
    for (let i = 0; i < this.items.length; i++) {
      const it = this.items[i];
      const type = it.type || "single";
      const question = it.question.trim();
      if (!question) return { error: "Question " + (i + 1) + " is empty." };
      if (type === "essay") {
        rows.push({ question, type, choices: [], correct: -1, corrects: null });
        continue;
      }
      const marked = type === "multi" ? (Array.isArray(it.correct) ? it.correct : [it.correct]) : [it.correct];
      const kept = [];
      const right = [];
      let lostMark = false;
      it.choices.forEach((c, k) => {
        const text = c.trim();
        if (!text) { if (marked.includes(k)) lostMark = true; return; }
        if (marked.includes(k)) right.push(kept.length);
        kept.push(text);
      });
      if (kept.length < 2) return { error: "Question " + (i + 1) + " needs at least two choices." };
      if (lostMark) return { error: "A correct answer ticked for question " + (i + 1) + " is empty." };
      if (!right.length) return { error: "Tick the correct answer" + (type === "multi" ? "s" : "") + " for question " + (i + 1) + "." };
      rows.push({ question, type, choices: kept, correct: right[0], corrects: type === "multi" ? right : null });
    }
    if (!rows.length) return { error: "A test needs at least one question." };
    return { rows };
  },

  async save() {
    this.collect();
    const act = this.act();
    this.el.save.disabled = true;
    try {
      if (this.isTrivia()) {
        const fact = (this.items[0].trivia || "").trim();
        if (!fact) { this.setStatus("The trivia card is empty.", "error"); return; }
        const { error } = await sb.from("act_trivia").upsert({ act_number: act, fact }, { onConflict: "act_number" });
        if (error) throw error;
      } else {
        const checked = this.validate();
        if (checked.error) { this.setStatus(checked.error, "error"); return; }
        const type = this.type();
        // Scan S14: a test students have already sat is a research
        // instrument in use. Changing it mid-study makes the scores before
        // and after the change different tests, so the teacher is told and
        // must confirm. The count is what RLS lets this teacher see (her
        // own students), which is the case that matters to her.
        const sat = await sb.from("assessment_scores").select("student_id", { count: "exact", head: true })
          .eq("act_number", act).eq("test_type", type);
        const n = sat && !sat.error ? (sat.count || 0) : 0;
        if (n > 0 && !window.confirm(n + " test result" + (n === 1 ? " has" : "s have") +
            " already been recorded for this test. Changing the questions now means students before and" +
            " after the change sat different tests, and the pre-test and post-test are matched pairs." +
            " Save anyway?")) {
          this.setStatus("Not saved.", "");
          return;
        }
        const put = await sb.from("assessment_items").upsert(checked.rows.map((r, i) => ({
          act_number: act, test_type: type, item_order: i + 1,
          question: r.question, choices: r.choices, correct_index: r.correct,
          item_type: r.type, correct_indexes: r.corrects,
        })), { onConflict: "act_number,test_type,item_order" });
        if (put.error) throw put.error;
        const del = await sb.from("assessment_items").delete().eq("act_number", act).eq("test_type", type)
          .gt("item_order", checked.rows.length);
        if (del.error) throw del.error;
      }
      this.loadedFromDb = true;
      this.render();
      this.setStatus(this.isTrivia()
        ? "Saved. The game will use this from the next test on."
        : "Saved. The game will use this from the next test on. The pre-test and post-test are matched" +
          " pairs: if you changed a question here, change its partner in the other test too.", "ok");
    } catch (err) {
      console.error("question save failed:", err);
      this.setStatus("Not saved: " + ((err && err.message) || "error") +
        ". Make sure schemas 006 and 017 have been run in Supabase.", "error");
    } finally {
      this.el.save.disabled = false;
    }
  },
};

window.TeacherQuestions = TeacherQuestions;

// teacher.js starts the editor once the gate opens, but its session check
// resolves on a microtask and can open the gate before this file has been
// parsed (the load-order pitfall in CLAUDE.md). Whichever comes second
// starts it; init runs once.
{
  const dashEl = document.getElementById("dash");
  if (dashEl && !dashEl.classList.contains("hidden")) TeacherQuestions.init();
}
