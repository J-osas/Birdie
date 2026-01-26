import { supabase } from '../lib/supabase';
import { 
  ProfessionalProfile, 
  Wallet, 
  HireRequest, 
  WalletTransaction, 
  WithdrawalRequest,
  RequestStatus,
  TransactionType,
  TransactionStatus,
  ProfessionalStatus,
  Availability,
  User,
  UserRole,
  UserStatus
} from '../types';

export const dataService = {
  
  // USER MANAGEMENT (ADMIN)
  async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error || !data) return [];
      
      return data.map((d: any) => ({
        id: d.id,
        firstName: d.full_name?.split(' ')[0] || '',
        lastName: d.full_name?.split(' ')[1] || '',
        name: d.full_name,
        email: d.email || '', 
        phone: d.phone || '',
        role: (d.role?.toLowerCase() || 'client') as UserRole,
        status: (d.status?.toLowerCase() || 'active') as UserStatus,
        emailVerified: true,
        createdAt: d.created_at || new Date().toISOString(),
        updatedAt: d.updated_at || d.created_at || new Date().toISOString()
      }));
    } catch (e) {
      console.error("GetAllUsers Error:", e);
      return [];
    }
  },

  async updateUserRole(userId: string, newRole: UserRole) {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole.toLowerCase() }) // Removed updated_at as it might be missing
      .eq('id', userId);
    if (error) throw error;
    return true;
  },

  async deleteUser(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    if (error) throw error;
    return true;
  },

  // PROFESSIONAL MANAGEMENT
  async getProfessionalProfile(userId: string): Promise<ProfessionalProfile | null> {
    try {
      const { data, error } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error || !data) return null;
      
      return {
        id: data.id,
        userId: data.user_id,
        category: data.category || 'Driver',
        bio: data.bio || '',
        location: data.location || '',
        phone: data.phone || '',
        availability: (data.availability || Availability.AVAILABLE) as Availability, 
        profileCompletion: data.profile_completion || 0,
        status: (data.status?.toUpperCase() as ProfessionalStatus) || ProfessionalStatus.PENDING,
        aptitudeScore: data.aptitude_score || 0,
        publicVisible: data.public_visible || false,
        createdAt: data.created_at || new Date().toISOString(),
        rating: data.rating || 0,
        reviewCount: data.review_count || 0,
        completedJobs: data.completed_jobs || 0,
        nin: data.nin,
        proofOfAddress: data.proof_of_address,
        govtId: data.govt_id,
        certificationsUrl: data.certifications_url
      };
    } catch (e) {
      console.error("DataService Error (Profile):", e);
      return null;
    }
  },

  async updateProfessionalProfile(userId: string, updates: Partial<ProfessionalProfile>) {
    try {
      const dbUpdates: any = {};
      if (updates.category) dbUpdates.category = updates.category;
      if (updates.bio) dbUpdates.bio = updates.bio;
      if (updates.location) dbUpdates.location = updates.location;
      if (updates.phone) dbUpdates.phone = updates.phone;
      if (updates.status) dbUpdates.status = updates.status.toLowerCase();
      if (updates.aptitudeScore !== undefined) dbUpdates.aptitude_score = updates.aptitudeScore;
      if (updates.nin) dbUpdates.nin = updates.nin;
      if (updates.profileCompletion !== undefined) dbUpdates.profile_completion = updates.profileCompletion;

      const { error } = await supabase
        .from('professional_profiles')
        .update(dbUpdates)
        .eq('user_id', userId);
      
      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Update Profile Error:", e);
      return false;
    }
  },

  async updateProfessionalStatus(userId: string, status: ProfessionalStatus) {
    const isVerified = status === ProfessionalStatus.VERIFIED || status === ProfessionalStatus.APPROVED;
    // Map internal status to lowercase for DB compatibility. 
    // Removed updated_at because schema check showed it doesn't exist on this table.
    const { error } = await supabase
      .from('professional_profiles')
      .update({ 
        status: status.toLowerCase(), 
        public_visible: isVerified
      })
      .eq('user_id', userId);
    
    if (error) throw error;
    return true;
  },

  async getAllProfessionals(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          role,
          professional_profiles (
            category,
            status,
            aptitude_score,
            rating,
            bio
          )
        `)
        .eq('role', 'professional'); 
      
      if (error || !data) return [];
      
      return data.map((d: any) => {
        // Correctly handle the joined array from Supabase
        const pro = Array.isArray(d.professional_profiles) ? d.professional_profiles[0] : d.professional_profiles;
        const safePro = pro || {};
        
        return {
          id: d.id, // This is the user_id
          name: d.full_name || 'Birdie Pro',
          category: safePro.category || 'Driver',
          score: safePro.aptitude_score || 0,
          status: (safePro.status?.toUpperCase() || ProfessionalStatus.PENDING) as ProfessionalStatus,
          rating: safePro.rating || 0,
          bio: safePro.bio || ''
        };
      });
    } catch (e) {
      console.error("DataService Error (AllPros):", e);
      return [];
    }
  },

  async getPublicProfessionals(): Promise<any[]> {
    try {
      // Adjusted query to remove 'availability' if it's missing from schema
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          role,
          professional_profiles!inner (
            category,
            status,
            aptitude_score,
            rating,
            bio,
            location,
            public_visible
          )
        `)
        .eq('role', 'professional')
        .eq('professional_profiles.public_visible', true)
        .eq('professional_profiles.status', 'verified');
      
      if (error || !data) {
        console.log("No public pros found or error:", error);
        return [];
      }
      
      return data.map((d: any) => {
        const pro = Array.isArray(d.professional_profiles) ? d.professional_profiles[0] : d.professional_profiles;
        const safePro = pro || {};
        return {
          id: d.id,
          userId: d.full_name || 'Birdie Pro',
          category: safePro.category || 'Driver',
          location: safePro.location || 'Lagos',
          rating: safePro.rating || 0,
          availability: Availability.AVAILABLE, // Default if column missing
          status: (safePro.status?.toUpperCase() || ProfessionalStatus.VERIFIED) as ProfessionalStatus,
          aptitudeScore: safePro.aptitude_score || 0,
          bio: safePro.bio || '',
          reviewCount: 0,
          completedJobs: 0
        };
      });
    } catch (e) {
      console.error("DataService Error (PublicPros):", e);
      return [];
    }
  },

  // WALLETS & TRANSACTIONS
  async getWallet(userId: string): Promise<Wallet | null> {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('professional_id', userId)
        .maybeSingle();
      
      if (error || !data) return null;
      
      return {
        id: data.id,
        professionalId: data.professional_id,
        escrowBalance: data.escrow_balance || 0,
        pendingEarnings: data.pending_balance || 0,
        availableBalance: data.available_balance || 0,
        totalWithdrawn: data.total_withdrawn || 0,
        currency: 'NGN' 
      };
    } catch (e) {
      console.error("DataService Error (Wallet):", e);
      return null;
    }
  },

  async getTransactions(walletId: string): Promise<WalletTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', walletId)
        .order('created_at', { ascending: false });
      
      if (error || !data) return [];
      
      return data.map((d: any) => ({
        id: d.id,
        walletId: d.wallet_id,
        hireRequestId: d.hire_request_id,
        type: d.type as TransactionType,
        amount: d.amount || 0,
        status: d.status as TransactionStatus,
        reference: d.reference || '',
        description: d.description || '',
        createdAt: d.created_at
      }));
    } catch (e) {
      console.error("DataService Error (Transactions):", e);
      return [];
    }
  },

  // HIRE REQUESTS
  async getHireRequests(userId: string, role: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN'): Promise<HireRequest[]> {
    try {
      let query = supabase.from('hire_requests').select('*');
      
      if (role === 'CLIENT') {
        query = query.eq('client_id', userId);
      } else if (role === 'PROFESSIONAL') {
        query = query.eq('professional_id', userId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error || !data) return [];
      
      return data.map((d: any) => ({
        id: d.id,
        clientId: d.client_id,
        professionalId: d.professional_id,
        clientName: d.client_name || 'Anonymous Client',
        professionalName: d.professional_name || 'Unassigned',
        serviceCategory: d.service_category || 'General',
        serviceRequested: d.service_requested || 'Domestic Support',
        status: (d.status?.toUpperCase() as RequestStatus) || RequestStatus.PENDING,
        preferredStartDate: d.preferred_start_date || new Date().toISOString(),
        requestedDate: d.requested_date || new Date().toISOString().split('T')[0],
        submissionDate: d.created_at ? d.created_at.split('T')[0] : 'N/A',
        location: d.location || 'Lagos',
        amount: d.amount || 0,
        requirements: d.requirements || {},
        createdAt: d.created_at,
        updatedAt: d.updated_at
      }));
    } catch (e) {
      console.error("DataService Error (Requests):", e);
      return [];
    }
  },

  async updateHireRequestStatus(requestId: string, status: RequestStatus) {
    const { error } = await supabase
      .from('hire_requests')
      .update({ status: status.toLowerCase() })
      .eq('id', requestId);
    if (error) throw error;
    return true;
  },

  async getWithdrawalRequests(userId?: string): Promise<WithdrawalRequest[]> {
    try {
      let query = supabase.from('withdrawal_requests').select('*');
      
      if (userId) {
        query = query.eq('professional_id', userId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error || !data) return [];
      
      return data.map((d: any) => ({
        id: d.id,
        walletId: d.wallet_id,
        professionalId: d.professional_id,
        professionalName: d.professional_name || 'Professional',
        amount: d.amount || 0,
        bankName: d.bank_name || 'Bank',
        accountNumber: d.account_number || '0000000000',
        accountName: d.account_name || 'Name',
        status: d.status?.toUpperCase() as any,
        requestedAt: d.created_at
      }));
    } catch (e) {
      console.error("DataService Error (Withdrawals):", e);
      return [];
    }
  }
};