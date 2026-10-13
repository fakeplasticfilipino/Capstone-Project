// =============================================================
// MACARIO — teacher.js (Block 4, teacher dashboard)
//
// Loads the logged-in teacher's classes, then for the selected
// class builds a roster of every enrolled student with their act
// progress and assessment results, plus class-level averages.
//
// ON THE QUERY APPROACH
// Supabase cannot cleanly join profiles to game_progress to
// act_progress to assessment_scores in one request while RLS is
// active. Rather than add a security definer RPC, which would mean
// another migration, this runs four scoped queries and stitches the
// results in JavaScript. RLS still enforces correctness on each
// query individually. At 40 to 50 students per section the extra
// round trips are irrelevant. If this ever becomes a bottleneck it
// converts to an RPC without changing any rendering code.
//
// THE LAYOUT (v2, after Block 38)
// Restyled as a light report page with a class toolbar, six summary
// figures each carrying its own n, and a roster that can be searched and
// sorted by any column. Act I's status, objectives and play time were
// added to the roster from act_progress columns the query can already
// read (schema v4). Searching and sorting happen on rows already fetched;
// nothing here adds a query or widens one beyond the teacher's own class.
//
// THE TABS (Block 132)
// The page was one long scroll; it is now five tabs, one job each
// (Overview, Students, Questions report, Edit tests, Talaan papers),
// with the act chosen once at the top for all of them. The overview
// adds Getting started (three steps, each ticked once done) and Needs
// attention; a row opens the student card, the numbers in sentences
// and a new password (js/teacher-accounts.js). Nothing it reports is
// computed differently: the same four queries feed every tab.
//
// SECURITY NOTE
// The role check below is a usability guard, not the security
// boundary. What actually prevents one teacher reading another
// class's data is the RLS policy set in the database. If the
// policies were removed, hiding this page would not protect
// anything.
// =============================================================

const TOTAL_ACTS = 4;

// ---- Elements ----
const gate = document.getElementById("gate");
const gateMsg = document.getElementById("gate-msg");
const dash = document.getElementById("dash");
const teacherNameEl = document.getElementById("dash-teacher-name");
const logoutBtn = document.getElementById("logout-btn");

const classPickerRow = document.getElementById("class-picker-row");
const classPicker = document.getElementById("class-picker");

const toolbarEl = document.getElementById("toolbar");
const classNameEl = document.getElementById("class-name");
const refreshBtn = document.getElementById("refresh-btn");
const exportBtn = document.getElementById("export-btn");
const updatedAtEl = document.getElementById("updated-at");

const summaryEl = document.getElementById("summary");
const stat = (id) => document.getElementById(id);

const rosterSection = document.getElementById("roster-section");
const rosterBody = document.getElementById("roster-body");
const rosterCountEl = document.getElementById("roster-count");
const rosterSearch = document.getElementById("roster-search");
const noMatchEl = document.getElementById("no-match");
const sortHeaders = document.querySelectorAll("#roster th[data-sort]");

const noClassEl = document.getElementById("no-class");
const noStudentsEl = document.getElementById("no-students");
const loadErrorEl = document.getElementById("load-error");
const loadingEl = document.getElementById("loading");
const attentionEl = document.getElementById("attention");
const stepsEl = document.getElementById("start-steps");

let teacherProfile = null;
let currentStudents = [];
let classesById = new Map();
let currentClassId = null;
let currentRows = [];
// Polish list #1. The act the roster describes, and the class's data as
// last fetched, so changing the act redraws without a second query.
const ACT_NAMES = { 1: "Act I", 2: "Act II", 3: "Act III", 4: "Act IV" };
const actPicker = document.getElementById("act-picker");
let currentAct = null;
let lastFetch = null;
let sortKey = "name";
let sortDir = 1; // 1 ascending, -1 descending

// act_progress.status, in the order a student moves through it, so
// sorting by status sorts by how far along each student is. Block 132:
// each label is what a teacher would say, and words says it in a
// sentence for the student card.
const STATUS = {
  none:      { label: "Not started",  pill: "pill-none",    order: 0, words: "has not started this act" },
  locked:    { label: "Locked",       pill: "pill-locked",  order: 1, words: "has not reached this act yet (the act before it comes first)" },
  trivia:    { label: "Trivia card",  pill: "pill-test",    order: 2, words: "is reading the trivia card before the pre-test" },
  pretest:   { label: "Pre-test",     pill: "pill-test",    order: 3, words: "is taking the pre-test" },
  playing:   { label: "Playing",      pill: "pill-playing", order: 4, words: "is playing the act" },
  posttest:  { label: "Post-test",    pill: "pill-test",    order: 5, words: "is taking the post-test" },
  completed: { label: "Finished",     pill: "pill-done",    order: 6, words: "has finished the act" },
};

