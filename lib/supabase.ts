
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.43.0';

/**
 * Supabase Configuration
 * 
 * To connect to your database:
 * 1. Replace the placeholder URL with your actual Supabase Project URL (starts with https://)
 * 2. Replace the placeholder Key with your actual Supabase Anon Key
 */

const supabaseUrl = (typeof process !== 'undefined' && process.env?.SUPABASE_URL) 
  ? process.env.SUPABASE_URL 
  : 'https://wajiuwphekflyayjwwmt.supabase.co';

const supabaseAnonKey = (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) 
  ? process.env.SUPABASE_ANON_KEY 
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhaml1d3BoZWtmbHlheWp3d210Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMzU0NjAsImV4cCI6MjA4NDcxMTQ2MH0.HjgzWWTjAioIt5eyEuVbHOGCtP4Vnnv_VazBk8HruGg';

// This will no longer throw "Invalid supabaseUrl" because the fallback is a valid URL format.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
