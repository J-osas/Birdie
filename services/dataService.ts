
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
  UserStatus,
  PlatformSettings,
  Category,
  WithdrawalStatus
} from '../types';

export const dataService = {
  
  // PLATFORM CONFIGURATION
  async getPlatformSettings(): Promise<PlatformSettings | null> {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('id', 'global')
        .maybeSingle();
      
      if (error || !data) {
        return {
          id: 'global',
          platform_name: 'Birdie',
          support_email: 'support@birdie.ng',
          default_currency: 'NGN',
          commission_rate: 15,
          min_withdrawal_amount: 5000,
          escrow_release_days: 3,
          reg_client_enabled: true,
          reg_pro_enabled: true,
          auto_verify_pros: false,
          manual_vetting_required: true,
          email_notifications_enabled: true,
          default_sender_email: 'noreply@birdie.ng',
          admin_alert_recipients: ['admin@birdie.ng'],
          session_timeout_minutes: 60,
          require_email_verification: true,
          admin_only_access: false,
          updated_at: new Date().toISOString()
        };
      };
      return data;
    } catch (e) {
      console.error("GetSettings Network Error:", e);
      return null;
    }
  },

  async updatePlatformSettings(updates: Partial<PlatformSettings>) {
    const { error } = await supabase
      .from('platform_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', 'global');
    if (error) throw error;
    return true;
  },

  // HIRE REQUEST MANAGEMENT (STRICT SCHEMA)
  async createHireRequest(params: {
    clientId: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    professionalId?: string;
    professionalName?: string;
    serviceCategory: string;
    serviceRequested: string;
    location: string;
    requirements: {
      ageRange?: string;
      duration: string;
      experienceLevel?: string;
      livingCondition: 'BQ' | 'SPARE' | 'SHARED' | 'LIVING' | 'OTHER';
      livingConditionOther?: string;
      notes?: string;
    };
    preferredStartDate: string;
    discoverySource?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('hire_requests')
        .insert({
          client_id: params.clientId,
          client_name: params.clientName,
          client_email: params.clientEmail,
          client_phone: params.clientPhone,
          professional_id: params.professionalId || null,
          professional_name: params.professionalName || null,
          service_category: params.serviceCategory,
          service_requested: params.serviceRequested,
          location: params.location,
          requirements: params.requirements,
          preferred_start_date: params.preferredStartDate,
          discovery_source: params.discoverySource || 'Direct',
          status: RequestStatus.PENDING, // STRICT ENFORCEMENT
          amount: null // Amount is determined at ASSIGNED or ACCEPTED stage
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (e) {
      console.error("Create Hire Request Error:", e);
      throw e;
    }
  },

  async updateHireRequestStatus(requestId: string, status: RequestStatus) {
    const { error } = await supabase
      .from('hire_requests')
      .update({ 
        status: status.toLowerCase(),
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);
    if (error) throw error;
    return true;
  },

  // CONSULTATION BOOKING
  async createConsultation(hireRequestId: string, paymentMethod: 'OFFLINE' | 'PAYSTACK') {
    const { data, error } = await supabase
      .from('consultations')
      .insert({
        hire_request_id: hireRequestId,
        amount: 10000,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'OFFLINE' ? 'PENDING' : 'PAID',
        consultation_type: 'ONLINE'
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // STATE-SPECIFIC TRANSITIONS
  async assignProfessional(requestId: string, proId: string, proName: string, amount: number) {
    const { error } = await supabase
      .from('hire_requests')
      .update({ 
        professional_id: proId,
        professional_name: proName,
        amount: amount,
        status: RequestStatus.ASSIGNED
      })
      .eq('id', requestId);
    if (error) throw error;
    return true;
  },

  async acceptHireRequest(requestId: string) {
    return this.updateHireRequestStatus(requestId, RequestStatus.ACCEPTED);
  },

  async initiatePaymentIntent(requestId: string) {
    const ref = `BIRDIE-${Date.now()}-${requestId.slice(0, 4)}`;
    const { error } = await supabase
      .from('hire_requests')
      .update({ 
        status: RequestStatus.AWAITING_ESCROW,
        provider_reference: ref,
        payment_status: 'awaiting_escrow'
      })
      .eq('id', requestId);
    if (error) throw error;
    return ref;
  },

  async markEscrowFunded(requestId: string) {
    const { error } = await supabase
      .from('hire_requests')
      .update({ 
        status: RequestStatus.FUNDED,
        payment_status: 'escrowed'
      })
      .eq('id', requestId);
    if (error) throw error;
    return true;
  },

  /**
   * Finishes a job and releases funds to pending balance.
   */
  async releaseEscrowToPending(requestId: string) {
    return this.updateHireRequestStatus(requestId, RequestStatus.COMPLETED);
  },

  /**
   * Finalizes a job clearance, settling it permanently.
   */
  async finalizeClearance(walletId: string, requestId: string) {
    return this.updateHireRequestStatus(requestId, RequestStatus.SETTLED);
  },

  // CATEGORY MANAGEMENT
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      
      if (error || !data) return [];
      return data;
    } catch (e) {
      console.error("GetCategories Network Error:", e);
      return [];
    }
  },

  async addCategory(name: string) {
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, is_active: true })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateCategory(id: string, updates: Partial<Category>) {
    const { error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  // USER MANAGEMENT
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
        updatedAt: d.created_at || new Date().toISOString()
      }));
    } catch (e) {
      console.error("GetAllUsers Network Error:", e);
      return [];
    }
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
        status: (data.status?.toLowerCase() as ProfessionalStatus) || ProfessionalStatus.PENDING,
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
      console.error("Profile Network Error:", e);
      return null;
    }
  },

  /**
   * Updates a professional's profile data.
   */
  async updateProfessionalProfile(userId: string, updates: Partial<ProfessionalProfile>) {
    const supabaseUpdates: any = {};
    if (updates.category) supabaseUpdates.category = updates.category;
    if (updates.bio) supabaseUpdates.bio = updates.bio;
    if (updates.location) supabaseUpdates.location = updates.location;
    if (updates.phone) supabaseUpdates.phone = updates.phone;
    if (updates.availability) supabaseUpdates.availability = updates.availability;
    if (updates.profileCompletion !== undefined) supabaseUpdates.profile_completion = updates.profileCompletion;
    if (updates.status) supabaseUpdates.status = updates.status.toLowerCase();
    if (updates.aptitudeScore !== undefined) supabaseUpdates.aptitude_score = updates.aptitudeScore;
    if (updates.publicVisible !== undefined) supabaseUpdates.public_visible = updates.publicVisible;
    if (updates.nin) supabaseUpdates.nin = updates.nin;
    if (updates.proofOfAddress) supabaseUpdates.proof_of_address = updates.proofOfAddress;
    if (updates.govtId) supabaseUpdates.govt_id = updates.govtId;
    if (updates.certificationsUrl) supabaseUpdates.certifications_url = updates.certificationsUrl;

    const { error } = await supabase
      .from('professional_profiles')
      .update(supabaseUpdates)
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  },

  /**
   * Updates a professional's verification status.
   */
  async updateProfessionalStatus(userId: string, status: ProfessionalStatus) {
    const { error } = await supabase
      .from('professional_profiles')
      .update({ status: status.toLowerCase() })
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
        const pro = Array.isArray(d.professional_profiles) ? d.professional_profiles[0] : d.professional_profiles;
        const safePro = pro || {};
        
        return {
          id: d.id, 
          name: d.full_name || 'Birdie Pro',
          category: safePro.category || 'Driver',
          score: safePro.aptitude_score || 0,
          status: (safePro.status?.toLowerCase() || ProfessionalStatus.PENDING) as ProfessionalStatus,
          rating: safePro.rating || 0,
          bio: safePro.bio || ''
        };
      });
    } catch (e) {
      console.error("AllPros Network Error:", e);
      return [];
    }
  },

  async getPublicProfessionals(): Promise<any[]> {
    try {
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
        .eq('professional_profiles.public_visible', true)
        .eq('professional_profiles.status', 'verified');
      
      if (error || !data) return [];
      
      return data.map((d: any) => {
        const pro = Array.isArray(d.professional_profiles) ? d.professional_profiles[0] : d.professional_profiles;
        const safePro = pro || {};
        return {
          id: d.id,
          userId: d.full_name || 'Birdie Pro',
          category: safePro.category || 'Driver',
          location: safePro.location || 'Lagos',
          rating: safePro.rating || 0,
          availability: Availability.AVAILABLE, 
          status: (safePro.status?.toLowerCase() || ProfessionalStatus.VERIFIED) as ProfessionalStatus,
          aptitudeScore: safePro.aptitude_score || 0,
          bio: safePro.bio || '',
          reviewCount: 0,
          completedJobs: 0
        };
      });
    } catch (e) {
      console.error("PublicPros Network Error:", e);
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
      console.error("Wallet Network Error:", e);
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
      console.error("Transactions Network Error:", e);
      return [];
    }
  },

  async getAllTransactions(): Promise<WalletTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
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
      console.error("Admin Transactions Network Error:", e);
      return [];
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
        status: (d.status?.toLowerCase() as RequestStatus) || RequestStatus.PENDING,
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
      console.error("HireRequests Network Error:", e);
      return [];
    }
  },

  /**
   * Submits a withdrawal request to the backend.
   */
  async submitWithdrawalSafe(amount: number, bankInfo: { bank_name: string, account_number: string, account_name: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const wallet = await this.getWallet(user.id);
    if (!wallet) throw new Error("Wallet not found");

    const { error } = await supabase
      .from('withdrawal_requests')
      .insert({
        professional_id: user.id,
        wallet_id: wallet.id,
        amount,
        bank_name: bankInfo.bank_name,
        account_number: bankInfo.account_number,
        account_name: bankInfo.account_name,
        status: 'requested'
      });
    
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
        status: (d.status?.toLowerCase() as any) as WithdrawalStatus,
        requestedAt: d.created_at
      }));
    } catch (e) {
      console.error("Withdrawals Network Error:", e);
      return [];
    }
  },

  async getPlatformRevenue(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('platform_ledger')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("Revenue Network Error:", e);
      return [];
    }
  }
};
