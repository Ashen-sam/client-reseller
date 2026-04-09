import { useEffect } from 'react';

function siteUrl(): string {
  const env = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim();
  if (env) return env.replace(/\/+$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return 'https://reseller.example.com';
}

function upsertMeta(selector: string, attrs: Record<string, string>): void {
  const head = document.head;
  if (!head) return;
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
}

export function useSeo(input: {
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;
}): void {
  const { title, description, path = '', noindex = false } = input;

  useEffect(() => {
    const fullTitle = `${title} | Reseller`;
    const url = `${siteUrl()}${path.startsWith('/') ? path : `/${path}`}`;

    document.title = fullTitle;

    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: noindex ? 'noindex, nofollow' : 'index, follow',
    });

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }, [title, description, path, noindex]);
}

export function setJsonLd(id: string, payload: Record<string, unknown> | null): void {
  const existing = document.getElementById(id);
  if (!payload) {
    existing?.remove();
    return;
  }

  const script =
    existing instanceof HTMLScriptElement
      ? existing
      : (() => {
          const next = document.createElement('script');
          next.type = 'application/ld+json';
          next.id = id;
          document.head.appendChild(next);
          return next;
        })();
  script.textContent = JSON.stringify(payload);
}

export function seoSiteUrl(): string {
  return siteUrl();
}

