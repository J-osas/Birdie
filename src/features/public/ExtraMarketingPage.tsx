import { useParams } from 'react-router-dom';
import { StudioRoute } from '@/features/studio/StudioRoute';
import { isExtraSlug } from '@/features/studio/schema';

export default function ExtraMarketingPage() {
  const { slug = '' } = useParams();
  if (!isExtraSlug(slug)) {
    return (
      <div className="w-full px-6 md:w-[90vw] md:mx-auto py-24">
        <p className="text-[#615A5C] font-medium">That page is not here.</p>
      </div>
    );
  }
  return (
    <StudioRoute
      slug={slug}
      fallback={
        <div className="w-full px-6 md:w-[90vw] md:mx-auto py-24 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033]">Page</p>
          <h1 className="text-3xl font-bold text-[#0A0A0A]">Nothing published yet</h1>
          <p className="text-[#615A5C] font-medium max-w-xl">
            Staff can build this page in Page studio, then press Publish.
          </p>
        </div>
      }
    />
  );
}
