// =============================================================
// MACARIO — create-students (Supabase Edge Function, Block 132)
//
// Lets a teacher make her students' accounts from the dashboard, give
// one a new password, and (Block 150) archive, restore or delete them.
// Each needs the project's secret key, which must never reach a
// browser; this function holds it on Supabase's side
// (SUPABASE_SERVICE_ROLE_KEY, set by the platform) and does a few fixed
// things with it, for the signed-in teacher's own class and nothing
// else.
//
//   { action: "create", class_id, prefix, count }
//       count new accounts <prefix>-NN, numbered on from the highest
//       already made with that prefix; each a student, enrolled in the
//       class, with six random digits as its password. Returns
//       { accounts: [{ code, password }] }, the only time a password is
//       ever seen: it is not stored anywhere readable.
//       Block 159: names, optional, a list of real names, the n-th for
//       the n-th account made (profiles.display_name, schema v16).
//   { action: "rename", student_id, name }
//       Block 159: a student of her class gets a name (empty clears it).
//       Returns { code, name }.
//   { action: "reset", student_id }
//       a new six digits for one student of her class. Returns
//       { code, password }.
//   { action: "archive" | "restore" | "delete", student_ids: [...] }
//       Block 150, up to MAX_PER_CALL of her class's students at once.
//       archive sets profiles.archived_at and bans the login; restore
//       clears both. delete removes the account, and only one that
//       never played: one row in any of PLAY_TABLES and it is refused
//       (HAS_DATA), because deleting cascades through all of them and
//       the scores are the study's. Returns { results: [{ id, code,
//       ok, error }] }, one per student, so a partial run is said.
//
//   { action: "move", student_ids: [...], class_id }
//       Block 164: her students to another of her sections. Only
//       profiles.class_id changes; codes, passwords and every row of
//       play stay. Returns { moved }.
//
// Block 166, an administrator only (profiles.role admin, schema v18):
//   { action: "teacher-create", email, name }
//       a teacher's login, with a password of twelve letters and digits
//       returned once. Returns { email, password, id }.
//   { action: "teacher-reset", teacher_id }       { email, password }
//   { action: "teacher-archive" | "teacher-restore", teacher_id }
//       bans or unbans the login and sets or clears archived_at. Her
//       sections, students and questions are kept. Returns { ok }.
//   { action: "section-create", teacher_id, class_name }   { id }
//   { action: "section-assign", class_id, teacher_id }     { ok }
//       hands a section, with its students, to another teacher.
// An administrator may also call every action above for any section:
// ownsClass is true for one. No action reads or writes a score, and an
// administrator cannot be made, changed or archived from here: the
// first is made by the developers, by hand.
//
// WHO MAY CALL IT. The caller's own access token is checked here
// (getUser), not by the gateway (deployed with verify_jwt false, since
// the project's publishable key is not a JWT); then profiles.role must
// be teacher, and the class (or the student's class) must be one whose
// classes.teacher_id is the caller. A student, a stranger or another
// class's teacher gets 403 and nothing changes.
//
// WHY SIX DIGITS. Supabase refuses a password under six characters,
// and four digits are 10,000 tries: every classmate's code is
// guessable, so a weak password is someone else's one pre-test
// attempt. Students may change theirs in settings (Block 122).
//
// The code is the login (CLAUDE.md, Privacy): full_name is the code, the
// email <code>@example.com, which never delivers and needs no
// confirmation (email_confirm). Since Block 159 a real name may sit
// beside it in profiles.display_name, written here and nowhere else.
//
// Source of truth for the deployed function. Deployed with the
// Supabase connector's deploy_edge_function, name create-students,
// verify_jwt false; recorded in TRACKER.md's Run log.
// =============================================================

import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const MAX_PER_CALL = 60;
const PREFIX_RE = /^[a-z]{2,12}$/;

