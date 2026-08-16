// Supabase project connection.
// The publishable key is safe to expose here — actual data protection
// comes from the Row Level Security policies set up in the database
// (see macario_schema.sql), not from hiding this key.

const SUPABASE_URL = "https://rkfnovfkroajottpmxxq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable__2EtEOa12QW3IoOH1fj88Q_73BDqJrs";

// `supabase` here is the global provided by the CDN script tag in index.html.
// We create our own client and store it as `sb` so game.js can use it.
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