// Block 132. Who "Needs attention" names as away: started, not finished,
// and not seen for this long.
const AWAY_DAYS = 3;

// The game's pass mark for an act's post-test (js/assessment.js,
// passingFor), read from the same content the game reads.
function passMark(act) {
  const bank = (window.QUESTIONS && window.QUESTIONS[act]) || {};
  const p = Number(bank.passing);
  return p > 0 && p <= 1 ? p : 0.75;
}

// =============================================================
// Tabs (Block 132)
// =============================================================

const TABS = ["overview", "students", "report", "tests", "talaan"];
const tabsEl = document.getElementById("tabs");
let currentTab = "overview";
// An editor the teacher has typed in is never switched to another act
// behind her back; one she has not touched follows the page's act.
const editorTouched = { tests: false, talaan: false };

function showTab(name) {
  if (!TABS.includes(name)) name = "overview";
  currentTab = name;
  tabsEl.querySelectorAll("[data-tab]").forEach((b) => {
    b.setAttribute("aria-selected", b.dataset.tab === name ? "true" : "false");
  });
  TABS.forEach((t) => {
    document.getElementById("tab-" + t).classList.toggle("hidden", t !== name);
  });
  if (location.hash !== "#" + name) history.replaceState(null, "", "#" + name);
  if (name === "tests" || name === "talaan") followAct(name);
}

function followAct(tab) {
  if (editorTouched[tab] || currentAct === null) return;
  const sel = document.getElementById(tab === "tests" ? "qe-act" : "tl-act");
  const want = String(currentAct);
  if (!sel || sel.value === want || ![...sel.options].some((o) => o.value === want)) return;
  sel.value = want;
  sel.dispatchEvent(new Event("change"));
}

tabsEl.addEventListener("click", (e) => {
  const b = e.target.closest("[data-tab]");
  if (b) showTab(b.dataset.tab);
});
document.querySelectorAll(".step-go").forEach((b) =>
  b.addEventListener("click", () => showTab(b.dataset.go)));
document.getElementById("qe-list").addEventListener("input", () => { editorTouched.tests = true; });
document.getElementById("tl-list").addEventListener("input", () => { editorTouched.talaan = true; });
window.addEventListener("hashchange", () => showTab(location.hash.slice(1)));

// =============================================================
// Access gate
// =============================================================

function bounceToGame(reason) {
  gateMsg.textContent = reason;
  gateMsg.className = "error";
  setTimeout(() => window.location.replace("index.html"), 1200);
}

async function initTeacher() {
  const {
    data: { session },
  } = await sb.auth.getSession();

  if (!session) {
    bounceToGame("Please log in first.");
    return;
  }

  const { data: profile, error } = await sb
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", session.user.id)
    .maybeSingle();

  if (error) {
    console.error("Profile fetch failed:", error);
    gateMsg.textContent = "Could not load the account. Please try again.";
    gateMsg.className = "error";
    return;
  }

  if (!profile || profile.role !== "teacher") {
    bounceToGame("This is not a teacher account.");
    return;
  }

  teacherProfile = profile;
  teacherNameEl.textContent = profile.full_name || "Teacher";

  gate.classList.add("hidden");
  dash.classList.remove("hidden");
  tabsEl.classList.remove("hidden");
  showTab(location.hash.slice(1));

  // Block 68. The question editor does not depend on a class.
  if (window.TeacherQuestions) TeacherQuestions.init();
  // Block 70. Nor do the Talaan papers.
  if (window.TeacherTalaan) TeacherTalaan.init();
  // Block 128. The Questions report, drawn with the roster.
  if (window.TeacherReport) TeacherReport.init();

  await loadClasses(profile.id);
}

logoutBtn.addEventListener("click", async () => {
  await sb.auth.signOut();
  window.location.replace("index.html");
});

// =============================================================
// Classes
// =============================================================

