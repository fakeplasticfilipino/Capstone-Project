// =============================================================
// create_accounts.js
//
// Bulk-creates pre-approved accounts (students/teachers) directly
// in Supabase, with emails auto-confirmed — no confirmation email
// is sent at all, so there's no rate limit to worry about.
//
// ⚠️ SECURITY: this script uses the SECRET key, which has full
// admin access to your database. Run it ONLY on your own computer.
// Never put the secret key in game.js, index.html, or anywhere
// that gets pushed to GitHub / GitHub Pages.
//
// HOW TO RUN:
//   1. npm install @supabase/supabase-js   (one-time, in this folder)
//   2. Fill in SUPABASE_URL and SUPABASE_SECRET_KEY below
//   3. Edit the ACCOUNTS list at the bottom with real logins
//   4. node create_accounts.js
// =============================================================

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://rkfnovfkroajottpmxxq.supabase.co";
const SUPABASE_SECRET_KEY = "PASTE_YOUR_SECRET_KEY_HERE"; // sb_secret_...

const sbAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

// Edit this list with the real accounts you want to pre-create.
// role must be "student" or "teacher" (matches the database's check).
const ACCOUNTS = [
  { email: "student1@example.com", password: "changeme123", full_name: "Juan Dela Cruz", role: "student" },
  { email: "student2@example.com", password: "changeme123", full_name: "Maria Santos", role: "student" },
  { email: "teacher1@example.com", password: "changeme123", full_name: "Guro Rivera", role: "teacher" },
];

async function main() {
  for (const account of ACCOUNTS) {
    const { data, error } = await sbAdmin.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true, // skips the confirmation email entirely
      user_metadata: {
        full_name: account.full_name,
        role: account.role,
      },
    });

    if (error) {
      console.error(`FAILED: ${account.email} — ${error.message}`);
    } else {
      console.log(`Created: ${account.email} (${account.role}) — user id ${data.user.id}`);
    }
  }
  console.log("Done.");
}

main();
