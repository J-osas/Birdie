# Birdie public image brief

Custom generated images live in `public/images/`. Paths are centralized in [`src/data/images.ts`](../src/data/images.ts).

## Filename map

| File | Used on |
|------|---------|
| `hero.jpg` | Homepage hero background |
| `category-security.jpg` | Security category card / pro fallback |
| `category-nanny.jpg` | Nanny category card / pro fallback |
| `category-house-help.jpg` | House Help category card / pro fallback |
| `category-gardener.jpg` | Gardener category card / pro fallback |
| `category-driver.jpg` | Driver category card / pro fallback |
| `category-chef.jpg` | Chef category card / pro fallback |
| `process.jpg` | Homepage “How it works” visual |
| `provider.jpg` | Homepage provider section |
| `story.jpg` | Our Story + About hero |
| `contact.jpg` | Contact page accent |
| `blog-cover.jpg` | Blog card / article fallback |
| `avatar-fallback.jpg` | Neutral avatar fallback |

## How to replace an image

**Option A — same filename (easiest)**

1. Export your photo as JPG (or convert to JPG).
2. Overwrite the matching file in `public/images/` (e.g. replace `hero.jpg`).
3. Hard-refresh the browser: `Ctrl+Shift+R` (no rebuild needed while `npm run dev` is running).

**Option B — new filename**

1. Add e.g. `public/images/my-hero.jpg`.
2. Open `src/data/images.ts` and change:

```ts
hero: '/images/my-hero.jpg',
```

3. Save and hard-refresh.

## Photo tips

- Lagos / West African domestic staffing context
- Natural light, respectful portrayal
- Warm cream + burgundy-friendly tones
- No text or logos burned into the image
- Hero: wide 16:9, at least ~1600px wide
- Category cards: ~4:3, clear subject
