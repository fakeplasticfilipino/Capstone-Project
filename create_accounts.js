// =============================================================
// create_accounts.js  (v2 — now handles class enrollment)
//
// Bulk-creates pre-approved accounts (students/teachers) directly
// in Supabase, with emails auto-confirmed — no confirmation email
// is sent at all, so there's no rate limit to worry about.
//
// NEW IN v2: creates the teacher's class row and assigns every
// student's profiles.class_id to it. This matters — until class_id
// is set, EVERY teacher RLS policy returns zero rows and the
// dashboard shows nothing at all.
//
// ⚠️ SECURITY: this script uses the SECRET key, which has full
// admin access to your database. Run it ONLY on your own computer.
// Never put the secret key in game.js, index.html, or anywhere
// that gets pushed to GitHub / GitHub Pages.
//
// HOW TO RUN:
//   1. npm install @supabase/supabase-js   (one-time, in this folder)
//   2. Fill in SUPABASE_URL and SUPABASE_SECRET_KEY below
//   3. Edit TEACHER and STUDENTS at the bottom
//   4. node create_accounts.js
//
// Safe to re-run: existing accounts are detected and skipped
// rather than erroring out, and class assignment is re-applied.
// =============================================================

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://rkfnovfkroajottpmxxq.supabase.co";
const SUPABASE_SECRET_KEY = "PASTE_YOUR_SECRET_KEY_HERE"; // sb_secret_...

const sbAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// -------------------------------------------------------------
// EDIT THIS SECTION
// -------------------------------------------------------------

const CLASS_NAME = "Grade 8 - Rizal";
const JOIN_CODE = "MAC8-RIZAL"; // unused for now; reserved for a
                                // future student-side join screen

const TEACHER = {
  email: "teacher1@example.com",
  password: "changeme123",
  full_name: "Guro Rivera",
};

const STUDENTS = [
  { email: "student1@example.com", password: "changeme123", full_name: "Juan Dela Cruz" },
  { email: "student2@example.com", password: "changeme123", full_name: "Maria Santos" },
  { email: "student3@example.com", password: "changeme123", full_name: "Pedro Reyes" },
];

// -------------------------------------------------------------
// Implementation
// -------------------------------------------------------------

// Creates the auth user, or returns the existing one if the email
// is already registered. Returns the user id either way.
async function ensureUser({ email, password, full_name, role }) {
  const { data, error } = await sbAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skips the confirmation email entirely
    user_metadata: { full_name, role },
  });

  if (!error) {
    console.log(`  created  ${email} (${role})`);
    return data.user.id;
  }

  // Already exists — look up the id instead of failing the run.
  const alreadyExists =
    error.status === 422 ||
    /already been registered|already exists/i.test(error.message || "");

  if (!alreadyExists) {
    throw new Error(`${email} — ${error.message}`);
  }

  const { data: list, error: listErr } = await sbAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) throw new Error(`lookup failed for ${email} — ${listErr.message}`);

  const found = list.users.find(
    (u) => (u.email || "").toLowerCase() === email.toLowerCase()
  );
  if (!found) throw new Error(`${email} exists but could not be found in listUsers`);

  console.log(`  exists   ${email} (${role})`);
  return found.id;
}

async function main() {
  if (SUPABASE_SECRET_KEY.includes("PASTE_YOUR")) {
    console.error("Fill in SUPABASE_SECRET_KEY first.");
    process.exit(1);
  }

  console.log("\n1. Teacher account");
  const teacherId = await ensureUser({ ...TEACHER, role: "teacher" });

  // The handle_new_user trigger creates the profile row, but it can
  // land a moment after createUser returns. Make sure it's there.
  await new Promise((r) => setTimeout(r, 500));

  console.log("\n2. Class");
  let classId;
  const { data: existingClass } = await sbAdmin
    .from("classes")
    .select("id")
    .eq("join_code", JOIN_CODE)
    .maybeSingle();

  if (existingClass) {
    classId = existingClass.id;
    console.log(`  exists   ${CLASS_NAME} (${classId})`);
  } else {
    const { data: newClass, error: classErr } = await sbAdmin
      .from("classes")
      .insert({
        teacher_id: teacherId,
        class_name: CLASS_NAME,
        join_code: JOIN_CODE,
      })
      .select("id")
      .single();
    if (classErr) throw new Error(`class creation failed — ${classErr.message}`);
    classId = newClass.id;
    console.log(`  created  ${CLASS_NAME} (${classId})`);
  }

  console.log("\n3. Student accounts");
  const studentIds = [];
  for (const s of STUDENTS) {
    const id = await ensureUser({ ...s, role: "student" });
    studentIds.push(id);
  }

  await new Promise((r) => setTimeout(r, 500));

  console.log("\n4. Class enrollment");
  const { error: enrollErr } = await sbAdmin
    .from("profiles")
    .update({ class_id: classId })
    .in("id", studentIds);
  if (enrollErr) throw new Error(`enrollment failed — ${enrollErr.message}`);
  console.log(`  assigned ${studentIds.length} student(s) to ${CLASS_NAME}`);

  // Teachers are not enrolled in their own class — class_id stays
  // null for them. Ownership is expressed by classes.teacher_id.

  console.log("\n5. Verifying");
  const { data: check, error: checkErr } = await sbAdmin
    .from("profiles")
    .select("full_name, role, class_id")
    .in("id", [teacherId, ...studentIds]);
  if (checkErr) throw new Error(checkErr.message);

  for (const row of check) {
    const where = row.class_id ? "enrolled" : "no class";
    console.log(`  ${row.role.padEnd(8)} ${(row.full_name || "?").padEnd(20)} ${where}`);
  }

  console.log("\nDone.\n");
}

main().catch((err) => {
  console.error("\nFAILED:", err.message, "\n");
  process.exit(1);
});
