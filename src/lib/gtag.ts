declare global {
  interface Window {
    dataLayer: IArguments[];
    gtag?: (...args: unknown[]) => void;
  }
}

const SCRIPT_ID = 'birdie-gtag';

export function getGaMeasurementId(stored?: string | null) {
  const fromSettings = (stored || '').trim();
  const fromEnv = (import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim();
  return fromSettings || fromEnv || null;
}

export function loadGtag(measurementId: string) {
  if (typeof window === 'undefined' || !measurementId) return;
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag() {
      // Official gtag signature uses the arguments object.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
  }
  window.gtag('config', measurementId, { send_page_view: false });
  if (document.getElementById(SCRIPT_ID)) return;
  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
}

export function trackPageview(path: string, measurementId: string) {
  window.gtag?.('event', 'page_view', {
    page_path: path,
    send_to: measurementId,
  });
}