async function loadClasses(teacherId) {
  const { data: classes, error } = await sb
    .from("classes")
    .select("id, class_name, join_code")
    .eq("teacher_id", teacherId)
    .order("class_name");

  if (error) {
    showLoadError("Could not load the class list.", error);
    return;
  }

  if (!classes || classes.length === 0) {
    loadingEl.classList.add("hidden");
    noClassEl.classList.remove("hidden");
    return;
  }

  classesById = new Map(classes.map((c) => [c.id, c]));
  classPicker.innerHTML = "";
  classes.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.class_name;
    classPicker.appendChild(opt);
  });

  // A dropdown holding one option is just noise, so only show the
  // picker when there is an actual choice to make.
  if (classes.length > 1) {
    classPickerRow.classList.remove("hidden");
  }

  classPicker.addEventListener("change", () => loadRoster(classPicker.value));

  await loadRoster(classes[0].id);
}

// =============================================================
// Roster
// =============================================================

async function loadRoster(classId) {
  currentClassId = classId;
  const cls = classesById.get(classId);
  classNameEl.textContent = cls ? cls.class_name : "";
  toolbarEl.classList.remove("hidden");
  showLoading();

  // 1. Students in this class.
  const { data: students, error: studentsError } = await sb
    .from("profiles")
    .select("id, full_name")
    .eq("class_id", classId)
    .eq("role", "student")
    .order("full_name");

  if (studentsError) {
    showLoadError("Could not load the students.", studentsError);
    return;
  }

  currentStudents = students || [];
  // Block 132. The accounts card belongs to the class, not to its
  // students: it is how the first ones are made.
  if (window.TeacherAccounts) TeacherAccounts.show(cls, currentStudents);

  if (!students || students.length === 0) {
    lastFetch = null;
    currentRows = [];
    loadingEl.classList.add("hidden");
    noStudentsEl.classList.remove("hidden");
    renderSteps();
    return;
  }

  const ids = students.map((s) => s.id);

  // 2, 3, 4. Progress, act progress, and scores for those students.
  // Run together since none depends on the others.
  const [progressRes, actsRes, scoresRes] = await Promise.all([
    sb
      .from("game_progress")
      .select("student_id, current_act, updated_at")
      .in("student_id", ids),
    sb
      .from("act_progress")
      .select("student_id, act_number, status, performance_score, objectives_done, objectives_total, elapsed_ms")
      .in("student_id", ids),
    sb
      .from("assessment_scores")
      .select("*")
      .in("student_id", ids),
  ]);

  const failure =
    progressRes.error || actsRes.error || scoresRes.error;
  if (failure) {
    showLoadError("Could not load progress data.", failure);
    return;
  }

  lastFetch = {
    students,
    progress: progressRes.data || [],
    acts: actsRes.data || [],
    scores: scoresRes.data || [],
  };
  // The furthest act with something to finish (objectives_total above 0)
  // that anyone in the class has a row for, unless the teacher has
  // already chosen one. A stub act, which a student who finished Act I
  // is moved into, has no objectives and would show an empty roster.
  if (currentAct === null) {
    const withContent = lastFetch.acts
      .filter((a) => Number(a.objectives_total) > 0)
      .map((a) => Number(a.act_number) || 1);
    currentAct = Math.min(4, Math.max(1, ...withContent));
  }
  drawAct();
  updatedAtEl.textContent = "Updated " + new Date().toLocaleTimeString("en-PH", {
    hour: "numeric", minute: "2-digit",
  });

  loadingEl.classList.add("hidden");
  noStudentsEl.classList.add("hidden");
  loadErrorEl.classList.add("hidden");
  summaryEl.classList.remove("hidden");
  rosterSection.classList.remove("hidden");
  attentionEl.classList.remove("hidden");
  renderSteps();
}

// Builds the rows for the act chosen and draws them, with the act's name
// wherever the page says which act it means.
function drawAct() {
  if (!lastFetch) return;
  actPicker.value = String(currentAct);
  document.querySelectorAll(".act-name").forEach((el) => {
    el.textContent = ACT_NAMES[currentAct];
  });
  const rows = buildRoster(lastFetch.students, lastFetch.progress, lastFetch.acts,
    lastFetch.scores, currentAct);
  currentRows = rows;
  renderRoster();
  renderSummary(rows);
  renderAttention(rows);
  if (window.TeacherReport) TeacherReport.draw(lastFetch, currentAct);
  document.getElementById("qr-wait").classList.add("hidden");
}

actPicker.addEventListener("change", () => {
  currentAct = Number(actPicker.value) || 1;
  drawAct();
});

