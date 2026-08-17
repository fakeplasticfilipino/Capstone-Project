// =============================================================
// teacher.js — Block 1: access gate only.
//
// Block 4 adds the roster + averages rendering below.
//
// Two things must be true before the dashboard renders:
//   1. There is a live session
//   2. That user's profile role is 'teacher'
//
// A student who types the teacher.html URL directly gets bounced
// back to the game. Note this is a UX guard, not the security
// boundary — RLS is what actually stops a student from reading
// another student's rows, and that is enforced in the database.
// =============================================================

const gate = document.getElementById("gate");
const gateMsg = document.getElementById("gate-msg");
const dash = document.getElementById("dash");
const teacherNameEl = document.getElementById("dash-teacher-name");
const logoutBtn = document.getElementById("logout-btn");

let teacherProfile = null;

function bounceToGame(reason) {
  gateMsg.textContent = reason;
  gateMsg.className = "error";
  setTimeout(() => {
    window.location.replace("index.html");
  }, 1200);
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

  // Block 4 hook:
  // await loadClasses(profile.id);
}

logoutBtn.addEventListener("click", async () => {
  await sb.auth.signOut();
  window.location.replace("index.html");
});

initTeacher();
