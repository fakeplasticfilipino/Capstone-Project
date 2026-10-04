// =============================================================
// MACARIO — _dev/tests/run.js
//
// Block 115. Both suites, split into pieces and run side by side: each
// part of verify_new_scene.js, and test.js's sections a few at a time,
// every piece its own node process with its own browser and its own
// free port, several at once. The suites already pass their pieces
// alone (--only), so nothing is shared between them but the files.
//
//   node _dev/tests/run.js                     everything, side by side
//   node _dev/tests/run.js verify:act1,act2 test:BR,BO
//                                              only those pieces
//   node _dev/tests/run.js --list              the pieces it would run
//   --jobs=N     how many at once (default: half the cores, 2 to 6)
//   --shard=I/N  every Nth piece from the Ith, for CI's parallel jobs
//   --real       the story at a student's speed (no fast-forward)
//
// Prints each piece as it finishes, with its time, then every FAIL line
// together, and exits 1 if anything failed.
// =============================================================
const { spawn, execFileSync } = require("child_process");
const os = require("os");
const path = require("path");

const DIR = __dirname;
const SUITES = { test: "test.js", verify: "verify_new_scene.js" };
const TEST_GROUP = 6; // test.js sections per process

const args = process.argv.slice(2);
const flag = (name) => {
  const a = args.find((x) => x.startsWith("--" + name + "="));
  return a ? a.slice(name.length + 3) : null;
};
const LIST = args.includes("--list");
const REAL = args.includes("--real");
const JOBS = Number(flag("jobs")) || Math.max(2, Math.min(6, Math.floor(os.cpus().length / 2)));
const SHARD = (() => {
  const s = flag("shard");
  if (!s) return null;
  const [i, n] = s.split("/").map(Number);
  return i >= 1 && n >= 1 && i <= n ? { i, n } : null;
})();
// "verify:act1,act2" or "test:BR": only those pieces of that suite.
const picks = {};
for (const a of args.filter((x) => !x.startsWith("--"))) {
  const [suite, list] = a.split(":");
  if (!SUITES[suite]) { console.error("unknown suite " + suite + " (test or verify)"); process.exit(2); }
  picks[suite] = (list || "").split(",").map((x) => x.trim()).filter(Boolean);
}

// The pieces a suite has, from its own --list.
function listOf(suite) {
  const out = execFileSync(process.execPath, [path.join(DIR, SUITES[suite]), "--list"], { encoding: "utf8" });
  return out.split("\n").map((l) => l.trim().split(/\s+/)[0]).filter((id) => id && /^[A-Za-z0-9]+$/.test(id));
}

function pieces() {
  const out = [];
  const wanted = (suite) => !Object.keys(picks).length || picks[suite];
  if (wanted("verify")) {
    const ids = picks.verify && picks.verify.length ? picks.verify : listOf("verify");
    for (const id of ids) out.push({ suite: "verify", ids: [id] });
  }
  if (wanted("test")) {
    const ids = picks.test && picks.test.length ? picks.test : listOf("test");
    for (let k = 0; k < ids.length; k += TEST_GROUP) out.push({ suite: "test", ids: ids.slice(k, k + TEST_GROUP) });
  }
  // The long pieces first, so a slow one does not start last.
  out.sort((a, b) => (b.suite === "verify") - (a.suite === "verify"));
  return SHARD ? out.filter((_, i) => i % SHARD.n === SHARD.i - 1) : out;
}

function run(p) {
  return new Promise((resolve) => {
    const started = Date.now();
    const argv = [path.join(DIR, SUITES[p.suite]), "--only=" + p.ids.join(",")].concat(REAL ? ["--real"] : []);
    const child = spawn(process.execPath, argv, { env: Object.assign({}, process.env, { PORT: "0" }) });
    let log = "";
    child.stdout.on("data", (d) => { log += d; });
    child.stderr.on("data", (d) => { log += d; });
    child.on("close", (code) => {
      const m = log.match(/(\d+) passed, (\d+) failed/);
      resolve({ p, code, log, secs: Math.round((Date.now() - started) / 1000),
        pass: m ? Number(m[1]) : 0, fail: m ? Number(m[2]) : (code ? 1 : 0) });
    });
  });
}

(async () => {
  const list = pieces();
  const name = (p) => p.suite + ":" + p.ids.join(",");
  if (LIST) { list.forEach((p) => console.log("  " + name(p))); return; }
  console.log(list.length + " pieces, " + JOBS + " at a time" + (SHARD ? ", shard " + SHARD.i + "/" + SHARD.n : "") +
    (REAL ? ", at a student's speed" : ""));
  const t0 = Date.now();
  const results = [];
  let next = 0;
  async function worker() {
    while (next < list.length) {
      const r = await run(list[next++]);
      results.push(r);
      console.log((r.code ? "  FAIL  " : "  ok    ") + name(r.p).padEnd(34) + String(r.secs).padStart(4) + "s  " +
        r.pass + " passed, " + r.fail + " failed");
    }
  }
  await Promise.all(Array.from({ length: Math.min(JOBS, list.length) }, worker));
  const failed = results.filter((r) => r.code);
  for (const r of failed) {
    console.log("\n" + name(r.p) + ":");
    const lines = r.log.split("\n").filter((l) => /FAIL|Error|error/.test(l));
    console.log((lines.length ? lines : r.log.split("\n").slice(-15)).slice(0, 30).join("\n"));
  }
  const pass = results.reduce((a, r) => a + r.pass, 0);
  const fail = results.reduce((a, r) => a + r.fail, 0);
  console.log("\n" + pass + " passed, " + fail + " failed, in " + Math.round((Date.now() - t0) / 1000) + "s");
  process.exit(failed.length ? 1 : 0);
})();
