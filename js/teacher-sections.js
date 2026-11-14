// =============================================================
// MACARIO — teacher-sections.js (Blocks 164, 165)
//
// Two cards on the Students tab.
//
// SECTIONS (Block 164). A section is a row of classes, which a teacher
// has always been allowed to write for herself (the policy "Teachers
// can manage their own classes"); until now nothing on the page made a
// second one. Here she makes one, renames the one on screen, deletes
// one that is empty, and moves the ticked students to another. Moving
// writes profiles.class_id, which no browser may do (schema v11), so it
// goes through the create-students function like every other change to
// an account.
//
// THE CLASS LIST (Block 165). A teacher already has her class list as
// a spreadsheet, made by the school and not for this game, so nothing
// about its shape is assumed: not which sheet, not where the names
// start, not whether the name is one column or two, not whether there
// is a section column at all. She uploads it as it is and says which
// column is which; the page guesses first, shows every row it would
// make an account for, and makes nothing until she presses the button.
// A row that is not a student (a title, "MALE", a total) is unticked by
// the guess and can be ticked or unticked by hand.
//
// READING THE FILE. An .xlsx is a zip of XML. It is read here with what
// the browser already has (DecompressionStream, DOMParser), about a
// hundred lines, rather than with a spreadsheet library of close to a
// megabyte: the dashboard needs the text of the cells of one sheet and
// nothing else a library offers. A .csv is read as text. The old .xls
// format is a different thing entirely and is refused with the way out
// (Save As .xlsx).
//
// Everything written is text, never HTML: a class list is somebody
// else's file.
// =============================================================

