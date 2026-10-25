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
// The codes are the students' only names here (CLAUDE.md, Privacy):
// full_name is the code, the email <code>@example.com, which never
// delivers and needs no confirmation (email_confirm). The teacher
// writes each name beside its code on paper.
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
  if (!caller || caller.role !== "teacher") return reply(403, { error: "NOT_A_TEACHER" });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return reply(400, { error: "BAD_REQUEST" });
  }

  const ownsClass = async (classId: unknown) => {
    if (typeof classId !== "string" || !classId) return false;
    const { data } = await admin
      .from("classes").select("id").eq("id", classId).eq("teacher_id", callerId).maybeSingle();
    return Boolean(data);
  };

  if (body.action === "create") {
    const classId = body.class_id;
    const prefix = String(body.prefix || "").trim().toLowerCase();
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

    const accounts: { code: string; password: string }[] = [];
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
      const { error: enrolErr } = await admin
        .from("profiles").update({ class_id: classId, role: "student", full_name: code })
        .eq("id", made.user.id);
      if (enrolErr) {
        return reply(207, { accounts, error: "ENROL_FAILED", at: code, detail: enrolErr.message });
      }
      accounts.push({ code, password });
    }
    return reply(200, { accounts });
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

  return reply(400, { error: "BAD_ACTION" });
});
