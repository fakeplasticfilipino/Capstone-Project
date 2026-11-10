// =============================================================
// MACARIO — teacher-feedback.js (Block 161)
//
// The Feedback tab: what students said in the optional form after an
// act's post-test (js/assessment.js, runFeedback; the feedback table).
// Until Block 161 nothing on the dashboard read it, so the third stated
// objective's "optional user feedback" was collected and never shown.
//
// Read from the rows the roster's load already fetched (teacher.js,
// fullFetch.feedback), so it adds no round trip of its own, and with
// archived students left out the same way every other tab leaves them
// out. A summary of every act (how many answered, the average rating,
// how many gave each rating) and, for the act chosen at the top of the
// page, each answer with its student, newest first. Export CSV saves
// every act's answers.
//
// A student may skip the form and cannot change an answer once sent
// (the table has no update policy, by design), so the counts are of the
// students who chose to answer, not of the class.
//
// Everything a student typed is written as text, never as HTML.
// =============================================================

const TeacherFeedback = {
  init() {
    if (this.started) return;
    this.started = true;
    this.el = {
      section: document.getElementById("fb"),
      basis: document.getElementById("fb-basis"),
      summary: document.getElementById("fb-summary"),
      table: document.getElementById("fb-table"),
      empty: document.getElementById("fb-empty"),
      error: document.getElementById("fb-error"),
      exportBtn: document.getElementById("fb-export"),
      wait: document.getElementById("fb-wait"),
    };
    if (!this.el.section) return;
    this.el.exportBtn.addEventListener("click", () => this.exportCsv());
  },

  // The student's name where the teacher gave one (Block 159), else the
  // code; and the code on its own, for the spreadsheet.
  _who(students) {
    const by = new Map();
    (students || []).forEach((s) => by.set(s.id, { name: s.display_name || s.full_name || "(no name)",
      code: s.full_name || "", realName: s.display_name || "" }));
    return (id) => by.get(id) || { name: "(unknown)", code: "", realName: "" };
  },

  _summary(rows) {
    const out = {};
    for (let act = 1; act <= 4; act++) {
      const mine = rows.filter((r) => Number(r.act_number) === act);
      const counts = [0, 0, 0, 0, 0];
      mine.forEach((r) => { const n = Number(r.rating); if (n >= 1 && n <= 5) counts[n - 1]++; });
      const rated = counts.reduce((a, b) => a + b, 0);
      out[act] = {
        n: mine.length,
        comments: mine.filter((r) => (r.comment || "").trim()).length,
        avg: rated ? counts.reduce((a, c, i) => a + c * (i + 1), 0) / rated : null,
        counts,
      };
    }
    return out;
  },

  draw(fetch, act) {
    if (!this.el || !this.el.section) return;
    this.lastFetch = fetch;
    this.lastAct = act;
    this.el.wait.classList.add("hidden");
    this.el.section.classList.remove("hidden");
    const failed = fetch && fetch.feedback === null;
    this.el.error.classList.toggle("hidden", !failed);
    const rows = (fetch && fetch.feedback) || [];
    const who = this._who(fetch && fetch.students);
    const sum = this._summary(rows);
    const students = (fetch && fetch.students ? fetch.students.length : 0);
    this.el.basis.textContent = rows.length
      ? rows.length + " answer" + (rows.length === 1 ? "" : "s") + " from " +
        new Set(rows.map((r) => r.student_id)).size + " of " + students + " students. The form is optional."
      : "No student has answered the feedback form yet. It is optional, and shown after each act's post-test.";

    const cell = (tr, text, cls) => {
      const td = document.createElement("td");
      if (cls) td.className = cls;
      td.textContent = text;
      tr.appendChild(td);
      return td;
    };

    const sbody = this.el.summary.querySelector("tbody");
    sbody.innerHTML = "";
    for (let a = 1; a <= 4; a++) {
      const s = sum[a];
      const tr = document.createElement("tr");
      if (a === act) tr.className = "fb-current";
      cell(tr, ACT_NAMES[a]);
      cell(tr, String(s.n), "num");
      cell(tr, s.avg === null ? "—" : s.avg.toFixed(1) + " / 5", "num");
      s.counts.forEach((c) => cell(tr, String(c), "num"));
      cell(tr, String(s.comments), "num");
      sbody.appendChild(tr);
    }

    const list = rows.filter((r) => Number(r.act_number) === act)
      .sort((x, y) => String(y.created_at || "").localeCompare(String(x.created_at || "")));
    const tbody = this.el.table.querySelector("tbody");
    tbody.innerHTML = "";
    list.forEach((r) => {
      const tr = document.createElement("tr");
      const w = who(r.student_id);
      const td = cell(tr, w.name);
      if (w.realName && w.code) {
        const sub = document.createElement("span");
        sub.className = "cell-sub";
        sub.textContent = w.code;
        td.appendChild(sub);
      }
      cell(tr, String(r.rating) + " / 5", "num");
      const text = (r.comment || "").trim();
      cell(tr, text || "(rating only)", text ? "fb-comment" : "fb-comment muted");
      cell(tr, r.created_at ? formatDate(r.created_at) : "—");
      tbody.appendChild(tr);
    });
    this.el.table.classList.toggle("hidden", list.length === 0);
    this.el.empty.classList.toggle("hidden", list.length > 0);
    this.el.empty.textContent = "No answers for " + ACT_NAMES[act] + " yet.";
    this.el.exportBtn.disabled = rows.length === 0;
  },

  exportCsv() {
    const rows = ((this.lastFetch && this.lastFetch.feedback) || []).slice()
      .sort((x, y) => Number(x.act_number) - Number(y.act_number) ||
        String(x.created_at || "").localeCompare(String(y.created_at || "")));
    if (!rows.length) return;
    const who = this._who(this.lastFetch.students);
    const cls = typeof classesById !== "undefined" ? classesById.get(currentClassId) : null;
    const lines = [["act", "code", "name", "rating", "comment", "date"].join(",")];
    rows.forEach((r) => {
      const w = who(r.student_id);
      lines.push([r.act_number, w.code, w.realName, r.rating, (r.comment || "").trim(),
        r.created_at ? String(r.created_at).slice(0, 10) : ""].map(csvField).join(","));
    });
    const blob = new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = ((cls && cls.class_name) || "class").replace(/[^A-Za-z0-9-]+/g, "-") +
      "-feedback-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },
};

window.TeacherFeedback = TeacherFeedback;

// The start-up race teacher-report.js answers: the gate may open, and the
// roster be drawn, before this file is parsed.
{
  const dashEl = document.getElementById("dash");
  if (dashEl && !dashEl.classList.contains("hidden")) {
    TeacherFeedback.init();
    if (typeof lastFetch !== "undefined" && lastFetch) TeacherFeedback.draw(lastFetch, currentAct);
  }
}
