import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { IMAGES, mergeSiteImages, type SiteImages } from '@/data/images';
import { dataService } from '@/services/dataService';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

interface SiteMediaContextValue {
  images: SiteImages;
  refresh: () => Promise<void>;
}

const SiteMediaContext = createContext<SiteMediaContextValue | null>(null);

function applyFavicon(href: string) {
  const links = document.querySelectorAll<HTMLLinkElement>("link[rel='icon'], link[rel='apple-touch-icon']");
  links.forEach((link) => {
    if (link.getAttribute('href') !== href) link.setAttribute('href', href);
  });
}

export function SiteMediaProvider({ children }: { children: React.ReactNode }) {
  const [images, setImages] = useState<SiteImages>(IMAGES);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setImages(IMAGES);
      return;
    }
    try {
      const urls = await dataService.getMediaSlotUrls();
      const next = mergeSiteImages(urls);
      Object.assign(IMAGES, next);
      IMAGES.categories = { ...next.categories };
      setImages(next);
    } catch (err) {
      console.error('Site media load failed', err);
      setImages(IMAGES);
    }
  }, []);

  useEffect(() => {
    refresh();
    if (!isSupabaseConfigured) return;
    const channel = supabase
      .channel('media-slots')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'media_slots' }, () => {
        refresh();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  useEffect(() => {
    applyFavicon(images.favicon);
  }, [images.favicon]);

  const value = useMemo(() => ({ images, refresh }), [images, refresh]);

  return <SiteMediaContext.Provider value={value}>{children}</SiteMediaContext.Provider>;
}

export function useImages(): SiteImages {
  const ctx = useContext(SiteMediaContext);
  return ctx?.images ?? IMAGES;
}

export function useSiteMedia() {
  const ctx = useContext(SiteMediaContext);
  if (!ctx) throw new Error('useSiteMedia must be used within SiteMediaProvider');
  return ctx;
}
