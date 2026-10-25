// =============================================================
// MACARIO — teacher-accounts.js (Block 132)
//
// The Students tab's accounts card: a teacher makes her class's
// accounts (a code start, how many), sees each code and password once,
// prints them as slips to cut and hand out, and gives one student a new
// password from the student card. Since Block 150 it also archives,
// restores and deletes the students ticked on the roster (bulk; the
// ticking is teacher.js's): archive keeps everything and stops the
// login, delete is only for accounts never used, checked again by the
// function against every table.
//
// Every change goes through the create-students function
// (db/functions/create-students), never through a table: making a login
// needs the project's secret key, which the function holds and this
// page never sees. The function checks the caller is a teacher and the
// class is hers; this file only asks.
//
// THE CODE START. Accounts are <start>-01, <start>-02 and so on, and a
// student types that at the game's login (game.js, loginEmail). The
// start is lowercase letters only, so the login can read "Rizal 7" as
// rizal-07. A class that already has accounts of that form is offered
// its own start again, and the function numbers on from the highest; a
// start another class uses is refused there.
//
// PASSWORDS ARE SHOWN ONCE. The function returns them and nothing keeps
// them: not the database (Supabase stores a hash), not this page after a
// reload. The slips and the spreadsheet are the teacher's only copy,
// which is why the card says so before anything else.
//
// Everything written is text, never HTML.
// =============================================================

