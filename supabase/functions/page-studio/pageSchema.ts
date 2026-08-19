import { z } from 'https://esm.sh/zod@3.23.8';

export const CTA_HREFS = [
  '/hire',
  '/professionals',
  '/register?role=professional',
  '/contact',
  '/story',
  '/about',
  '/blog',
  '/login',
] as const;

export type CtaHref = (typeof CTA_HREFS)[number];

const href = z.enum(CTA_HREFS);
const id = z.string().min(1).max(64);
const short = z.string().max(120);
const mid = z.string().max(400);
const long = z.string().max(2000);
const slot = z.string().max(80);

const card = z.object({
  title: short,
  body: mid,
});

const step = z.object({
  n: z.string().max(8),
  t: short,
  d: mid,
});

const quote = z.object({
  name: short,
  role: short,
  quote: long,
  imageSlot: slot.optional(),
});

const faq = z.object({
  q: mid,
  a: long,
});

const pill = z.object({
  label: short,
});

export const heroBlock = z.object({
  id,
  type: z.literal('hero'),
  hidden: z.boolean().optional(),
  eyebrow: short.optional(),
  title: mid,
  subtitle: long.optional(),
  ctaLabel: short,
  ctaTo: href,
  secondaryLabel: short.optional(),
  imageSlot: slot.optional(),
  proofLabel: mid.optional(),
});

export const reachBlock = z.object({
  id,
  type: z.literal('reach'),
  hidden: z.boolean().optional(),
  title: mid,
  subtitle: mid.optional(),
  imageSlotLeft: slot.optional(),
  imageSlotRight: slot.optional(),
});

export const splitPhotoTextBlock = z.object({
  id,
  type: z.literal('splitPhotoText'),
  hidden: z.boolean().optional(),
  imageSlot: slot.optional(),
  imageSide: z.enum(['left', 'right']).optional(),
  eyebrow: short.optional(),
  title: mid,
  subtitle: long.optional(),
  caption: mid.optional(),
  ctaLabel: short.optional(),
  ctaTo: href.optional(),
  cards: z.array(card).max(6).optional(),
  pills: z.array(pill).max(8).optional(),
});

export const meetProsBlock = z.object({
  id,
  type: z.literal('meetPros'),
  hidden: z.boolean().optional(),
  eyebrow: short.optional(),
  title: mid,
  subtitle: long.optional(),
});

export const stepsBlock = z.object({
  id,
  type: z.literal('steps'),
  hidden: z.boolean().optional(),
  eyebrow: short.optional(),
  title: mid,
  subtitle: long.optional(),
  imageSlot: slot.optional(),
  items: z.array(step).min(1).max(8),
});

export const quotesBlock = z.object({
  id,
  type: z.literal('quotes'),
  hidden: z.boolean().optional(),
  eyebrow: short.optional(),
  title: mid,
  subtitle: long.optional(),
  items: z.array(quote).min(1).max(6),
});

export const ctaBandBlock = z.object({
  id,
  type: z.literal('ctaBand'),
  hidden: z.boolean().optional(),
  dark: z.boolean().optional(),
  eyebrow: short.optional(),
  title: mid,
  subtitle: long.optional(),
  ctaLabel: short,
  ctaTo: href,
  secondaryLabel: short.optional(),
  secondaryTo: href.optional(),
  imageSlot: slot.optional(),
});

export const faqBlock = z.object({
  id,
  type: z.literal('faq'),
  hidden: z.boolean().optional(),
  eyebrow: short.optional(),
  title: mid,
  subtitle: long.optional(),
  items: z.array(faq).min(1).max(12),
});

export const blogTeaserBlock = z.object({
  id,
  type: z.literal('blogTeaser'),
  hidden: z.boolean().optional(),
  eyebrow: short.optional(),
  title: mid,
  subtitle: long.optional(),
});

export const storyTeaserBlock = z.object({
  id,
  type: z.literal('storyTeaser'),
  hidden: z.boolean().optional(),
  eyebrow: short.optional(),
  title: mid,
  body: long.optional(),
  ctaLabel: short.optional(),
  ctaTo: href.optional(),
  imageSlot: slot.optional(),
});

export const pageBlockSchema = z.discriminatedUnion('type', [
  heroBlock,
  reachBlock,
  splitPhotoTextBlock,
  meetProsBlock,
  stepsBlock,
  quotesBlock,
  ctaBandBlock,
  faqBlock,
  blogTeaserBlock,
  storyTeaserBlock,
]);

export const pageLayoutSchema = z.object({
  blocks: z.array(pageBlockSchema).max(40),
});

export type PageBlock = z.infer<typeof pageBlockSchema>;
export type PageLayoutDoc = z.infer<typeof pageLayoutSchema>;
export type BlockType = PageBlock['type'];

export const BLOCK_TYPES = [
  'hero',
  'reach',
  'splitPhotoText',
  'meetPros',
  'steps',
  'quotes',
  'ctaBand',
  'faq',
  'blogTeaser',
  'storyTeaser',
] as const;

