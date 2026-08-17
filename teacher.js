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

const summaryEl = document.getElementById("summary");
const statStudents = document.getElementById("stat-students");
const statStarted = document.getElementById("stat-started");
const statPre = document.getElementById("stat-pre");
const statPost = document.getElementById("stat-post");
const statGain = document.getElementById("stat-gain");

const rosterSection = document.getElementById("roster-section");
const rosterBody = document.getElementById("roster-body");

const noClassEl = document.getElementById("no-class");
const noStudentsEl = document.getElementById("no-students");
const loadErrorEl = document.getElementById("load-error");
const loadingEl = document.getElementById("loading");

let teacherProfile = null;

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
      .select("student_id, act_number, status, performance_score")
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

  renderRoster(rows);
  renderSummary(rows);

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

    return {
      name: student.full_name || "(walang pangalan)",
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

function renderRoster(rows) {
  rosterBody.innerHTML = "";

  rows.forEach((row) => {
    const tr = document.createElement("tr");

    tr.appendChild(cell(row.name, "cell-name"));
    tr.appendChild(cell(row.currentAct !== null ? "Act " + row.currentAct : null));
    tr.appendChild(cell(row.hasPlayed ? `${row.actsCompleted}/${TOTAL_ACTS}` : null));
    tr.appendChild(cell(row.pre ? fraction(row.pre) : null));
    tr.appendChild(cell(row.post ? fraction(row.post) : null));
    tr.appendChild(gainCell(row.gain));
    tr.appendChild(
      cell(row.performance !== null ? row.performance.toFixed(1) : null)
    );
    tr.appendChild(cell(formatDate(row.lastActive)));

    rosterBody.appendChild(tr);
  });
}

function renderSummary(rows) {
  const started = rows.filter((r) => r.hasPlayed);
  const withPre = rows.filter((r) => r.prePct !== null);
  const withPost = rows.filter((r) => r.postPct !== null);
  const withGain = rows.filter((r) => r.gain !== null);

  statStudents.textContent = rows.length;
  statStarted.textContent = started.length;
  statPre.textContent = withPre.length
    ? average(withPre.map((r) => r.prePct)).toFixed(0) + "%"
    : "-";
  statPost.textContent = withPost.length
    ? average(withPost.map((r) => r.postPct)).toFixed(0) + "%"
    : "-";

  if (withGain.length) {
    const avgGain = average(withGain.map((r) => r.gain));
    statGain.textContent = signed(avgGain) + "%";
  } else {
    statGain.textContent = "-";
  }
}

// =============================================================
// Cell helpers
// =============================================================

// A null value renders as a dash in a muted colour, so "no data yet"
// is visually distinct from a real zero.
function cell(value, className) {
  const td = document.createElement("td");
  if (value === null || value === undefined || value === "") {
    td.textContent = "-";
    td.className = "cell-empty";
  } else {
    td.textContent = value;
    if (className) td.className = className;
  }
  return td;
}

function gainCell(gain) {
  const td = document.createElement("td");
  if (gain === null) {
    td.textContent = "-";
    td.className = "cell-empty";
    return td;
  }
  td.textContent = signed(gain) + "%";
  td.className =
    gain > 0 ? "gain-positive" : gain < 0 ? "gain-negative" : "gain-neutral";
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

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
