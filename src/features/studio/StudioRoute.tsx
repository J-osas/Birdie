import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { categoryImage } from '@/data/images';
import { HOME_PLACEHOLDER_PROS } from '@/data/homePlaceholders';
import { dataService } from '@/services/dataService';
import { BlogPost, ProfessionalProfile, ProfessionalStatus } from '@/types';
import { useAuth } from '@/app/AuthProvider';
import { UserRole } from '@/types';
import { useImages } from '@/app/SiteMediaProvider';
import { PageCanvas, type CanvasPro } from './PageCanvas';
import { useStudio } from './StudioProvider';

function toPro(p: ProfessionalProfile, images: ReturnType<typeof useImages>): CanvasPro {
  return {
    id: p.id,
    fullName: p.fullName || 'A Birdie professional',
    category: p.category,
    location: p.location || 'Lagos',
    photo: p.avatarUrl || categoryImage(p.category, images) || images.avatarFallback,
    live: true,
  };
}

export function StudioRoute({ slug, fallback }: { slug: string; fallback: ReactNode }) {
  const { settings, user } = useAuth();
  const images = useImages();
  const studio = useStudio();
  const isStaff = user?.role === UserRole.ADMIN || user?.role === UserRole.OPERATIONS;
  const studioOn = settings?.page_studio_enabled === true;
  const [pros, setPros] = useState<CanvasPro[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    dataService.getBlogPosts().then(setPosts).catch(() => setPosts([]));
    dataService
      .getPublicProfessionals()
      .then((list) => {
        const verified = list.filter(
          (p) => p.status === ProfessionalStatus.VERIFIED || p.status === ProfessionalStatus.APPROVED
        );
        const pick = (verified.length ? verified : list).slice(0, 4).map((p) => toPro(p, images));
        const filled = [...pick];
        let i = 0;
        while (filled.length < 4 && i < HOME_PLACEHOLDER_PROS.length) {
          const ph = HOME_PLACEHOLDER_PROS[i];
          filled.push({
            id: ph.id,
            fullName: ph.fullName,
            category: ph.category,
            location: ph.location,
            photo: images[ph.photoKey],
            live: false,
          });
          i += 1;
        }
        setPros(filled);
      })
      .catch(() => {
        setPros(
          HOME_PLACEHOLDER_PROS.map((ph) => ({
            id: ph.id,
            fullName: ph.fullName,
            category: ph.category,
            location: ph.location,
            photo: images[ph.photoKey],
            live: false,
          }))
        );
      });
  }, [images]);

  const editing = studioOn && isStaff && studio.editing;
  const live = studio.published && studio.published.blocks.length > 0 ? studio.published : null;
  const useCanvas = editing || Boolean(studioOn && live);

  if (!useCanvas) return <>{fallback}</>;

  const layout = editing ? studio.draft : live!;
  const moveBlock = (fromId: string, toId: string) => {
    const blocks = [...studio.draft.blocks];
    const from = blocks.findIndex((b) => b.id === fromId);
    const to = blocks.findIndex((b) => b.id === toId);
    if (from < 0 || to < 0 || from === to) return;
    const [item] = blocks.splice(from, 1);
    blocks.splice(to, 0, item);
    studio.setDraft({ blocks });
  };
  return (
    <PageCanvas
      layout={layout}
      editing={editing}
      selectedId={studio.selectedId}
      onSelect={studio.setSelectedId}
      onMove={moveBlock}
      pros={pros}
      posts={posts}
    />
  );
}
