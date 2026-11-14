// =============================================================
// MACARIO — _dev/tests/sb-stub.js
//
// A fake Supabase client. Stands in for supabaseClient.js during
// tests, so the suite drives the real game against an in-memory
// database and never touches the live project.
//
// It is injected by _dev/tests/test.js through request interception, not
// by editing index.html. That matters: the suite therefore tests
// the SHIPPING index.html, in its real script order, and cannot
// drift away from it.
//
// Seed data comes from window.__TEST, set per test case.
// =============================================================
(function () {
  const T = window.__TEST || {};
  const db = {
    profiles: T.profiles || [
      { id: "u1", role: "student", full_name: "Test Student", class_id: "c1" },
    ],
    game_progress: T.game_progress || [],
    act_progress: T.act_progress || [],
    classes: T.classes || [],
    assessment_scores: T.assessment_scores || [],
    player_inventory: T.player_inventory || [],
    player_equipment: T.player_equipment || [],
    // Block 68: the questions the teacher edited, and the trivia card.
    assessment_items: T.assessment_items || [],
    // Block 161: the feedback form's answers, read by the dashboard.
    feedback: T.feedback || [],
    act_trivia: T.act_trivia || [],
    // Block 70: the teacher's Talaan papers.
    talaan_entries: T.talaan_entries || [],
  };
  let session = T.session || null;
  const listeners = [];

  // Exposed so assertions can read what the game wrote.
  window.__DB = db;
  window.__CALLS = [];

  // A filter is [column, value] for eq, or [column, list, "in"] for the
  // teacher dashboard's .in("student_id", ids).
  const match = (rows, filters) =>
    rows.filter((r) => filters.every(([k, v, op]) =>
      op === "in" ? v.includes(r[k]) : op === "gt" ? r[k] > v : r[k] === v));

  function builder(table, op, payload, opts) {
    const filters = [];
    let mode = null;

    function exec(m) {
      window.__CALLS.push({ table, op, filters: filters.slice() });
      const rows = db[table] || (db[table] = []);
      let data = null;
      try {
        if (op === "select") {
          // 6 Oct 2026: the next n reads of a table fail, as a dropped
          // request does (selectFail: { table: n }).
          if (T.selectFail && T.selectFail[table] > 0) {
            T.selectFail[table] -= 1;
            return Promise.resolve({ data: null, error: { message: "Failed to fetch" } });
          }
          if (table === "profiles" && T.profileError) {
            return Promise.resolve({
              data: null,
              error: { message: "simulated network failure" },
            });
          }
          const found = match(rows, filters);
          // { count: "exact", head: true } asks for how many, not the rows
          // (the question editor's check, Scan S14).
          if (opts && opts.count) {
            return Promise.resolve({ data: opts.head ? null : found, count: found.length, error: null });
          }
          data = m === "maybe" || m === "single" ? found[0] || null : found;
          if (m === "single" && !found[0]) {
            return Promise.resolve({ data: null, error: { message: "no rows" } });
          }
        } else if (op === "insert") {
          if (T.insertError && T.insertError[table]) {
            return Promise.resolve({ data: null, error: { message: T.insertError[table] } });
          }
          const list = Array.isArray(payload) ? payload : [payload];
          // Block 164: a section made from the dashboard gets its id from
          // the database (gen_random_uuid), so the stub gives one too.
          const added = list.map((p, i) => Object.assign(
            table === "classes" && !p.id ? { id: "sec-" + (rows.length + i + 1) } : {}, p));
          rows.push(...added);
          data = m === "single" ? added[0] : added;
        } else if (op === "upsert") {
          if (T.upsertError && T.upsertError[table]) {
            return Promise.resolve({ data: null, error: { message: T.upsertError[table] } });
          }
          const list = Array.isArray(payload) ? payload : [payload];
          list.forEach((p) => {
            const keys = (opts && opts.onConflict
              ? opts.onConflict.split(",")
              : ["student_id"]
            ).map((s) => s.trim());
            const existing = rows.find((r) => keys.every((k) => r[k] === p[k]));
            if (existing) Object.assign(existing, p);
            else rows.push(Object.assign({}, p));
          });
          data = list;
        } else if (op === "update") {
          match(rows, filters).forEach((r) => Object.assign(r, payload));
        } else if (op === "delete") {
          // Unequipping is a delete rather than a null item_id, because
          // player_equipment.item_id is not null and an empty slot is
          // the absence of a row. The stub needs the verb for that.
          match(rows, filters).forEach((r) => {
            const at = rows.indexOf(r);
            if (at !== -1) rows.splice(at, 1);
          });
        }
      } catch (err) {
        return Promise.resolve({ data: null, error: { message: String(err) } });
      }
      return Promise.resolve({ data, error: null });
    }

    const b = {
      select() { return b; },
      eq(k, v) { filters.push([k, v]); return b; },
      in(k, list) { filters.push([k, list, "in"]); return b; },
      gt(k, v) { filters.push([k, v, "gt"]); return b; },
      order() { return b; },
      maybeSingle() { mode = "maybe"; return exec("maybe"); },
      single() { return exec("single"); },
      then(res, rej) { return exec(mode).then(res, rej); },
    };
    return b;
  }

  window.sb = {
    from(table) {
      return {
        select(cols, o) { return builder(table, "select", null, o).select(); },
        insert(p) { return builder(table, "insert", p); },
        upsert(p, o) { return builder(table, "upsert", p, o); },
        update(p) { return builder(table, "update", p); },
        delete() { return builder(table, "delete"); },
      };
    },
    rpc(name, args) {
      window.__CALLS.push({ rpc: name, args });

      // Block 153, schema v15. As the live function: grades the choices
      // ({ item_order: choice }) against the act's questions, enforces
      // the attempts, writes the row and answers with the score. The
      // live database holds every act's questions (the built-in bank was
      // seeded into it), so with none seeded here the stub grades
      // against window.QUESTIONS, which is that same bank.
      // __TEST.insertError.assessment_scores still stands for a dropped
      // connection, as it did when the game inserted the row itself.
      if (name === "submit_test") {
        if (T.insertError && T.insertError.assessment_scores) {
          return Promise.resolve({ data: null, error: { message: T.insertError.assessment_scores } });
        }
        const a = args || {};
        const uid = session && session.user && session.user.id;
        const fail = (message, code) => Promise.resolve({ data: null, error: { message, code } });
        if (!uid) return fail("NOT_SIGNED_IN", "28000");
        const rows = db.assessment_scores;
        const mine = rows.filter((r) => r.student_id === uid && r.act_number === a.p_act && r.test_type === a.p_test)
          .sort((x, y) => (Number(x.attempt) || 1) - (Number(y.attempt) || 1));
        const passed = (r) => a.p_test === "pre" || Number(r.max_score) === 0 || r.score / r.max_score >= 0.75;
        const same = mine.find((r) => (Number(r.attempt) || 1) === a.p_attempt);
        if (same) {
          return Promise.resolve({ data: { score: same.score, max_score: same.max_score,
            attempt: Number(same.attempt) || 1, passed: passed(same), already: true }, error: null });
        }
        const last = mine[mine.length - 1];
        let attempt = 1;
        if (last) {
          if (a.p_test === "pre") return fail("ALREADY_SUBMITTED", "23505");
          if (passed(last)) return fail("ALREADY_PASSED", "23505");
          attempt = (Number(last.attempt) || 1) + 1;
        }
        if (a.p_attempt != null && a.p_attempt !== attempt) return fail("BAD_ATTEMPT", "23505");
        let items = db.assessment_items.filter((r) => r.act_number === a.p_act && r.test_type === a.p_test)
          .sort((x, y) => x.item_order - y.item_order);
        if (!items.length) {
          const bank = (window.QUESTIONS && window.QUESTIONS[a.p_act] && window.QUESTIONS[a.p_act][a.p_test]) || [];
          items = bank.map((q, i) => ({ id: "q" + (i + 1), item_order: i + 1, question: q.question, correct_index: q.correct,
            item_type: q.type, correct_indexes: Array.isArray(q.correct) ? q.correct : null }));
        }
        if (!items.length) return fail("NO_ITEMS", "P0002");
        // Block 160 (schema v17): graded as the database grades.
        const answers = {};
        let score = 0;
        let max = 0;
        items.forEach((it) => {
          const c = (a.p_answers || {})[String(it.item_order)];
          const q = String(it.question).slice(0, 600);
          if (it.item_type === "essay") {
            if (typeof c === "string" && c.trim()) answers[it.id] = { o: it.item_order, t: "essay", e: c.trim().slice(0, 2000), q };
            return;
          }
          max++;
          if (it.item_type === "multi") {
            if (!Array.isArray(c) || !c.length || !c.every(Number.isInteger)) return;
            const set = [...new Set(c)].sort((x, y) => x - y);
            const key = [...new Set(it.correct_indexes || [it.correct_index])].sort((x, y) => x - y);
            const k = set.length === key.length && set.every((n, i) => n === key[i]) ? 1 : 0;
            score += k;
            answers[it.id] = { o: it.item_order, t: "multi", c: set, k, q };
            return;
          }
          if (!Number.isInteger(c)) return;
          const k = c === it.correct_index ? 1 : 0;
          score += k;
          answers[it.id] = { o: it.item_order, c, k, q };
        });
        const row = { student_id: uid, act_number: a.p_act, test_type: a.p_test,
          score, max_score: max, attempt, answers };
        rows.push(row);
        return Promise.resolve({ data: { score, max_score: max, attempt, passed: passed(row) }, error: null });
      }
      // No items seeded for any act, which is the documented state
      // until macario_items_v3.sql is run.
      if (name === "get_assessment_items") {
        return Promise.resolve({ data: [], error: null });
      }

      // Schema v5. The live functions are security definer and check
      // a named allowlist; here the answer is seeded per test case, so
      // the suite can drive an allowed account, a refused one, and a
      // failing call without inventing a second stub.
      if (name === "can_reset_my_data") {
        return Promise.resolve({ data: T.canReset === true, error: null });
      }
      if (name === "reset_my_play_data") {
        if (T.resetError) {
          return Promise.resolve({ data: null, error: { message: T.resetError } });
        }
        if (T.canReset !== true) {
          return Promise.resolve({ data: null, error: { message: "NOT_ALLOWED" } });
        }
        // Exactly the seven tables the function deletes from, in the
        // order it deletes them. profiles is deliberately absent: the
        // account survives a wipe.
        ["feedback", "assessment_scores", "act_progress", "game_progress",
         "game_sessions", "player_equipment", "player_inventory"]
          .forEach((t) => { if (db[t]) db[t].length = 0; });
        return Promise.resolve({ data: null, error: null });
      }

      return Promise.resolve({ data: null, error: null });
    },
    // Block 132. The create-students function, as the dashboard calls it.
    // "create" makes the profiles the live function would (enrolled,
    // numbered on), "reset" a new password; __TEST.fnError makes it
    // refuse with that word, the way supabase-js hands a refusal back.
    functions: {
      invoke(name, opts) {
        const body = (opts && opts.body) || {};
        window.__CALLS.push({ fn: name, body });
        if (T.fnError) {
          const word = T.fnError;
          return Promise.resolve({ data: null, error: { message: "Edge Function returned a non-2xx status code",
            context: { json: () => Promise.resolve({ error: word }) } } });
        }
        if (body.action === "create") {
          db.profiles = db.profiles || [];
          const re = new RegExp("^" + body.prefix + "-(\\d+)$");
          let next = db.profiles.reduce((m, p) => {
            const k = re.exec(p.full_name || "");
            return k ? Math.max(m, Number(k[1])) : m;
          }, 0) + 1;
          const accounts = [];
          for (let i = 0; i < body.count; i++, next++) {
            const code = body.prefix + "-" + String(next).padStart(2, "0");
            // Block 159: the n-th name for the n-th account.
            const name = (body.names || [])[i] || null;
            db.profiles.push({ id: "new-" + code, role: "student", full_name: code, class_id: body.class_id, display_name: name });
            accounts.push({ code, password: String(100000 + next), name });
          }
          return Promise.resolve({ data: { accounts }, error: null });
        }
        // Block 159. A name from the student card; empty clears it.
        if (body.action === "rename") {
          const p = (db.profiles || []).find((x) => x.id === body.student_id);
          if (!p) return Promise.resolve({ data: null, error: { message: "NOT_YOUR_STUDENT" } });
          p.display_name = String(body.name || "").trim() || null;
          return Promise.resolve({ data: { code: p.full_name, name: p.display_name }, error: null });
        }
        if (body.action === "reset") {
          const p = (db.profiles || []).find((x) => x.id === body.student_id);
          return Promise.resolve({ data: { code: p ? p.full_name : "", password: "654321" }, error: null });
        }
        // Block 150. As the live function: archive and restore set and
        // clear archived_at; delete refuses anyone with a row in a play
        // table (HAS_DATA) and removes the rest.
        if (body.action === "archive" || body.action === "restore" || body.action === "delete") {
          const results = (body.student_ids || []).map((id) => {
            const p = (db.profiles || []).find((x) => x.id === id);
            const code = p ? p.full_name : "";
            if (!p) return { id, code, ok: false, error: "NOT_FOUND" };
            if (body.action === "delete") {
              const played = ["game_progress", "act_progress", "assessment_scores", "game_sessions",
                "feedback", "player_inventory", "player_equipment"]
                .some((t) => (db[t] || []).some((r) => r.student_id === id));
              if (played) return { id, code, ok: false, error: "HAS_DATA" };
              db.profiles.splice(db.profiles.indexOf(p), 1);
              return { id, code, ok: true };
            }
            p.archived_at = body.action === "archive" ? "2026-10-25T00:00:00Z" : null;
            return { id, code, ok: true };
          });
          return Promise.resolve({ data: { results }, error: null });
        }
        // Block 164. Students to another section: only class_id changes.
        if (body.action === "move") {
          const moved = (db.profiles || []).filter((p) => (body.student_ids || []).includes(p.id));
          moved.forEach((p) => { p.class_id = body.class_id; });
          return Promise.resolve({ data: { moved: moved.length }, error: null });
        }
        // Block 166. The administrator's actions, as the live function.
        if (body.action === "teacher-create") {
          db.profiles = db.profiles || [];
          const id = "teacher-" + (db.profiles.length + 1);
          db.profiles.push({ id, role: "teacher", full_name: body.name, class_id: null });
          return Promise.resolve({ data: { id, email: body.email, password: "abcdefgh2345" }, error: null });
        }
        if (body.action === "teacher-reset") {
          return Promise.resolve({ data: { email: "t@example.com", password: "newpass23456" }, error: null });
        }
        if (body.action === "teacher-archive" || body.action === "teacher-restore") {
          const p = (db.profiles || []).find((x) => x.id === body.teacher_id);
          if (p) p.archived_at = body.action === "teacher-archive" ? "2026-11-14T00:00:00Z" : null;
          return Promise.resolve({ data: { ok: true }, error: null });
        }
        if (body.action === "section-create") {
          db.classes = db.classes || [];
          const id = "sec-" + (db.classes.length + 1);
          db.classes.push({ id, class_name: body.class_name, teacher_id: body.teacher_id, join_code: "S" });
          return Promise.resolve({ data: { id }, error: null });
        }
        if (body.action === "section-assign") {
          const c = (db.classes || []).find((x) => x.id === body.class_id);
          if (c) c.teacher_id = body.teacher_id;
          return Promise.resolve({ data: { ok: true }, error: null });
        }
        return Promise.resolve({ data: null, error: { message: "BAD_ACTION" } });
      },
    },
    auth: {
      getSession() { return Promise.resolve({ data: { session } }); },
      onAuthStateChange(cb) {
        listeners.push(cb);
        return { data: { subscription: { unsubscribe() {} } } };
      },
      // Block 122. With __TEST.currentPassword set, any other password is
      // refused, as Supabase refuses a wrong one (the password change
      // checks the current one this way).
      signInWithPassword(creds) {
        window.__CALLS.push({ auth: "signInWithPassword" });
        if (T.currentPassword && creds && creds.password !== T.currentPassword) {
          return Promise.resolve({ error: { message: "Invalid login credentials" } });
        }
        session = { user: { id: "u1" } };
        listeners.forEach((cb) => cb("SIGNED_IN", session));
        return Promise.resolve({ error: null });
      },
      signOut() { session = null; return Promise.resolve({ error: null }); },
      // Block 68. The password change from settings.
      updateUser(attrs) {
        window.__CALLS.push({ auth: "updateUser", attrs });
        if (T.passwordError) return Promise.resolve({ data: null, error: { message: T.passwordError } });
        return Promise.resolve({ data: { user: session && session.user }, error: null });
      },
    },
  };
})();
