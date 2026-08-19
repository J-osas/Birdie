import { supabase } from '@/lib/supabase';
import {
  Availability,
  Category,
  Consultation,
  HireRequest,
  Payment,
  PaymentStatus,
  PaymentType,
  PlatformSettings,
  ProfessionalProfile,
  ProfessionalStatus,
  RequestStatus,
  Review,
  User,
  UserRole,
  UserStatus,
  Invoice,
  InvoiceStatus,
  Wallet,
  WalletTransaction,
  WithdrawalRequest,
  WithdrawalStatus,
  BlogPost,
  Message,
  AppNotification,
  ProfessionalCertification,
  AdminAuditLog,
  CommunicationTemplate,
  CommunicationLog,
  AdminOverviewMetrics,
  OverviewRangeDays,
  MediaFile,
  MediaSlot,
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
    deletedAt: (row.deleted_at as string) || null,
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
    referenceCode: String(row.reference_code || ''),
  };
}

function mapReview(row: Record<string, unknown>): Review {
  const hire = row.hire_requests as { reference_code?: string; professional_name?: string } | null | undefined;
  return {
    id: String(row.id),
    hireRequestId: String(row.hire_request_id),
    professionalId: String(row.professional_id),
    clientId: String(row.client_id),
    clientName: String(row.client_name || ''),
    category: String(row.category || ''),
    rating: Number(row.rating),
    comment: String(row.comment || ''),
    createdAt: String(row.created_at),
    status: (row.status as Review['status']) || 'published',
    flagReason: (row.flag_reason as string) || undefined,
    screenedAt: (row.screened_at as string) || undefined,
    professionalName: hire?.professional_name || undefined,
    hireReferenceCode: hire?.reference_code || undefined,
  };
}

function mapInvoice(row: Record<string, unknown>): Invoice {
  const hire = row.hire_requests as
    | { reference_code?: string; professional_name?: string; client_name?: string; service_requested?: string; status?: string }
    | null
    | undefined;
  return {
    id: String(row.id),
    hireRequestId: String(row.hire_request_id),
    invoiceNumber: String(row.invoice_number || ''),
    clientId: String(row.client_id),
    professionalId: row.professional_id ? String(row.professional_id) : undefined,
    amount: Number(row.amount || 0),
    dueDate: (row.due_date as string) || undefined,
    duration: (row.duration as string) || undefined,
    startDate: (row.start_date as string) || undefined,
    notes: (row.notes as string) || undefined,
    status: (row.status as InvoiceStatus) || InvoiceStatus.DRAFT,
    sentAt: (row.sent_at as string) || undefined,
    paidAt: (row.paid_at as string) || undefined,
    createdAt: String(row.created_at),
    clientName: hire?.client_name || undefined,
    professionalName: hire?.professional_name || undefined,
    serviceRequested: hire?.service_requested || undefined,
    hireReferenceCode: hire?.reference_code || undefined,
    hireStatus: hire?.status || undefined,
  };
}

const INVOICE_SELECT =
  '*, hire_requests(reference_code, professional_name, client_name, service_requested, status)';

const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  id: 'global',
  platform_name: 'Birdie',
  support_email: 'support@birdie.ng',
  default_currency: 'NGN',
  commission_rate: 3.5,
  consultation_fee_ngn: DEFAULT_CONSULTATION_FEE,
  min_withdrawal_amount: 5000,
  escrow_release_days: 3,
  invoice_due_days: 3,
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
  ga_measurement_id: null,
  paystack_mode: 'test',
  paystack_public_key_test: null,
  paystack_public_key_live: null,
  paystack_secret_last4_test: null,
  paystack_secret_last4_live: null,
  hires_enabled: true,
  withdrawals_enabled: true,
  reviews_enabled: true,
  public_banner_enabled: false,
  public_banner_text: null,
  support_phone: null,
  support_whatsapp: null,
  office_address: null,
  page_studio_enabled: false,
  openai_secret_last4: null,
  updated_at: new Date().toISOString(),
};

function mapPlatformSettings(data: Record<string, unknown>): PlatformSettings {
  return {
    ...DEFAULT_PLATFORM_SETTINGS,
    ...data,
    consultation_fee_ngn: Number(data.consultation_fee_ngn ?? DEFAULT_CONSULTATION_FEE),
    min_withdrawal_amount: Number(data.min_withdrawal_amount ?? 5000),
    commission_rate: Number(data.commission_rate ?? 3.5),
    escrow_release_days: Number(data.escrow_release_days ?? 3),
    invoice_due_days: Number(data.invoice_due_days ?? 3),
    ga_measurement_id: (data.ga_measurement_id as string) || null,
    paystack_mode: data.paystack_mode === 'live' ? 'live' : 'test',
    hires_enabled: data.hires_enabled !== false,
    withdrawals_enabled: data.withdrawals_enabled !== false,
    reviews_enabled: data.reviews_enabled !== false,
    email_notifications_enabled: data.email_notifications_enabled !== false,
    reg_client_enabled: data.reg_client_enabled !== false,
    reg_pro_enabled: data.reg_pro_enabled !== false,
    page_studio_enabled: data.page_studio_enabled === true,
    openai_secret_last4: (data.openai_secret_last4 as string) || null,
  };
}

