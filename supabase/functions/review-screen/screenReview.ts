// Server copy of the review word check. Edge functions cannot import from src/,
// so this list is duplicated in src/data/reviewGuidelines.ts for the live warning
// shown while a person types. This copy is the one that decides.
const BLOCKED =
  /\b(kill yourself|kys|nin|whatsapp me|call me on|fuck|fucking|shithead|bastard|bitch|whore|slut|nigger|nigga|retard|rape)\b|wa\.me\//i;
const PHONE_LIKE = /(?:\+?234|0)[789]\d{8,10}/;
const LONG_DIGIT_RUN = /\d{11,}/;

export function screenReviewComment(comment: string): string | null {
  const text = comment || '';
  if (BLOCKED.test(text)) return 'Possible abusive language';
  if (PHONE_LIKE.test(text) || LONG_DIGIT_RUN.test(text)) return 'Looks like private contact details';
  return null;
}
