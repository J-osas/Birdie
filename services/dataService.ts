
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
  Availability
} from '../types';

/**
 * Data Service handles all non-auth interactions with the Supabase database.
 * Maps snake_case database columns to camelCase frontend types.
 * Includes fallback logic to prevent app crashes on database mismatch.
 */
export const dataService = {
  
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
        availability: (data.availability as Availability) || Availability.AVAILABLE,
        profileCompletion: data.profile_completion || 0,
        status: (data.status as ProfessionalStatus) || ProfessionalStatus.PENDING,
        aptitudeScore: data.aptitude_score || 0,
        publicVisible: data.public_visible || false,
        createdAt: data.created_at || new Date().toISOString(),
        rating: data.rating || 0,
        reviewCount: data.review_count || 0,
        completedJobs: data.completed_jobs || 0
      };
    } catch (e) {
      console.error("DataService: getProfessionalProfile error", e);
      return null;
    }
  },

  /** ADMIN: Fetch all professionals for vetting and management */
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
            rating
          )
        `)
        .eq('role', 'PROFESSIONAL');
      
      if (error || !data) return [];
      
      return data.map((d: any) => ({
        id: d.id,
        name: d.full_name || 'Birdie Pro',
        category: d.professional_profiles?.[0]?.category || 'General',
        score: d.professional_profiles?.[0]?.aptitude_score || 0,
        status: d.professional_profiles?.[0]?.status || ProfessionalStatus.PENDING,
        rating: d.professional_profiles?.[0]?.rating || 0
      }));
    } catch (e) {
      console.error("DataService: getAllProfessionals error", e);
      return [];
    }
  },

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
      console.error("DataService: getWallet error", e);
      return null;
    }
  },

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
        status: (d.status as RequestStatus) || RequestStatus.PENDING,
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
      console.error("DataService: getHireRequests error", e);
      return [];
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
        status: (d.status as TransactionStatus) || TransactionStatus.INITIATED,
        reference: d.reference || 'REF-000',
        description: d.description || 'Transaction',
        createdAt: d.created_at ? new Date(d.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'N/A'
      }));
    } catch (e) {
      console.error("DataService: getTransactions error", e);
      return [];
    }
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
        status: d.status,
        requestedAt: d.created_at
      }));
    } catch (e) {
      console.error("DataService: getWithdrawalRequests error", e);
      return [];
    }
  }
};
