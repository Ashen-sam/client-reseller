/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API origin, e.g. https://server-reseller.onrender.com (no trailing slash). Optional in prod (Render default). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
