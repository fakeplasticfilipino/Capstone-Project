// =============================================================
// MACARIO — teacher-talaan.js (Block 70)
//
// The teacher's Talaan papers: up to three per act, each a title and a
// text, which the game lays on the road at three places fixed by the
// act's content (content/act1.js, HINT_SPOTS). A student walks or jumps
// into one, reads it on a card, and finds it again in the Talaan on the
// pause screen. Requested by the proponent: the teacher writes them,
// the places are decided beforehand, three at most.
//
// Stored in talaan_entries (schema 007), one row per (act, slot). An
// empty slot is no row, and lays nothing in the game. Saving upserts
// the slots that have text and deletes the ones that were emptied, so
// a paper keeps its slot, and a student who found paper 2 still has it
// found after the teacher rewrites it.
//
// PLACES describes where each paper lies, in words, because the
// dashboard does not load the game's content. An act without places
// is not offered. A spot moved in content is described again here.
//
// Block 94. The game has three papers of its own for Act I (content/
// act1.js, hints.pool), laid in any slot the teacher leaves empty.
// DEFAULTS names them, for the same reason PLACES describes the spots;
// a paper renamed in content is renamed here too.
//
// Everything a teacher typed is written into inputs as values, never
// as HTML.
// =============================================================

const TeacherTalaan = {
  SLOTS: 3,
  TITLE_MAX: 60,
  TEXT_MAX: 400,

  PLACES: {
    1: [
      "On the road between Nanay and the Kutsero. Every student walks past it early in the act.",
      "Past the Mananahi's sewing, at jump height: the student has to jump for it.",
      "Near the end of the street, before the direktor, at jump height.",
    ],
  },

  DEFAULTS: {
    1: ["Si Macario Sakay", "Ang komedya", "Ang Katipunan"],
  },

  init() {
    if (this.started) return;
    this.started = true;
    this.el = {
      act: document.getElementById("tl-act"),
      list: document.getElementById("tl-list"),
      save: document.getElementById("tl-save"),
      status: document.getElementById("tl-status"),
    };
    if (!this.el.list) return;
    this.el.act.innerHTML = "";
    Object.keys(this.PLACES).forEach((n) => {
      const opt = document.createElement("option");
      opt.value = n;
      opt.textContent = "Act " + ["", "I", "II", "III", "IV"][Number(n)];
      this.el.act.appendChild(opt);
    });
    this.el.act.addEventListener("change", () => this.load());
    this.el.save.addEventListener("click", () => this.save());
    this.load();
  },

  act() { return Number(this.el.act.value) || 1; },

  setStatus(text, kind) {
    this.el.status.textContent = text || "";
    this.el.status.className = "qe-status" + (kind ? " qe-" + kind : "");
  },

  async load() {
    this.setStatus("Loading...", "");
    let papers = [];
    try {
      const { data, error } = await sb.from("talaan_entries")
        .select("slot, title, body").eq("act_number", this.act());
      if (error) throw error;
      papers = data || [];
      this.setStatus("", "");
    } catch (err) {
      console.error("talaan load failed:", err);
      this.setStatus("Could not load the papers. Make sure schema 007 has been run in Supabase.", "error");
    }
    this.render(papers);
  },

  render(papers) {
    const list = this.el.list;
    list.innerHTML = "";
    const places = this.PLACES[this.act()] || [];
    for (let slot = 1; slot <= this.SLOTS; slot++) {
      const paper = papers.find((p) => Number(p.slot) === slot) || {};
      const card = document.createElement("div");
      card.className = "qe-item tl-paper";
      card.dataset.slot = String(slot);

      const head = document.createElement("div");
      head.className = "qe-item-head";
      const num = document.createElement("strong");
      num.textContent = "Paper " + slot;
      head.appendChild(num);
      card.appendChild(head);

      const where = document.createElement("p");
      where.className = "muted tl-where";
      where.textContent = places[slot - 1] || "";
      card.appendChild(where);

      const title = document.createElement("input");
      title.type = "text";
      title.className = "qe-choice-text tl-title";
      title.maxLength = this.TITLE_MAX;
      title.placeholder = "Title (optional)";
      title.value = paper.title || "";
      title.setAttribute("aria-label", "Paper " + slot + " title");
      card.appendChild(title);

      const text = document.createElement("textarea");
      text.className = "qe-question tl-text";
      text.rows = 3;
      text.maxLength = this.TEXT_MAX;
      const own = (this.DEFAULTS[this.act()] || [])[slot - 1];
      text.placeholder = own
        ? "What the paper says. Leave both boxes empty to keep the game's own paper here (" + own + ")."
        : "What the paper says. Leave both boxes empty for no paper here.";
      text.value = paper.body || "";
      text.setAttribute("aria-label", "Paper " + slot + " text");
      card.appendChild(text);

      list.appendChild(card);
    }
  },

  collect() {
    return [...this.el.list.querySelectorAll(".tl-paper")].map((card) => ({
      slot: Number(card.dataset.slot),
      title: card.querySelector(".tl-title").value.trim(),
      body: card.querySelector(".tl-text").value.trim(),
    }));
  },

  async save() {
    const act = this.act();
    const papers = this.collect();
    const lacking = papers.find((p) => p.title && !p.body);
    if (lacking) {
      this.setStatus("Paper " + lacking.slot + " has a title but no text.", "error");
      return;
    }
    this.el.save.disabled = true;
    try {
      const keep = papers.filter((p) => p.body);
      const drop = papers.filter((p) => !p.body);
      if (keep.length) {
        const now = new Date().toISOString();
        const { error } = await sb.from("talaan_entries").upsert(
          keep.map((p) => ({ act_number: act, slot: p.slot, title: p.title, body: p.body, updated_at: now })),
          { onConflict: "act_number,slot" });
        if (error) throw error;
      }
      for (const p of drop) {
        const { error } = await sb.from("talaan_entries").delete()
          .eq("act_number", act).eq("slot", p.slot);
        if (error) throw error;
      }
      this.setStatus(keep.length
        ? "Saved. " + keep.length + " of " + this.SLOTS + " papers will lie on the road from a student's next visit." +
          (this.DEFAULTS[act] && keep.length < this.SLOTS ? " The empty slots keep the game's own papers." : "")
        : (this.DEFAULTS[act]
          ? "Saved. No papers of yours: the game's own papers lie on the road."
          : "Saved. No papers: the Talaan is hidden in this act."), "ok");
    } catch (err) {
      console.error("talaan save failed:", err);
      this.setStatus("Not saved: " + ((err && err.message) || "error") +
        ". Make sure schema 007 has been run in Supabase.", "error");
    } finally {
      this.el.save.disabled = false;
    }
  },
};

window.TeacherTalaan = TeacherTalaan;

// The same start-up race teacher-questions.js answers: whichever comes
// second, the gate opening or this file being parsed, starts it.
{
  const dashEl = document.getElementById("dash");
  if (dashEl && !dashEl.classList.contains("hidden")) TeacherTalaan.init();
}
