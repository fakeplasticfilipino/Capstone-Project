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

let teacherProfile = null;
let classesById = new Map();
let currentClassId = null;
let currentRows = [];
let sortKey = "name";
let sortDir = 1; // 1 ascending, -1 descending

// act_progress.status, in the order a student moves through it, so
// sorting by status sorts by how far along each student is.
const STATUS = {
  none:      { label: "Hindi pa nagsisimula", pill: "pill-none",    order: 0 },
  locked:    { label: "Naka-lock",            pill: "pill-locked",  order: 1 },
  trivia:    { label: "Trivia",               pill: "pill-test",    order: 2 },
  pretest:   { label: "Pre-test",             pill: "pill-test",    order: 3 },
  playing:   { label: "Naglalaro",            pill: "pill-playing", order: 4 },
  posttest:  { label: "Post-test",            pill: "pill-test",    order: 5 },
  completed: { label: "Tapos",                pill: "pill-done",    order: 6 },
};

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
    bounceToGame("Kailangan mag-log in muna.");
    return;
  }

  const { data: profile, error } = await sb
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", session.user.id)
    .maybeSingle();

  if (error) {
    console.error("Profile fetch failed:", error);
    gateMsg.textContent = "May error sa pagkuha ng account. Subukan ulit.";
    gateMsg.className = "error";
    return;
  }

  if (!profile || profile.role !== "teacher") {
    bounceToGame("Hindi teacher account ito.");
    return;
  }

  teacherProfile = profile;
  teacherNameEl.textContent = profile.full_name || "Guro";

  gate.classList.add("hidden");
  dash.classList.remove("hidden");

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
    showLoadError("Hindi makuha ang listahan ng klase.", error);
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
    showLoadError("Hindi makuha ang mga mag-aaral.", studentsError);
    return;
  }

  if (!students || students.length === 0) {
    loadingEl.classList.add("hidden");
    noStudentsEl.classList.remove("hidden");
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
      .select("student_id, act_number, test_type, score, max_score")
      .in("student_id", ids),
  ]);

  const failure =
    progressRes.error || actsRes.error || scoresRes.error;
  if (failure) {
    showLoadError("Hindi makuha ang datos ng progreso.", failure);
    return;
  }

  const rows = buildRoster(
    students,
    progressRes.data || [],
    actsRes.data || [],
    scoresRes.data || []
  );

  currentRows = rows;
  renderRoster();
  renderSummary(rows);
  updatedAtEl.textContent = "Na-update " + new Date().toLocaleTimeString("en-PH", {
    hour: "numeric", minute: "2-digit",
  });

  loadingEl.classList.add("hidden");
  noStudentsEl.classList.add("hidden");
  loadErrorEl.classList.add("hidden");
  summaryEl.classList.remove("hidden");
  rosterSection.classList.remove("hidden");
}

