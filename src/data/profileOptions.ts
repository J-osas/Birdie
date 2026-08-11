export const GENDER_OPTIONS = [
  { value: '', label: 'Prefer not to share' },
  { value: 'woman', label: 'Woman' },
  { value: 'man', label: 'Man' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

export const RATE_UNIT_OPTIONS = [
  { value: 'monthly', label: 'Per month', short: '/mo' },
  { value: 'daily', label: 'Per day', short: '/day' },
  { value: 'hourly', label: 'Per hour', short: '/hr' },
] as const;

export const WORK_TYPE_OPTIONS = [
  { value: '', label: 'Not specified' },
  { value: 'live_in', label: 'Live-in' },
  { value: 'live_out', label: 'Live-out' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'flexible', label: 'Flexible' },
] as const;

export const LANGUAGE_OPTIONS = [
  'English',
  'Yoruba',
  'Igbo',
  'Hausa',
  'Pidgin',
  'French',
  'Other',
] as const;

export const SKILL_OPTIONS = [
  'Cooking',
  'Cleaning',
  'Childcare',
  'Infant care',
  'Elderly care',
  'Laundry',
  'Driving',
  'Security',
  'Gardening',
  'First aid',
  'Pet care',
  'Shopping / errands',
] as const;

export function genderLabel(value?: string | null) {
  if (!value) return null;
  return GENDER_OPTIONS.find((o) => o.value === value)?.label || null;
}

export function workTypeLabel(value?: string | null) {
  if (!value) return null;
  return WORK_TYPE_OPTIONS.find((o) => o.value === value)?.label || null;
}

export function rateUnitShort(unit?: string | null) {
  return RATE_UNIT_OPTIONS.find((o) => o.value === (unit || 'monthly'))?.short || '/mo';
}

export function publicNeighborhood(profile: {
  city?: string;
  state?: string;
  location?: string;
}) {
  const parts = [profile.city, profile.state].filter(Boolean);
  if (parts.length) return parts.join(', ');
  return profile.location || 'Lagos';
}

export function osmEmbedUrl(lat: number, lng: number, delta = 0.025) {
  const minLng = lng - delta;
  const minLat = lat - delta;
  const maxLng = lng + delta;
  const maxLat = lat + delta;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${lat}%2C${lng}`;
}
