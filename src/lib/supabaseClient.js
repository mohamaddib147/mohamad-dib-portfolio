import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// null when env vars aren't configured (e.g. local dev without .env.local, or
// a misconfigured deploy) — callers must treat this the same as a fetch
// failure rather than crashing the whole app at import time.
export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Exposed for callers that need to hit an Edge Function directly (fetch,
// not the supabase-js client) — e.g. AskWidget calling ask-portfolio.
export const supabaseUrlForFunctions = supabaseUrl;
export const supabaseAnonKeyForFunctions = supabaseAnonKey;
