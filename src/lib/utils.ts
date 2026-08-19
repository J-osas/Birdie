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

export function errorMessage(err: unknown, fallback: string) {
  if (err instanceof Error && err.message) return err.message;
  if (err && typeof err === 'object' && 'message' in err) {
    const message = String((err as { message?: unknown }).message || '').trim();
    if (message) return message;
  }
  if (typeof err === 'string' && err.trim()) return err.trim();
  return fallback;
}
