
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.43.0';

/**
 * Supabase Configuration
 * 
 * In Vercel, add these to your Environment Variables:
 * 1. SUPABASE_URL
 * 2. SUPABASE_ANON_KEY
 */

// Priority 1: Check process.env (Vercel Build)
// Priority 2: Check window.process (some ESM environments)
// Priority 3: Fallback to the hardcoded keys provided for the demo
const getEnv = (key: string, fallback: string) => {
  if (typeof process !== 'undefined' && process.env?.[key]) return process.env[key];
  // @ts-ignore
  if (typeof window !== 'undefined' && window.process?.env?.[key]) return window.process.env[key];
  return fallback;
};

const supabaseUrl = getEnv('SUPABASE_URL', 'https://wajiuwphekflyayjwwmt.supabase.co');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhaml1d3BoZWtmbHlheWp3d210Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMzU0NjAsImV4cCI6MjA4NDcxMTQ2MH0.HjgzWWTjAioIt5eyEuVbHOGCtP4Vnnv_VazBk8HruGg');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