// Stitches the four result sets into one row per student.
function buildRoster(students, progress, acts, scores) {
  const progressBy = new Map(progress.map((p) => [p.student_id, p]));

  const actsBy = new Map();
  acts.forEach((a) => {
    if (!actsBy.has(a.student_id)) actsBy.set(a.student_id, []);
    actsBy.get(a.student_id).push(a);
  });

  // Keyed "studentId|actNumber|testType" for direct lookup.
  const scoresBy = new Map();
  scores.forEach((s) => {
    scoresBy.set(`${s.student_id}|${s.act_number}|${s.test_type}`, s);
  });

  return students.map((student) => {
    const prog = progressBy.get(student.id) || null;
    const studentActs = actsBy.get(student.id) || [];

    const pre = scoresBy.get(`${student.id}|1|pre`) || null;
    const post = scoresBy.get(`${student.id}|1|post`) || null;

    const prePct = pre ? toPercent(pre.score, pre.max_score) : null;
    const postPct = post ? toPercent(post.score, post.max_score) : null;
    const gain =
      prePct !== null && postPct !== null ? postPct - prePct : null;

    // Performance is currently recorded per act. Average whatever
    // acts have produced a score so far. Blocks 2 and 3 will start
    // populating this for real.
    const scored = studentActs.filter((a) => a.performance_score !== null);
    const performance = scored.length
      ? scored.reduce((sum, a) => sum + Number(a.performance_score), 0) /
        scored.length
      : null;

    const act1 = studentActs.find((a) => Number(a.act_number) === 1) || null;
    const status = act1 && STATUS[act1.status] ? act1.status : "none";

    return {
      name: student.full_name || "(walang pangalan)",
      status,
      objectivesDone: act1 ? act1.objectives_done : null,
      objectivesTotal: act1 ? act1.objectives_total : null,
      objectives: act1 && act1.objectives_total
        ? Number(act1.objectives_done) / Number(act1.objectives_total)
        : null,
      elapsed: act1 && act1.elapsed_ms ? Number(act1.elapsed_ms) : null,
      currentAct: prog ? prog.current_act : null,
      hasPlayed: Boolean(prog),
      actsCompleted: studentActs.filter((a) => a.status === "completed").length,
      pre,
      post,
      prePct,
      postPct,
      gain,
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

    tr.appendChild(cell(row.name, "cell-name"));
    tr.appendChild(statusCell(row.status));
    tr.appendChild(cell(
      row.currentAct !== null ? "Act " + row.currentAct : null,
      null,
      row.hasPlayed ? `${row.actsCompleted} sa ${TOTAL_ACTS} tapos` : null
    ));
    tr.appendChild(cell(
      row.objectivesTotal ? `${row.objectivesDone}/${row.objectivesTotal}` : null, "num"));
    tr.appendChild(cell(
      row.pre ? Math.round(row.prePct) + "%" : null, "num", row.pre ? fraction(row.pre) : null));
    tr.appendChild(cell(
      row.post ? Math.round(row.postPct) + "%" : null, "num", row.post ? fraction(row.post) : null));
    tr.appendChild(gainCell(row.gain));
    tr.appendChild(cell(row.performance !== null ? row.performance.toFixed(1) : null, "num"));
    tr.appendChild(cell(formatDuration(row.elapsed), "num"));
    tr.appendChild(cell(formatDate(row.lastActive)));

    rosterBody.appendChild(tr);
  });

  const total = currentRows.length;
  rosterCountEl.textContent = query
    ? `${rows.length} sa ${total} mag-aaral ang tumugma`
    : `${total} mag-aaral`;
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
  const withPost = rows.filter((r) => r.postPct !== null);
  const withGain = rows.filter((r) => r.gain !== null);

  stat("stat-students").textContent = n;
  stat("stat-started").textContent = started.length;
  stat("stat-started-sub").textContent = percentOf(started.length, n) + " ng klase";
  stat("stat-done").textContent = done.length;
  stat("stat-done-sub").textContent = percentOf(done.length, n) + " ng klase";

  stat("stat-pre").textContent = withPre.length
    ? average(withPre.map((r) => r.prePct)).toFixed(0) + "%"
    : "—";
  stat("stat-pre-sub").textContent = `n = ${withPre.length}`;
  stat("stat-post").textContent = withPost.length
    ? average(withPost.map((r) => r.postPct)).toFixed(0) + "%"
    : "—";
  stat("stat-post-sub").textContent = `n = ${withPost.length}`;

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
  stat("stat-gain-sub").textContent = `n = ${withGain.length}, may pre at post`;
}

function percentOf(part, whole) {
  return whole ? Math.round((part / whole) * 100) + "%" : "0%";
}

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

function gainCell(gain) {
  const td = document.createElement("td");
  if (gain === null) {
    td.textContent = "—";
    td.className = "cell-empty num";
    return td;
  }
  td.textContent = signed(gain) + "%";
  td.className = "num " +
    (Math.round(gain) > 0 ? "gain-positive" : Math.round(gain) < 0 ? "gain-negative" : "gain-neutral");
  return td;
}

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
  loadErrorEl.textContent = message + " Tingnan ang console para sa detalye.";

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