// Stitches the four result sets into one row per student, for one act.
function buildRoster(students, progress, acts, scores, actNumber) {
  const n = actNumber || 1;
  const progressBy = new Map(progress.map((p) => [p.student_id, p]));

  const actsBy = new Map();
  acts.forEach((a) => {
    if (!actsBy.has(a.student_id)) actsBy.set(a.student_id, []);
    actsBy.get(a.student_id).push(a);
  });

  // Keyed "studentId|actNumber|testType" for direct lookup. Since
  // Block 68 a failed post-test can be taken again, so a test may have
  // several rows; the latest attempt is the one shown, and the count is
  // kept for the cell. A row from before schema 006 is attempt 1. The
  // first attempt is kept too (firstBy): the study's learning gain is the
  // first post-test against the pre-test, not the retake's (Scan S13).
  const scoresBy = new Map();
  const firstBy = new Map();
  scores.forEach((s) => {
    const key = `${s.student_id}|${s.act_number}|${s.test_type}`;
    const attempt = Number(s.attempt) || 1;
    const prev = scoresBy.get(key);
    const tries = prev ? prev.tries + 1 : 1;
    if (!prev || attempt >= (Number(prev.attempt) || 1)) {
      scoresBy.set(key, Object.assign({}, s, { tries }));
    } else {
      prev.tries = tries;
    }
    const first = firstBy.get(key);
    if (!first || attempt < (Number(first.attempt) || 1)) firstBy.set(key, s);
  });

  return students.map((student) => {
    const prog = progressBy.get(student.id) || null;
    const studentActs = actsBy.get(student.id) || [];

    const pre = scoresBy.get(`${student.id}|${n}|pre`) || null;
    const post = scoresBy.get(`${student.id}|${n}|post`) || null;

    const firstPost = firstBy.get(`${student.id}|${n}|post`) || null;

    const prePct = pre ? toPercent(pre.score, pre.max_score) : null;
    const postPct = post ? toPercent(post.score, post.max_score) : null;
    const firstPostPct = firstPost ? toPercent(firstPost.score, firstPost.max_score) : null;
    const gain =
      prePct !== null && firstPostPct !== null ? firstPostPct - prePct : null;
    const gainLatest =
      prePct !== null && postPct !== null && post.tries > 1 ? postPct - prePct : null;

    const row = studentActs.find((a) => Number(a.act_number) === n) || null;
    const status = row && STATUS[row.status] ? row.status : "none";

    // Performance is the chosen act's, once it is completed: a row still
    // being played, or a stub act's, holds a score of 0 that would read as
    // a result (Scan S1).
    const performance = row && row.status === "completed" && row.performance_score !== null
      ? Number(row.performance_score)
      : null;

    return {
      id: student.id,
      name: student.full_name || "(no name)",
      status,
      objectivesDone: row ? row.objectives_done : null,
      objectivesTotal: row ? row.objectives_total : null,
      objectives: row && row.objectives_total
        ? Number(row.objectives_done) / Number(row.objectives_total)
        : null,
      elapsed: row && row.elapsed_ms ? Number(row.elapsed_ms) : null,
      currentAct: prog ? prog.current_act : null,
      hasPlayed: Boolean(prog),
      actsCompleted: studentActs.filter((a) => a.status === "completed").length,
      pre,
      post,
      prePct,
      postPct,
      firstPostPct,
      gain,
      gainLatest,
      performance,
      lastActive: prog ? prog.updated_at : null,
    };
  });
}

// =============================================================
// Rendering
// =============================================================