export const dataService = {
  async getPlatformSettings(): Promise<PlatformSettings> {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('id', 'global')
      .maybeSingle();

    if (error || !data) return { ...DEFAULT_PLATFORM_SETTINGS };
    return mapPlatformSettings(data as Record<string, unknown>);
  },

  async updatePlatformSettings(updates: Partial<PlatformSettings>) {
    const blocked = [
      'id',
      'paystack_mode',
      'paystack_public_key_test',
      'paystack_public_key_live',
      'paystack_secret_last4_test',
      'paystack_secret_last4_live',
      'openai_secret_last4',
    ];
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const [key, value] of Object.entries(updates)) {
      if (blocked.includes(key) || value === undefined) continue;
      patch[key] = value;
    }
    const { error } = await supabase.from('platform_settings').update(patch).eq('id', 'global');
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
      .select('*, profiles:user_id(full_name, deleted_at, status)')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((row: Record<string, unknown>) => {
      const profiles = row.profiles as { full_name?: string; deleted_at?: string | null } | null;
      return mapPro({
        ...row,
        full_name: profiles?.full_name,
        deleted_at: profiles?.deleted_at ?? null,
      });
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

  async updateProfessionalStatus(proId: string, status: ProfessionalStatus, actorId?: string) {
    const { data: pro, error: fetchErr } = await supabase
      .from('professional_profiles')
      .select('user_id, full_name, assessment_completed_at')
      .eq('id', proId)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!pro) throw new Error('Professional not found.');

    const publicVisible =
      status === ProfessionalStatus.VERIFIED || status === ProfessionalStatus.APPROVED;
    const { data: updated, error } = await supabase
      .from('professional_profiles')
      .update({
        status,
        updated_at: new Date().toISOString(),
        public_visible: publicVisible,
      })
      .eq('id', proId)
      .select('id, status, public_visible')
      .maybeSingle();
    if (error) throw error;
    if (!updated) throw new Error('Could not update professional status. Check staff permissions.');

    const userId = String(pro.user_id);
    if (status === ProfessionalStatus.SUSPENDED) {
      const { data: profileRow, error: profileErr } = await supabase
        .from('profiles')
        .update({ status: UserStatus.SUSPENDED, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select('id')
        .maybeSingle();
      if (profileErr) throw profileErr;
      if (!profileRow) throw new Error('Could not suspend the account login.');
    }
    if (status === ProfessionalStatus.VERIFIED || status === ProfessionalStatus.APPROVED) {
      const { data: profileRow, error: profileErr } = await supabase
        .from('profiles')
        .update({
          status: UserStatus.ACTIVE,
          deleted_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select('id')
        .maybeSingle();
      if (profileErr) throw profileErr;
      if (!profileRow) throw new Error('Could not restore the account login.');
    }

    if (status === ProfessionalStatus.VERIFIED) {
      await this.createNotification(
        userId,
        'You’re verified on Birdie',
        'Your documents and assessment were approved. Bank details, certifications, and profile editing are now unlocked. You’re ready for hires.',
        'verification'
      );
    }
    if (status === ProfessionalStatus.REJECTED) {
      await this.createNotification(
        userId,
        'Verification update',
        'Your Birdie application was not approved. Contact support if you need clarification.',
        'verification'
      );
    }
    if (status === ProfessionalStatus.SUSPENDED) {
      await this.createNotification(
        userId,
        'Account suspended',
        'Your Birdie professional account has been suspended. Contact support if you need help.',
        'account'
      );
    }

    await this.writeAuditLog({
      actorId,
      action:
        status === ProfessionalStatus.VERIFIED
          ? 'pro.verify'
          : status === ProfessionalStatus.REJECTED
            ? 'pro.reject'
            : status === ProfessionalStatus.SUSPENDED
              ? 'pro.suspend'
              : 'pro.status',
      entityType: 'professional',
      entityId: proId,
      meta: { status, name: pro.full_name },
    });

    return {
      status: updated.status as ProfessionalStatus,
      publicVisible: Boolean(updated.public_visible),
    };
  },

  async restoreProfessional(proId: string, actorId?: string) {
    const { data: pro, error: fetchErr } = await supabase
      .from('professional_profiles')
      .select('user_id, full_name, assessment_completed_at, assessment_score')
      .eq('id', proId)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!pro) throw new Error('Professional not found.');

    const { data: profileRow, error: profileErr } = await supabase
      .from('profiles')
      .update({
        status: UserStatus.ACTIVE,
        deleted_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', String(pro.user_id))
      .select('id')
      .maybeSingle();
    if (profileErr) throw profileErr;
    if (!profileRow) throw new Error('Could not restore the account login.');

    const nextStatus =
      pro.assessment_completed_at || Number(pro.assessment_score || 0) > 0
        ? ProfessionalStatus.VERIFIED
        : ProfessionalStatus.PENDING;

    const result = await this.updateProfessionalStatus(proId, nextStatus, actorId);
    return { ...result, deletedAt: null as string | null };
  },

  async softDeleteProfessional(proId: string, actorId?: string) {
    const { data: pro, error: fetchErr } = await supabase
      .from('professional_profiles')
      .select('user_id, full_name')
      .eq('id', proId)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!pro) throw new Error('Professional not found.');

    const { data: updated, error } = await supabase
      .from('professional_profiles')
      .update({
        status: ProfessionalStatus.SUSPENDED,
        public_visible: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', proId)
      .select('id')
      .maybeSingle();
    if (error) throw error;
    if (!updated) throw new Error('Could not delete this professional.');

    const deletedAt = new Date().toISOString();
    const { data: profileRow, error: profileErr } = await supabase
      .from('profiles')
      .update({
        status: UserStatus.SUSPENDED,
        deleted_at: deletedAt,
        updated_at: deletedAt,
      })
      .eq('id', String(pro.user_id))
      .select('id')
      .maybeSingle();
    if (profileErr) throw profileErr;
    if (!profileRow) throw new Error('Could not delete the account.');

    await this.createNotification(
      String(pro.user_id),
      'Account deleted',
      'Your Birdie professional account has been removed. Contact support if this was a mistake.',
      'account'
    );
    await this.writeAuditLog({
      actorId,
      action: 'pro.delete',
      entityType: 'professional',
      entityId: proId,
      meta: { name: pro.full_name },
    });
    return { status: ProfessionalStatus.SUSPENDED, publicVisible: false, deletedAt };
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
    return mapReview(data as Record<string, unknown>);
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

  async setCertificationStatus(certId: string, status: 'approved' | 'rejected', actorId?: string) {
    const { error } = await supabase
      .from('professional_certifications')
      .update({ verification_status: status })
      .eq('id', certId);
    if (error) throw error;
    await this.writeAuditLog({
      actorId,
      action: status === 'approved' ? 'cert.approve' : 'cert.reject',
      entityType: 'certification',
      entityId: certId,
      meta: { status },
    });
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
    if (settings.hires_enabled === false) {
      throw new Error('We are not taking new requests right now.');
    }
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
    if (status === RequestStatus.COMPLETED) {
      const { data, error } = await supabase.rpc('complete_hire', { p_hire_id: requestId });
      if (error) throw error;
      if (data && typeof data === 'object' && 'error' in (data as object)) {
        throw new Error(String((data as { error?: string }).error));
      }
      return;
    }
    if (status === RequestStatus.SETTLED) {
      const { data, error } = await supabase.rpc('release_hire', { p_hire_id: requestId });
      if (error) throw error;
      return;
    }

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
      .select('*, hire_requests(reference_code)')
      .eq('wallet_id', walletId)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      walletId: row.wallet_id,
      hireRequestId: row.hire_request_id || undefined,
      hireReferenceCode: (row.hire_requests as { reference_code?: string } | null)?.reference_code,
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
      bankCode: row.bank_code || undefined,
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
    bankCode: string;
    accountNumber: string;
    accountName: string;
  }) {
    const settings = await this.getPlatformSettings();
    if (settings.withdrawals_enabled === false) {
      throw new Error('Withdrawals are paused right now. Try again later.');
    }
    const min = settings.min_withdrawal_amount || 5000;
    if (params.amount < min) throw new Error(`Minimum withdrawal is ₦${min.toLocaleString('en-NG')}`);
    if (!params.bankCode) throw new Error('Pick a bank from the list');
    if (!/^\d{10}$/.test(params.accountNumber)) throw new Error('Account number must be 10 digits');
    const wallet = await this.getWallet(params.professionalId);
    if (!wallet || params.amount > wallet.availableBalance) throw new Error('Amount is more than your available balance');
    const { error } = await supabase.from('withdrawal_requests').insert({
      wallet_id: params.walletId,
      professional_id: params.professionalId,
      professional_name: params.professionalName,
      amount: params.amount,
      bank_name: params.bankName,
      bank_code: params.bankCode,
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
        status: row.status as UserStatus,
        emailVerified: true,
        avatarUrl: row.avatar_url || undefined,
        deletedAt: row.deleted_at ?? null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });
  },

  async listClients(): Promise<(User & { hireCount: number })[]> {
    const users = (await this.getAllUsers()).filter((u) => u.role === UserRole.CLIENT);
    const { data: hires } = await supabase.from('hire_requests').select('client_id');
    const counts = new Map<string, number>();
    for (const h of hires || []) {
      const id = String(h.client_id);
      counts.set(id, (counts.get(id) || 0) + 1);
    }
    return users.map((u) => ({ ...u, hireCount: counts.get(u.id) || 0 }));
  },

  async listStaff(): Promise<User[]> {
    return (await this.getAllUsers()).filter(
      (u) => u.role === UserRole.ADMIN || u.role === UserRole.OPERATIONS
    );
  },

  async updateUserStatus(userId: string, status: UserStatus, deletedAt?: string | null, actorId?: string) {
    const patch: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (deletedAt !== undefined) patch.deleted_at = deletedAt;
    const { data, error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', userId)
      .select('id, status, deleted_at')
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Could not update this account. Check staff permissions.');
    await this.writeAuditLog({
      actorId,
      action: status === UserStatus.SUSPENDED ? 'user.suspend' : 'user.restore',
      entityType: 'profile',
      entityId: userId,
      meta: { status, deletedAt: deletedAt ?? null },
    });
    return {
      status: data.status as UserStatus,
      deletedAt: (data.deleted_at as string) || null,
    };
  },

  async listAllReviews(): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, hire_requests(reference_code, professional_name)')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((row) => mapReview(row as Record<string, unknown>));
  },

  async getReview(id: string): Promise<Review | null> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, hire_requests(reference_code, professional_name)')
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return null;
    return mapReview(data as Record<string, unknown>);
  },

  async setReviewStatus(id: string, status: string, actorId?: string, flagReason?: string) {
    const patch: Record<string, unknown> = { status, screened_at: new Date().toISOString() };
    if (status === 'published') patch.flag_reason = null;
    if (status === 'flagged') patch.flag_reason = flagReason || 'A person at Birdie did not approve this';
    if (status === 'pending') patch.flag_reason = flagReason || 'Waiting for a Birdie decision';
    const { error } = await supabase.from('reviews').update(patch).eq('id', id);
    if (error) throw error;
    await this.writeAuditLog({
      actorId,
      action: 'review.status',
      entityType: 'review',
      entityId: id,
      meta: { status, flagReason: flagReason || null },
    });
  },

  // A family reporting a live review sends it back to waiting for a Birdie decision.
  async reportReview(id: string, actorId?: string, reason = 'Reported by a family') {
    const { error } = await supabase
      .from('reviews')
      .update({ status: 'pending', flag_reason: reason })
      .eq('id', id);
    if (error) throw error;
    await this.writeAuditLog({
      actorId,
      action: 'review.report',
      entityType: 'review',
      entityId: id,
      meta: { reason },
    });
  },

  async writeAuditLog(params: {
    actorId?: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    meta?: Record<string, unknown>;
  }) {
    try {
      await supabase.from('admin_audit_log').insert({
        actor_id: params.actorId || null,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId || null,
        meta: params.meta || {},
      });
    } catch {
      /* audit is best-effort */
    }
  },

  async listAuditLog(limit = 40): Promise<AdminAuditLog[]> {
    const { data, error } = await supabase
      .from('admin_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      actorId: row.actor_id,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      meta: (row.meta as Record<string, unknown>) || {},
      createdAt: row.created_at,
    }));
  },

  async rejectWithdrawal(id: string, note?: string, actorId?: string) {
    const { error } = await supabase
      .from('withdrawal_requests')
      .update({
        status: WithdrawalStatus.REJECTED,
        admin_note: note || 'Rejected by staff',
        processed_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) throw error;
    await this.writeAuditLog({
      actorId,
      action: 'payout.reject',
      entityType: 'withdrawal',
      entityId: id,
      meta: { note },
    });
  },

  async getEscrowSnapshot(): Promise<{ count: number; total: number }> {
    const { data, error } = await supabase
      .from('hire_requests')
      .select('escrow_amount, status')
      .in('status', ['funded', 'active']);
    if (error || !data) return { count: 0, total: 0 };
    const total = data.reduce((sum, row) => sum + Number(row.escrow_amount || 0), 0);
    return { count: data.length, total };
  },

  async getAdminAnalytics() {
    const [clients, pros, hires, settings] = await Promise.all([
      this.listClients(),
      this.getAllProfessionals(),
      this.getHireRequests('admin', 'ADMIN'),
      this.getPlatformSettings(),
    ]);
    const verified = pros.filter(
      (p) => p.status === ProfessionalStatus.VERIFIED || p.status === ProfessionalStatus.APPROVED
    ).length;
    const byStatus: Record<string, number> = {};
    for (const h of hires) {
      byStatus[h.status] = (byStatus[h.status] || 0) + 1;
    }
    const byCategory: Record<string, number> = {};
    for (const p of pros) {
      byCategory[p.category] = (byCategory[p.category] || 0) + 1;
    }
    return {
      clientCount: clients.length,
      proCount: pros.length,
      verifiedCount: verified,
      verifiedPct: pros.length ? Math.round((verified / pros.length) * 100) : 0,
      hiresByStatus: byStatus,
      prosByCategory: byCategory,
      consultationFee: settings.consultation_fee_ngn,
      commissionRate: settings.commission_rate,
      escrowDays: settings.escrow_release_days,
    };
  },

  async getAdminOverviewMetrics(rangeDays: OverviewRangeDays = 30): Promise<AdminOverviewMetrics> {
    const rangeStart = new Date();
    rangeStart.setHours(0, 0, 0, 0);
    rangeStart.setDate(rangeStart.getDate() - (rangeDays - 1));
    const inRange = (iso?: string | null) => {
      if (!iso) return false;
      return new Date(iso).getTime() >= rangeStart.getTime();
    };

    const [pros, hires, payouts, clients, reviews, activity, certCountRes] = await Promise.all([
      this.getAllProfessionals(),
      this.getHireRequests('admin', 'ADMIN'),
      this.getWithdrawalRequests(),
      this.listClients(),
      this.listAllReviews(),
      this.listAuditLog(15),
      supabase
        .from('professional_certifications')
        .select('id', { count: 'exact', head: true })
        .eq('verification_status', 'pending'),
    ]);

    const pendingCerts = certCountRes.count || 0;
    const verifiedPros = pros.filter(
      (p) => p.status === ProfessionalStatus.VERIFIED || p.status === ProfessionalStatus.APPROVED
    );
    const pendingApps = pros.filter(
      (p) => p.status === ProfessionalStatus.PENDING || p.status === ProfessionalStatus.UNDER_REVIEW
    );
    const activeJobs = hires.filter((h) => h.status === 'funded' || h.status === 'active');
    const pendingPayouts = payouts.filter((p) => p.status === 'requested');
    const publishedReviews = reviews.filter((r) => r.status === 'published');
    const ratingSum = publishedReviews.reduce((s, r) => s + r.rating, 0);
    const platformRating =
      publishedReviews.length > 0
        ? ratingSum / publishedReviews.length
        : verifiedPros.some((p) => p.rating > 0)
          ? verifiedPros.reduce((s, p) => s + (p.rating || 0), 0) /
            Math.max(1, verifiedPros.filter((p) => (p.rating || 0) > 0).length)
          : null;

    const CONSULTATION_PAID = new Set([
      'consultation_paid',
      'accepted',
      'awaiting_escrow',
      'funded',
      'active',
      'completed',
      'settled',
    ]);
    const periodHires = hires.filter((h) => inRange(h.createdAt));
    const consultationRevenue = periodHires
      .filter((h) => CONSULTATION_PAID.has(h.status))
      .reduce((s, h) => s + Number(h.amount || 0), 0);

    const escrowHeld = hires
      .filter((h) => h.status === 'funded' || h.status === 'active')
      .reduce((s, h) => s + Number(h.escrowAmount || 0), 0);

    const withdrawalsPaid = payouts
      .filter((p) => p.status === 'paid' && inRange(p.processedAt || p.requestedAt))
      .reduce((s, p) => s + Number(p.amount || 0), 0);

    const dayKeys: string[] = [];
    const dayLabels: string[] = [];
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dayKeys.push(key);
      dayLabels.push(d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }));
    }
    const dateKey = (iso: string) => {
      const d = new Date(iso);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    const countByDay = (timestamps: string[]) => {
      const map = new Map<string, number>();
      for (const t of timestamps) {
        const k = dateKey(t);
        map.set(k, (map.get(k) || 0) + 1);
      }
      return dayKeys.map((k) => map.get(k) || 0);
    };
    const sumByDay = (rows: { at: string; amount: number }[]) => {
      const map = new Map<string, number>();
      for (const r of rows) {
        const k = dateKey(r.at);
        map.set(k, (map.get(k) || 0) + r.amount);
      }
      return dayKeys.map((k) => map.get(k) || 0);
    };

    const hireCounts = countByDay(hires.map((h) => h.createdAt));
    const hiresByDay = dayKeys.map((date, i) => ({
      date,
      label: dayLabels[i],
      count: hireCounts[i],
    }));

    const pendingPay = hires.filter(
      (h) => h.status === 'awaiting_consultation_pay' || h.status === 'awaiting_escrow'
    ).length;
    const pipelineActive = hires.filter((h) =>
      ['accepted', 'consultation_paid', 'funded', 'active'].includes(h.status)
    ).length;
    const pipelineCompleted = hires.filter((h) => h.status === 'completed' || h.status === 'settled').length;
    const pipelineCancelled = hires.filter((h) => h.status === 'cancelled' || h.status === 'disputed').length;

    const byCategory = new Map<string, number>();
    for (const p of pros) {
      byCategory.set(p.category, (byCategory.get(p.category) || 0) + 1);
    }

    const rejected = pros.filter((p) => p.status === ProfessionalStatus.REJECTED).length;
    const suspended = pros.filter((p) => p.status === ProfessionalStatus.SUSPENDED).length;

    const ratingHistogram = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count: publishedReviews.filter((r) => r.rating === rating).length,
    }));

    return {
      rangeDays,
      refreshedAt: new Date().toISOString(),
      kpis: {
        verifiedPros: verifiedPros.length,
        pendingApps: pendingApps.length,
        activeJobs: activeJobs.length,
        platformRating,
        pendingPayouts: pendingPayouts.length,
        clientCount: clients.length,
        escrowHeld,
        consultationRevenue,
      },
      sparklines: {
        hires: hireCounts,
        pros: countByDay(pros.map((p) => p.createdAt)),
        clients: countByDay(clients.map((c) => c.createdAt)),
        consultation: sumByDay(
          periodHires
            .filter((h) => CONSULTATION_PAID.has(h.status))
            .map((h) => ({ at: h.createdAt, amount: Number(h.amount || 0) }))
        ),
      },
      hiresByDay,
      hirePipeline: [
        { name: 'Waiting to pay', value: pendingPay },
        { name: 'Job running', value: pipelineActive },
        { name: 'Job done', value: pipelineCompleted },
        { name: 'Cancelled', value: pipelineCancelled },
      ],
      prosByCategory: Array.from(byCategory.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      proStatusMix: [
        { name: 'Verified', value: verifiedPros.length },
        { name: 'Being checked', value: pendingApps.length },
        { name: 'Not approved', value: rejected },
        { name: 'Paused', value: suspended },
      ].filter((s) => s.value > 0),
      moneyPulse: { escrowHeld, withdrawalsPaid },
      ratingHistogram,
      attention: {
        pendingPros: pendingApps.slice(0, 6),
        pendingCerts,
        pendingPayouts: pendingPayouts.length,
        flaggedReviews: reviews.filter((r) => r.status === 'flagged').length,
        suspendedClients: clients.filter((c) => c.status === UserStatus.SUSPENDED || !!c.deletedAt).length,
      },
      activity,
    };
  },

  async listCommunicationTemplates(): Promise<CommunicationTemplate[]> {
    const { data, error } = await supabase
      .from('communication_templates')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      subject: row.subject,
      body: row.body,
      variables: row.variables || [],
      status: row.status,
      updatedAt: row.updated_at,
    }));
  },

  async listCommunicationLogs(): Promise<CommunicationLog[]> {
    const { data, error } = await supabase
      .from('communication_logs')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(50);
    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      toEmail: row.to_email,
      recipientRole: row.recipient_role,
      subject: row.subject,
      templateSlug: row.template_slug,
      status: row.status,
      relatedEvent: row.related_event,
      sentAt: row.sent_at,
      retryCount: row.retry_count,
      error: row.error,
    }));
  },

  async getBlogPost(id: string): Promise<BlogPost | null> {
    const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).maybeSingle();
    if (error || !data) return null;
    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || '',
      content: data.content || '',
      category: data.category || 'Guides',
      author: data.author || 'Birdie',
      imageUrl: data.image_url || undefined,
      published: data.published,
      createdAt: data.created_at,
      date: new Date(data.created_at).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    };
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
    return data.map((row) => mapReview(row as Record<string, unknown>));
  },

  async getReviewsByClient(clientId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((row) => mapReview(row as Record<string, unknown>));
  },

  async getEligibleHiresForReview(clientId: string, professionalId: string): Promise<HireRequest[]> {
    const [hires, reviews] = await Promise.all([
      this.getHireRequests(clientId, 'CLIENT'),
      this.getReviewsByClient(clientId),
    ]);
    const reviewed = new Set(reviews.map((r) => r.hireRequestId));
    return hires.filter(
      (h) =>
        h.professionalId === professionalId &&
        (h.status === RequestStatus.COMPLETED || h.status === RequestStatus.SETTLED) &&
        !reviewed.has(h.id)
    );
  },

  async getUnreviewedCompletedHires(clientId: string): Promise<HireRequest[]> {
    const [hires, reviews] = await Promise.all([
      this.getHireRequests(clientId, 'CLIENT'),
      this.getReviewsByClient(clientId),
    ]);
    const reviewed = new Set(reviews.map((r) => r.hireRequestId));
    return hires.filter(
      (h) =>
        Boolean(h.professionalId) &&
        (h.status === RequestStatus.COMPLETED || h.status === RequestStatus.SETTLED) &&
        !reviewed.has(h.id)
    );
  },

  async createReview(params: {
    hireRequestId: string;
    professionalId: string;
    clientId: string;
    clientName: string;
    category: string;
    rating: number;
    comment: string;
  }): Promise<Review> {
    const settings = await this.getPlatformSettings();
    if (settings.reviews_enabled === false) {
      throw new Error('Reviews are paused right now.');
    }
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        hire_request_id: params.hireRequestId,
        professional_id: params.professionalId,
        client_id: params.clientId,
        client_name: params.clientName,
        category: params.category,
        rating: params.rating,
        comment: params.comment,
        status: 'pending',
        flag_reason: null,
      })
      .select('*')
      .single();
    if (error || !data) throw error || new Error('Could not send your review');
    const review = mapReview(data as Record<string, unknown>);
    // Fire and forget: if this never lands, a job on the server checks it a minute later.
    supabase.functions.invoke('review-screen', { body: { reviewId: review.id } }).catch(() => undefined);
    return review;
  },

  // Waits while Birdie checks a review. Returns as soon as the check is finished.
  async waitForReviewCheck(id: string, timeoutMs = 15000): Promise<Review | null> {
    const startedAt = Date.now();
    let latest = await this.getReview(id);
    while (latest && latest.status === 'pending' && !latest.screenedAt && Date.now() - startedAt < timeoutMs) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      latest = await this.getReview(id);
    }
    return latest;
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

  async createNotification(
    userId: string,
    title: string,
    body: string,
    type = 'info',
    link?: { relatedEntity?: string; relatedId?: string }
  ) {
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      body,
      type,
      related_entity: link?.relatedEntity || null,
      related_id: link?.relatedId || null,
    });
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
    const callbackUrl = `${window.location.origin}/app/payments/return?hire=${payload.hireRequestId}`;
    const { data, error } = await supabase.functions.invoke('paystack-initialize', {
      body: { ...payload, callbackUrl },
    });
    if (error) throw error;
    if (data && typeof data === 'object' && 'error' in data && (data as { error?: string }).error) {
      throw new Error((data as { error: string }).error);
    }
    return data as { authorization_url: string; reference: string };
  },

  async verifyPaystackPayment(reference: string) {
    const { data, error } = await supabase.functions.invoke('paystack-verify', { body: { reference } });
    if (error) throw error;
    if (data && typeof data === 'object' && 'error' in data && (data as { error?: string }).error) {
      throw new Error((data as { error: string }).error);
    }
    return data as { paid: boolean; hireRequestId?: string; paymentType?: string; reference: string };
  },

  async listPaystackBanks(): Promise<{ name: string; code: string }[]> {
    const { data, error } = await supabase.functions.invoke('paystack-banks', { body: {} });
    if (error) throw error;
    if (data && typeof data === 'object' && 'error' in data && (data as { error?: string }).error) {
      throw new Error((data as { error: string }).error);
    }
    return ((data as { banks?: { name: string; code: string }[] })?.banks || []);
  },

  async refundPayment(params: { paymentId?: string; hireRequestId?: string; paymentType?: 'consultation' | 'escrow' }) {
    const { data, error } = await supabase.functions.invoke('paystack-refund', { body: params });
    if (error) throw error;
    if (data && typeof data === 'object' && 'error' in data && (data as { error?: string }).error) {
      throw new Error((data as { error: string }).error);
    }
  },

  async approveWithdrawalTransfer(withdrawalId: string) {
    const { data, error } = await supabase.functions.invoke('paystack-transfer', { body: { withdrawalId } });
    if (error) throw error;
    if (data && typeof data === 'object' && 'error' in data && (data as { error?: string }).error) {
      throw new Error((data as { error: string }).error);
    }
  },

  async getConsultationForHire(hireId: string): Promise<Consultation | null> {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('hire_request_id', hireId)
      .maybeSingle();
    if (error || !data) return null;
    return {
      id: data.id,
      hireRequestId: data.hire_request_id,
      scheduledAt: data.scheduled_at,
      feeAmount: Number(data.fee_amount || 0),
      paymentStatus: data.payment_status as PaymentStatus,
      paystackReference: data.paystack_reference || undefined,
      createdAt: data.created_at,
      completedAt: data.completed_at || undefined,
      outcomeNotes: data.outcome_notes || undefined,
    };
  },

  // Staff mark the consultation call as done. Birdie then drafts the invoice.
  async markConsultationDone(params: { hireId: string; notes?: string; actorId?: string }): Promise<Invoice | null> {
    const { error } = await supabase
      .from('consultations')
      .update({ completed_at: new Date().toISOString(), outcome_notes: params.notes || null })
      .eq('hire_request_id', params.hireId);
    if (error) throw error;

    const { error: draftError } = await supabase.rpc('draft_invoice_for_hire', { p_hire_id: params.hireId });
    if (draftError) throw draftError;

    const invoice = await this.getInvoiceForHire(params.hireId);
    const { data: hire } = await supabase
      .from('hire_requests')
      .select('reference_code, client_name')
      .eq('id', params.hireId)
      .maybeSingle();
    const { data: staff } = await supabase.from('profiles').select('id').in('role', ['admin', 'operations']);
    const ref = hire?.reference_code || 'this hire';
    const who = hire?.client_name || 'A family';
    for (const s of staff || []) {
      if (s.id === params.actorId) continue;
      await this.createNotification(
        s.id,
        'A bill is ready to check',
        `${who} · ${ref}. Open the hire, check the amount, then send it to the family.`,
        'invoice',
        invoice ? { relatedEntity: 'invoice', relatedId: invoice.id } : { relatedEntity: 'hire_request', relatedId: params.hireId }
      );
    }

    await this.writeAuditLog({
      actorId: params.actorId,
      action: 'consultation.done',
      entityType: 'hire',
      entityId: params.hireId,
      meta: { notes: params.notes || null },
    });
    return invoice;
  },

  async getInvoiceForHire(hireId: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select(INVOICE_SELECT)
      .eq('hire_request_id', hireId)
      .maybeSingle();
    if (error || !data) return null;
    return mapInvoice(data as Record<string, unknown>);
  },

  async getInvoice(id: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select(INVOICE_SELECT)
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return null;
    return mapInvoice(data as Record<string, unknown>);
  },

  async listInvoices(clientId?: string): Promise<Invoice[]> {
    let query = supabase.from('invoices').select(INVOICE_SELECT).order('created_at', { ascending: false });
    if (clientId) query = query.eq('client_id', clientId);
    const { data, error } = await query;
    if (error || !data) return [];
    return data.map((row) => mapInvoice(row as Record<string, unknown>));
  },

  async saveInvoiceDraft(params: {
    id: string;
    amount: number;
    dueDate?: string;
    duration?: string;
    startDate?: string;
    notes?: string;
  }): Promise<Invoice> {
    if (!params.amount || params.amount <= 0) throw new Error('Enter the amount the family agreed to pay');
    const { data, error } = await supabase
      .from('invoices')
      .update({
        amount: params.amount,
        due_date: params.dueDate || null,
        duration: params.duration || null,
        start_date: params.startDate || null,
        notes: params.notes || null,
      })
      .eq('id', params.id)
      .select(INVOICE_SELECT)
      .single();
    if (error || !data) throw error || new Error('Could not save the invoice');
    return mapInvoice(data as Record<string, unknown>);
  },

  // Send the invoice: the hire moves to "waiting for payment" and the client is told to pay.
  async sendInvoice(params: {
    invoiceId: string;
    professionalUserId?: string;
    referenceCode?: string;
    actorId?: string;
  }) {
    const invoice = await this.getInvoice(params.invoiceId);
    if (!invoice) throw new Error('Invoice not found');
    if (!invoice.amount || invoice.amount <= 0) throw new Error('Enter the amount before you send this invoice');

    const { error } = await supabase
      .from('invoices')
      .update({ status: InvoiceStatus.SENT, sent_at: new Date().toISOString() })
      .eq('id', params.invoiceId);
    if (error) throw error;

    await this.applyAgreedJobPrice({
      hireId: invoice.hireRequestId,
      escrowAmount: invoice.amount,
      startDate: invoice.startDate || undefined,
      duration: invoice.duration || undefined,
    });

    const ref = params.referenceCode || invoice.hireReferenceCode || 'your hire';
    const amountText = `₦${invoice.amount.toLocaleString()}`;
    if (params.professionalUserId) {
      await this.createNotification(
        params.professionalUserId,
        'Price agreed for your job',
        `Birdie sent the family a bill of ${amountText} for ${ref}. The job starts once they pay.`,
        'hire'
      );
    }
    await this.createNotification(
      invoice.clientId,
      'Your Birdie bill is ready',
      `${invoice.invoiceNumber} · ${amountText} for ${ref}. Open it to pay.`,
      'invoice',
      { relatedEntity: 'invoice', relatedId: invoice.id }
    );

    await this.writeAuditLog({
      actorId: params.actorId,
      action: 'invoice.sent',
      entityType: 'invoice',
      entityId: invoice.id,
      meta: { amount: invoice.amount, hireId: invoice.hireRequestId },
    });
  },

  // Writes the agreed amount onto the hire and moves it to "waiting for payment".
  async applyAgreedJobPrice(params: {
    hireId: string;
    escrowAmount: number;
    startDate?: string;
    duration?: string;
  }) {
    if (!params.escrowAmount || params.escrowAmount <= 0) throw new Error('Enter the agreed job amount');
    const extras: Record<string, unknown> = {
      escrow_amount: params.escrowAmount,
      payment_status: 'awaiting_escrow',
    };
    if (params.startDate) {
      extras.preferred_start_date = params.startDate.includes('T')
        ? params.startDate
        : `${params.startDate}T09:00:00`;
    }
    if (params.duration) {
      const { data: hire } = await supabase
        .from('hire_requests')
        .select('requirements')
        .eq('id', params.hireId)
        .maybeSingle();
      extras.requirements = { ...((hire?.requirements as Record<string, unknown>) || {}), duration: params.duration };
    }
    await this.updateHireStatus(params.hireId, RequestStatus.AWAITING_ESCROW, extras);
  },

  async getPayments(userId?: string): Promise<Payment[]> {
    let query = supabase
      .from('payments')
      .select('*, hire_requests(reference_code)')
      .order('created_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      userId: row.user_id,
      hireRequestId: row.hire_request_id || undefined,
      hireReferenceCode: (row.hire_requests as { reference_code?: string } | null)?.reference_code,
      type: row.payment_type as PaymentType,
      amount: Number(row.amount),
      status: row.status as PaymentStatus,
      provider: row.provider,
      providerReference: row.provider_reference || undefined,
      createdAt: row.created_at,
    }));
  },

  async getMediaSlotUrls(): Promise<Record<string, string>> {
    const { data, error } = await supabase
      .from('media_slots')
      .select('slot, fallback_url, updated_at, media_files ( public_url )');
    if (error || !data) return {};
    const urls: Record<string, string> = {};
    for (const row of data as Array<Record<string, unknown>>) {
      const file = row.media_files as { public_url?: string } | { public_url?: string }[] | null;
      const fileUrl = Array.isArray(file) ? file[0]?.public_url : file?.public_url;
      urls[String(row.slot)] = mediaSlotUrl(
        String(row.fallback_url || ''),
        fileUrl,
        row.updated_at as string | undefined
      );
    }
    return urls;
  },

  async listMediaSlots(): Promise<MediaSlot[]> {
    const { data, error } = await supabase
      .from('media_slots')
      .select('slot, label, group_name, fallback_url, media_id, updated_at, media_files (*)')
      .order('group_name')
      .order('label');
    if (error || !data) return [];
    return (data as Array<Record<string, unknown>>).map((row) => {
      const raw = row.media_files as Record<string, unknown> | Record<string, unknown>[] | null;
      const fileRow = Array.isArray(raw) ? raw[0] : raw;
      const file = fileRow ? mapMediaFile(fileRow) : null;
      return {
        slot: String(row.slot),
        label: String(row.label || ''),
        groupName: String(row.group_name || 'pages'),
        fallbackUrl: String(row.fallback_url || ''),
        mediaId: (row.media_id as string) || null,
        publicUrl: mediaSlotUrl(String(row.fallback_url || ''), file?.publicUrl, row.updated_at as string | undefined),
        updatedAt: String(row.updated_at || ''),
        file,
      };
    });
  },

  async listMediaFiles(): Promise<MediaFile[]> {
    const { data, error } = await supabase
      .from('media_files')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((row) => mapMediaFile(row as Record<string, unknown>));
  },

  async uploadSiteMedia(file: File, slot?: string) {
    if (!file.type.startsWith('image/')) {
      throw new Error('Please choose a picture.');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('That picture is too large. Keep it under 10 MB.');
    }

    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id || null;
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 80) || 'image.png';
    const path = slot
      ? `slots/${slot}/${Date.now()}-${safe}`
      : `library/${crypto.randomUUID()}-${safe}`;

    const { error: upErr } = await supabase.storage.from('site-media').upload(path, file, {
      upsert: false,
      contentType: file.type,
    });
    if (upErr) throw upErr;

    const { data: pub } = supabase.storage.from('site-media').getPublicUrl(path);
    const { data: row, error: insErr } = await supabase
      .from('media_files')
      .insert({
        filename: file.name,
        storage_path: path,
        public_url: pub.publicUrl,
        mime_type: file.type,
        byte_size: file.size,
        created_by: userId,
      })
      .select()
      .single();
    if (insErr || !row) throw insErr || new Error('Could not save that picture.');

    if (slot) {
      const { error } = await supabase
        .from('media_slots')
        .update({
          media_id: row.id,
          updated_at: new Date().toISOString(),
          updated_by: userId,
        })
        .eq('slot', slot);
      if (error) throw error;
    }

    return mapMediaFile(row as Record<string, unknown>);
  },

  async assignMediaToSlot(slot: string, mediaId: string) {
    const { data: authData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('media_slots')
      .update({
        media_id: mediaId,
        updated_at: new Date().toISOString(),
        updated_by: authData.user?.id || null,
      })
      .eq('slot', slot);
    if (error) throw error;
  },

  async deleteMediaFile(id: string) {
    const { data, error } = await supabase.from('media_files').select('storage_path').eq('id', id).maybeSingle();
    if (error) throw error;
    if (data?.storage_path) {
      await supabase.storage.from('site-media').remove([data.storage_path]);
    }
    const { error: delErr } = await supabase.from('media_files').delete().eq('id', id);
    if (delErr) throw delErr;
  },

  async getPublishedLayout(slug: string) {
    const { data, error } = await supabase.rpc('get_published_layout', { p_slug: slug });
    if (error) return null;
    return data ?? null;
  },

  async getPageLayoutRow(slug: string) {
    const { data, error } = await supabase
      .from('page_layouts')
      .select('slug, draft, published, updated_at, updated_by')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async listPageLayouts() {
    const { data, error } = await supabase
      .from('page_layouts')
      .select('slug, updated_at, published')
      .order('slug');
    if (error || !data) return [];
    return data.map((row) => ({
      slug: String(row.slug),
      updatedAt: String(row.updated_at || ''),
      hasPublished: Boolean(row.published),
    }));
  },

  async savePageDraft(slug: string, draft: unknown, userId?: string) {
    const existing = await this.getPageLayoutRow(slug);
    if (existing) {
      const { error } = await supabase
        .from('page_layouts')
        .update({
          draft,
          updated_at: new Date().toISOString(),
          updated_by: userId || null,
        })
        .eq('slug', slug);
      if (error) throw error;
      return;
    }
    const { error } = await supabase.from('page_layouts').insert({
      slug,
      draft,
      published: null,
      updated_at: new Date().toISOString(),
      updated_by: userId || null,
    });
    if (error) throw error;
  },

  async publishPageLayout(slug: string, draft: unknown, userId?: string) {
    const { error } = await supabase
      .from('page_layouts')
      .update({
        draft,
        published: draft,
        updated_at: new Date().toISOString(),
        updated_by: userId || null,
      })
      .eq('slug', slug);
    if (error) throw error;
  },

  async resetPageLayout(slug: string, draft: unknown, userId?: string) {
    const { error } = await supabase
      .from('page_layouts')
      .update({
        draft,
        published: null,
        updated_at: new Date().toISOString(),
        updated_by: userId || null,
      })
      .eq('slug', slug);
    if (error) throw error;
  },
};

const FALLBACK_BLOG: BlogPost[] = [
  {
    id: 'b1',
    title: 'How Birdie Checks Home Helpers in Lagos',
    slug: 'how-birdie-vets',
    excerpt: 'ID checks, guarantors, police clearance, and a skills test — how we decide who can go live.',
    content:
      'Birdie checks every professional before a family can hire them. They send us their ID, papers, guarantor details, and they sit a skills test. A person at Birdie looks at all of that before they go live.',
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
    excerpt: 'Say what you need, pay through Birdie, and agree the job before day one.',
    content:
      'Start with the kind of help you need and when. Pay the meeting fee so Birdie can set up a call. After the call we send you a bill for the amount you agreed. Birdie holds your money until the job is done, then pays the professional.',
    category: 'Guides',
    author: 'Birdie Team',
    published: true,
    createdAt: new Date().toISOString(),
    date: 'Mar 2026',
  },
  {
    id: 'b3',
    title: 'Why Birdie Holds Your Money',
    slug: 'why-escrow',
    excerpt: 'You pay Birdie, not the professional. That keeps both sides safe.',
    content:
      'You pay your bill with your card. Birdie holds that money while the work is happening. When the job is done we pay the professional and keep a small service fee. Nobody waits on a cash handoff, and nobody takes the money before the work is finished.',
    category: 'Trust',
    author: 'Birdie Team',
    published: true,
    createdAt: new Date().toISOString(),
    date: 'Mar 2026',
  },
];

function mapMediaFile(row: Record<string, unknown>): MediaFile {
  return {
    id: String(row.id),
    filename: String(row.filename || ''),
    storagePath: String(row.storage_path || ''),
    publicUrl: String(row.public_url || ''),
    mimeType: (row.mime_type as string) || undefined,
    byteSize: typeof row.byte_size === 'number' ? row.byte_size : undefined,
    alt: (row.alt as string) || undefined,
    createdAt: String(row.created_at || ''),
  };
}

function mediaSlotUrl(fallbackUrl: string, fileUrl?: string | null, updatedAt?: string) {
  if (!fileUrl) return fallbackUrl;
  const stamp = updatedAt ? Date.parse(updatedAt) : Date.now();
  return `${fileUrl}${fileUrl.includes('?') ? '&' : '?'}v=${stamp}`;
}
