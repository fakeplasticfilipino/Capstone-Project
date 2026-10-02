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
// Saving a test replaces its rows: the old ones are deleted and the
// edited list inserted in order, so reordering and removing need no
// bookkeeping. If the insert fails after the delete, the database holds
// no questions for that test and the game falls back to its built-in
// bank, which is a safe place to fail to; the teacher is told.
//
// Everything a teacher typed is written into inputs as values, never
// as HTML.
// =============================================================

const TeacherQuestions = {
  CHOICES: 4,
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
      this.items.push({ question: "", choices: Array(this.CHOICES).fill(""), correct: 0 });
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
      this.items = (this.bank()[this.type()] || []).map((q) => ({
        question: q.question, choices: q.choices.slice(), correct: Number(q.correct),
      }));
    }
    this.render();
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
        const { data, error } = await sb.from("assessment_items")
          .select("id, item_order, question, choices, correct_index")
          .eq("act_number", this.act()).eq("test_type", this.type())
          .order("item_order");
        if (error) throw error;
        const rows = (data || []).slice().sort((a, b) => a.item_order - b.item_order);
        if (rows.length) {
          this.items = rows.map((r) => ({
            question: r.question,
            choices: Array.isArray(r.choices) ? r.choices.slice() : [],
            correct: Number(r.correct_index),
          }));
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

      const q = document.createElement("textarea");
      q.className = "qe-question";
      q.rows = 2;
      q.value = item.question;
      q.setAttribute("aria-label", "Question " + (i + 1));
      card.appendChild(q);

      const choices = item.choices.slice();
      while (choices.length < this.CHOICES) choices.push("");
      choices.forEach((choice, c) => {
        const row = document.createElement("label");
        row.className = "qe-choice";
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "qe-correct-" + i;
        radio.checked = item.correct === c;
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
      const radios = [...card.querySelectorAll("input[type=radio]")];
      return {
        question: card.querySelector(".qe-question").value,
        choices: [...card.querySelectorAll(".qe-choice-text")].map((x) => x.value),
        correct: Math.max(0, radios.findIndex((r) => r.checked)),
      };
    });
  },

  // Every question needs its text, at least two choices, and a right
  // answer that is one of them. Empty choices are dropped and the right
  // answer moved with the ones that stay.
  validate() {
    const rows = [];
    for (let i = 0; i < this.items.length; i++) {
      const it = this.items[i];
      const question = it.question.trim();
      const kept = [];
      let correct = -1;
      it.choices.forEach((c, k) => {
        const text = c.trim();
        if (!text) return;
        if (k === it.correct) correct = kept.length;
        kept.push(text);
      });
      if (!question) return { error: "Question " + (i + 1) + " is empty." };
      if (kept.length < 2) return { error: "Question " + (i + 1) + " needs at least two choices." };
      if (correct < 0) return { error: "The correct answer chosen for question " + (i + 1) + " is empty." };
      rows.push({ question, choices: kept, correct });
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
        const del = await sb.from("assessment_items").delete().eq("act_number", act).eq("test_type", type);
        if (del.error) throw del.error;
        const ins = await sb.from("assessment_items").insert(checked.rows.map((r, i) => ({
          act_number: act, test_type: type, item_order: i + 1,
          question: r.question, choices: r.choices, correct_index: r.correct,
        })));
        if (ins.error) throw ins.error;
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
        ". Make sure schema 006 has been run in Supabase.", "error");
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
