import { supabase } from '@/lib/supabase';
import {
  Availability,
  Category,
  HireRequest,
  PlatformSettings,
  ProfessionalProfile,
  ProfessionalStatus,
  RequestStatus,
  Review,
  User,
  UserRole,
  Wallet,
  WalletTransaction,
  WithdrawalRequest,
  WithdrawalStatus,
  BlogPost,
  Message,
  AppNotification,
  ProfessionalCertification,
} from '@/types';
import { DEFAULT_CONSULTATION_FEE } from '@/data/constants';

export type InboxThread = {
  hire: HireRequest;
  lastMessage: Message | null;
  messageCount: number;
};

function mapPro(row: Record<string, unknown>): ProfessionalProfile {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    fullName: (row.full_name as string) || undefined,
    category: String(row.category || 'House Help'),
    bio: String(row.bio || ''),
    location: String(row.location || ''),
    phone: (row.phone as string) || undefined,
    state: (row.state as string) || undefined,
    city: (row.city as string) || undefined,
    addressLine: (row.address_line as string) || undefined,
    country: (row.country as string) || 'NG',
    lat: row.lat != null ? Number(row.lat) : null,
    lng: row.lng != null ? Number(row.lng) : null,
    availability: (row.availability as Availability) || Availability.AVAILABLE,
    profileCompletion: Number(row.profile_completion || 0),
    status: (row.status as ProfessionalStatus) || ProfessionalStatus.PENDING,
    aptitudeScore: Number(row.aptitude_score || 0),
    assessmentScore: Number(row.assessment_score || 0),
    publicVisible: Boolean(row.public_visible ?? true),
    avatarUrl: (row.avatar_url as string) || undefined,
    createdAt: String(row.created_at || new Date().toISOString()),
    rating: Number(row.rating || 0),
    reviewCount: Number(row.review_count || 0),
    completedJobs: Number(row.completed_jobs || 0),
    nin: (row.nin as string) || undefined,
    govtIdPath: (row.govt_id_path as string) || undefined,
    proofOfAddressPath: (row.proof_of_address_path as string) || undefined,
    proofOfAddressType: (row.proof_of_address_type as string) || undefined,
    ninDocPath: (row.nin_doc_path as string) || undefined,
    onboardingStep: (row.onboarding_step as string) || undefined,
    assessmentCompletedAt: (row.assessment_completed_at as string) || null,
    attitudeAnswers: (row.attitude_answers as Record<string, string>) || undefined,
    gender: (row.gender as string) || '',
    indicativeRateNgn: row.indicative_rate_ngn != null ? Number(row.indicative_rate_ngn) : null,
    rateUnit: (row.rate_unit as ProfessionalProfile['rateUnit']) || 'monthly',
    yearsExperience: Number(row.years_experience || 0),
    workType: (row.work_type as ProfessionalProfile['workType']) || '',
    languages: Array.isArray(row.languages) ? (row.languages as string[]) : [],
    skills: Array.isArray(row.skills) ? (row.skills as string[]) : [],
  };
}

function mapHire(row: Record<string, unknown>): HireRequest {
  return {
    id: String(row.id),
    clientId: String(row.client_id),
    professionalId: row.professional_id ? String(row.professional_id) : undefined,
    serviceCategory: String(row.service_category),
    serviceRequested: (row.service_requested as string) || undefined,
    preferredStartDate: String(row.preferred_start_date || ''),
    location: String(row.location || 'Lagos'),
    requirements: (row.requirements as Record<string, unknown>) || {},
    notes: (row.notes as string) || undefined,
    status: (row.status as RequestStatus) || RequestStatus.PENDING,
    amount: row.amount != null ? Number(row.amount) : null,
    escrowAmount: row.escrow_amount != null ? Number(row.escrow_amount) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at || row.created_at),
    clientName: String(row.client_name || ''),
    clientEmail: (row.client_email as string) || undefined,
    clientPhone: (row.client_phone as string) || undefined,
    professionalName: (row.professional_name as string) || undefined,
    paymentStatus: (row.payment_status as string) || undefined,
  };
}

