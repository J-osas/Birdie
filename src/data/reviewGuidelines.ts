export const REVIEW_GUIDELINES = [
  'Talk about the work: were they on time, careful, and easy to talk to?',
  'No insults, no threats, and no private details like a phone number, address or NIN.',
  'One review for each job you finished through Birdie.',
  'You can be firm and honest. You cannot be abusive.',
];

const BLOCKED =
  /\b(kill yourself|kys|nin\b|whatsapp me|wa\.me\/|call me on|fuck|fucking|shithead|bastard|bitch|whore|slut|nigger|nigga|retard|rape)\b/i;
const PHONE_LIKE = /(?:\+?234|0)[789]\d{8,10}/;
const LONG_DIGIT_RUN = /\d{11,}/;

export function screenReviewComment(comment: string): string | null {
  const text = comment || '';
  if (BLOCKED.test(text)) return 'Possible abusive language';
  if (PHONE_LIKE.test(text) || LONG_DIGIT_RUN.test(text)) return 'Looks like private contact details';
  return null;
}
