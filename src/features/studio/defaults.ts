import { PAYMENT_FAQS } from '@/data/paymentCopy';
import { HOME_PROOF, HOME_TESTIMONIALS } from '@/data/homePlaceholders';
import type { PageLayoutDoc } from './schema';

export const HOME_DEFAULT: PageLayoutDoc = {
  blocks: [
    {
      id: 'home_hero',
      type: 'hero',
      eyebrow: 'Lagos home help',
      title: 'Good help you can trust, for your home in Lagos.',
      subtitle:
        'Drivers, nannies, house help, chefs, gardeners and security. We check every person before you meet them, and we hold your money safely until the job is done.',
      ctaLabel: 'Find someone to help',
      ctaTo: '/hire',
      secondaryLabel: 'I am looking for work',
      imageSlot: 'home_hero',
      proofLabel: `${HOME_PROOF.families} ${HOME_PROOF.familiesLabel}`,
    },
    {
      id: 'home_reach',
      type: 'reach',
      title: 'Have a concern? We are a message away.',
      subtitle: 'Reach out now — a real person at Birdie will reply.',
      imageSlotLeft: 'home_reach_1',
      imageSlotRight: 'home_reach_2',
    },
    {
      id: 'home_why',
      type: 'splitPhotoText',
      imageSlot: 'home_why',
      imageSide: 'left',
      eyebrow: 'Why families stay',
      title: 'You deserve help that does not fall apart',
      subtitle: 'We check the person, agree the work, and hold your money until the job is done. You are not left guessing.',
      caption: 'Dignity sits at the centre of every connection.',
      ctaLabel: 'Get started',
      ctaTo: '/hire',
      cards: [
        {
          title: 'We check IDs, references and skill',
          body: 'A person at Birdie reads the file before anyone gets a Verified badge.',
        },
        {
          title: 'We hold your money until the work is done',
          body: 'You pay Birdie. The professional is paid when the job is complete.',
        },
        {
          title: 'We treat the worker with respect too',
          body: 'Fair pay, a clear agreement, and someone to call if anything goes wrong.',
        },
      ],
    },
    {
      id: 'home_pros',
      type: 'meetPros',
      eyebrow: 'Our people',
      title: 'Meet the professionals',
      subtitle: 'Checked nannies, drivers, house help and more — ready for Lagos homes.',
    },
    {
      id: 'home_steps',
      type: 'steps',
      eyebrow: 'How it works',
      title: 'Four simple steps',
      subtitle: 'Look, talk, pay, and get to work. Birdie stays with you the whole way.',
      imageSlot: 'process',
      items: [
        {
          n: '01',
          t: 'Look at the people',
          d: 'Every person here has sent us their ID, given us references, and passed a short test for their job.',
        },
        {
          n: '02',
          t: 'Pay a small meeting fee and talk to us',
          d: 'We set up a call, learn what your home needs, and agree the right person, the hours and the price.',
        },
        {
          n: '03',
          t: 'Pay your bill',
          d: 'We send you one clear bill. You pay it with your card and Birdie holds the money, not the professional.',
        },
        {
          n: '04',
          t: 'Work starts, then we pay',
          d: 'When the job is done and you are happy, we pay the professional. If the work never happens, you get your money back.',
        },
      ],
    },
    {
      id: 'home_quotes',
      type: 'quotes',
      eyebrow: 'Families',
      title: 'What it feels like when the system works',
      subtitle: 'These quotes are placeholders until we publish real family stories. The layout is ready.',
      items: HOME_TESTIMONIALS.map((t) => ({
        name: t.name,
        role: t.role,
        quote: t.quote,
        imageSlot:
          t.photoKey === 'homeTestimonial'
            ? 'home_testimonial'
            : t.photoKey === 'homeReach2'
              ? 'home_reach_2'
              : 'home_testimonial',
      })),
    },
    {
      id: 'home_workers',
      type: 'splitPhotoText',
      imageSlot: 'provider',
      imageSide: 'left',
      eyebrow: 'If you are looking for work',
      title: 'Work with respect and get paid on time',
      subtitle:
        'We agree your pay before you start, we hold the money so it cannot disappear, and we are here if anything goes wrong.',
      ctaLabel: 'Sign up for work',
      ctaTo: '/register?role=professional',
      pills: [
        { label: 'Treated well' },
        { label: 'Learn and grow' },
        { label: 'Safe and supported' },
        { label: 'You know your pay' },
      ],
    },
    {
      id: 'home_story',
      type: 'storyTeaser',
      eyebrow: 'Our story',
      title: 'Birdie was born from a lifetime of living in a home that never stopped moving.',
      body: 'We have seen how hard this is for families and for the people who work in their homes. Birdie is our way of making it fair for both sides.',
      ctaLabel: 'Read our story',
      ctaTo: '/story',
      imageSlot: 'story',
    },
    {
      id: 'home_blog',
      type: 'blogTeaser',
      eyebrow: 'Reading',
      title: 'Helpful things to read',
      subtitle: 'Short guides on hiring, staying safe, and running a home well.',
    },
    {
      id: 'home_faq',
      type: 'faq',
      eyebrow: 'Questions',
      title: 'A few things people ask',
      subtitle: 'Straight answers about how we check people, and how we keep your money safe.',
      items: [
        {
          q: 'How does Birdie check the people on this site?',
          a: 'Everyone sends us their ID, gives us people who can speak for them, and takes a short test for the job they want to do. A person at Birdie reads the whole file before we give anyone a Verified badge. If someone is still being checked, you will see that on their profile.',
        },
        PAYMENT_FAQS[3],
        {
          q: 'Can I start without picking one person?',
          a: 'Yes. Press "Find someone to help", choose the kind of help you need, and look through the people we have. You can also tell us what you need and we will match you.',
        },
      ],
    },
    {
      id: 'home_cta',
      type: 'ctaBand',
      dark: true,
      eyebrow: 'Ready when you are',
      title: 'Ready to get help at home?',
      subtitle: 'Clear prices, people we have checked, and your money held safely until the work is done.',
      ctaLabel: 'Find someone to help',
      ctaTo: '/hire',
      secondaryLabel: 'Talk to us',
      secondaryTo: '/contact',
      imageSlot: 'home_hero',
    },
  ],
};

