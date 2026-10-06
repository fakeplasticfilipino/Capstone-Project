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
          const added = list.map((p) => Object.assign({}, p));
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
    rpc(name) {
      window.__CALLS.push({ rpc: name });
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