function renderRoster() {
  const query = rosterSearch.value.trim().toLowerCase();
  const rows = currentRows
    .filter((r) => !query || r.name.toLowerCase().includes(query))
    .sort(compareRows);

  rosterBody.innerHTML = "";

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    // Block 132. The whole row opens the student card, and the name is
    // a button so a keyboard reaches it too.
    tr.className = "row-open";
    tr.addEventListener("click", () => openStudent(row.id));

    const nameTd = document.createElement("td");
    nameTd.className = "cell-name";
    const nameBtn = document.createElement("button");
    nameBtn.type = "button";
    nameBtn.className = "name-btn";
    nameBtn.textContent = row.name;
    nameTd.appendChild(nameBtn);
    tr.appendChild(nameTd);
    tr.appendChild(statusCell(row.status));
    tr.appendChild(cell(
      row.currentAct !== null ? "Act " + row.currentAct : null,
      null,
      row.hasPlayed ? `${row.actsCompleted} of ${TOTAL_ACTS} done` : null
    ));
    tr.appendChild(cell(
      row.objectivesTotal ? `${row.objectivesDone}/${row.objectivesTotal}` : null, "num"));
    tr.appendChild(cell(
      row.pre ? Math.round(row.prePct) + "%" : null, "num", row.pre ? fraction(row.pre) : null));
    tr.appendChild(cell(
      row.post ? Math.round(row.postPct) + "%" : null, "num",
      row.post ? fraction(row.post) + (row.post.tries > 1 ? " · " + row.post.tries + " attempts" : "") : null));
    tr.appendChild(gainCell(row.gain, row.gainLatest));
    tr.appendChild(cell(row.performance !== null ? row.performance.toFixed(1) : null, "num"));
    tr.appendChild(cell(formatDuration(row.elapsed), "num"));
    tr.appendChild(cell(formatDate(row.lastActive)));

    rosterBody.appendChild(tr);
  });

  const total = currentRows.length;
  rosterCountEl.textContent = query
    ? `${rows.length} of ${total} students match`
    : `${total} students`;
  noMatchEl.classList.toggle("hidden", rows.length > 0);

  sortHeaders.forEach((th) => {
    if (th.dataset.sort === sortKey) {
      th.setAttribute("aria-sort", sortDir === 1 ? "ascending" : "descending");
    } else {
      th.removeAttribute("aria-sort");
    }
  });
}

// Missing values always sort last, whichever way the column is sorted,
// so a teacher sorting by score sees scores first rather than a block
// of dashes.
function compareRows(a, b) {
  const va = sortValue(a, sortKey);
  const vb = sortValue(b, sortKey);
  if (va === null && vb === null) return a.name.localeCompare(b.name);
  if (va === null) return 1;
  if (vb === null) return -1;
  const diff = typeof va === "string" ? va.localeCompare(vb) : va - vb;
  return diff !== 0 ? diff * sortDir : a.name.localeCompare(b.name);
}

function sortValue(row, key) {
  switch (key) {
    case "name": return row.name.toLowerCase();
    case "status": return STATUS[row.status].order;
    case "lastActive": return row.lastActive ? new Date(row.lastActive).getTime() : null;
    default: {
      const v = row[key];
      return v === null || v === undefined ? null : Number(v);
    }
  }
}

sortHeaders.forEach((th) => {
  th.querySelector("button").addEventListener("click", () => {
    const key = th.dataset.sort;
    if (key === sortKey) {
      sortDir = -sortDir;
    } else {
      sortKey = key;
      // Names and status read naturally ascending; numbers and dates are
      // usually wanted highest or latest first.
      sortDir = key === "name" || key === "status" ? 1 : -1;
    }
    renderRoster();
  });
});

rosterSearch.addEventListener("input", () => renderRoster());

refreshBtn.addEventListener("click", async () => {
  if (!currentClassId) return;
  refreshBtn.disabled = true;
  await loadRoster(currentClassId);
  refreshBtn.disabled = false;
});

function renderSummary(rows) {
  const n = rows.length;
  const started = rows.filter((r) => r.hasPlayed);
  const done = rows.filter((r) => r.status === "completed");
  const withPre = rows.filter((r) => r.prePct !== null);
  // 6 Oct 2026. The class's post-test is each student's first attempt,
  // the one the gain is measured from (Scan S13): averaging the latest
  // let retakes raise it, so pre, post and gain did not agree. The
  // roster and the CSV still show the latest beside it.
  const withPost = rows.filter((r) => r.firstPostPct !== null);
  const withGain = rows.filter((r) => r.gain !== null);

  stat("stat-students").textContent = n;
  stat("stat-started").textContent = started.length;
  stat("stat-started-sub").textContent = percentOf(started.length, n) + " of class";
  stat("stat-done").textContent = done.length;
  stat("stat-done-sub").textContent = percentOf(done.length, n) + " of class";

  stat("stat-pre").textContent = withPre.length
    ? average(withPre.map((r) => r.prePct)).toFixed(0) + "%"
    : "—";
  stat("stat-pre-sub").textContent = `n = ${withPre.length}`;
  stat("stat-post").textContent = withPost.length
    ? average(withPost.map((r) => r.firstPostPct)).toFixed(0) + "%"
    : "—";
  stat("stat-post-sub").textContent = `n = ${withPost.length}, first attempt`;

  const gainEl = stat("stat-gain");
  gainEl.classList.remove("gain-positive", "gain-negative");
  if (withGain.length) {
    const avgGain = average(withGain.map((r) => r.gain));
    gainEl.textContent = signed(avgGain) + "%";
    if (Math.round(avgGain) > 0) gainEl.classList.add("gain-positive");
    if (Math.round(avgGain) < 0) gainEl.classList.add("gain-negative");
  } else {
    gainEl.textContent = "—";
  }
  stat("stat-gain-sub").textContent = `n = ${withGain.length}, pre to first post-test`;
}

