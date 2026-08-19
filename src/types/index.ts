export enum UserRole {
  CLIENT = 'client',
  PROFESSIONAL = 'professional',
  ADMIN = 'admin',
  OPERATIONS = 'operations',
}

export enum UserStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

export enum ProfessionalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  VERIFIED = 'verified',
  UNDER_REVIEW = 'under_review',
  SUSPENDED = 'suspended',
}

export enum RequestStatus {
  PENDING = 'pending',
  AWAITING_CONSULTATION_PAY = 'awaiting_consultation_pay',
  CONSULTATION_PAID = 'consultation_paid',
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  AWAITING_ESCROW = 'awaiting_escrow',
  FUNDED = 'funded',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  SETTLED = 'settled',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

export enum Availability {
  AVAILABLE = 'available',
  BUSY = 'busy',
  UNAVAILABLE = 'unavailable',
  ON_JOB = 'on_job',
}

export enum PaymentType {
  CONSULTATION = 'consultation',
  ESCROW = 'escrow',
  REFUND = 'refund',
}

export enum PaymentStatus {
  INITIATED = 'initiated',
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum TransactionType {
  ESCROW_CREDIT = 'escrow_credit',
  ESCROW_DEBIT = 'escrow_debit',
  PENDING_CREDIT = 'pending_credit',
  PENDING_DEBIT = 'pending_debit',
  AVAILABLE_CREDIT = 'available_credit',
  AVAILABLE_DEBIT = 'available_debit',
  COMMISSION_DEBIT = 'commission_debit',
  WITHDRAWAL_DEBIT = 'withdrawal_debit',
  REFUND_DEBIT = 'refund_debit',
}

export enum TransactionStatus {
  INITIATED = 'initiated',
  PAID = 'paid',
  IN_ESCROW = 'in_escrow',
  PENDING_RELEASE = 'pending_release',
  RELEASED = 'released',
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum WithdrawalStatus {
  REQUESTED = 'requested',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  PAID = 'paid',
  REJECTED = 'rejected',
}

export enum DocumentType {
  GOVT_ID = 'govt_id',
  PASSPORT_PHOTO = 'passport_photo',
  POLICE_CLEARANCE = 'police_clearance',
  PROOF_OF_ADDRESS = 'proof_of_address',
}

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface User {
  id: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  phone: string;
  status: UserStatus;
  emailVerified: boolean;
  avatarUrl?: string;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  description?: string;
}

export interface PlatformSettings {
  id: string;
  platform_name: string;
  support_email: string;
  default_currency: string;
  commission_rate: number;
  consultation_fee_ngn: number;
  min_withdrawal_amount: number;
  escrow_release_days: number;
  reg_client_enabled: boolean;
  reg_pro_enabled: boolean;
  auto_verify_pros: boolean;
  manual_vetting_required: boolean;
  email_notifications_enabled: boolean;
  default_sender_email: string;
  admin_alert_recipients: string[];
  session_timeout_minutes: number;
  require_email_verification: boolean;
  admin_only_access: boolean;
  ga_measurement_id?: string | null;
  invoice_due_days: number;
  paystack_mode: 'test' | 'live';
  paystack_public_key_test?: string | null;
  paystack_public_key_live?: string | null;
  paystack_secret_last4_test?: string | null;
  paystack_secret_last4_live?: string | null;
  hires_enabled: boolean;
  withdrawals_enabled: boolean;
  reviews_enabled: boolean;
  public_banner_enabled: boolean;
  public_banner_text?: string | null;
  support_phone?: string | null;
  support_whatsapp?: string | null;
  office_address?: string | null;
  page_studio_enabled: boolean;
  help_assistant_enabled: boolean;
  openai_secret_last4?: string | null;
  updated_at: string;
}

export interface AdminAuditLog {
  id: string;
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  meta: Record<string, unknown>;
  createdAt: string;
}

export interface CommunicationTemplate {
  id: string;
  slug: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  status: string;
  updatedAt: string;
}

export interface CommunicationLog {
  id: string;
  toEmail: string;
  recipientRole?: string | null;
  subject: string;
  templateSlug?: string | null;
  status: string;
  relatedEvent?: string | null;
  sentAt?: string | null;
  retryCount: number;
  error?: string | null;
}

export interface ProfessionalProfile {
  id: string;
  userId: string;
  fullName?: string;
  category: string;
  bio: string;
  location: string;
  phone?: string;
  state?: string;
  city?: string;
  addressLine?: string;
  country?: string;
  lat?: number | null;
  lng?: number | null;
  availability: Availability;
  profileCompletion: number;
  status: ProfessionalStatus;
  aptitudeScore?: number;
  assessmentScore?: number;
  publicVisible: boolean;
  avatarUrl?: string;
  createdAt: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  nin?: string;
  govtIdPath?: string;
  proofOfAddressPath?: string;
  proofOfAddressType?: string;
  ninDocPath?: string;
  onboardingStep?: string;
  assessmentCompletedAt?: string | null;
  attitudeAnswers?: Record<string, string>;
  gender?: string;
  indicativeRateNgn?: number | null;
  rateUnit?: 'monthly' | 'daily' | 'hourly';
  yearsExperience?: number;
  workType?: '' | 'live_in' | 'live_out' | 'part_time' | 'flexible';
  languages?: string[];
  skills?: string[];
  deletedAt?: string | null;
}

export type OverviewRangeDays = 7 | 30 | 90;

export interface OverviewDayPoint {
  date: string;
  label: string;
  count: number;
}

export interface OverviewNamedCount {
  name: string;
  value: number;
}

export interface AdminOverviewMetrics {
  rangeDays: OverviewRangeDays;
  refreshedAt: string;
  kpis: {
    verifiedPros: number;
    pendingApps: number;
    activeJobs: number;
    platformRating: number | null;
    pendingPayouts: number;
    clientCount: number;
    escrowHeld: number;
    consultationRevenue: number;
  };
  sparklines: {
    hires: number[];
    pros: number[];
    clients: number[];
    consultation: number[];
  };
  hiresByDay: OverviewDayPoint[];
  hirePipeline: OverviewNamedCount[];
  prosByCategory: OverviewNamedCount[];
  proStatusMix: OverviewNamedCount[];
  moneyPulse: { escrowHeld: number; withdrawalsPaid: number };
  ratingHistogram: { rating: number; count: number }[];
  attention: {
    pendingPros: ProfessionalProfile[];
    pendingCerts: number;
    pendingPayouts: number;
    flaggedReviews: number;
    suspendedClients: number;
  };
  activity: AdminAuditLog[];
}

export interface ProfessionalDocument {
  id: string;
  professionalId: string;
  type: DocumentType;
  storagePath: string;
  reviewStatus: ReviewStatus;
  createdAt: string;
}

export interface ProfessionalCertification {
  id: string;
  professionalId: string;
  title: string;
  storagePath: string;
  verificationStatus: ReviewStatus;
  createdAt: string;
}

export interface Guarantor {
  id: string;
  professionalId: string;
  name: string;
  phone: string;
  occupation: string;
  address: string;
  relationship: string;
}

export interface HireRequest {
  id: string;
  clientId: string;
  professionalId?: string;
  serviceCategory: string;
  serviceRequested?: string;
  preferredStartDate: string;
  location: string;
  requirements: Record<string, unknown>;
  notes?: string;
  status: RequestStatus;
  amount: number | null;
  escrowAmount?: number | null;
  createdAt: string;
  updatedAt: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  professionalName?: string;
  paymentStatus?: string;
  referenceCode: string;
}

export interface Consultation {
  id: string;
  hireRequestId: string;
  scheduledAt: string;
  feeAmount: number;
  paymentStatus: PaymentStatus;
  paystackReference?: string;
  createdAt: string;
  completedAt?: string;
  outcomeNotes?: string;
}

export interface Payment {
  id: string;
  userId: string;
  hireRequestId?: string;
  hireReferenceCode?: string;
  type: PaymentType;
  amount: number;
  status: PaymentStatus;
  provider: string;
  providerReference?: string;
  createdAt: string;
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export interface Invoice {
  id: string;
  hireRequestId: string;
  invoiceNumber: string;
  clientId: string;
  professionalId?: string;
  amount: number;
  dueDate?: string;
  duration?: string;
  startDate?: string;
  notes?: string;
  status: InvoiceStatus;
  sentAt?: string;
  paidAt?: string;
  createdAt: string;
  clientName?: string;
  professionalName?: string;
  serviceRequested?: string;
  hireReferenceCode?: string;
  hireStatus?: string;
}

export interface Wallet {
  id: string;
  professionalId: string;
  escrowBalance: number;
  pendingEarnings: number;
  availableBalance: number;
  totalWithdrawn: number;
  currency: 'NGN';
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  hireRequestId?: string;
  hireReferenceCode?: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  reference: string;
  description: string;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  walletId: string;
  professionalId: string;
  professionalName: string;
  amount: number;
  bankName: string;
  bankCode?: string;
  accountNumber: string;
  accountName: string;
  status: WithdrawalStatus;
  adminNote?: string;
  requestedAt: string;
  processedAt?: string;
}

export interface Message {
  id: string;
  hireRequestId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export interface Review {
  id: string;
  hireRequestId: string;
  professionalId: string;
  clientId: string;
  clientName: string;
  category: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: 'published' | 'pending' | 'flagged';
  flagReason?: string;
  screenedAt?: string;
  professionalName?: string;
  hireReferenceCode?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  relatedEntity?: string;
  relatedId?: string;
  read: boolean;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  imageUrl?: string;
  published: boolean;
  createdAt: string;
  date: string;
}

export interface AssessmentAttempt {
  id: string;
  professionalId: string;
  category: string;
  answers: Record<string, string>;
  autoScore: number;
  submittedAt: string;
}

export interface MediaFile {
  id: string;
  filename: string;
  storagePath: string;
  publicUrl: string;
  mimeType?: string;
  byteSize?: number;
  alt?: string;
  createdAt: string;
}

export interface MediaSlot {
  slot: string;
  label: string;
  groupName: string;
  fallbackUrl: string;
  mediaId: string | null;
  publicUrl: string;
  updatedAt: string;
  file?: MediaFile | null;
}
