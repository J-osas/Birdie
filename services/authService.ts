
import { supabase } from '../lib/supabase';
import { UserRole, ProfessionalStatus, Availability, UserStatus } from '../types';

export const authService = {
  /**
   * Signup Flow:
   * 1. Creates Supabase auth user
   * 2. Inserts row into public.profiles (including email now)
   * 3. If professional, inserts into professional_profiles and wallets
   */
  async signUp(email: string, pass: string, firstName: string, lastName: string, role: UserRole) {
    const fullName = `${firstName} ${lastName}`;
    
    // 1. Auth Signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: { 
          full_name: fullName,
          role: role
        }
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("User creation failed.");

    const userId = authData.user.id;

    // 2. Insert Profile - Added email field here
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: fullName,
        email: email, // Persisting email to public schema
        role: role.toLowerCase(),
        status: UserStatus.ACTIVE
      });

    if (profileError) console.error("Profile creation error:", profileError);

    // 3. Conditional Professional Setup
    if (role === UserRole.PROFESSIONAL) {
      // Create Professional Profile with extra id fields
      const { error: proError } = await supabase
        .from('professional_profiles')
        .insert({
          user_id: userId,
          category: 'Driver',
          status: ProfessionalStatus.PENDING,
          profile_completion: 0,
          nin: '',
          proof_of_address: '',
          govt_id: '',
          certifications_url: ''
        });
      
      if (proError) console.error("Pro profile error:", proError);

      // Create Wallet
      const { error: walletError } = await supabase
        .from('wallets')
        .insert({
          professional_id: userId,
          escrow_balance: 0,
          pending_balance: 0,
          available_balance: 0,
          total_withdrawn: 0
        });
      
      if (walletError) console.error("Wallet error:", walletError);
    }
    
    return authData.user;
  },

  async signIn(email: string, pass: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass
    });
    if (error) {
      if (error.message === 'Failed to fetch') {
        throw new Error("Unable to reach the server. Please check your internet or if the database is active.");
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
  }
};