const TeacherAccounts = {
  FUNCTION: "create-students",
  MAX: 60,

  init() {
    if (this.started) return;
    this.started = true;
    this.el = {
      card: document.getElementById("acct"),
      prefix: document.getElementById("acct-prefix"),
      count: document.getElementById("acct-count"),
      create: document.getElementById("acct-create"),
      hint: document.getElementById("acct-hint"),
      status: document.getElementById("acct-status"),
      result: document.getElementById("acct-result"),
      slips: document.getElementById("acct-slips"),
      print: document.getElementById("acct-print"),
      csv: document.getElementById("acct-csv"),
      resetStatus: document.getElementById("sc-reset-status"),
    };
    this.made = [];
    this.el.create.addEventListener("click", () => this.create());
    this.el.print.addEventListener("click", () => this.print());
    this.el.csv.addEventListener("click", () => this.downloadCsv());
    this.el.prefix.addEventListener("input", () => {
      const clean = this.el.prefix.value.toLowerCase().replace(/[^a-z]/g, "");
      if (clean !== this.el.prefix.value) this.el.prefix.value = clean;
      this.drawHint();
    });
  },

  // Called by teacher.js whenever a class's students are loaded.
  show(cls, students) {
    this.init();
    this.cls = cls;
    this.students = students || [];
    const own = this.ownStart();
    if (own) {
      this.el.prefix.value = own.start;
    } else if (!this.el.prefix.value) {
      this.el.prefix.value = this.suggestStart(cls);
    }
    if (this.students.length) this.el.count.value = "5";
    this.el.card.classList.remove("hidden");
    this.drawHint();
  },

  // The start this class's accounts already use, and its highest number.
  ownStart() {
    const seen = {};
    this.students.forEach((s) => {
      const m = /^([a-z]{2,12})-(\d+)$/.exec(s.full_name || "");
      if (m) seen[m[1]] = Math.max(seen[m[1]] || 0, Number(m[2]));
    });
    const starts = Object.keys(seen);
    if (!starts.length) return null;
    starts.sort((a, b) => seen[b] - seen[a]);
    return { start: starts[0], last: seen[starts[0]] };
  },

  // From the class name: its last word of letters ("Grade 8 - Rizal",
  // "MAC8-RIZAL" give rizal), else "klase".
  suggestStart(cls) {
    const words = String((cls && cls.class_name) || "").toLowerCase().match(/[a-z]{2,}/g) || [];
    const w = words.length ? words[words.length - 1] : "klase";
    return w.slice(0, 12);
  },

  drawHint() {
    const start = this.el.prefix.value;
    if (!/^[a-z]{2,12}$/.test(start)) {
      this.el.hint.textContent = "The code start is 2 to 12 letters, no spaces or numbers (for example rizal).";
      return;
    }
    const own = this.ownStart();
    const from = own && own.start === start ? own.last + 1 : 1;
    const pad = (n) => String(n).padStart(2, "0");
    this.el.hint.textContent = "The next codes will be " + start + "-" + pad(from) + ", " + start + "-" + pad(from + 1) +
      ", and so on. Students type their code and password at the game's login.";
  },

  // supabase-js's invoke, with the function's own error word read back
  // out of a refusal (it arrives as a FunctionsHttpError with the body
  // still unread).
  async call(body) {
    const { data, error } = await sb.functions.invoke(this.FUNCTION, { body });
    if (!error) return { data };
    let word = null;
    try {
      if (error.context && typeof error.context.json === "function") {
        const b = await error.context.json();
        word = b && b.error;
        if (b && b.accounts) return { data: b, partial: true };
      }
    } catch (e) { /* not JSON */ }
    return { error: word || error.message || "FAILED" };
  },

  explain(word) {
    return ({
      PREFIX_IN_USE: "Another class already uses that code start. Choose another (for example the section's name).",
      BAD_PREFIX: "The code start is 2 to 12 letters, no spaces or numbers.",
      BAD_COUNT: "Choose between 1 and " + this.MAX + " accounts at a time.",
      NOT_YOUR_CLASS: "This class is not linked to your account.",
      NOT_YOUR_STUDENT: "That student is not in your class.",
      NOT_A_TEACHER: "Only a teacher account can do this.",
      NOT_SIGNED_IN: "You have been logged out. Reload the page and log in again.",
    })[word] || "Could not reach the server. Check the internet connection and try again.";
  },

  setStatus(el, text, kind) {
    el.textContent = text;
    el.className = "qe-status" + (kind ? " qe-" + kind : "");
  },

  async create() {
    const start = this.el.prefix.value;
    const count = Math.floor(Number(this.el.count.value));
    if (!/^[a-z]{2,12}$/.test(start)) return this.setStatus(this.el.status, this.explain("BAD_PREFIX"), "error");
    if (!(count >= 1 && count <= this.MAX)) return this.setStatus(this.el.status, this.explain("BAD_COUNT"), "error");
    if (!this.cls) return;
    this.el.create.disabled = true;
    this.setStatus(this.el.status, "Making " + count + " account" + (count === 1 ? "" : "s") + "... this can take a minute.");
    const res = await this.call({ action: "create", class_id: this.cls.id, prefix: start, count });
    this.el.create.disabled = false;
    const accounts = (res.data && res.data.accounts) || [];
    if (accounts.length) {
      this.made = this.made.concat(accounts);
      this.drawSlips();
    }
    if (res.error && !accounts.length) {
      this.setStatus(this.el.status, this.explain(res.error), "error");
    } else if (res.partial || (res.data && res.data.error)) {
      this.setStatus(this.el.status, accounts.length + " of " + count + " accounts were made before an error. Print these, then try again for the rest.", "error");
    } else {
      this.setStatus(this.el.status, accounts.length + " account" + (accounts.length === 1 ? "" : "s") + " made.", "ok");
    }
    if (accounts.length && window.TeacherDash) await TeacherDash.reload();
  },

  drawSlips() {
    this.el.slips.innerHTML = "";
    const cls = (this.cls && this.cls.class_name) || "";
    this.made.forEach((a) => this.el.slips.appendChild(this.slip(a.code, a.password, cls)));
    this.el.result.classList.toggle("hidden", this.made.length === 0);
  },

  slip(code, password, cls) {
    const box = document.createElement("div");
    box.className = "slip";
    const rows = [
      ["MACARIO", cls],
      ["Code", code],
      ["Password", password],
      ["Name", ""],
    ];
    rows.forEach(([k, v], i) => {
      const line = document.createElement("div");
      line.className = i === 0 ? "slip-head" : "slip-line" + (k === "Name" ? " slip-name" : "");
      const a = document.createElement("span");
      a.className = "slip-k";
      a.textContent = k;
      const b = document.createElement("span");
      b.className = "slip-v";
      b.textContent = v;
      line.append(a, b);
      box.appendChild(line);
    });
    const how = document.createElement("div");
    how.className = "slip-how";
    how.textContent = "Mag-log in gamit ang code at password na ito. Maaari mong palitan ang password sa Settings.";
    box.appendChild(how);
    return box;
  },

  // Only the slips are printed (body.printing-slips, teacher.css).
  print() {
    document.body.classList.add("printing-slips");
    const done = () => {
      document.body.classList.remove("printing-slips");
      window.removeEventListener("afterprint", done);
    };
    window.addEventListener("afterprint", done);
    if (window.TeacherDash) TeacherDash.markSlipsPrinted();
    window.print();
    // Some browsers never fire afterprint; the class is harmless on screen
    // only while the print dialog is up.
    setTimeout(done, 1000);
  },

  downloadCsv() {
    if (!this.made.length) return;
    const lines = ["code,password,name"].concat(this.made.map((a) => a.code + "," + a.password + ","));
    const blob = new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "macario-accounts-" + (this.made[0].code.split("-")[0]) + "-" +
      new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    if (window.TeacherDash) TeacherDash.markSlipsPrinted();
  },

  // Block 150. Archive, restore or delete the students in rows (the
  // roster's own rows), saying each result in status. Resolves true once
  // anything changed, so the page reloads the class.
  async bulk(action, rows, status) {
    this.init();
    const codes = rows.map((r) => r.name);
    const list = codes.length > 12 ? codes.slice(0, 12).join(", ") + " and " + (codes.length - 12) + " more" : codes.join(", ");
    const n = rows.length;
    const them = n === 1 ? "this student" : "these " + n + " students";
    if (action === "archive") {
      if (!window.confirm("Archive " + them + "?\n\n" + list + "\n\nThey will not be able to log in, and they leave the roster and the averages. " +
        "Nothing they did is deleted; Show archived, then Restore, brings them back.")) return false;
    } else if (action === "restore") {
      if (!window.confirm("Restore " + them + "?\n\n" + list + "\n\nThey can log in again with the same password, and return to the roster.")) return false;
    } else {
      // Typing the number is the second step a delete needs: it cannot be
      // undone, and a teacher clicking through two dialogs by habit would
      // otherwise get it.
      const typed = window.prompt("Delete " + them + " for good?\n\n" + list + "\n\nThey have never been used. " +
        "Their codes and passwords stop working and cannot be brought back.\n\nType " + n + " to delete.");
      if (typed === null) return false;
      if (String(typed).trim() !== String(n)) {
        this.setStatus(status, "Nothing deleted: the number typed was not " + n + ".", "error");
        return false;
      }
    }
    const verb = { archive: "Archiving", restore: "Restoring", delete: "Deleting" }[action];
    this.setStatus(status, verb + " " + n + " account" + (n === 1 ? "" : "s") + "...");
    const res = await this.call({ action, student_ids: rows.map((r) => r.id) });
    const results = (res.data && res.data.results) || [];
    if (res.error || !results.length) {
      this.setStatus(status, this.explain(res.error), "error");
      return false;
    }
    const good = results.filter((r) => r.ok);
    const kept = results.filter((r) => r.error === "HAS_DATA").map((r) => r.code);
    const failed = results.filter((r) => !r.ok && r.error !== "HAS_DATA").map((r) => r.code);
    const past = { archive: "archived", restore: "restored", delete: "deleted" }[action];
    let text = good.length + " of " + n + " " + past + ".";
    if (kept.length) text += " Not deleted, because they have played (archive them instead): " + kept.join(", ") + ".";
    if (failed.length) text += " Could not be " + past + ", try again: " + failed.join(", ") + ".";
    this.setStatus(status, text, kept.length || failed.length ? "error" : "ok");
    return good.length > 0;
  },

  // From the student card. The new password is shown there and added to
  // the slips, so it can be printed like the others.
  async resetPassword(studentId, code) {
    this.init();
    if (!window.confirm("Give " + code + " a new password? The old one will stop working.")) return;
    this.setStatus(this.el.resetStatus, "Making a new password...");
    const res = await this.call({ action: "reset", student_id: studentId });
    if (res.error || !res.data || !res.data.password) {
      this.setStatus(this.el.resetStatus, this.explain(res.error), "error");
      return;
    }
    this.setStatus(this.el.resetStatus, "New password for " + res.data.code + ": " + res.data.password +
      ". Write it down now; it is also on the slips under Students.", "ok");
    this.made = this.made.filter((a) => a.code !== res.data.code).concat([{ code: res.data.code, password: res.data.password }]);
    this.drawSlips();
  },
};

window.TeacherAccounts = TeacherAccounts;
