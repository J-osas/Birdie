import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getGaMeasurementId, loadGtag, trackPageview } from '@/lib/gtag';

export default function GaTracker({ storedId }: { storedId?: string | null }) {
  const location = useLocation();
  const id = getGaMeasurementId(storedId);

  useEffect(() => {
    if (id) loadGtag(id);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    trackPageview(`${location.pathname}${location.search}`, id);
  }, [id, location.pathname, location.search]);

  return null;
}
