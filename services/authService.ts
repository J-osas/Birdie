
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';

export const authService = {
  /**
   * Signup Flow:
   * Passes first_name, last_name, and role into user_metadata.
   * The database trigger 'handle_new_user' listens for this and creates the public.profiles record.
   */
  async signUp(email: string, pass: string, firstName: string, lastName: string, role: UserRole) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: { 
          first_name: firstName, 
          last_name: lastName, 
          role: role 
        }
      }
    });

    if (authError) {
      // If the error is the common trigger failure, provide a clearer message
      if (authError.message.includes('Database error saving new user')) {
        throw new Error('Our profile system is syncing. Please try again in a few seconds or contact support.');
      }
      throw authError;
    }
    
    return authData.user;
  },

  async signIn(email: string, pass: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass
    });
    if (error) throw error;
    return data.user;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;
    return { ...user, ...profile };
  }
};
