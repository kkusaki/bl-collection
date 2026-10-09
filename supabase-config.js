
const SUPABASE_URL = "https://bczkhtfbljagncktadah.supabase.co";

const SUPABASE_KEY = "在這裡保留你原本完整的Publishable key";

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
