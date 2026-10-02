// =============================================================
// MACARIO — _dev/tools/profile.js (Block 107)
//
// Measures the real game the way a slow phone would run it, so a change
// to the engine is judged by numbers rather than by feel (Block 66 did
// this by hand once; this makes it one command):
//
//   node _dev/tools/profile.js              CPU slowed 6 times (default)
//   node _dev/tools/profile.js --cpu=4      another slowdown
//   node _dev/tools/profile.js --json       the numbers as JSON
//
// It serves the repository, opens index.html in headless Chromium at
// phone landscape (823 by 412) with the fake Supabase client (nothing
// touches the live project), resumes a student on the street past the
// opening, and runs four scenes of play:
//
//   stand      four seconds standing still
//   guards     six seconds standing on the pamphlet night, the three
//              guardia civil walking their beats
//   walk       eight seconds holding right along the street: a walk that
//              breaks into a run after RUN_AFTER_MS, as a student plays
//   scenes     the street and the entablado, back and forth eight times
//
// For each it prints the frames: the median and the 95th percentile
// interval, and the share slower than 33 ms (below 30 fps); and Chrome's
// own counters per second: style recalculations, layouts, and the time
// spent in script, style and layout. For scenes it prints the DOM nodes,
// the event listeners and the heap after each round trip, garbage
// collected first: a count that climbs with every trip is a leak.
//
// Headless Chromium on a desktop slowed six times is not a phone; the
// numbers are for comparing a change against the code before it, on the
// same computer, not for promising a frame rate.
// =============================================================

"use strict";

const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const PORT = 8091;
const STUB = fs.readFileSync(path.join(ROOT, "_dev", "tests", "sb-stub.js"), "utf8");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png",
  ".jpg": "image/jpeg", ".mp3": "audio/mpeg", ".wav": "audio/wav", ".woff2": "font/woff2" };
const arg = (name, dflt) => {
  const a = process.argv.find((x) => x.startsWith("--" + name + "="));
  return a ? a.split("=")[1] : dflt;
};
const CPU = Number(arg("cpu", 6));
const JSON_OUT = process.argv.includes("--json");

// Past the opening: the first talk done, standing on the street.
const SAVE = {
  session: { user: { id: "u1" } },
  game_progress: [{ student_id: "u1", current_act: 1, current_room: "tondo", currency: 0,
    save_state: { quests: [], posX: 300, flags: { nakitaAngMgaSiga: true, nakausapSiNanaySaBahay: true,
      nagpasyangMagtrabaho: true, "__turo_lakad": true, "__turo_talon": true, "__turo_usap": true,
      "__turo_atake": true, "__turo_tanda": true, "__turo_bag": true } } }],
  act_progress: [{ student_id: "u1", act_number: 1, status: "playing", objectives_done: 1 }],
};

// The pamphlet night (Block 81): the three guardia civil on their beats.
// The same flags verify_new_scene.js reaches the night with.
const NIGHT_FLAGS = Object.assign({}, SAVE.game_progress[0].save_state.flags, {
  nakausapAngKutsero: true, naalagaanAngKabayo: true, nakausapAngMananahi: true,
  tinawagAngMananahi: true, mayDalangDamit: true, naihatidKay_direktor: true,
  naihatidAngMgaDamit: true, naitanghalAngDula: true, nabayaranNgMananahi: true,
  naibigayAngIponKayNanay: true, lumipasAngApatNaTaon: true, naitanghalAngBaldovino: true,
  nilapitanNgKatipunan: true, nakausapAngKasama: true, tinanggapSaKatipunan: true,
});
const NIGHT = Object.assign({}, SAVE, {
  game_progress: [Object.assign({}, SAVE.game_progress[0], {
    save_state: { quests: [], posX: 4650, flags: NIGHT_FLAGS } })],
});

const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "") || "index.html";
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "text/plain" });
    res.end(data);
  });
});

const pct = (xs, p) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
};

async function metrics(cdp) {
  const { metrics: list } = await cdp.send("Performance.getMetrics");
  return Object.fromEntries(list.map((m) => [m.name, m.value]));
}

