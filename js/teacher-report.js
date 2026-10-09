// =============================================================
// MACARIO — teacher-report.js (Block 128, item 2)
//
// The Questions report: for the act chosen on the page, each pre-test
// question beside the post-test question in the same place, with how
// many of the class answered each one right. The roster says how much a
// class gained; this says on which topics, which is what a panel asks
// of a learning gain.
//
// Read from rows the roster already fetched (assessment_scores, select
// *), so it adds no query. Each row carries its answers since schema 012
// (js/assessment.js, _answerRecord): per item its place in the test (o),
// whether it was right (k) and the question as asked (q). A row from
// before that has none and is left out; the counts under the table say
// how many rows the report stands on.
//
// First attempts only, like the roster's gain (Scan S13, Block 123): a
// retake after a replay is a second reading of the same questions, not
// the comparison the study makes.
//
// Pre-test question n is paired with post-test question n, which is how
// the matched pairs are written (CLAUDE.md, Standing decisions). If the
// teacher's two tests are not in matching order, the pairing on this
// table is wrong in the same way, and the questions are shown in full so
// that it can be seen.
//
// Everything a teacher or a game typed is written as text, never HTML.
// =============================================================

const TeacherReport = {
  init() {
    if (this.started) return;
    this.started = true;
    this.el = {
      section: document.getElementById("qr"),
      body: document.getElementById("qr-body"),
      basis: document.getElementById("qr-basis"),
      empty: document.getElementById("qr-empty"),
      table: document.getElementById("qr-table"),
      exportBtn: document.getElementById("qr-export"),
    };
    if (!this.el.section) return;
    this.el.exportBtn.addEventListener("click", () => this.exportCsv());
  },

  // The first attempt of each student's test of this type, for this act.
  _firstAttempts(scores, act, type) {
    const by = new Map();
    scores.forEach((s) => {
      if (Number(s.act_number) !== act || s.test_type !== type) return;
      const prev = by.get(s.student_id);
      if (!prev || (Number(s.attempt) || 1) < (Number(prev.attempt) || 1)) by.set(s.student_id, s);
    });
    return [...by.values()];
  },

  // { order: { right, n, q } } from the rows that recorded answers, and
  // how many rows those were out of all the first attempts.
  _tally(rows) {
    const byOrder = {};
    let recorded = 0;
    rows.forEach((r) => {
      const answers = r.answers && typeof r.answers === "object" ? r.answers : null;
      if (!answers || !Object.keys(answers).length) return;
      recorded++;
      Object.values(answers).forEach((a) => {
        const o = Number(a && a.o);
        if (!o) return;
        const t = byOrder[o] || (byOrder[o] = { right: 0, n: 0, texts: new Map() });
        t.n++;
        if (Number(a.k) === 1) t.right++;
        const q = String(a.q || "");
        t.texts.set(q, (t.texts.get(q) || 0) + 1);
      });
    });
    // The wording most of the class saw, should it have changed mid-study.
    Object.values(byOrder).forEach((t) => {
      t.q = [...t.texts.entries()].sort((a, b) => b[1] - a[1])[0][0];
      t.reworded = t.texts.size > 1;
      delete t.texts;
    });
    return { byOrder, recorded, total: rows.length };
  },

  build(fetch, act) {
    const scores = (fetch && fetch.scores) || [];
    const pre = this._tally(this._firstAttempts(scores, act, "pre"));
    const post = this._tally(this._firstAttempts(scores, act, "post"));
    const orders = [...new Set([...Object.keys(pre.byOrder), ...Object.keys(post.byOrder)].map(Number))]
      .sort((a, b) => a - b);
    const pct = (t) => (t && t.n ? (t.right / t.n) * 100 : null);
    const rows = orders.map((o) => {
      const p = pre.byOrder[o] || null;
      const q = post.byOrder[o] || null;
      const prePct = pct(p);
      const postPct = pct(q);
      return {
        order: o, pre: p, post: q, prePct, postPct,
        change: prePct !== null && postPct !== null ? postPct - prePct : null,
      };
    });
    return { rows, pre, post };
  },

  draw(fetch, act) {
    if (!this.el || !this.el.section) return;
    this.lastAct = act;
    this.report = this.build(fetch, act);
    const { rows, pre, post } = this.report;
    this.el.section.classList.remove("hidden");
    this.el.basis.textContent =
      "From " + pre.recorded + " of " + pre.total + " pre-tests and " +
      post.recorded + " of " + post.total + " first post-tests that recorded answers.";
    const tbody = this.el.table.querySelector("tbody");
    tbody.innerHTML = "";
    this.el.empty.classList.toggle("hidden", rows.length > 0);
    this.el.table.classList.toggle("hidden", rows.length === 0);
    this.el.exportBtn.disabled = rows.length === 0;
    const cell = (tr, text, cls) => {
      const td = document.createElement("td");
      if (cls) td.className = cls;
      td.textContent = text;
      tr.appendChild(td);
      return td;
    };
    const share = (t, p) => (t ? Math.round(p) + "% (" + t.right + "/" + t.n + ")" : "—");
    rows.forEach((r) => {
      const tr = document.createElement("tr");
      cell(tr, String(r.order), "num");
      cell(tr, r.pre ? r.pre.q + (r.pre.reworded ? " (reworded during the study)" : "") : "—", "qr-q");
      cell(tr, share(r.pre, r.prePct), "num");
      cell(tr, r.post ? r.post.q + (r.post.reworded ? " (reworded during the study)" : "") : "—", "qr-q");
      cell(tr, share(r.post, r.postPct), "num");
      const ch = cell(tr, r.change === null ? "—" : (r.change > 0 ? "+" : "") + Math.round(r.change), "num");
      if (r.change !== null) ch.classList.add(r.change > 0 ? "gain-positive" : r.change < 0 ? "gain-negative" : "gain-neutral");
      tbody.appendChild(tr);
    });
  },

  exportCsv() {
    if (!this.report || !this.report.rows.length) return;
    const cls = typeof classesById !== "undefined" ? classesById.get(currentClassId) : null;
    const header = ["act", "item", "pre_question", "pre_correct", "pre_answered", "pre_pct",
      "post_question", "post_correct", "post_answered", "post_pct", "change_points"];
    const num = (v) => (v === null || v === undefined ? "" : Number(v).toFixed(1));
    const lines = [header.join(",")];
    this.report.rows.forEach((r) => {
      lines.push([
        this.lastAct, r.order,
        r.pre ? r.pre.q : "", r.pre ? r.pre.right : "", r.pre ? r.pre.n : "", num(r.prePct),
        r.post ? r.post.q : "", r.post ? r.post.right : "", r.post ? r.post.n : "", num(r.postPct),
        num(r.change),
      ].map(csvField).join(","));
    });
    const blob = new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = ((cls && cls.class_name) || "class").replace(/[^A-Za-z0-9-]+/g, "-") +
      "-act" + this.lastAct + "-questions-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },
};

window.TeacherReport = TeacherReport;

// The start-up race teacher-questions.js answers: the gate may open, and
// the roster be drawn, before this file is parsed.
{
  const dashEl = document.getElementById("dash");
  if (dashEl && !dashEl.classList.contains("hidden")) {
    TeacherReport.init();
    if (typeof lastFetch !== "undefined" && lastFetch) TeacherReport.draw(lastFetch, currentAct);
  }
}
