import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { dataService } from '@/services/dataService';
import { parseLayout, type PageLayoutDoc } from './schema';
import { defaultLayoutFor } from './defaults';

type StudioContextValue = {
  slug: string | null;
  editing: boolean;
  selectedId: string | null;
  draft: PageLayoutDoc;
  published: PageLayoutDoc | null;
  dirty: boolean;
  saving: boolean;
  error: string | null;
  attach: (slug: string) => Promise<void>;
  detach: () => void;
  setEditing: (v: boolean) => void;
  setSelectedId: (id: string | null) => void;
  setDraft: (doc: PageLayoutDoc) => void;
  saveDraft: (userId?: string) => Promise<void>;
  publish: (userId?: string) => Promise<void>;
  reset: (userId?: string) => Promise<void>;
  hydrateFromDefault: () => void;
};

const StudioContext = createContext<StudioContextValue | null>(null);

export function StudioProvider({ children }: { children: React.ReactNode }) {
  const [slug, setSlug] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraftState] = useState<PageLayoutDoc>({ blocks: [] });
  const [published, setPublished] = useState<PageLayoutDoc | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const attach = useCallback(async (nextSlug: string) => {
    setSlug(nextSlug);
    setEditing(false);
    setSelectedId(null);
    setDirty(false);
    setError(null);
    try {
      const live = await dataService.getPublishedLayout(nextSlug);
      const publishedDoc = live ? parseLayout(live) : null;
      setPublished(publishedDoc && publishedDoc.blocks.length ? publishedDoc : null);
      try {
        const row = await dataService.getPageLayoutRow(nextSlug);
        const draftDoc = parseLayout(row?.draft);
        setDraftState(draftDoc.blocks.length ? draftDoc : defaultLayoutFor(nextSlug));
      } catch {
        setDraftState(publishedDoc && publishedDoc.blocks.length ? publishedDoc : defaultLayoutFor(nextSlug));
      }
    } catch {
      setPublished(null);
      setDraftState(defaultLayoutFor(nextSlug));
    }
  }, []);

  const setDraft = useCallback((doc: PageLayoutDoc) => {
    setDraftState(doc);
    setDirty(true);
  }, []);

  const detach = useCallback(() => {
    setSlug(null);
    setEditing(false);
    setSelectedId(null);
    setDirty(false);
    setError(null);
  }, []);

  const hydrateFromDefault = useCallback(() => {
    if (!slug) return;
    setDraftState(defaultLayoutFor(slug));
    setDirty(true);
  }, [slug]);

  const saveDraft = useCallback(
    async (userId?: string) => {
      if (!slug) return;
      setSaving(true);
      setError(null);
      try {
        await dataService.savePageDraft(slug, draft, userId);
        setDirty(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not save draft.');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [slug, draft]
  );

  const publish = useCallback(
    async (userId?: string) => {
      if (!slug) return;
      setSaving(true);
      setError(null);
      try {
        await dataService.publishPageLayout(slug, draft, userId);
        setPublished(draft);
        setDirty(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not publish.');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [slug, draft]
  );

  const reset = useCallback(
    async (userId?: string) => {
      if (!slug) return;
      const next = defaultLayoutFor(slug);
      setSaving(true);
      setError(null);
      try {
        await dataService.resetPageLayout(slug, next, userId);
        setDraftState(next);
        setPublished(null);
        setDirty(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not reset.');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [slug]
  );

  const value = useMemo(
    () => ({
      slug,
      editing,
      selectedId,
      draft,
      published,
      dirty,
      saving,
      error,
      attach,
      detach,
      setEditing,
      setSelectedId,
      setDraft,
      saveDraft,
      publish,
      reset,
      hydrateFromDefault,
    }),
    [
      slug,
      editing,
      selectedId,
      draft,
      published,
      dirty,
      saving,
      error,
      attach,
      detach,
      setDraft,
      saveDraft,
      publish,
      reset,
      hydrateFromDefault,
    ]
  );

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error('useStudio must be used within StudioProvider');
  return ctx;
}

export function useStudioOptional() {
  return useContext(StudioContext);
}
