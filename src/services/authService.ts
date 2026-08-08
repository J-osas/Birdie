import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types';

export const authService = {
  async signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: UserRole.CLIENT | UserRole.PROFESSIONAL
  ) {
    if (role !== UserRole.CLIENT && role !== UserRole.PROFESSIONAL) {
      throw new Error('Invalid registration role.');
    }

    const fullName = `${firstName} ${lastName}`.trim();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error('User creation failed.');
    return data.user;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      if (error.message === 'Failed to fetch') {
        throw new Error('Unable to reach Birdie servers. Check your connection.');
      }
      throw error;
    }
    return data.user;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Record<string, unknown>) {
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw error;
  },
};