export function isBlockType(value: string): value is BlockType {
  return (BLOCK_TYPES as readonly string[]).includes(value);
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  hero: 'Hero',
  reach: 'Reach-out strip',
  splitPhotoText: 'Photo and text',
  meetPros: 'Meet professionals',
  steps: 'How it works',
  quotes: 'Quotes',
  ctaBand: 'Closing call',
  faq: 'Questions',
  blogTeaser: 'Reading',
  storyTeaser: 'Story teaser',
};

export const CORE_SLUGS = ['home', 'about', 'story', 'contact'] as const;
export type CoreSlug = (typeof CORE_SLUGS)[number];

export function isCoreSlug(slug: string): slug is CoreSlug {
  return (CORE_SLUGS as readonly string[]).includes(slug);
}

export function isExtraSlug(slug: string) {
  return /^[a-z0-9][a-z0-9-]{1,48}$/.test(slug) && !isCoreSlug(slug);
}

export function parseLayout(raw: unknown): PageLayoutDoc {
  const parsed = pageLayoutSchema.safeParse(raw);
  if (!parsed.success) return { blocks: [] };
  return parsed.data;
}

export function parseLayoutOrThrow(raw: unknown): PageLayoutDoc {
  const parsed = pageLayoutSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .slice(0, 8)
      .map((issue) => `${issue.path.join('.') || 'layout'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Layout is not valid: ${msg}`);
  }
  return parsed.data;
}

export function newBlockId() {
  return `b_${Math.random().toString(36).slice(2, 10)}`;
}

export function emptyBlock(type: BlockType): PageBlock {
  const id = newBlockId();
  switch (type) {
    case 'hero':
      return {
        id,
        type,
        eyebrow: 'Lagos home help',
        title: 'Good help you can trust.',
        subtitle: 'We check every person before you meet them.',
        ctaLabel: 'Find someone to help',
        ctaTo: '/hire',
        imageSlot: 'home_hero',
      };
    case 'reach':
      return {
        id,
        type,
        title: 'Have a concern? We are a message away.',
        subtitle: 'Reach out now — a real person at Birdie will reply.',
        imageSlotLeft: 'home_reach_1',
        imageSlotRight: 'home_reach_2',
      };
    case 'splitPhotoText':
      return {
        id,
        type,
        imageSlot: 'home_why',
        imageSide: 'left',
        eyebrow: 'Why families stay',
        title: 'You deserve help that does not fall apart',
        subtitle: 'We check the person, agree the work, and hold your money until the job is done.',
        ctaLabel: 'Get started',
        ctaTo: '/hire',
      };
    case 'meetPros':
      return {
        id,
        type,
        eyebrow: 'Our people',
        title: 'Meet the professionals',
        subtitle: 'Checked nannies, drivers, house help and more — ready for Lagos homes.',
      };
    case 'steps':
      return {
        id,
        type,
        eyebrow: 'How it works',
        title: 'Four simple steps',
        subtitle: 'Look, talk, pay, and get to work.',
        imageSlot: 'process',
        items: [
          { n: '01', t: 'Look at the people', d: 'Every person here has been checked by Birdie.' },
          { n: '02', t: 'Talk to us', d: 'We set up a call and agree the work and the price.' },
          { n: '03', t: 'Pay your bill', d: 'You pay Birdie. We hold the money, not the professional.' },
          { n: '04', t: 'Work starts', d: 'When the job is done, we pay the professional.' },
        ],
      };
    case 'quotes':
      return {
        id,
        type,
        eyebrow: 'Families',
        title: 'What it feels like when the system works',
        items: [
          {
            name: 'A family in Lagos',
            role: 'Family',
            quote: 'Clear prices and people we could trust.',
            imageSlot: 'home_testimonial',
          },
        ],
      };
    case 'ctaBand':
      return {
        id,
        type,
        dark: true,
        eyebrow: 'Ready when you are',
        title: 'Ready to get help at home?',
        subtitle: 'Clear prices, people we have checked, and your money held safely until the work is done.',
        ctaLabel: 'Find someone to help',
        ctaTo: '/hire',
        secondaryLabel: 'Talk to us',
        secondaryTo: '/contact',
        imageSlot: 'home_hero',
      };
    case 'faq':
      return {
        id,
        type,
        eyebrow: 'Questions',
        title: 'A few things people ask',
        items: [{ q: 'How does Birdie check people?', a: 'ID, references, and a skills test. A person at Birdie reads the file.' }],
      };
    case 'blogTeaser':
      return {
        id,
        type,
        eyebrow: 'Reading',
        title: 'Helpful things to read',
        subtitle: 'Short guides on hiring, staying safe, and running a home well.',
      };
    case 'storyTeaser':
      return {
        id,
        type,
        eyebrow: 'Our story',
        title: 'Birdie was born from a lifetime of living in a home that never stopped moving.',
        body: 'We have seen how hard this is for families and for the people who work in their homes.',
        ctaLabel: 'Read our story',
        ctaTo: '/story',
        imageSlot: 'story',
      };
  }
  throw new Error(`Unknown block type: ${type}`);
}