const TeacherSections = {
  MAX_ROWS: 400,
  CHUNK: 60,
  // Not a student: the lines a school's class list carries around the
  // names. Unticked by the guess; the teacher has the last word.
  NOT_A_NAME: /^(male|female|boys?|girls?|lalaki|babae|total|name|names|pangalan|learners?|students?|no\.?|adviser|teacher|section|grade)\b[\s:.]*$/i,

  init() {
    if (this.started) return;
    this.started = true;
    this.classes = [];
    const $ = (id) => document.getElementById(id);
    this.el = {
      card: $("sect"), name: $("sect-name"), rename: $("sect-rename"), del: $("sect-delete"),
      newName: $("sect-new-name"), create: $("sect-create"), status: $("sect-status"),
      firstName: $("first-sect-name"), firstCreate: $("first-sect-create"), firstStatus: $("first-sect-status"),
      moveTo: $("bulk-move-to"), move: $("bulk-move"),
      file: $("cl-file"), status2: $("cl-status"), map: $("cl-map"), sheet: $("cl-sheet"),
      colName: $("cl-col-name"), colFirst: $("cl-col-first"), colSection: $("cl-col-section"),
      start: $("cl-start"), preview: $("cl-preview"), groups: $("cl-groups"), go: $("cl-go"), count: $("cl-count"),
    };
    this.el.create.addEventListener("click", () => this.create(this.el.newName, this.el.status));
    this.el.firstCreate.addEventListener("click", () => this.create(this.el.firstName, this.el.firstStatus));
    this.el.rename.addEventListener("click", () => this.rename());
    this.el.del.addEventListener("click", () => this.remove());
    this.el.move.addEventListener("click", () => this.move());
    this.el.file.addEventListener("change", () => this.readFile());
    this.el.sheet.addEventListener("change", () => this.useSheet(Number(this.el.sheet.value)));
    [this.el.colName, this.el.colFirst, this.el.colSection, this.el.start].forEach((e) =>
      e.addEventListener("change", () => this.drawPreview(true)));
    this.el.go.addEventListener("click", () => this.makeAccounts());
  },

  status(el, text, kind) {
    el.textContent = text;
    el.className = "qe-status" + (kind ? " qe-" + kind : "");
  },

  // Called by teacher.js whenever the class on screen changes.
  show(cls, classes, admin) {
    this.init();
    this.cls = cls;
    this.classes = classes || [];
    this.admin = Boolean(admin);
    this.el.card.classList.remove("hidden");
    this.el.name.value = cls ? cls.class_name : "";
    // Block 166. An administrator sees every teacher's sections here and
    // makes or hands over one on the Admin page, where its teacher is
    // chosen; a section made here would have nobody to belong to.
    document.querySelectorAll(".sect-own").forEach((e) => e.classList.toggle("hidden", this.admin));
    this.el.moveTo.innerHTML = "";
    this.classes.filter((c) => !cls || c.id !== cls.id).forEach((c) => {
      const o = document.createElement("option");
      o.value = c.id;
      o.textContent = c.class_name;
      this.el.moveTo.appendChild(o);
    });
    const many = this.classes.length > 1;
    this.el.moveTo.classList.toggle("hidden", !many);
    this.el.move.classList.toggle("hidden", !many);
    if (this.grid) this.drawPreview(false);
  },

  cleanName(v) {
    return String(v || "").replace(/\s+/g, " ").trim().slice(0, 80);
  },

  // join_code has been in the table since schema v1 and is not null; no
  // screen asks a student for it (CLAUDE.md, Standing decisions), so it
  // is only made unlikely to repeat.
  joinCode() {
    const a = new Uint32Array(2);
    crypto.getRandomValues(a);
    return "SEC-" + (a[0].toString(36) + a[1].toString(36)).toUpperCase().slice(0, 10);
  },

  async insertSection(name) {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return { error: "NOT_SIGNED_IN" };
    const { data, error } = await sb.from("classes")
      .insert({ teacher_id: session.user.id, class_name: name, join_code: this.joinCode() })
      .select("id, class_name, join_code").single();
    return error ? { error: error.message } : { data };
  },

  async create(input, status) {
    const name = this.cleanName(input.value);
    if (!name) return this.status(status, "Type the section's name first (for example Grade 8 - Bonifacio).", "error");
    if (this.classes.some((c) => c.class_name.toLowerCase() === name.toLowerCase())) {
      return this.status(status, "You already have a section with that name.", "error");
    }
    this.status(status, "Making the section...");
    const res = await this.insertSection(name);
    if (res.error) return this.status(status, "Could not make the section. Check the internet connection and try again.", "error");
    input.value = "";
    this.status(status, "Section made: " + res.data.class_name + ". Make its students' accounts below.", "ok");
    await TeacherDash.reloadClasses(res.data.id);
  },

  async rename() {
    const name = this.cleanName(this.el.name.value);
    if (!this.cls || !name || name === this.cls.class_name) return;
    const { error } = await sb.from("classes").update({ class_name: name }).eq("id", this.cls.id);
    if (error) return this.status(this.el.status, "Could not rename the section. Try again.", "error");
    this.status(this.el.status, "Renamed to " + name + ".", "ok");
    await TeacherDash.reloadClasses(this.cls.id);
  },

  // Only an empty section. The database would let a section with
  // students go and leave them in no section at all (class_id set null),
  // where no teacher can see them: counted first, archived ones too.
  async remove() {
    if (!this.cls) return;
    const { count, error } = await sb.from("profiles").select("id", { count: "exact", head: true }).eq("class_id", this.cls.id);
    if (error) return this.status(this.el.status, "Could not check the section. Try again.", "error");
    if (count > 0) {
      return this.status(this.el.status, "This section still has " + count + " student" + (count === 1 ? "" : "s") +
        " (archived ones count). Move them to another section first.", "error");
    }
    if (this.classes.length < 2) return this.status(this.el.status, "This is your only section.", "error");
    if (!window.confirm("Delete the empty section " + this.cls.class_name + "?")) return;
    const { error: delErr } = await sb.from("classes").delete().eq("id", this.cls.id);
    if (delErr) return this.status(this.el.status, "Could not delete the section. Try again.", "error");
    this.status(this.el.status, "Section deleted.", "ok");
    await TeacherDash.reloadClasses();
  },

  async move() {
    const rows = TeacherDash.pickedRows();
    const to = this.classes.find((c) => c.id === this.el.moveTo.value);
    const status = document.getElementById("bulk-status");
    if (!rows.length || !to) return this.status(status, "Tick the students to move first.", "error");
    if (!window.confirm("Move " + rows.length + " student" + (rows.length === 1 ? "" : "s") + " to " + to.class_name +
      "?\n\nTheir codes, passwords, progress and scores stay as they are.")) return;
    this.status(status, "Moving...");
    const res = await TeacherAccounts.call({ action: "move", student_ids: rows.map((r) => r.id), class_id: to.id });
    if (res.error || !res.data) return this.status(status, TeacherAccounts.explain(res.error), "error");
    this.status(status, res.data.moved + " moved to " + to.class_name + ".", "ok");
    TeacherDash.clearPicked();
    await TeacherDash.reload();
  },

  // -----------------------------------------------------------
  // Reading a class list
  // -----------------------------------------------------------

  async readFile() {
    const f = this.el.file.files && this.el.file.files[0];
    this.grid = null;
    this.el.map.classList.add("hidden");
    if (!f) return;
    this.status(this.el.status2, "Reading " + f.name + "...");
    try {
      const buf = new Uint8Array(await f.arrayBuffer());
      const zip = buf[0] === 0x50 && buf[1] === 0x4b;
      if (!zip && buf[0] === 0xd0 && buf[1] === 0xcf) throw new Error("OLD_XLS");
      this.sheets = zip ? await this.readXlsx(buf) : [{ name: f.name, rows: this.readCsv(new TextDecoder("utf-8").decode(buf)) }];
    } catch (e) {
      console.error("Class list not read:", e);
      return this.status(this.el.status2, e.message === "OLD_XLS"
        ? "This is the old Excel format (.xls). Open it in Excel, choose Save As, Excel Workbook (.xlsx), and upload that."
        : "Could not read this file. Upload an Excel workbook (.xlsx) or a .csv.", "error");
    }
    this.sheets = this.sheets.filter((s) => s.rows.some((r) => r.some(Boolean)));
    if (!this.sheets.length) return this.status(this.el.status2, "The file has no text in it.", "error");
    this.el.sheet.innerHTML = "";
    this.sheets.forEach((s, i) => {
      const o = document.createElement("option");
      o.value = String(i);
      o.textContent = s.name;
      this.el.sheet.appendChild(o);
    });
    this.el.sheet.parentElement.classList.toggle("hidden", this.sheets.length < 2);
    this.status(this.el.status2, "");
    this.el.map.classList.remove("hidden");
    this.useSheet(0);
  },

  readCsv(text) {
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    // The separator: whichever of the three is commonest in the first
    // lines, outside quotes (a name is often "Lopez, Carla" in a file
    // separated by semicolons).
    const head = text.split(/\r?\n/, 8).join("\n").replace(/"[^"]*"/g, "");
    const sep = [",", ";", "\t"].sort((a, b) => head.split(b).length - head.split(a).length)[0];
    const rows = [];
    let row = [], cell = "", quoted = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (quoted) {
        if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (ch === '"') quoted = false;
        else cell += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === sep) { row.push(cell); cell = ""; }
      else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); rows.push(row); row = []; cell = "";
      } else cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows.map((r) => r.map((c) => this.cleanName(c)));
  },

  // The files of a zip, by name, inflated on demand. Sizes and offsets
  // are read from the central directory at the end, the one place they
  // are always right (a streamed zip leaves them out of the local
  // headers).
  async unzip(buf) {
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    let end = buf.length - 22;
    while (end >= 0 && view.getUint32(end, true) !== 0x06054b50) end--;
    if (end < 0) throw new Error("NOT_A_ZIP");
    const count = view.getUint16(end + 10, true);
    let at = view.getUint32(end + 16, true);
    const files = {};
    const dec = new TextDecoder("utf-8");
    for (let i = 0; i < count && view.getUint32(at, true) === 0x02014b50; i++) {
      const method = view.getUint16(at + 10, true);
      const size = view.getUint32(at + 20, true);
      const nameLen = view.getUint16(at + 28, true);
      const extraLen = view.getUint16(at + 30, true);
      const commentLen = view.getUint16(at + 32, true);
      const local = view.getUint32(at + 42, true);
      const name = dec.decode(buf.subarray(at + 46, at + 46 + nameLen));
      files[name] = { method, size, local };
      at += 46 + nameLen + extraLen + commentLen;
    }
    return async (name) => {
      const f = files[name];
      if (!f) return null;
      const dataAt = f.local + 30 + view.getUint16(f.local + 26, true) + view.getUint16(f.local + 28, true);
      const raw = buf.subarray(dataAt, dataAt + f.size);
      if (f.method === 0) return dec.decode(raw);
      if (f.method !== 8 || typeof DecompressionStream === "undefined") throw new Error("CANNOT_INFLATE");
      const stream = new Blob([raw]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      return await new Response(stream).text();
    };
  },

  async readXlsx(buf) {
    const read = await this.unzip(buf);
    const xml = async (name) => {
      const text = await read(name);
      return text ? new DOMParser().parseFromString(text, "application/xml") : null;
    };
    const tags = (node, tag) => Array.from(node.getElementsByTagNameNS("*", tag));
    const book = await xml("xl/workbook.xml");
    if (!book) throw new Error("NOT_A_WORKBOOK");
    const rels = await xml("xl/_rels/workbook.xml.rels");
    const target = {};
    if (rels) tags(rels, "Relationship").forEach((r) => { target[r.getAttribute("Id")] = r.getAttribute("Target"); });
    const sst = await xml("xl/sharedStrings.xml");
    // A string's text is every t under it but the phonetic guides' (rPh).
    const textOf = (node) => tags(node, "t").filter((t) => t.parentNode.localName !== "rPh").map((t) => t.textContent).join("");
    const shared = sst ? tags(sst, "si").map(textOf) : [];
    const colOf = (ref) => {
      let n = 0;
      for (const ch of String(ref || "").toUpperCase()) {
        if (ch < "A" || ch > "Z") break;
        n = n * 26 + (ch.charCodeAt(0) - 64);
      }
      return n - 1;
    };
    const sheets = [];
    for (const s of tags(book, "sheet")) {
      const rid = s.getAttribute("r:id") || s.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id");
      let path = target[rid] || "";
      path = path.startsWith("/") ? path.slice(1) : "xl/" + path;
      const doc = await xml(path);
      if (!doc) continue;
      const rows = [];
      tags(doc, "row").slice(0, this.MAX_ROWS * 2).forEach((r) => {
        const out = [];
        tags(r, "c").forEach((c, i) => {
          const col = c.getAttribute("r") ? colOf(c.getAttribute("r")) : i;
          const type = c.getAttribute("t");
          const v = tags(c, "v")[0];
          let text = "";
          if (type === "s") text = shared[Number(v && v.textContent)] || "";
          else if (type === "inlineStr") text = textOf(c);
          else text = v ? v.textContent : "";
          if (col >= 0 && col < 60) out[col] = this.cleanName(text);
        });
        const at = Number(r.getAttribute("r")) - 1;
        rows[at >= 0 ? at : rows.length] = Array.from(out, (x) => x || "");
      });
      sheets.push({ name: s.getAttribute("name") || "Sheet", rows: Array.from(rows, (x) => x || []) });
    }
    return sheets;
  },

  // -----------------------------------------------------------
  // Which column is which
  // -----------------------------------------------------------

  colLetter(i) {
    let s = "";
    for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
    return s;
  },

  looksLikeName(v) {
    return /[A-Za-zÀ-ɏ]{2,}/.test(v) && !/\d{3,}/.test(v) && v.length >= 3 && v.length <= 80 && !this.NOT_A_NAME.test(v);
  },

  useSheet(i) {
    this.grid = this.sheets[i].rows.slice(0, this.MAX_ROWS);
    const width = this.grid.reduce((m, r) => Math.max(m, r.length), 0);
    // The header: the first of the top rows with a cell that says what a
    // name column is called. None is fine; the columns are then guessed
    // from what they hold.
    let head = -1;
    for (let r = 0; r < Math.min(this.grid.length, 20) && head < 0; r++) {
      if (this.grid[r].some((c) => /name|pangalan|learner|student/i.test(c))) head = r;
    }
    const title = (c) => (head >= 0 && this.grid[head][c]) || "";
    const score = (c) => this.grid.slice(head + 1).filter((r) => this.looksLikeName(r[c] || "")).length;
    const find = (re) => { for (let c = 0; c < width; c++) if (re.test(title(c))) return c; return -1; };
    let nameCol = find(/^(full\s*)?name|pangalan|learner|student|last\s*name|surname|apelyido/i);
    if (nameCol < 0) nameCol = Array.from({ length: width }, (_, c) => c).sort((a, b) => score(b) - score(a))[0] || 0;
    let firstCol = find(/first\s*name|given|pangalan$/i);
    if (firstCol === nameCol || !/last|surname|apelyido/i.test(title(nameCol))) firstCol = -1;
    const sectionCol = find(/section|seksyon|pangkat|class/i);
    const fill = (sel, none, picked) => {
      sel.innerHTML = "";
      if (none) {
        const o = document.createElement("option");
        o.value = "-1";
        o.textContent = none;
        sel.appendChild(o);
      }
      for (let c = 0; c < width; c++) {
        const o = document.createElement("option");
        o.value = String(c);
        const sample = title(c) || (this.grid.find((r) => r[c]) || [])[c] || "";
        o.textContent = "Column " + this.colLetter(c) + (sample ? ": " + sample.slice(0, 28) : "");
        sel.appendChild(o);
      }
      sel.value = String(picked);
    };
    fill(this.el.colName, null, nameCol);
    fill(this.el.colFirst, "No: the name is in one column", firstCol);
    fill(this.el.colSection, "No section column: all go to the section on screen", sectionCol);
    this.el.start.value = String(head + 2);
    this.drawPreview(true);
  },

  // The rows as the choices read them: { name, section, on }.
  readRows() {
    const nameCol = Number(this.el.colName.value);
    const firstCol = Number(this.el.colFirst.value);
    const sectionCol = Number(this.el.colSection.value);
    const from = Math.max(1, Math.floor(Number(this.el.start.value)) || 1) - 1;
    const out = [];
    let lastSection = "";
    this.grid.forEach((r, i) => {
      if (i < from) return;
      const last = r[nameCol] || "";
      const first = firstCol >= 0 ? r[firstCol] || "" : "";
      const name = this.cleanName(first && last ? last + ", " + first : last || first);
      // A merged section cell holds its text in its first row only.
      if (sectionCol >= 0 && r[sectionCol]) lastSection = r[sectionCol];
      if (!name) return;
      out.push({ row: i + 1, name, section: sectionCol >= 0 ? lastSection : "", on: this.looksLikeName(name) });
    });
    return out;
  },

  drawPreview(reread) {
    if (!this.grid) return;
    if (reread || !this.rows) this.rows = this.readRows();
    const box = this.el.preview;
    box.innerHTML = "";
    this.rows.forEach((r) => {
      const label = document.createElement("label");
      label.className = "cl-row" + (r.on ? "" : " cl-off");
      const tick = document.createElement("input");
      tick.type = "checkbox";
      tick.checked = r.on;
      tick.addEventListener("change", () => {
        r.on = tick.checked;
        label.classList.toggle("cl-off", !r.on);
        this.drawGroups();
      });
      const n = document.createElement("span");
      n.className = "cl-n";
      n.textContent = "Row " + r.row;
      const name = document.createElement("span");
      name.className = "cl-name";
      name.textContent = r.name;
      const sec = document.createElement("span");
      sec.className = "cl-sec";
      sec.textContent = r.section;
      label.append(tick, n, name, sec);
      box.appendChild(label);
    });
    this.drawGroups();
  },

  // "Grade 8 - Rizal" and "rizal" are the same section: the whole name,
  // or its last word.
  matchSection(value) {
    const v = value.toLowerCase().replace(/\s+/g, " ").trim();
    const lastWord = (s) => (s.toLowerCase().match(/[a-z0-9]+/g) || []).pop() || "";
    return this.classes.find((c) => c.class_name.toLowerCase() === v) ||
      this.classes.find((c) => lastWord(c.class_name) === lastWord(v) && lastWord(v).length > 1) || null;
  },

  // One line per section the ticked rows name: where its students go,
  // and the start of their codes.
  drawGroups() {
    const on = this.rows.filter((r) => r.on);
    const by = new Map();
    on.forEach((r) => { if (!by.has(r.section)) by.set(r.section, []); by.get(r.section).push(r); });
    const old = new Map((this.groups || []).map((g) => [g.value, g]));
    this.groups = [...by.entries()].map(([value, rows]) => {
      const cls = value ? this.matchSection(value) : this.cls;
      const was = old.get(value);
      return { value, rows, cls, start: was && was.typed ? was.start : null, typed: Boolean(was && was.typed) };
    });
    const box = this.el.groups;
    box.innerHTML = "";
    this.groups.forEach((g) => {
      const line = document.createElement("div");
      line.className = "cl-group";
      const what = document.createElement("span");
      const n = g.rows.length + " student" + (g.rows.length === 1 ? "" : "s");
      if (g.cls) what.textContent = n + " into " + g.cls.class_name + (g.value && g.value !== g.cls.class_name ? " (\"" + g.value + "\" in the file)" : "");
      else if (this.admin) what.textContent = n + " in \"" + g.value + "\": no such section. Make it on the Admin page first; these are left out.";
      else what.textContent = n + " into a new section, " + g.value;
      line.appendChild(what);
      if (g.cls || !this.admin) {
        const label = document.createElement("label");
        label.textContent = "Code start ";
        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 12;
        input.className = "cl-start";
        input.value = g.start || "";
        input.placeholder = "...";
        input.addEventListener("input", () => {
          input.value = input.value.toLowerCase().replace(/[^a-z]/g, "");
          g.start = input.value;
          g.typed = true;
        });
        g.input = input;
        label.appendChild(input);
        line.appendChild(label);
      }
      box.appendChild(line);
    });
    this.el.count.textContent = on.length + " of " + this.rows.length + " rows ticked.";
    this.el.go.disabled = on.length === 0;
    this.fillStarts();
  },

  // Each section's code start: the one its accounts already use, else its
  // name's last word, made different from every other start in sight.
  async fillStarts() {
    const ids = this.groups.filter((g) => g.cls).map((g) => g.cls.id);
    const used = {};
    if (ids.length) {
      const { data } = await sb.from("profiles").select("class_id, full_name").in("class_id", ids).eq("role", "student");
      (data || []).forEach((p) => {
        const m = /^([a-z]{2,12})-\d+$/.exec(p.full_name || "");
        if (m) used[p.class_id] = m[1];
      });
    }
    const taken = new Set(Object.values(used));
    this.groups.forEach((g) => {
      if (g.typed || !g.input) return;
      let start = g.cls && used[g.cls.id];
      if (!start) {
        start = TeacherAccounts.suggestStart({ class_name: g.cls ? g.cls.class_name : g.value });
        while (taken.has(start) && start.length < 12) start += "x";
      }
      taken.add(start);
      g.start = start;
      g.input.value = start;
    });
  },

  async makeAccounts() {
    const groups = (this.groups || []).filter((g) => g.cls || !this.admin);
    const total = groups.reduce((n, g) => n + g.rows.length, 0);
    if (!total) return;
    const bad = groups.find((g) => !/^[a-z]{2,12}$/.test(g.start || ""));
    if (bad) return this.status(this.el.status2, TeacherAccounts.explain("BAD_PREFIX") + " (" + (bad.cls ? bad.cls.class_name : bad.value) + ")", "error");
    const fresh = groups.filter((g) => !g.cls).map((g) => g.value);
    if (!window.confirm("Make " + total + " account" + (total === 1 ? "" : "s") + "?" +
      (fresh.length ? "\n\nNew sections: " + fresh.join(", ") + "." : "") +
      "\n\nEach gets a code and a password, shown once on the slips.")) return;
    this.el.go.disabled = true;
    let made = 0;
    const problems = [];
    for (const g of groups) {
      const label = g.cls ? g.cls.class_name : g.value;
      if (!g.cls) {
        const res = await this.insertSection(this.cleanName(g.value));
        if (res.error) { problems.push(label + ": the section could not be made"); continue; }
        g.cls = res.data;
      }
      for (let i = 0; i < g.rows.length; i += this.CHUNK) {
        const names = g.rows.slice(i, i + this.CHUNK).map((r) => r.name);
        this.status(this.el.status2, "Making accounts for " + label + "... " + made + " of " + total + " done. This can take a few minutes.");
        const res = await TeacherAccounts.call({ action: "create", class_id: g.cls.id, prefix: g.start, count: names.length, names });
        const accounts = (res.data && res.data.accounts) || [];
        TeacherAccounts.addMade(accounts, g.cls.class_name);
        made += accounts.length;
        if (accounts.length < names.length) {
          problems.push(label + ": " + (res.error ? TeacherAccounts.explain(res.error) : "stopped after " + accounts.length + " of this batch"));
          break;
        }
      }
    }
    this.el.go.disabled = false;
    this.status(this.el.status2, made + " of " + total + " accounts made. Their slips are under Student accounts, above: print them now." +
      (problems.length ? " Not finished: " + problems.join("; ") + "." : ""), problems.length ? "error" : "ok");
    if (made) {
      this.grid = null;
      this.rows = null;
      this.el.map.classList.add("hidden");
      this.el.file.value = "";
      await TeacherDash.reloadClasses(TeacherDash.classId());
    }
  },
};

window.TeacherSections = TeacherSections;
