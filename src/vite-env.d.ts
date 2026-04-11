/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API origin, e.g. https://server-reseller.onrender.com (no trailing slash). Optional in prod (Render default). */
  readonly VITE_API_URL?: string;
  /** Clerk publishable key (Dashboard → API Keys). Required for sign-in. */
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
