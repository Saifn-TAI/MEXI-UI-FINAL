/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_API_URL?: string;
  readonly VITE_SIGNALS_API_URL?: string;
  readonly VITE_SIGNALS_API_KEY?: string;
  /** When true, send login access token as Signal Engine `X-API-Key` (TAI: token = API key). */
  readonly VITE_SIGNAL_USE_ACCESS_TOKEN?: string;
  readonly VITE_AUTH_PROXY_TARGET?: string;
  readonly VITE_SIGNAL_PROXY_TARGET?: string;
  readonly VITE_AUTH_PROXY_INSECURE?: string;
  readonly VITE_SIGNAL_PROXY_INSECURE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
