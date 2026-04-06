/**
 * Auth API base URL.
 * - Dev (default): empty string → requests go to the Vite dev server and are proxied (see vite.config.js) to avoid CORS.
 * - Prod: set VITE_AUTH_API_URL=https://tai-auth.transformativeai.co (TAI must allow your SPA origin in CORS).
 */
export function getAuthApiBase() {
  const fromEnv = import.meta.env.VITE_AUTH_API_URL;
  if (fromEnv !== undefined && fromEnv !== null && String(fromEnv).trim() !== '') {
    return String(fromEnv).replace(/\/$/, '');
  }
  return '';
}

export const AUTH_PREFIX = '/api/auth';