export const ABOUT_DEFAULT: PageLayoutDoc = {
  blocks: [
    {
      id: 'about_hero',
      type: 'splitPhotoText',
      imageSlot: 'home_why',
      imageSide: 'right',
      eyebrow: 'About Birdie',
      title: 'Home help done properly',
      subtitle:
        'Birdie makes it safe and simple to bring someone into your home. We check every person, we agree the price up front, and we treat the people who work in your home with respect.',
      ctaLabel: 'Find someone to help',
      ctaTo: '/hire',
    },
    {
      id: 'about_cta',
      type: 'ctaBand',
      dark: false,
      eyebrow: 'Get started',
      title: 'Ready when you are',
      subtitle: 'Look through people we have checked, or tell us what you need.',
      ctaLabel: 'Find someone to help',
      ctaTo: '/hire',
      secondaryLabel: 'Talk to us',
      secondaryTo: '/contact',
      imageSlot: 'story',
    },
  ],
};

export const STORY_DEFAULT: PageLayoutDoc = {
  blocks: [
    {
      id: 'story_hero',
      type: 'storyTeaser',
      eyebrow: 'Our story',
      title: 'Birdie was born from a lifetime of living in a home that never stopped moving.',
      body: 'We have seen how hard this is for families and for the people who work in their homes. Birdie is our way of making it fair for both sides.',
      imageSlot: 'story',
    },
    {
      id: 'story_cta',
      type: 'ctaBand',
      dark: true,
      eyebrow: 'Join us',
      title: 'Come and see how we work',
      subtitle: 'Find help for your home, or join as a professional.',
      ctaLabel: 'Find someone to help',
      ctaTo: '/hire',
      secondaryLabel: 'I am looking for work',
      secondaryTo: '/register?role=professional',
      imageSlot: 'home_hero',
    },
  ],
};

export const CONTACT_DEFAULT: PageLayoutDoc = {
  blocks: [
    {
      id: 'contact_intro',
      type: 'splitPhotoText',
      imageSlot: 'contact',
      imageSide: 'right',
      eyebrow: 'Contact',
      title: 'A real person will reply',
      subtitle: 'Questions about hiring, work, or the site — write to us. The form on this page stays in the code so it keeps working.',
      ctaLabel: 'Talk to us',
      ctaTo: '/contact',
    },
    {
      id: 'contact_faq',
      type: 'faq',
      eyebrow: 'Questions',
      title: 'Before you write',
      items: [
        {
          q: 'What does Birdie do?',
          a: 'We help Lagos homes find good help. We check each person, agree the job and the price, and hold your money until the work is done.',
        },
      ],
    },
  ],
};

export function defaultLayoutFor(slug: string): PageLayoutDoc {
  if (slug === 'home') return structuredClone(HOME_DEFAULT);
  if (slug === 'about') return structuredClone(ABOUT_DEFAULT);
  if (slug === 'story') return structuredClone(STORY_DEFAULT);
  if (slug === 'contact') return structuredClone(CONTACT_DEFAULT);
  return { blocks: [] };
}