export const dataService = {
  async getPlatformSettings(): Promise<PlatformSettings> {
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
        consultation_fee_ngn: DEFAULT_CONSULTATION_FEE,
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
        updated_at: new Date().toISOString(),
      };
    }
    return {
      ...data,
      consultation_fee_ngn: Number(data.consultation_fee_ngn ?? DEFAULT_CONSULTATION_FEE),
    } as PlatformSettings;
  },

  async updatePlatformSettings(updates: Partial<PlatformSettings>) {
    const { error } = await supabase
      .from('platform_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', 'global');
    if (error) throw error;
  },

  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');
    if (error || !data?.length) {
      return [
        'Security',
        'Nanny',
        'House Help',
        'Gardener',
        'Driver',
        'Chef',
      ].map((name, i) => ({
        id: `fallback-${i}`,
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        is_active: true,
      }));
    }
    return data as Category[];
  },

  async getPublicProfessionals(): Promise<ProfessionalProfile[]> {
    const { data, error } = await supabase
      .from('professional_profiles')
      .select('*, profiles:user_id(full_name)')
      .eq('public_visible', true)
      .in('status', [
        ProfessionalStatus.PENDING,
        ProfessionalStatus.UNDER_REVIEW,
        ProfessionalStatus.VERIFIED,
        ProfessionalStatus.APPROVED,
      ])
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((row: Record<string, unknown>) => {
      const profiles = row.profiles as { full_name?: string } | null;
      return mapPro({ ...row, full_name: profiles?.full_name });
    });
  },

  async getProfessionalById(id: string): Promise<ProfessionalProfile | null> {
    const { data, error } = await supabase
      .from('professional_profiles')
      .select('*, profiles:user_id(full_name)')
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return null;
    const profiles = data.profiles as { full_name?: string } | null;
    return mapPro({ ...data, full_name: profiles?.full_name });
  },

  async getProfessionalProfile(userId: string): Promise<ProfessionalProfile | null> {
    const { data, error } = await supabase
      .from('professional_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error || !data) return null;
    return mapPro(data);
  },

  async getAllProfessionals(): Promise<ProfessionalProfile[]> {
    const { data, error } = await supabase
      .from('professional_profiles')
      .select('*, profiles:user_id(full_name)')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((row: Record<string, unknown>) => {
      const profiles = row.profiles as { full_name?: string } | null;
      return mapPro({ ...row, full_name: profiles?.full_name });
    });
  },

  async updateProfessionalProfile(userId: string, updates: Partial<ProfessionalProfile> & Record<string, unknown>) {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.bio !== undefined) payload.bio = updates.bio;
    if (updates.location !== undefined) payload.location = updates.location;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.state !== undefined) payload.state = updates.state;
    if (updates.city !== undefined) payload.city = updates.city;
    if (updates.addressLine !== undefined) payload.address_line = updates.addressLine;
    if (updates.country !== undefined) payload.country = updates.country;
    if (updates.lat !== undefined) payload.lat = updates.lat;
    if (updates.lng !== undefined) payload.lng = updates.lng;
    if (updates.availability !== undefined) payload.availability = updates.availability;
    if (updates.profileCompletion !== undefined) payload.profile_completion = updates.profileCompletion;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.aptitudeScore !== undefined) payload.aptitude_score = updates.aptitudeScore;
    if (updates.assessmentScore !== undefined) payload.assessment_score = updates.assessmentScore;
    if (updates.publicVisible !== undefined) payload.public_visible = updates.publicVisible;
    if (updates.nin !== undefined) payload.nin = updates.nin;
    if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
    if (updates.govtIdPath !== undefined) payload.govt_id_path = updates.govtIdPath;
    if (updates.proofOfAddressPath !== undefined) payload.proof_of_address_path = updates.proofOfAddressPath;
    if (updates.proofOfAddressType !== undefined) payload.proof_of_address_type = updates.proofOfAddressType;
    if (updates.ninDocPath !== undefined) payload.nin_doc_path = updates.ninDocPath;
    if (updates.onboardingStep !== undefined) payload.onboarding_step = updates.onboardingStep;
    if (updates.assessmentCompletedAt !== undefined) payload.assessment_completed_at = updates.assessmentCompletedAt;
    if (updates.attitudeAnswers !== undefined) payload.attitude_answers = updates.attitudeAnswers;
    if (updates.gender !== undefined) payload.gender = updates.gender;
    if (updates.indicativeRateNgn !== undefined) payload.indicative_rate_ngn = updates.indicativeRateNgn;
    if (updates.rateUnit !== undefined) payload.rate_unit = updates.rateUnit;
    if (updates.yearsExperience !== undefined) payload.years_experience = updates.yearsExperience;
    if (updates.workType !== undefined) payload.work_type = updates.workType;
    if (updates.languages !== undefined) payload.languages = updates.languages;
    if (updates.skills !== undefined) payload.skills = updates.skills;

    const { error } = await supabase
      .from('professional_profiles')
      .update(payload)
      .eq('user_id', userId);
    if (error) throw error;
  },

  async updateProfessionalStatus(proId: string, status: ProfessionalStatus) {
    const { data: pro, error: fetchErr } = await supabase
      .from('professional_profiles')
      .select('user_id')
      .eq('id', proId)
      .maybeSingle();
    if (fetchErr) throw fetchErr;

    const { error } = await supabase
      .from('professional_profiles')
      .update({
        status,
        updated_at: new Date().toISOString(),
        public_visible: status === ProfessionalStatus.VERIFIED || status === ProfessionalStatus.APPROVED,
      })
      .eq('id', proId);
    if (error) throw error;

    if (pro?.user_id && status === ProfessionalStatus.VERIFIED) {
      await this.createNotification(
        String(pro.user_id),
        'You’re verified on Birdie',
        'Your documents and assessment were approved. Bank details, certifications, and profile editing are now unlocked. You’re ready for hires.',
        'verification'
      );
    }
    if (pro?.user_id && status === ProfessionalStatus.REJECTED) {
      await this.createNotification(
        String(pro.user_id),
        'Verification update',
        'Your Birdie application was not approved. Contact support if you need clarification.',
        'verification'
      );
    }
  },

  async submitAssessment(
    professionalId: string,
    category: string,
    answers: Record<string, string>,
    autoScore: number,
    attitudeAnswers?: Record<string, string>
  ) {
    const { error } = await supabase.from('assessment_attempts').insert({
      professional_id: professionalId,
      category,
      answers: { ...answers, __attitude: attitudeAnswers || {} },
      auto_score: autoScore,
    });
    if (error) throw error;

    const { data: pro } = await supabase
      .from('professional_profiles')
      .update({
        assessment_score: autoScore,
        aptitude_score: autoScore,
        status: ProfessionalStatus.UNDER_REVIEW,
        assessment_completed_at: new Date().toISOString(),
        attitude_answers: attitudeAnswers || {},
        profile_completion: 100,
        onboarding_step: 'pending_review',
        updated_at: new Date().toISOString(),
      })
      .eq('id', professionalId)
      .select('user_id')
      .maybeSingle();

    if (pro?.user_id) {
      await this.createNotification(
        String(pro.user_id),
        'Assessment submitted',
        'Your Birdie assessment was submitted. Ops will review your documents and score.',
        'assessment'
      );
    }
  },

  async getSignedDocumentUrl(path: string, bucket = 'pro-documents'): Promise<string | null> {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('pending://')) return path;
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  },

  async getReviewForHire(hireRequestId: string): Promise<Review | null> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('hire_request_id', hireRequestId)
      .maybeSingle();
    if (error || !data) return null;
    return {
      id: data.id,
      hireRequestId: data.hire_request_id,
      professionalId: data.professional_id,
      clientId: data.client_id,
      clientName: data.client_name,
      category: data.category,
      rating: data.rating,
      comment: data.comment,
      createdAt: data.created_at,
      status: data.status,
    };
  },

  async addCertification(professionalId: string, title: string, storagePath: string) {
    const { error } = await supabase.from('professional_certifications').insert({
      professional_id: professionalId,
      title,
      storage_path: storagePath,
      verification_status: 'pending',
    });
    if (error) throw error;
  },

  async getApprovedCertifications(professionalId: string): Promise<ProfessionalCertification[]> {
    const { data, error } = await supabase
      .from('professional_certifications')
      .select('*')
      .eq('professional_id', professionalId)
      .eq('verification_status', 'approved');
    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      professionalId: row.professional_id,
      title: row.title,
      storagePath: row.storage_path,
      verificationStatus: row.verification_status,
      createdAt: row.created_at,
    }));
  },

  async getAllCertificationsForPro(professionalId: string) {
    const { data, error } = await supabase
      .from('professional_certifications')
      .select('*')
      .eq('professional_id', professionalId);
    if (error) throw error;
    return data || [];
  },

  async setCertificationStatus(certId: string, status: 'approved' | 'rejected') {
    const { error } = await supabase
      .from('professional_certifications')
      .update({ verification_status: status })
      .eq('id', certId);
    if (error) throw error;
  },

  async addDocument(professionalId: string, docType: string, storagePath: string) {
    const { error } = await supabase.from('professional_documents').insert({
      professional_id: professionalId,
      doc_type: docType,
      storage_path: storagePath,
      review_status: 'pending',
    });
    if (error) throw error;
  },

  async addGuarantor(
    professionalId: string,
    g: { name: string; phone: string; occupation: string; address: string; relationship: string }
  ) {
    const { error } = await supabase.from('guarantors').insert({
      professional_id: professionalId,
      ...g,
    });
    if (error) throw error;
  },

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
    requirements: Record<string, unknown>;
    preferredStartDate: string;
    notes?: string;
    consultationDate?: string;
    consultationTime?: string;
  }): Promise<HireRequest> {
    const settings = await this.getPlatformSettings();
    const { data, error } = await supabase
      .from('hire_requests')
      .insert({
        client_id: params.clientId,
        professional_id: params.professionalId || null,
        service_category: params.serviceCategory,
        service_requested: params.serviceRequested,
        preferred_start_date: params.preferredStartDate.includes('T')
          ? params.preferredStartDate
          : `${params.preferredStartDate}T09:00:00`,
        location: params.location,
        requirements: params.requirements,
        notes: params.notes || '',
        status: RequestStatus.AWAITING_CONSULTATION_PAY,
        amount: settings.consultation_fee_ngn,
        client_name: params.clientName,
        client_email: params.clientEmail,
        client_phone: params.clientPhone,
        professional_name: params.professionalName || null,
        payment_status: 'awaiting_consultation',
      })
      .select('*')
      .single();

    if (error) throw error;

    if (params.consultationDate && params.consultationTime) {
      const scheduledAt = new Date(`${params.consultationDate}T${params.consultationTime}:00`);
      const { error: consultErr } = await supabase.from('consultations').insert({
        hire_request_id: data.id,
        scheduled_at: scheduledAt.toISOString(),
        fee_amount: settings.consultation_fee_ngn,
        payment_status: 'pending',
      });
      if (consultErr) console.warn('Consultation insert failed', consultErr);
    }

    return mapHire(data);
  },

  async getHireRequests(
    userId: string,
    role: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN'
  ): Promise<HireRequest[]> {
    let query = supabase.from('hire_requests').select('*').order('created_at', { ascending: false });
    if (role === 'CLIENT') query = query.eq('client_id', userId);
    if (role === 'PROFESSIONAL') {
      const pro = await this.getProfessionalProfile(userId);
      if (!pro) return [];
      query = query.eq('professional_id', pro.id);
    }
    const { data, error } = await query;
    if (error || !data) return [];
    return data.map(mapHire);
  },

  async updateHireStatus(requestId: string, status: RequestStatus, extras: Record<string, unknown> = {}) {
    const { error } = await supabase
      .from('hire_requests')
      .update({ status, updated_at: new Date().toISOString(), ...extras })
      .eq('id', requestId);
    if (error) throw error;

    if (status === RequestStatus.ACTIVE || status === RequestStatus.ACCEPTED) {
      const { data: hire } = await supabase
        .from('hire_requests')
        .select('professional_id')
        .eq('id', requestId)
        .maybeSingle();
      if (hire?.professional_id) {
        await supabase
          .from('professional_profiles')
          .update({ availability: Availability.ON_JOB })
          .eq('id', hire.professional_id);
      }
    }

    if (status === RequestStatus.COMPLETED || status === RequestStatus.SETTLED || status === RequestStatus.CANCELLED) {
      const { data: hire } = await supabase
        .from('hire_requests')
        .select('professional_id')
        .eq('id', requestId)
        .maybeSingle();
      if (hire?.professional_id) {
        await supabase
          .from('professional_profiles')
          .update({ availability: Availability.AVAILABLE })
          .eq('id', hire.professional_id);
      }
    }
  },

  async getWallet(professionalUserId: string): Promise<Wallet | null> {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('professional_id', professionalUserId)
      .maybeSingle();
    if (error || !data) return null;
    return {
      id: data.id,
      professionalId: data.professional_id,
      escrowBalance: Number(data.escrow_balance || 0),
      pendingEarnings: Number(data.pending_balance || 0),
      availableBalance: Number(data.available_balance || 0),
      totalWithdrawn: Number(data.total_withdrawn || 0),
      currency: 'NGN',
    };
  },

  async getTransactions(walletId: string): Promise<WalletTransaction[]> {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', walletId)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      walletId: row.wallet_id,
      hireRequestId: row.hire_request_id || undefined,
      type: row.tx_type,
      amount: Number(row.amount),
      status: row.status,
      reference: row.reference,
      description: row.description,
      createdAt: row.created_at,
    }));
  },

  async getWithdrawalRequests(professionalId?: string): Promise<WithdrawalRequest[]> {
    let query = supabase.from('withdrawal_requests').select('*').order('requested_at', { ascending: false });
    if (professionalId) query = query.eq('professional_id', professionalId);
    const { data, error } = await query;
    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      walletId: row.wallet_id,
      professionalId: row.professional_id,
      professionalName: row.professional_name,
      amount: Number(row.amount),
      bankName: row.bank_name,
      accountNumber: row.account_number,
      accountName: row.account_name,
      status: row.status as WithdrawalStatus,
      adminNote: row.admin_note || undefined,
      requestedAt: row.requested_at,
      processedAt: row.processed_at || undefined,
    }));
  },

  async requestWithdrawal(params: {
    walletId: string;
    professionalId: string;
    professionalName: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
  }) {
    const { error } = await supabase.from('withdrawal_requests').insert({
      wallet_id: params.walletId,
      professional_id: params.professionalId,
      professional_name: params.professionalName,
      amount: params.amount,
      bank_name: params.bankName,
      account_number: params.accountNumber,
      account_name: params.accountName,
      status: WithdrawalStatus.REQUESTED,
    });
    if (error) throw error;
  },

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((row) => {
      const parts = String(row.full_name || '').split(' ');
      return {
        id: row.id,
        role: row.role as UserRole,
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
        name: row.full_name,
        email: row.email || '',
        phone: row.phone || '',
        status: row.status,
        emailVerified: true,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });
  },

  async getMessages(hireRequestId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('hire_request_id', hireRequestId)
      .order('created_at', { ascending: true });
    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      hireRequestId: row.hire_request_id,
      senderId: row.sender_id,
      body: row.body,
      createdAt: row.created_at,
    }));
  },

  async getInboxThreads(
    userId: string,
    role: 'CLIENT' | 'PROFESSIONAL'
  ): Promise<InboxThread[]> {
    const hires = await this.getHireRequests(userId, role);
    const threads = await Promise.all(
      hires.map(async (hire) => {
        const messages = await this.getMessages(hire.id);
        return {
          hire,
          lastMessage: messages.length ? messages[messages.length - 1] : null,
          messageCount: messages.length,
        };
      })
    );
    return threads.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.hire.updatedAt || a.hire.createdAt;
      const bTime = b.lastMessage?.createdAt || b.hire.updatedAt || b.hire.createdAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  },

  async sendMessage(hireRequestId: string, senderId: string, body: string) {
    const { error } = await supabase.from('messages').insert({
      hire_request_id: hireRequestId,
      sender_id: senderId,
      body,
    });
    if (error) throw error;
  },

  async getReviewsForProfessional(
    professionalId: string,
    opts?: { forOwner?: boolean }
  ): Promise<Review[]> {
    let query = supabase
      .from('reviews')
      .select('*')
      .eq('professional_id', professionalId)
      .order('created_at', { ascending: false });
    if (!opts?.forOwner) {
      query = query.eq('status', 'published');
    }
    const { data, error } = await query;
    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      hireRequestId: row.hire_request_id,
      professionalId: row.professional_id,
      clientId: row.client_id,
      clientName: row.client_name,
      category: row.category,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.created_at,
      status: row.status,
    }));
  },

  async createReview(params: {
    hireRequestId: string;
    professionalId: string;
    clientId: string;
    clientName: string;
    category: string;
    rating: number;
    comment: string;
  }) {
    const { error } = await supabase.from('reviews').insert({
      hire_request_id: params.hireRequestId,
      professional_id: params.professionalId,
      client_id: params.clientId,
      client_name: params.clientName,
      category: params.category,
      rating: params.rating,
      comment: params.comment,
      status: 'published',
    });
    if (error) throw error;
  },

  async getNotifications(userId: string): Promise<AppNotification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      body: row.body,
      relatedEntity: row.related_entity || undefined,
      relatedId: row.related_id || undefined,
      read: row.read,
      createdAt: row.created_at,
    }));
  },

  async markNotificationsRead(userId: string) {
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
  },

  async createNotification(userId: string, title: string, body: string, type = 'info') {
    await supabase.from('notifications').insert({ user_id: userId, title, body, type });
  },

  async getBlogPosts(publishedOnly = true): Promise<BlogPost[]> {
    let query = supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    if (publishedOnly) query = query.eq('published', true);
    const { data, error } = await query;
    if (error || !data?.length) return FALLBACK_BLOG;
    return data.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      content: row.content,
      category: row.category,
      author: row.author,
      imageUrl: row.image_url || undefined,
      published: row.published,
      createdAt: row.created_at,
      date: new Date(row.created_at).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    }));
  },

  async upsertBlogPost(post: Partial<BlogPost> & { title: string; slug: string }) {
    const { error } = await supabase.from('blog_posts').upsert({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content || '',
      category: post.category || 'Guides',
      author: post.author || 'Birdie',
      image_url: post.imageUrl || null,
      published: post.published ?? false,
    });
    if (error) throw error;
  },

  async initializePaystackPayment(payload: {
    hireRequestId: string;
    paymentType: 'consultation' | 'escrow';
    amount?: number;
  }) {
    const { data, error } = await supabase.functions.invoke('paystack-initialize', {
      body: payload,
    });
    if (error) throw error;
    return data as { authorization_url: string; reference: string };
  },
};

