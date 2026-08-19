/**
 * Bundled fallbacks for every site picture.
 * Live URLs come from the media_slots table (admin Gallery).
 */
export type SiteImages = {
  hero: string;
  process: string;
  provider: string;
  story: string;
  contact: string;
  blogCover: string;
  avatarFallback: string;
  homeHero: string;
  homeReach1: string;
  homeReach2: string;
  homeWhy: string;
  homeTestimonial: string;
  logoOnLight: string;
  logoOnDark: string;
  markBurgundy: string;
  markLight: string;
  favicon: string;
  categories: Record<string, string>;
};

export const IMAGES: SiteImages = {
  hero: '/images/hero.jpg',
  process: '/images/process.jpg',
  provider: '/images/provider.jpg',
  story: '/images/story.jpg',
  contact: '/images/contact.jpg',
  blogCover: '/images/blog-cover.jpg',
  avatarFallback: '/images/avatar-fallback.jpg',
  homeHero: '/images/home-hero.jpg',
  homeReach1: '/images/home-reach-1.jpg',
  homeReach2: '/images/home-reach-2.jpg',
  homeWhy: '/images/home-why.jpg',
  homeTestimonial: '/images/home-testimonial.jpg',
  logoOnLight: '/brand/logo-on-light.png',
  logoOnDark: '/brand/logo-on-dark.png',
  markBurgundy: '/brand/mark-burgundy.png',
  markLight: '/brand/mark-light.png',
  favicon: '/favicon.png',
  categories: {
    Security: '/images/category-security.jpg',
    Nanny: '/images/category-nanny.jpg',
    'House Help': '/images/category-house-help.jpg',
    Gardener: '/images/category-gardener.jpg',
    Driver: '/images/category-driver.jpg',
    Chef: '/images/category-chef.jpg',
  },
};

export const IMAGE_KEY_SLOTS = {
  hero: 'hero',
  process: 'process',
  provider: 'provider',
  story: 'story',
  contact: 'contact',
  blogCover: 'blog_cover',
  avatarFallback: 'avatar_fallback',
  homeHero: 'home_hero',
  homeReach1: 'home_reach_1',
  homeReach2: 'home_reach_2',
  homeWhy: 'home_why',
  homeTestimonial: 'home_testimonial',
  logoOnLight: 'logo_on_light',
  logoOnDark: 'logo_on_dark',
  markBurgundy: 'mark_burgundy',
  markLight: 'mark_light',
  favicon: 'favicon',
} as const;

export const CATEGORY_SLOTS: Record<string, string> = {
  Security: 'category_security',
  Nanny: 'category_nanny',
  'House Help': 'category_house_help',
  Gardener: 'category_gardener',
  Driver: 'category_driver',
  Chef: 'category_chef',
};

export function mergeSiteImages(urls: Record<string, string>): SiteImages {
  const pick = (key: keyof typeof IMAGE_KEY_SLOTS) => urls[IMAGE_KEY_SLOTS[key]] || IMAGES[key];
  return {
    hero: pick('hero'),
    process: pick('process'),
    provider: pick('provider'),
    story: pick('story'),
    contact: pick('contact'),
    blogCover: pick('blogCover'),
    avatarFallback: pick('avatarFallback'),
    homeHero: pick('homeHero'),
    homeReach1: pick('homeReach1'),
    homeReach2: pick('homeReach2'),
    homeWhy: pick('homeWhy'),
    homeTestimonial: pick('homeTestimonial'),
    logoOnLight: pick('logoOnLight'),
    logoOnDark: pick('logoOnDark'),
    markBurgundy: pick('markBurgundy'),
    markLight: pick('markLight'),
    favicon: pick('favicon'),
    categories: Object.fromEntries(
      Object.entries(CATEGORY_SLOTS).map(([name, slot]) => [name, urls[slot] || IMAGES.categories[name]])
    ),
  };
}

export function categoryImage(name: string, images: SiteImages = IMAGES) {
  return images.categories[name] || images.blogCover;
}