function percentOf(part, whole) {
  return whole ? Math.round((part / whole) * 100) + "%" : "0%";
}

// =============================================================
// Getting started, Needs attention, the student card (Block 132)
// =============================================================

// Accounts made: the class has students. Slips printed: remembered on
// this browser (a device preference, like the game's settings), or
// taken as done once anyone has played, since a student who logged in
// had a slip. Played: anyone has a save.
function slipsKey() { return "macario_slips_printed_" + currentClassId; }

function markSlipsPrinted() {
  try { localStorage.setItem(slipsKey(), "1"); } catch (e) { /* private window */ }
  renderSteps();
}

function renderSteps() {
  const made = currentStudents.length > 0;
  const played = Boolean(lastFetch && lastFetch.progress.length);
  let printed = played;
  try { printed = printed || localStorage.getItem(slipsKey()) === "1"; } catch (e) { /* none */ }
  const done = { "step-accounts": made, "step-slips": made && printed, "step-play": played };
  Object.keys(done).forEach((id) => document.getElementById(id).classList.toggle("step-done", done[id]));
  stepsEl.classList.toggle("hidden", made && printed && played);
}

function renderAttention(rows) {
  const body = document.getElementById("attention-body");
  body.innerHTML = "";
  const pass = passMark(currentAct) * 100;
  const now = Date.now();
  const groups = [
    { title: "Not started yet", why: "has not opened the game", rows: rows.filter((r) => !r.hasPlayed) },
    { title: "Below the pass mark (" + Math.round(pass) + "%)", why: "may replay the act and take the post-test again",
      rows: rows.filter((r) => r.postPct !== null && r.postPct < pass) },
    { title: "Not seen for " + AWAY_DAYS + " days", why: "started but has not finished",
      rows: rows.filter((r) => r.hasPlayed && r.status !== "completed" && r.lastActive &&
        now - new Date(r.lastActive).getTime() > AWAY_DAYS * 86400000) },
  ].filter((g) => g.rows.length);

  if (!groups.length) {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = "Nobody needs attention for " + ACT_NAMES[currentAct] + " right now.";
    body.appendChild(p);
    return;
  }
  groups.forEach((g) => {
    const box = document.createElement("div");
    box.className = "attention-group";
    const h = document.createElement("h3");
    h.textContent = g.title + " · " + g.rows.length;
    const why = document.createElement("p");
    why.className = "muted";
    why.textContent = "Each " + g.why + ".";
    const list = document.createElement("div");
    list.className = "chips";
    g.rows.forEach((r) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = r.name;
      b.addEventListener("click", () => openStudent(r.id));
      list.appendChild(b);
    });
    box.append(h, why, list);
    body.appendChild(box);
  });
}

const cardEl = document.getElementById("student-card");
let cardStudentId = null;

// One student's numbers, said in sentences. Everything is text, never
// HTML: a code is whatever the account was made with.
function studentLines(r) {
  const act = ACT_NAMES[currentAct];
  const lines = [];
  lines.push(act + ": " + r.name + " " + (STATUS[r.status] || STATUS.none).words + ".");
  if (r.objectivesTotal) lines.push("Story steps done: " + r.objectivesDone + " of " + r.objectivesTotal + ".");
  lines.push(r.pre
    ? "Pre-test: " + fraction(r.pre) + " (" + Math.round(r.prePct) + "%)."
    : "Pre-test: not taken yet.");
  if (r.post) {
    const first = r.firstPostPct !== null ? Math.round(r.firstPostPct) + "%" : "";
    lines.push(r.post.tries > 1
      ? "Post-test: " + r.post.tries + " tries. First " + first + ", latest " + fraction(r.post) + " (" + Math.round(r.postPct) + "%)."
      : "Post-test: " + fraction(r.post) + " (" + Math.round(r.postPct) + "%).");
    const pass = passMark(currentAct) * 100;
    if (r.postPct < pass) lines.push("Below the pass mark of " + Math.round(pass) + "%: the student may replay the act and try again.");
  } else {
    lines.push("Post-test: not taken yet.");
  }
  if (r.gain !== null) {
    lines.push("Gain: " + signed(r.gain) + " points from the pre-test to the first post-test" +
      (Math.round(r.gain) > 0 ? ", so the act taught something." : Math.round(r.gain) < 0 ? ", lower than before." : ", no change."));
  }
  if (r.performance !== null) {
    lines.push("Performance: " + r.performance.toFixed(1) + " of 100 (half for finishing, a quarter each for avoiding damage and staying unseen).");
  }
  if (r.elapsed) lines.push("Time in this act: " + formatDuration(r.elapsed) + ".");
  lines.push(r.lastActive ? "Last active: " + formatDate(r.lastActive) + "." : "Has not logged in yet.");
  lines.push("Acts finished: " + r.actsCompleted + " of " + TOTAL_ACTS + ".");
  return lines;
}

