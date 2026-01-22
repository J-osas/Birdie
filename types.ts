
export enum UserRole {
  CLIENT = 'CLIENT',
  PROFESSIONAL = 'PROFESSIONAL',
  ADMIN = 'ADMIN',
  OPERATIONS = 'OPERATIONS'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED'
}

export enum ProfessionalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  VERIFIED = 'VERIFIED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  SUSPENDED = 'SUSPENDED'
}

export enum RequestStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ACTIVE = 'ACTIVE',
  DISPUTED = 'DISPUTED'
}

export enum Availability {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  UNAVAILABLE = 'UNAVAILABLE',
  ON_JOB = 'ON_JOB'
}

export type AvailabilityStatus = Availability;

export enum PaymentType {
  CONSULTATION = 'CONSULTATION',
  PLACEMENT = 'PLACEMENT',
  SERVICE_FEE = 'SERVICE_FEE'
}

export enum TransactionType {
  ESCROW_CREDIT = 'ESCROW_CREDIT',
  ESCROW_DEBIT = 'ESCROW_DEBIT',
  PENDING_CREDIT = 'PENDING_CREDIT',
  PENDING_DEBIT = 'PENDING_DEBIT',
  AVAILABLE_CREDIT = 'AVAILABLE_CREDIT',
  AVAILABLE_DEBIT = 'AVAILABLE_DEBIT',
  COMMISSION_DEBIT = 'COMMISSION_DEBIT',
  WITHDRAWAL_DEBIT = 'WITHDRAWAL_DEBIT',
  REFUND_DEBIT = 'REFUND_DEBIT'
}

export enum TransactionStatus {
  INITIATED = 'INITIATED',
  PAID = 'PAID',
  IN_ESCROW = 'IN_ESCROW',
  PENDING_RELEASE = 'PENDING_RELEASE',
  RELEASED = 'RELEASED',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum WithdrawalStatus {
  REQUESTED = 'REQUESTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  REJECTED = 'REJECTED'
}

export interface Wallet {
  id: string;
  professionalId: string;
  escrowBalance: number;    // Client paid, held by platform
  pendingEarnings: number;  // Job completed, waiting for release rule
  availableBalance: number; // Confirmed, withdrawable
  totalWithdrawn: number;   // Historical read-only
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

export interface ProfessionalProfile {
  id: string;
  userId: string;
  category: 'Security' | 'Nanny' | 'House Help' | 'Gardener' | 'Driver' | 'Chef';
  serviceCategory?: string;
  bio: string;
  location: string;
  // Added phone property to resolve type errors in views and onboarding flows
  phone?: string;
  availability: Availability;
  availabilityStatus?: Availability;
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
  };
  notes?: string;
  status: RequestStatus;
  amount: number;
  createdAt: string;
  updatedAt: string;
  clientName: string;
  professionalName?: string;
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
