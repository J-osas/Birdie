
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.43.0';

// Birdie Production Database Credentials
const supabaseUrl = 'https://suciyjcupnubaylgtthb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1Y2l5amN1cG51YmF5bGd0dGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwNjg2NTcsImV4cCI6MjA4NDY0NDY1N30.Zjqs8gy20isRp5ss6q__QIHFfNJ1kebNOXAaynbai4I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