function openStudent(id) {
  const r = currentRows.find((x) => x.id === id) ||
    (() => {
      const s = currentStudents.find((x) => x.id === id);
      return s ? buildRoster([s], [], [], [], currentAct)[0] : null;
    })();
  if (!r) return;
  cardStudentId = id;
  document.getElementById("sc-name").textContent = r.name;
  const ul = document.getElementById("sc-lines");
  ul.innerHTML = "";
  studentLines(r).forEach((t) => {
    const li = document.createElement("li");
    li.textContent = t;
    ul.appendChild(li);
  });
  const status = document.getElementById("sc-reset-status");
  status.textContent = "";
  status.className = "qe-status";
  document.getElementById("sc-reset").disabled = !window.TeacherAccounts;
  cardEl.classList.remove("hidden");
  document.getElementById("sc-close").focus();
}

function closeStudent() {
  cardEl.classList.add("hidden");
  cardStudentId = null;
}

document.getElementById("sc-close").addEventListener("click", closeStudent);
cardEl.addEventListener("click", (e) => { if (e.target === cardEl) closeStudent(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !cardEl.classList.contains("hidden")) closeStudent();
});
document.getElementById("sc-reset").addEventListener("click", () => {
  if (cardStudentId && window.TeacherAccounts) {
    TeacherAccounts.resetPassword(cardStudentId, document.getElementById("sc-name").textContent);
  }
});

// What js/teacher-accounts.js reads of the page, and the reload it asks
// for once accounts are made.
window.TeacherDash = {
  classId: () => currentClassId,
  reload: () => (currentClassId ? loadRoster(currentClassId) : Promise.resolve()),
  markSlipsPrinted,
};

// =============================================================
// Cell helpers
// =============================================================

// A null value renders as a dash in a muted colour, so "no data yet"
// is visually distinct from a real zero.
// sub is an optional second, smaller line (the raw score under a
// percentage, say). Everything is written as text, never as HTML, since
// a student's name is whatever was typed into their profile.
function cell(value, className, sub) {
  const td = document.createElement("td");
  const align = className === "num" ? "num" : "";
  if (value === null || value === undefined || value === "") {
    td.textContent = "—";
    td.className = ["cell-empty", align].filter(Boolean).join(" ");
  } else {
    td.textContent = value;
    if (className) td.className = className;
    if (sub) {
      const small = document.createElement("span");
      small.className = "cell-sub";
      small.textContent = sub;
      td.appendChild(small);
    }
  }
  return td;
}

function statusCell(status) {
  const td = document.createElement("td");
  const info = STATUS[status] || STATUS.none;
  const pill = document.createElement("span");
  pill.className = "pill " + info.pill;
  pill.textContent = info.label;
  td.appendChild(pill);
  return td;
}

// The gain shown is the first post-test's; a retake's, when there is
// one, is the smaller line under it.
function gainCell(gain, gainLatest) {
  const td = document.createElement("td");
  if (gain === null) {
    td.textContent = "—";
    td.className = "cell-empty num";
    return td;
  }
  td.textContent = signed(gain) + "%";
  td.className = "num " +
    (Math.round(gain) > 0 ? "gain-positive" : Math.round(gain) < 0 ? "gain-negative" : "gain-neutral");
  if (gainLatest !== null && gainLatest !== undefined) {
    const small = document.createElement("span");
    small.className = "cell-sub";
    small.textContent = "latest " + signed(gainLatest) + "%";
    td.appendChild(small);
  }
  return td;
}

// =============================================================
// Export (Scan S15)
// =============================================================

