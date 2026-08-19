import { CATEGORY_SLOTS, IMAGE_KEY_SLOTS, type SiteImages } from '@/data/images';

const SLOT_TO_KEY = Object.fromEntries(
  Object.entries(IMAGE_KEY_SLOTS).map(([key, slot]) => [slot, key])
) as Record<string, keyof Omit<SiteImages, 'categories'>>;

const SLOT_TO_CATEGORY = Object.fromEntries(
  Object.entries(CATEGORY_SLOTS).map(([name, slot]) => [slot, name])
);

export function resolveStudioImage(slot: string | undefined, images: SiteImages): string {
  if (!slot) return images.blogCover;
  if (slot.startsWith('/') || slot.startsWith('http')) return slot;
  const key = SLOT_TO_KEY[slot];
  if (key) return images[key];
  const cat = SLOT_TO_CATEGORY[slot];
  if (cat && images.categories[cat]) return images.categories[cat];
  return images.blogCover;
}
