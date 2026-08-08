export const COLORS = {
  background: '#f8fafb',
  card: '#ffffff',
  primary: '#660033',
  accent: '#660033',
  text: '#0a0a0a',
  textMuted: '#615a5c',
  success: '#059669',
  warning: '#f59e0b',
  danger: '#dc2626',
} as const;

export const CATEGORIES = [
  'Security',
  'Nanny',
  'House Help',
  'Gardener',
  'Driver',
  'Chef',
] as const;

export const NIGERIA_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara',
] as const;

export const PROOF_OF_ADDRESS_TYPES = [
  { value: 'utility_bill', label: 'Utility bill' },
  { value: 'tenancy_letter', label: 'Tenancy letter' },
  { value: 'official_letter', label: 'Official letter' },
] as const;

export const LAGOS_LOCATIONS = [
  'Agege',
  'Ajegunle',
  'Akodo',
  'Apapa',
  'Badagry',
  'Egbeda',
  'Ebute Ikorodu',
  'Ebute-Metta',
  'Ejirin',
  'Epe',
  'Festac Town',
  'Ifako',
  'Ikeja',
  'Ikorodu',
  'Ikotun',
  'Ikoyi',
  'Ipaja',
  'Iyana Ipaja',
  'Lagos',
  'Makoko',
  'Mushin',
  'Ojota',
  'Oshodi',
  'Somolu',
  'Surulere',
  'Victoria Garden City',
  'Victoria Island',
  'Yaba',
] as const;

export const DEFAULT_CONSULTATION_FEE = 10000;

export function getStatusStyle(status: string) {
  switch (status) {
    case 'pending':
    case 'awaiting_consultation_pay':
    case 'awaiting_escrow':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'active':
    case 'funded':
    case 'consultation_paid':
    case 'accepted':
      return 'bg-[#660033]/5 text-[#660033] border-[#660033]/20';
    case 'completed':
    case 'settled':
    case 'verified':
    case 'success':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'cancelled':
    case 'rejected':
    case 'disputed':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}