// The rows already on screen, as a CSV the proponents can analyse. No
// new query: it is what RLS already let this teacher read.
function exportCsv() {
  if (!currentRows || !currentRows.length) return;
  const cls = classesById.get(currentClassId);
  // One act at a time, the act chosen on the page (act), so the file says
  // which act its columns describe.
  const header = ["student", "act", "status", "current_act", "objectives_done", "objectives_total",
    "pre_score", "pre_max", "pre_pct", "post_first_pct", "post_latest_score", "post_max",
    "post_latest_pct", "post_attempts", "gain_first", "gain_latest", "performance",
    "play_minutes", "last_active"];
  const num = (v, d) => (v === null || v === undefined ? "" : Number(v).toFixed(d));
  const lines = [header.join(",")];
  currentRows.forEach((r) => {
    lines.push([
      r.name, currentAct, r.status, r.currentAct, r.objectivesDone, r.objectivesTotal,
      r.pre ? r.pre.score : "", r.pre ? r.pre.max_score : "", num(r.prePct, 1),
      num(r.firstPostPct, 1), r.post ? r.post.score : "", r.post ? r.post.max_score : "",
      num(r.postPct, 1), r.post ? r.post.tries : "", num(r.gain, 1),
      num(r.gainLatest !== null ? r.gainLatest : r.gain, 1), num(r.performance, 1),
      r.elapsed ? (r.elapsed / 60000).toFixed(1) : "", r.lastActive || "",
    ].map(csvField).join(","));
  });
  // A byte order mark first, so Excel opens the Tagalog names as UTF-8.
  const blob = new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = ((cls && cls.class_name) || "class").replace(/[^A-Za-z0-9-]+/g, "-") +
    "-" + new Date().toISOString().slice(0, 10) + ".csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// Block 121. A cell a spreadsheet would read as a formula (= + - @, or a
// tab or return first) gets an apostrophe in front, so a name typed as
// "=HYPERLINK(...)" is shown, not run. A plain number is left alone: a
// negative gain must stay a number.
// Block 128. The Questions report goes with the roster.
function hideReport() {
  const qr = document.getElementById("qr");
  if (qr) qr.classList.add("hidden");
}

function csvField(v) {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = "'" + s;
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

exportBtn.addEventListener("click", exportCsv);

// =============================================================
// Utilities
// =============================================================

function toPercent(score, maxScore) {
  const max = Number(maxScore);
  if (!max) return null; // guards against a divide by zero
  return (Number(score) / max) * 100;
}

function fraction(row) {
  return `${Number(row.score)}/${Number(row.max_score)}`;
}

function average(numbers) {
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

function signed(value) {
  const rounded = Math.round(value);
  return rounded > 0 ? "+" + rounded : String(rounded);
}

// Play time as minutes, or hours and minutes once it passes an hour.
function formatDuration(ms) {
  if (!ms) return null;
  const minutes = Math.round(ms / 60000);
  if (minutes < 1) return "<1m";
  if (minutes < 60) return minutes + "m";
  return Math.floor(minutes / 60) + "h " + (minutes % 60) + "m";
}

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  // The year only when it is not this one: a school term fits in one,
  // and the column stays narrow enough to fit a laptop screen.
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString("en-PH", {
    year: sameYear ? undefined : "numeric",
    month: "short",
    day: "numeric",
  }) + ", " + d.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" });
}

// =============================================================
// States
// =============================================================

function showLoading() {
  loadingEl.classList.remove("hidden");
  summaryEl.classList.add("hidden");
  rosterSection.classList.add("hidden");
  attentionEl.classList.add("hidden");
  hideReport();
  document.getElementById("qr-wait").classList.remove("hidden");
  noStudentsEl.classList.add("hidden");
  loadErrorEl.classList.add("hidden");
}

function showLoadError(message, error) {
  console.error(message, error);
  loadingEl.classList.add("hidden");
  summaryEl.classList.add("hidden");
  rosterSection.classList.add("hidden");
  noStudentsEl.classList.add("hidden");

  toolbarEl.classList.add("hidden");
  loadErrorEl.textContent = message + " Check the internet connection, then reload the page.";

  // Surface the single most likely cause rather than leaving the
  // teacher with a bare failure message.
  if (error && /recursion/i.test(error.message || "")) {
    const sub = document.createElement("span");
    sub.className = "notice-sub";
    sub.textContent =
      "RLS recursion detected. Part 1 of macario_schema_v2.sql has not applied.";
    loadErrorEl.appendChild(sub);
  }

  loadErrorEl.classList.remove("hidden");
}

initTeacher();