const FALLBACK_BLOG: BlogPost[] = [
  {
    id: 'b1',
    title: 'How Birdie Vets Domestic Professionals in Lagos',
    slug: 'how-birdie-vets',
    excerpt: 'Identity checks, guarantors, police clearance, and skills assessments — how trust is built.',
    content:
      'Birdie was built to replace informal referrals with a structured vetting pipeline. Every professional completes identity verification, document upload, guarantor details, and a category-specific assessment before admin review.',
    category: 'Safety',
    author: 'Birdie Team',
    published: true,
    createdAt: new Date().toISOString(),
    date: 'Mar 2026',
  },
  {
    id: 'b2',
    title: 'Hiring Domestic Staff: A Practical Guide for Busy Households',
    slug: 'hiring-guide',
    excerpt: 'Define scope, use escrow, and set clear expectations before day one.',
    content:
      'Start with category and schedule clarity. Use Birdie’s consultation step to align contracts and rates. Fund escrow only after terms are agreed so both sides are protected.',
    category: 'Guides',
    author: 'Birdie Team',
    published: true,
    createdAt: new Date().toISOString(),
    date: 'Mar 2026',
  },
  {
    id: 'b3',
    title: 'Why Escrow Matters for Domestic Work',
    slug: 'why-escrow',
    excerpt: 'Transparent payouts protect families and professionals alike.',
    content:
      'Clients deposit into secure escrow. Funds release when milestones are met. Professionals get a clear ledger and withdrawal path — dignity and structure instead of delayed cash handoffs.',
    category: 'Trust',
    author: 'Birdie Team',
    published: true,
    createdAt: new Date().toISOString(),
    date: 'Mar 2026',
  },
];