// Block 150. Every table a student's play writes a row to (the seven
// reset_my_play_data clears). An account with a row in any of them has
// played, and is archived, never deleted.
const PLAY_TABLES = [
  "game_progress", "act_progress", "assessment_scores", "game_sessions",
  "feedback", "player_inventory", "player_equipment",
];
// A ban Supabase reads as for good: about a hundred years.
const BAN_FOREVER = "876000h";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function reply(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// Six digits, each uniform: a byte below 250 is kept (250 = 25 * 10),
// so no digit is likelier than another.
function sixDigits(): string {
  let out = "";
  const buf = new Uint8Array(1);
  while (out.length < 6) {
    crypto.getRandomValues(buf);
    if (buf[0] < 250) out += String(buf[0] % 10);
  }
  return out;
}

// Block 166. A teacher's password: n letters and digits, none of the
// ones read as each other on a printed slip (0 O, 1 l I).
function letters(n: number): string {
  const set = "abcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  const buf = new Uint8Array(1);
  while (out.length < n) {
    crypto.getRandomValues(buf);
    if (buf[0] < 248) out += set[buf[0] % set.length];
  }
  return out;
}

// Block 159. A name as typed, kept plain: no control characters, single
// spaces, at most 80 characters (the column's own check); empty is none.
function cleanName(v: unknown): string | null {
  const s = String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  return s || null;
}

function codeFor(prefix: string, n: number): string {
  return prefix + "-" + String(n).padStart(2, "0");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return reply(405, { error: "POST only" });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // Who is asking.
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return reply(401, { error: "NOT_SIGNED_IN" });
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData?.user) return reply(401, { error: "NOT_SIGNED_IN" });
  const callerId = userData.user.id;

  const { data: caller } = await admin
    .from("profiles").select("role").eq("id", callerId).maybeSingle();
  if (!caller || (caller.role !== "teacher" && caller.role !== "admin")) return reply(403, { error: "NOT_A_TEACHER" });
  const isAdmin = caller.role === "admin";

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return reply(400, { error: "BAD_REQUEST" });
  }

  const ownsClass = async (classId: unknown) => {
    if (typeof classId !== "string" || !classId) return false;
    let q = admin.from("classes").select("id").eq("id", classId);
    // Block 166: an administrator manages every section's students.
    if (!isAdmin) q = q.eq("teacher_id", callerId);
    const { data } = await q.maybeSingle();
    return Boolean(data);
  };

  if (body.action === "create") {
    const classId = body.class_id;
    const prefix = String(body.prefix || "").trim().toLowerCase();
    const names = Array.isArray(body.names) ? body.names.map(cleanName) : [];
    const count = Math.floor(Number(body.count));
    if (!PREFIX_RE.test(prefix)) return reply(400, { error: "BAD_PREFIX" });
    if (!(count >= 1 && count <= MAX_PER_CALL)) return reply(400, { error: "BAD_COUNT" });
    if (!(await ownsClass(classId))) return reply(403, { error: "NOT_YOUR_CLASS" });

    // Every account already made with this prefix, in any class: the
    // numbering goes on from the highest, and a prefix another class
    // uses is refused, or two classes would share a list of codes.
    const { data: taken, error: takenErr } = await admin
      .from("profiles").select("full_name, class_id").like("full_name", prefix + "-%");
    if (takenErr) return reply(500, { error: "LOOKUP_FAILED" });
    const own = (taken || []).filter((p) => new RegExp("^" + prefix + "-\\d+$").test(p.full_name || ""));
    if (own.some((p) => p.class_id !== classId)) return reply(409, { error: "PREFIX_IN_USE" });
    let next = own.reduce((m, p) => Math.max(m, Number(p.full_name.split("-")[1]) || 0), 0) + 1;

    const accounts: { code: string; password: string; name: string | null }[] = [];
    for (let i = 0; i < count; i++, next++) {
      const code = codeFor(prefix, next);
      const password = sixDigits();
      const { data: made, error: makeErr } = await admin.auth.admin.createUser({
        email: code + "@example.com",
        password,
        email_confirm: true,
        user_metadata: { role: "student", full_name: code },
      });
      if (makeErr || !made?.user) {
        // What was made before the failure is kept and returned, so the
        // teacher can print those; the rest is said.
        return reply(207, { accounts, error: "CREATE_FAILED", at: code, detail: makeErr?.message });
      }
      // handle_new_user made the profile; enrol it, and make it a
      // student whatever the trigger read.
      const name = names[i] || null;
      const { error: enrolErr } = await admin
        .from("profiles").update({ class_id: classId, role: "student", full_name: code, display_name: name })
        .eq("id", made.user.id);
      if (enrolErr) {
        return reply(207, { accounts, error: "ENROL_FAILED", at: code, detail: enrolErr.message });
      }
      accounts.push({ code, password, name });
    }
    return reply(200, { accounts });
  }

  if (body.action === "rename") {
    const studentId = body.student_id;
    if (typeof studentId !== "string" || !studentId) return reply(400, { error: "BAD_REQUEST" });
    const { data: student } = await admin
      .from("profiles").select("role, class_id, full_name").eq("id", studentId).maybeSingle();
    if (!student || student.role !== "student" || !(await ownsClass(student.class_id))) {
      return reply(403, { error: "NOT_YOUR_STUDENT" });
    }
    const name = cleanName(body.name);
    const { error: nameErr } = await admin.from("profiles").update({ display_name: name }).eq("id", studentId);
    if (nameErr) return reply(500, { error: "RENAME_FAILED", detail: nameErr.message });
    return reply(200, { code: student.full_name, name });
  }

  if (body.action === "reset") {
    const studentId = body.student_id;
    if (typeof studentId !== "string" || !studentId) return reply(400, { error: "BAD_REQUEST" });
    const { data: student } = await admin
      .from("profiles").select("role, class_id, full_name").eq("id", studentId).maybeSingle();
    if (!student || student.role !== "student" || !(await ownsClass(student.class_id))) {
      return reply(403, { error: "NOT_YOUR_STUDENT" });
    }
    const password = sixDigits();
    const { error: resetErr } = await admin.auth.admin.updateUserById(studentId, { password });
    if (resetErr) return reply(500, { error: "RESET_FAILED", detail: resetErr.message });
    return reply(200, { code: student.full_name, password });
  }

  if (body.action === "archive" || body.action === "restore" || body.action === "delete") {
    const ids = Array.isArray(body.student_ids) ? [...new Set(body.student_ids)] : [];
    if (!ids.length || ids.length > MAX_PER_CALL || ids.some((x) => typeof x !== "string" || !x)) {
      return reply(400, { error: "BAD_REQUEST" });
    }
    // Every one must be a student of a class she owns, or nothing is
    // done: a list with a stranger in it is a mistake to stop at, not
    // to half-carry out.
    const { data: rows, error: rowsErr } = await admin
      .from("profiles").select("id, role, class_id, full_name").in("id", ids);
    if (rowsErr) return reply(500, { error: "LOOKUP_FAILED" });
    const byId = new Map((rows || []).map((r) => [r.id, r]));
    const owned = new Map<string, boolean>();
    for (const id of ids) {
      const s = byId.get(id as string);
      if (!s || s.role !== "student") return reply(403, { error: "NOT_YOUR_STUDENT" });
      if (!owned.has(s.class_id)) owned.set(s.class_id, await ownsClass(s.class_id));
      if (!owned.get(s.class_id)) return reply(403, { error: "NOT_YOUR_STUDENT" });
    }

    // Who has played, from the tables themselves, before anything is
    // deleted.
    const played = new Set<string>();
    if (body.action === "delete") {
      for (const t of PLAY_TABLES) {
        const { data: hit, error: hitErr } = await admin.from(t).select("student_id").in("student_id", ids);
        if (hitErr) return reply(500, { error: "LOOKUP_FAILED" });
        (hit || []).forEach((h) => played.add(h.student_id));
      }
    }

    const results: { id: string; code: string; ok: boolean; error?: string }[] = [];
    for (const id of ids as string[]) {
      const code = byId.get(id)!.full_name || "";
      if (body.action === "delete") {
        if (played.has(id)) { results.push({ id, code, ok: false, error: "HAS_DATA" }); continue; }
        const { error } = await admin.auth.admin.deleteUser(id);
        results.push(error ? { id, code, ok: false, error: "DELETE_FAILED" } : { id, code, ok: true });
        continue;
      }
      const archive = body.action === "archive";
      // The ban first: a student archived on the roster but still able
      // to log in would be worse than one not archived at all.
      const { error: banErr } = await admin.auth.admin.updateUserById(id,
        { ban_duration: archive ? BAN_FOREVER : "none" });
      if (banErr) { results.push({ id, code, ok: false, error: "BAN_FAILED" }); continue; }
      const { error: markErr } = await admin.from("profiles")
        .update({ archived_at: archive ? new Date().toISOString() : null }).eq("id", id);
      results.push(markErr ? { id, code, ok: false, error: "MARK_FAILED" } : { id, code, ok: true });
    }
    return reply(200, { results });
  }

  if (body.action === "move") {
    const ids = Array.isArray(body.student_ids) ? [...new Set(body.student_ids)] : [];
    if (!ids.length || ids.length > MAX_PER_CALL || ids.some((x) => typeof x !== "string" || !x)) {
      return reply(400, { error: "BAD_REQUEST" });
    }
    if (!(await ownsClass(body.class_id))) return reply(403, { error: "NOT_YOUR_SECTION" });
    const { data: rows, error: rowsErr } = await admin
      .from("profiles").select("id, role, class_id").in("id", ids);
    if (rowsErr) return reply(500, { error: "LOOKUP_FAILED" });
    if ((rows || []).length !== ids.length) return reply(403, { error: "NOT_YOUR_STUDENT" });
    const owned = new Map<string, boolean>();
    for (const r of rows || []) {
      if (r.role !== "student") return reply(403, { error: "NOT_YOUR_STUDENT" });
      if (!owned.has(r.class_id)) owned.set(r.class_id, await ownsClass(r.class_id));
      if (!owned.get(r.class_id)) return reply(403, { error: "NOT_YOUR_STUDENT" });
    }
    const { error: moveErr } = await admin.from("profiles")
      .update({ class_id: body.class_id }).in("id", ids as string[]).eq("role", "student");
    if (moveErr) return reply(500, { error: "MOVE_FAILED", detail: moveErr.message });
    return reply(200, { moved: ids.length });
  }

  // ---- Block 166. Everything below is an administrator's. ----
  if (typeof body.action === "string" && (body.action.startsWith("teacher-") || body.action.startsWith("section-"))) {
    if (!isAdmin) return reply(403, { error: "NOT_AN_ADMIN" });

    // A teacher by id, and nobody else: never a student, never an admin.
    const teacherRow = async (id: unknown) => {
      if (typeof id !== "string" || !id) return null;
      const { data } = await admin.from("profiles").select("id, role, full_name").eq("id", id).maybeSingle();
      return data && data.role === "teacher" ? data : null;
    };

    if (body.action === "teacher-create") {
      const email = String(body.email || "").trim().toLowerCase();
      const name = cleanName(body.name);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) return reply(400, { error: "BAD_EMAIL" });
      if (!name) return reply(400, { error: "BAD_NAME" });
      const password = letters(12);
      const { data: made, error: makeErr } = await admin.auth.admin.createUser({
        email, password, email_confirm: true, user_metadata: { full_name: name },
      });
      if (makeErr || !made?.user) {
        const taken = /already|registered|exists/i.test(makeErr?.message || "");
        return reply(taken ? 409 : 500, { error: taken ? "EMAIL_IN_USE" : "CREATE_FAILED", detail: makeErr?.message });
      }
      // handle_new_user made the profile a student (schema v13); only
      // here, with the service role, does it become a teacher.
      const { error: roleErr } = await admin.from("profiles")
        .update({ role: "teacher", full_name: name, class_id: null }).eq("id", made.user.id);
      if (roleErr) return reply(500, { error: "ROLE_FAILED", detail: roleErr.message });
      return reply(200, { id: made.user.id, email, password });
    }

    if (body.action === "teacher-reset") {
      const t = await teacherRow(body.teacher_id);
      if (!t) return reply(403, { error: "NOT_A_TEACHER_ACCOUNT" });
      const password = letters(12);
      const { data: upd, error } = await admin.auth.admin.updateUserById(t.id, { password });
      if (error) return reply(500, { error: "RESET_FAILED", detail: error.message });
      return reply(200, { email: upd?.user?.email || "", password });
    }

    if (body.action === "teacher-archive" || body.action === "teacher-restore") {
      const t = await teacherRow(body.teacher_id);
      if (!t) return reply(403, { error: "NOT_A_TEACHER_ACCOUNT" });
      const archive = body.action === "teacher-archive";
      const { error: banErr } = await admin.auth.admin.updateUserById(t.id,
        { ban_duration: archive ? BAN_FOREVER : "none" });
      if (banErr) return reply(500, { error: "BAN_FAILED" });
      const { error: markErr } = await admin.from("profiles")
        .update({ archived_at: archive ? new Date().toISOString() : null }).eq("id", t.id);
      if (markErr) return reply(500, { error: "MARK_FAILED" });
      return reply(200, { ok: true });
    }

    if (body.action === "section-create") {
      const t = await teacherRow(body.teacher_id);
      const name = cleanName(body.class_name);
      if (!t) return reply(403, { error: "NOT_A_TEACHER_ACCOUNT" });
      if (!name) return reply(400, { error: "BAD_NAME" });
      const { data: made, error } = await admin.from("classes")
        .insert({ teacher_id: t.id, class_name: name, join_code: "SEC-" + letters(10).toUpperCase() })
        .select("id").single();
      if (error || !made) return reply(500, { error: "SECTION_FAILED", detail: error?.message });
      return reply(200, { id: made.id });
    }

    if (body.action === "section-assign") {
      const t = await teacherRow(body.teacher_id);
      if (!t) return reply(403, { error: "NOT_A_TEACHER_ACCOUNT" });
      if (typeof body.class_id !== "string" || !body.class_id) return reply(400, { error: "BAD_REQUEST" });
      const { data: upd, error } = await admin.from("classes")
        .update({ teacher_id: t.id }).eq("id", body.class_id).select("id");
      if (error || !upd?.length) return reply(500, { error: "ASSIGN_FAILED", detail: error?.message });
      return reply(200, { ok: true });
    }
  }

  return reply(400, { error: "BAD_ACTION" });
});