async function measure(page, cdp, name, seconds, act) {
  const x0 = await page.evaluate(() => {
    // A loop per measurement, stopped by its own number, so one left
    // running from the last measurement cannot count twice.
    const run = (window.__frameRun || 0) + 1;
    window.__frameRun = run;
    window.__frames = [];
    let last = performance.now();
    const tick = (now) => {
      if (window.__frameRun !== run) return;
      window.__frames.push(now - last);
      last = now;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return posX;
  });
  const before = await metrics(cdp);
  if (act) await act();
  await page.waitForTimeout(seconds * 1000);
  const after = await metrics(cdp);
  const frames = await page.evaluate(() => { window.__frameRun++; return window.__frames.slice(1); });
  const moved = Math.round((await page.evaluate(() => posX)) - x0);
  const d = (k) => (after[k] || 0) - (before[k] || 0);
  const per = (k) => +(d(k) / seconds).toFixed(1);
  const ms = (k) => +((d(k) * 1000) / seconds).toFixed(1);
  return {
    name,
    moved,
    frames: frames.length,
    p50: +pct(frames, 50).toFixed(1),
    p95: +pct(frames, 95).toFixed(1),
    slow: +((frames.filter((f) => f > 33.4).length / Math.max(1, frames.length)) * 100).toFixed(1),
    stylesPerSec: per("RecalcStyleCount"),
    layoutsPerSec: per("LayoutCount"),
    scriptMsPerSec: ms("ScriptDuration"),
    styleMsPerSec: ms("RecalcStyleDuration"),
    layoutMsPerSec: ms("LayoutDuration"),
  };
}

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch();
  const errors = [];
  const open = async (save) => {
    const ctx = await browser.newContext({ viewport: { width: 823, height: 412 } });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    await page.route("**/supabaseClient.js*", (r) => r.fulfill({ body: STUB, contentType: "text/javascript" }));
    await page.route("**/js/vendor/supabase.js*", (r) => r.fulfill({ body: "", contentType: "text/javascript" }));
    await page.addInitScript((s) => { window.__TEST = s; }, save);
    await page.goto("http://localhost:" + PORT + "/index.html");
    await page.waitForTimeout(500);
    await page.click("#shell-start");
    for (let i = 0; i < 100 && (await page.evaluate(() => Shell.state)) !== "playing"; i++) await page.waitForTimeout(100);
    await page.waitForTimeout(1500);
    // Close whatever opened on arrival, so the street is free.
    for (let i = 0; i < 6; i++) {
      const up = await page.evaluate(() => !document.getElementById("dialogue-box").classList.contains("hidden"));
      if (!up) break;
      await page.keyboard.press("e");
      await page.waitForTimeout(300);
    }
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Performance.enable");
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU });
    return { ctx, page, cdp };
  };

  const night = await open(NIGHT);
  const guardsUp = await night.page.evaluate(() => GUARDS.length);
  const nightResult = await measure(night.page, night.cdp, "guards", 6);
  nightResult.name = "guards" + (guardsUp === 3 ? "" : "?");
  await night.ctx.close();

  const { page, cdp } = await open(SAVE);

  const results = [];
  results.push(await measure(page, cdp, "stand", 4));
  results.push(nightResult);
  results.push(await measure(page, cdp, "walk", 8, () => page.keyboard.down("d")));
  await page.keyboard.up("d");

  // Scene changes: is anything left behind each time?
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  const trips = [];
  for (let i = 0; i < 8; i++) {
    await page.evaluate(() => Acts.gotoScene("entablado"));
    await page.waitForTimeout(900);
    await page.evaluate(() => Acts.gotoScene("tondo", { x: 600 }));
    await page.waitForTimeout(900);
    await cdp.send("HeapProfiler.collectGarbage");
    const m = await metrics(cdp);
    trips.push({ nodes: m.Nodes, listeners: m.JSEventListeners, heapMB: +(m.JSHeapUsedSize / 1048576).toFixed(1) });
  }

  await browser.close();
  server.close();

  if (JSON_OUT) {
    console.log(JSON.stringify({ cpu: CPU, results, trips, errors }, null, 1));
    return;
  }
  console.log("CPU slowed " + CPU + " times, 823 by 412\n");
  console.log("scene   moved px  frames  p50 ms  p95 ms  >33ms %  styles/s  layouts/s  script ms/s  style ms/s  layout ms/s");
  for (const r of results) {
    console.log([r.name.padEnd(7), String(r.moved).padStart(8), String(r.frames).padStart(6), String(r.p50).padStart(7), String(r.p95).padStart(7),
      String(r.slow).padStart(8), String(r.stylesPerSec).padStart(9), String(r.layoutsPerSec).padStart(10),
      String(r.scriptMsPerSec).padStart(12), String(r.styleMsPerSec).padStart(11), String(r.layoutMsPerSec).padStart(12)].join(" "));
  }
  console.log("\nscene changes, street and entablado, after each round trip (garbage collected):");
  trips.forEach((t, i) => console.log("  " + (i + 1) + "  nodes " + t.nodes + "  listeners " + t.listeners + "  heap " + t.heapMB + " MB"));
  const grew = trips[trips.length - 1].nodes - trips[1].nodes;
  const grewL = trips[trips.length - 1].listeners - trips[1].listeners;
  console.log("  growth from trip 2 to " + trips.length + ": " + grew + " nodes, " + grewL + " listeners" +
    (grew > 50 || grewL > 50 ? "  <- something is left behind" : ""));
  if (errors.length) console.log("\npage errors:\n  " + errors.join("\n  "));
})();
