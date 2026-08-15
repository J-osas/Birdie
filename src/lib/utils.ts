export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function formatNaira(amount: number) {
  return `₦${Number(amount || 0).toLocaleString('en-NG')}`;
}

export function safeNextPath(raw: string | null | undefined, fallback = '/app') {
  if (!raw) return fallback;
  let value = raw.trim();
  try {
    value = decodeURIComponent(value);
  } catch {
    /* keep raw */
  }
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
  return value;
}

export function splitName(fullName: string) {
  const parts = (fullName || '').trim().split(/\s+/);
  return {
    firstName: parts[0] || 'User',
    lastName: parts.slice(1).join(' ') || '',
  };
}
