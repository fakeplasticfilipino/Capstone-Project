// =============================================================
// MACARIO — _dev/sb-stub.js
//
// A fake Supabase client. Stands in for supabaseClient.js during
// tests, so the suite drives the real game against an in-memory
// database and never touches the live project.
//
// It is injected by _dev/test.js through request interception, not
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
    player_inventory: T.player_inventory || [],
    player_equipment: T.player_equipment || [],
  };
  let session = T.session || null;
  const listeners = [];

  // Exposed so assertions can read what the game wrote.
  window.__DB = db;
  window.__CALLS = [];

  const match = (rows, filters) =>
    rows.filter((r) => filters.every(([k, v]) => r[k] === v));

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
          data = m === "maybe" || m === "single" ? found[0] || null : found;
          if (m === "single" && !found[0]) {
            return Promise.resolve({ data: null, error: { message: "no rows" } });
          }
        } else if (op === "insert") {
          const row = Object.assign({}, payload);
          rows.push(row);
          data = m === "single" ? row : [row];
        } else if (op === "upsert") {
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
        select() { return builder(table, "select").select(); },
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
      return Promise.resolve({ data: null, error: null });
    },
    auth: {
      getSession() { return Promise.resolve({ data: { session } }); },
      onAuthStateChange(cb) {
        listeners.push(cb);
        return { data: { subscription: { unsubscribe() {} } } };
      },
      signInWithPassword() {
        session = { user: { id: "u1" } };
        listeners.forEach((cb) => cb("SIGNED_IN", session));
        return Promise.resolve({ error: null });
      },
      signOut() { session = null; return Promise.resolve({ error: null }); },
    },
  };
})();
