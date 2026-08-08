/**
 * Central image map for public marketing pages.
 * To replace an asset: overwrite the file in /public/images/ with the same name,
 * or change the path here and hard-refresh (Ctrl+Shift+R).
 */
export const IMAGES = {
  hero: '/images/hero.jpg',
  process: '/images/process.jpg',
  provider: '/images/provider.jpg',
  story: '/images/story.jpg',
  contact: '/images/contact.jpg',
  blogCover: '/images/blog-cover.jpg',
  avatarFallback: '/images/avatar-fallback.jpg',
  categories: {
    Security: '/images/category-security.jpg',
    Nanny: '/images/category-nanny.jpg',
    'House Help': '/images/category-house-help.jpg',
    Gardener: '/images/category-gardener.jpg',
    Driver: '/images/category-driver.jpg',
    Chef: '/images/category-chef.jpg',
  } as Record<string, string>,
} as const;

export function categoryImage(name: string) {
  return IMAGES.categories[name] || IMAGES.blogCover;
}
