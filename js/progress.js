// =============================================================
// MACARIO — progress.js (Block 167)
//
// Aking Pag-unlad: a signed-in student's own dashboard, on the menu.
// Three things, as the instructor asked: an overview (Buod), progress
// (each act's tasks, tests and score) and status (where each act
// stands). A student could see none of this before; only the teacher
// could, of everyone.
//
// READ ONLY, AND ONLY THEIR OWN. Three selects, of act_progress,
// assessment_scores and game_progress, each filtered by the student's
// own id, which is also all the policies allow them (CLAUDE.md, Which
// tables a student may delete from: a student has had select on these
// since the tables were made). Nothing is written, so nothing here can
// touch a score or an attempt, and no new policy was needed.
//
// It shows the code the student logs in with, never the name, as the
// rest of the game does. A guest has no rows and is never offered it.
//
// Optional, as inventory.js and assessment.js are: shell.js checks
// window.Progress and keeps the menu's button hidden without it.
// =============================================================

const Progress = {
  ROMAN: { 1: "I", 2: "II", 3: "III", 4: "IV" },
  // act_progress.status in a student's words.
  STATUS: {
    none: "Hindi pa nasisimulan",
    locked: "Nakakandado pa",
    trivia: "Paunang pagsusulit",
    pretest: "Paunang pagsusulit",
    playing: "Nilalaro",
    posttest: "Panghuling pagsusulit",
    completed: "Tapos na",
  },

  async load() {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return null;
    const id = session.user.id;
    const [acts, scores, save, me] = await Promise.all([
      sb.from("act_progress").select("act_number, status, performance_score, objectives_done, objectives_total, elapsed_ms").eq("student_id", id),
      sb.from("assessment_scores").select("act_number, test_type, score, max_score, attempt").eq("student_id", id),
      sb.from("game_progress").select("currency, current_act").eq("student_id", id).maybeSingle(),
      sb.from("profiles").select("full_name").eq("id", id).maybeSingle(),
    ]);
    if (acts.error || scores.error) return null;
    return { acts: acts.data || [], scores: scores.data || [], save: save.data || null, code: (me.data && me.data.full_name) || "" };
  },

  pct(s) {
    return s && Number(s.max_score) > 0 ? Math.round((Number(s.score) / Number(s.max_score)) * 100) : null;
  },

  passing(n) {
    const q = window.QUESTIONS && window.QUESTIONS[n];
    return Math.round(((q && q.passing) || 0.75) * 100);
  },

  time(ms) {
    const min = Math.round(ms / 60000);
    if (min < 1) return "wala pang isang minuto";
    return min < 60 ? min + " minuto" : Math.floor(min / 60) + " oras, " + (min % 60) + " minuto";
  },

  // What the screen says, as plain data, so the drawing is only layout
  // and a check can read the numbers without the DOM.
  summarise(data) {
    const numbers = [1, 2, 3, 4].filter((n) => window.Acts && Acts.getAct && Acts.getAct(n));
    const rows = numbers.map((n) => {
      const act = Acts.getAct(n);
      const row = data.acts.find((a) => a.act_number === n) || null;
      const pre = data.scores.find((s) => s.act_number === n && s.test_type === "pre") || null;
      // The post-test may be sat again after a replay: the best one.
      const posts = data.scores.filter((s) => s.act_number === n && s.test_type === "post");
      const post = posts.sort((a, b) => this.pct(b) - this.pct(a))[0] || null;
      const prePct = this.pct(pre), postPct = this.pct(post);
      const status = row ? row.status : "none";
      let note = "";
      if (status === "completed" && postPct !== null) {
        note = postPct >= this.passing(n) ? "Pumasa sa pagsusulit" : "Maaaring laruin ulit para kunin muli ang pagsusulit";
      }
      return {
        n, title: (act && (act.titleTagalog || act.title)) || "", status, statusText: this.STATUS[status] || status, note,
        done: row ? Number(row.objectives_done) || 0 : 0,
        total: row && row.objectives_total ? Number(row.objectives_total) : ((act && act.objectives) || []).length,
        pre, post, prePct, postPct, tries: posts.length,
        gain: prePct !== null && postPct !== null ? postPct - prePct : null,
        performance: row && row.performance_score !== null && row.performance_score !== undefined ? Math.round(Number(row.performance_score)) : null,
        ms: row ? Number(row.elapsed_ms) || 0 : 0,
      };
    });
    const finished = rows.filter((r) => r.status === "completed");
    const scored = finished.filter((r) => r.performance !== null);
    return {
      code: data.code,
      rows,
      finished: finished.length,
      of: rows.length,
      barya: data.save ? Number(data.save.currency) || 0 : 0,
      ms: rows.reduce((t, r) => t + r.ms, 0),
      performance: scored.length ? Math.round(scored.reduce((t, r) => t + r.performance, 0) / scored.length) : null,
    };
  },

  el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  },

  // Draws into box. Resolves true once drawn, false if the rows could
  // not be read (said in the box, with nothing half shown).
  async show(box) {
    box.innerHTML = "";
    box.appendChild(this.el("p", "prog-note", "Binabasa ang iyong pag-unlad..."));
    let data = null;
    try { data = await this.load(); } catch (e) { data = null; }
    box.innerHTML = "";
    if (!data) {
      box.appendChild(this.el("p", "prog-note", "Hindi mabasa ang iyong pag-unlad. Suriin ang internet at subukan ulit."));
      return false;
    }
    const sum = this.summarise(data);
    this.last = sum;

    const top = this.el("div", "prog-cards");
    const card = (label, value) => {
      const c = this.el("div", "prog-card");
      c.append(this.el("span", "prog-value", value), this.el("span", "prog-label", label));
      top.appendChild(c);
    };
    card("Mga yugtong natapos", sum.finished + " / " + sum.of);
    card("Barya", String(sum.barya));
    card("Oras ng paglalaro", this.time(sum.ms));
    card("Karaniwang iskor sa laro", sum.performance === null ? "wala pa" : sum.performance + " / 100");
    box.appendChild(top);
    if (sum.code) box.appendChild(this.el("p", "prog-note", "Code: " + sum.code));

    sum.rows.forEach((r) => {
      const act = this.el("div", "prog-act prog-" + r.status);
      const head = this.el("div", "prog-act-head");
      head.append(this.el("span", "prog-num", this.ROMAN[r.n] || String(r.n)),
        this.el("span", "prog-title", r.title),
        this.el("span", "prog-status", r.statusText));
      act.appendChild(head);
      const bar = this.el("div", "prog-bar");
      const fill = this.el("div", "prog-bar-fill");
      fill.style.width = (r.total ? Math.min(100, Math.round((r.done / r.total) * 100)) : 0) + "%";
      bar.appendChild(fill);
      act.appendChild(bar);
      const facts = this.el("dl", "prog-facts");
      const fact = (k, v) => facts.append(this.el("dt", "", k), this.el("dd", "", v));
      fact("Mga gawain", r.done + " / " + r.total);
      fact("Paunang pagsusulit", r.pre ? r.pre.score + " / " + r.pre.max_score : "hindi pa");
      fact("Panghuling pagsusulit", r.post ? r.post.score + " / " + r.post.max_score + (r.tries > 1 ? " (pinakamataas sa " + r.tries + " subok)" : "") : "hindi pa");
      if (r.gain !== null) fact("Itinaas", (r.gain > 0 ? "+" : "") + r.gain + " puntos sa bahagdan");
      fact("Iskor sa laro", r.performance === null ? "wala pa" : r.performance + " / 100");
      act.appendChild(facts);
      if (r.note) act.appendChild(this.el("p", "prog-note", r.note));
      box.appendChild(act);
    });
    return true;
  },
};

window.Progress = Progress;
