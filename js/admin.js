// =============================================================
// MACARIO — admin.js (Block 166)
//
// The administrator's page. An administrator makes the teachers'
// accounts, gives one a new password, archives or restores one, makes
// a section for a teacher and hands a section to another. With this
// the game runs without its developers: the one thing still asked of
// them is to make an administrator.
//
// WHAT IS READ. Two queries, as the dashboard reads (scoped queries,
// stitched here): every profile's id, role, name, section and archived
// mark, and every class. Schema v18's two policies allow an
// administrator exactly that. No score, save or answer is asked for,
// and none would be given.
//
// WHAT IS WRITTEN. Nothing from here. Every change is a call to the
// create-students function, which checks the caller's role itself; the
// buttons on this page are a courtesy, the function is the rule.
//
// A new password is shown once and kept nowhere, as a student's is.
// Everything written to the page is text, never HTML.
// =============================================================

const Admin = {
  FUNCTION: "create-students",

  async init() {
    const $ = (id) => document.getElementById(id);
    this.el = {
      gate: $("gate"), gateMsg: $("gate-msg"), dash: $("dash"), who: $("dash-teacher-name"),
      err: $("load-error"),
      tName: $("t-name"), tEmail: $("t-email"), tCreate: $("t-create"), tStatus: $("t-status"), tMade: $("t-made"),
      tBody: $("t-body"), tCount: $("t-count"), tRow: $("t-row-status"),
      sName: $("s-name"), sTeacher: $("s-teacher"), sCreate: $("s-create"), sStatus: $("s-status"), sBody: $("s-body"),
    };
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return this.bounce("Please log in first.", "index.html");
    const { data: profile } = await sb.from("profiles").select("id, role, full_name").eq("id", session.user.id).maybeSingle();
    if (!profile || profile.role !== "admin") {
      return this.bounce("This is not an administrator account.", profile && profile.role === "teacher" ? "teacher.html" : "index.html");
    }
    this.el.who.textContent = profile.full_name || "Administrator";
    this.el.gate.classList.add("hidden");
    this.el.dash.classList.remove("hidden");
    $("logout-btn").addEventListener("click", async () => {
      await sb.auth.signOut();
      window.location.replace("index.html");
    });
    this.el.tCreate.addEventListener("click", () => this.createTeacher());
    this.el.sCreate.addEventListener("click", () => this.createSection());
    await this.load();
  },

  bounce(reason, to) {
    this.el.gateMsg.textContent = reason;
    this.el.gateMsg.className = "error";
    setTimeout(() => window.location.replace(to), 1200);
  },

  status(el, text, kind) {
    el.textContent = text;
    el.className = "qe-status" + (kind ? " qe-" + kind : "");
  },

  // The function's own error word, read out of a refusal (as
  // teacher-accounts.js does).
  async call(body) {
    const { data, error } = await sb.functions.invoke(this.FUNCTION, { body });
    if (!error) return { data };
    let word = null;
    try {
      if (error.context && typeof error.context.json === "function") word = (await error.context.json()).error;
    } catch (e) { /* not JSON */ }
    return { error: word || "FAILED" };
  },

  explain(word) {
    return ({
      BAD_EMAIL: "That does not look like an email address.",
      BAD_NAME: "Type a name first.",
      EMAIL_IN_USE: "An account with that email already exists.",
      NOT_AN_ADMIN: "Only an administrator account can do this.",
      NOT_A_TEACHER: "Only an administrator account can do this.",
      NOT_A_TEACHER_ACCOUNT: "That account is not a teacher's.",
      NOT_SIGNED_IN: "You have been logged out. Reload the page and log in again.",
      BAD_ACTION: "The server has not been updated for this yet. Tell the game's developers.",
    })[word] || "Could not reach the server. Check the internet connection and try again.";
  },

  async load() {
    const [people, classes] = await Promise.all([
      sb.from("profiles").select("id, role, full_name, class_id, archived_at"),
      sb.from("classes").select("id, class_name, teacher_id").order("class_name"),
    ]);
    if (people.error || classes.error) {
      this.el.err.textContent = "Could not load the accounts. Check the internet connection and reload.";
      this.el.err.classList.remove("hidden");
      return;
    }
    this.el.err.classList.add("hidden");
    this.teachers = people.data.filter((p) => p.role === "teacher")
      .sort((a, b) => String(a.full_name || "").localeCompare(String(b.full_name || "")));
    this.classes = classes.data;
    this.studentsIn = {};
    people.data.forEach((p) => {
      if (p.role === "student" && p.class_id && !p.archived_at) this.studentsIn[p.class_id] = (this.studentsIn[p.class_id] || 0) + 1;
    });
    this.draw();
  },

  cell(text, cls) {
    const td = document.createElement("td");
    if (cls) td.className = cls;
    td.textContent = text;
    return td;
  },

  button(label, fn, cls) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = cls || "btn-secondary";
    b.textContent = label;
    b.addEventListener("click", fn);
    return b;
  },

  teacherOptions(select, picked) {
    select.innerHTML = "";
    this.teachers.filter((t) => !t.archived_at || t.id === picked).forEach((t) => {
      const o = document.createElement("option");
      o.value = t.id;
      o.textContent = t.full_name || "Teacher";
      select.appendChild(o);
    });
    if (picked) select.value = picked;
  },

  draw() {
    const active = this.teachers.filter((t) => !t.archived_at).length;
    this.el.tCount.textContent = active + " teacher" + (active === 1 ? "" : "s") +
      (active < this.teachers.length ? ", and " + (this.teachers.length - active) + " archived" : "") + ".";
    this.el.tBody.innerHTML = "";
    this.teachers.forEach((t) => {
      const own = this.classes.filter((c) => c.teacher_id === t.id);
      const tr = document.createElement("tr");
      if (t.archived_at) tr.className = "row-archived";
      tr.appendChild(this.cell(t.full_name || "Teacher", "cell-name"));
      tr.appendChild(this.cell(own.length ? own.map((c) => c.class_name).join(", ") : "None yet"));
      tr.appendChild(this.cell(String(own.reduce((n, c) => n + (this.studentsIn[c.id] || 0), 0))));
      tr.appendChild(this.cell(t.archived_at ? "Archived (cannot log in)" : "Active"));
      const act = document.createElement("td");
      act.className = "qe-actions";
      if (!t.archived_at) act.appendChild(this.button("New password", () => this.resetTeacher(t)));
      act.appendChild(this.button(t.archived_at ? "Restore" : "Archive", () => this.archiveTeacher(t)));
      tr.appendChild(act);
      this.el.tBody.appendChild(tr);
    });

    this.teacherOptions(this.el.sTeacher);
    this.el.sBody.innerHTML = "";
    this.classes.forEach((c) => {
      const tr = document.createElement("tr");
      tr.appendChild(this.cell(c.class_name, "cell-name"));
      tr.appendChild(this.cell(String(this.studentsIn[c.id] || 0)));
      const td = document.createElement("td");
      const select = document.createElement("select");
      select.setAttribute("aria-label", "Teacher of " + c.class_name);
      this.teacherOptions(select, c.teacher_id);
      td.appendChild(select);
      tr.appendChild(td);
      const act = document.createElement("td");
      act.appendChild(this.button("Hand over", () => this.assign(c, select.value)));
      tr.appendChild(act);
      this.el.sBody.appendChild(tr);
    });
  },

  async createTeacher() {
    const name = this.el.tName.value.replace(/\s+/g, " ").trim();
    const email = this.el.tEmail.value.trim().toLowerCase();
    if (!name) return this.status(this.el.tStatus, this.explain("BAD_NAME"), "error");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return this.status(this.el.tStatus, this.explain("BAD_EMAIL"), "error");
    this.el.tCreate.disabled = true;
    this.status(this.el.tStatus, "Making the account...");
    const res = await this.call({ action: "teacher-create", name, email });
    this.el.tCreate.disabled = false;
    if (res.error || !res.data || !res.data.password) return this.status(this.el.tStatus, this.explain(res.error), "error");
    this.el.tName.value = "";
    this.el.tEmail.value = "";
    this.status(this.el.tStatus, "Teacher account made.", "ok");
    this.showPassword(name, res.data.email, res.data.password);
    await this.load();
  },

  showPassword(name, email, password) {
    this.el.tMade.textContent = "Write this down now and give it to " + name + ". It is shown only this once.  Email: " +
      email + "   Password: " + password;
    this.el.tMade.classList.remove("hidden");
  },

  async resetTeacher(t) {
    if (!window.confirm("Give " + (t.full_name || "this teacher") + " a new password? The old one will stop working.")) return;
    this.status(this.el.tRow, "Making a new password...");
    const res = await this.call({ action: "teacher-reset", teacher_id: t.id });
    if (res.error || !res.data || !res.data.password) return this.status(this.el.tRow, this.explain(res.error), "error");
    this.status(this.el.tRow, "New password made; it is shown above.", "ok");
    this.showPassword(t.full_name || "the teacher", res.data.email, res.data.password);
  },

  async archiveTeacher(t) {
    const archive = !t.archived_at;
    const who = t.full_name || "this teacher";
    if (!window.confirm(archive
      ? "Archive " + who + "?\n\nShe will not be able to log in. Her sections, students and questions are kept; hand her sections to another teacher if a class is still running."
      : "Restore " + who + "? She can log in again with the same password.")) return;
    this.status(this.el.tRow, archive ? "Archiving..." : "Restoring...");
    const res = await this.call({ action: archive ? "teacher-archive" : "teacher-restore", teacher_id: t.id });
    if (res.error) return this.status(this.el.tRow, this.explain(res.error), "error");
    this.status(this.el.tRow, who + (archive ? " archived." : " restored."), "ok");
    await this.load();
  },

  async createSection() {
    const name = this.el.sName.value.replace(/\s+/g, " ").trim().slice(0, 80);
    const teacherId = this.el.sTeacher.value;
    if (!name) return this.status(this.el.sStatus, "Type the section's name first.", "error");
    if (!teacherId) return this.status(this.el.sStatus, "Make a teacher first.", "error");
    this.status(this.el.sStatus, "Making the section...");
    const res = await this.call({ action: "section-create", teacher_id: teacherId, class_name: name });
    if (res.error) return this.status(this.el.sStatus, this.explain(res.error), "error");
    this.el.sName.value = "";
    this.status(this.el.sStatus, "Section made: " + name + ".", "ok");
    await this.load();
  },

  async assign(c, teacherId) {
    if (!teacherId || teacherId === c.teacher_id) return;
    const to = this.teachers.find((t) => t.id === teacherId);
    if (!window.confirm("Hand " + c.class_name + " and its students to " + ((to && to.full_name) || "this teacher") + "?")) return;
    this.status(this.el.sStatus, "Handing over...");
    const res = await this.call({ action: "section-assign", class_id: c.id, teacher_id: teacherId });
    if (res.error) return this.status(this.el.sStatus, this.explain(res.error), "error");
    this.status(this.el.sStatus, c.class_name + " now belongs to " + ((to && to.full_name) || "the teacher") + ".", "ok");
    await this.load();
  },
};

document.addEventListener("DOMContentLoaded", () => Admin.init());
