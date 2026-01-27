
export enum UserRole {
  CLIENT = 'client',
  PROFESSIONAL = 'professional',
  ADMIN = 'admin',
  OPERATIONS = 'operations'
}

export enum UserStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended'
}

export enum ProfessionalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  VERIFIED = 'verified',
  UNDER_REVIEW = 'under_review',
  SUSPENDED = 'suspended'
}

export enum RequestStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  AWAITING_ESCROW = 'awaiting_escrow',
  FUNDED = 'funded',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  SETTLED = 'settled',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed'
}

export enum Availability {
  AVAILABLE = 'available',
  BUSY = 'busy',
  UNAVAILABLE = 'unavailable',
  ON_JOB = 'on_job'
}

export type AvailabilityStatus = Availability;

export enum PaymentType {
  CONSULTATION = 'consultation',
  PLACEMENT = 'placement',
  SERVICE_FEE = 'service_fee'
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
  REFUND_DEBIT = 'refund_debit'
}

export enum TransactionStatus {
  INITIATED = 'initiated',
  PAID = 'paid',
  IN_ESCROW = 'in_escrow',
  PENDING_RELEASE = 'pending_release',
  RELEASED = 'released',
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum WithdrawalStatus {
  REQUESTED = 'requested',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  PAID = 'paid',
  REJECTED = 'rejected'
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
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  reference: string;
  description: string;
  createdAt: string;
}

export interface PaymentWebhook {
  id: string;
  provider: string;
  eventType: string;
  reference: string;
  payload: any;
  processed: boolean;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  walletId: string;
  professionalId: string;
  professionalName: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: WithdrawalStatus;
  adminNote?: string;
  requestedAt: string;
  processedAt?: string;
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
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  is_active: boolean;
}

export interface PlatformSettings {
  id: string;
  platform_name: string;
  support_email: string;
  default_currency: string;
  commission_rate: number;
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
  updated_at: string;
}

export interface ProfessionalProfile {
  id: string;
  userId: string;
  category: string;
  serviceCategory?: string;
  bio: string;
  location: string;
  phone?: string;
  availability: Availability;
  profileCompletion: number;
  status: ProfessionalStatus;
  verificationStatus?: ProfessionalStatus;
  aptitudeScore?: number;
  assessmentScore?: number;
  isVetted?: boolean;
  publicVisible: boolean;
  createdAt: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  nin?: string;
  proofOfAddress?: string;
  govtId?: string;
  certificationsUrl?: string;
}

export interface HireRequest {
  id: string;
  clientId: string;
  professionalId?: string;
  serviceCategory: string;
  serviceRequested?: string;
  preferredStartDate: string;
  requestedDate: string;
  submissionDate?: string;
  location: string;
  requirements: {
    ageRange?: string;
    duration?: string;
    livingCondition?: 'LIVE_IN' | 'LIVE_OUT';
    notes?: string;
    hours?: string;
  };
  notes?: string;
  status: RequestStatus;
  amount: number | null;
  createdAt: string;
  updatedAt: string;
  clientName: string;
  professionalName?: string;
  providerReference?: string;
  paymentStatus?: 'unpaid' | 'awaiting_escrow' | 'escrowed' | 'disputed' | 'released';
}

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  message?: string;
  relatedEntity?: 'HIRE_REQUEST' | 'PAYMENT' | 'REVIEW';
  relatedId?: string;
  read: boolean;
  isRead?: boolean;
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
  text: string;
  date: string;
  createdAt: string;
  status: 'PUBLISHED' | 'PENDING' | 'FLAGGED';
}

export enum CommunicationStatus {
  SENT = 'SENT',
  FAILED = 'FAILED',
  PENDING = 'PENDING'
}

export enum CommunicationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  IN_APP = 'IN_APP'
}

export enum SystemEvent {
  HIRE_REQUEST_SUBMITTED = 'HIRE_REQUEST_SUBMITTED',
  HIRE_REQUEST_ASSIGNED = 'HIRE_REQUEST_ASSIGNED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS'
}

export interface EmailTemplate {
  id: string;
  slug: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  lastUpdated: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface TriggerConfig {
  id: string;
  event: SystemEvent;
  clientEmailEnabled: boolean;
  professionalEmailEnabled: boolean;
  adminEmailEnabled: boolean;
  inAppEnabled: boolean;
  templateId: string;
  status: 'ON' | 'OFF';
}

export interface CommunicationLog {
  id: string;
  toEmail: string;
  recipientRole: UserRole;
  subject: string;
  templateSlug: string;
  status: CommunicationStatus;
  relatedEvent: SystemEvent;
  sentAt: string;
  retryCount: number;
  error?: string;
}
