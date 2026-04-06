import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const signalProxyTarget =
    env.VITE_SIGNAL_PROXY_TARGET || 'https://tai-signals.transformativeai.co'
  const authProxyTarget =
    env.VITE_AUTH_PROXY_TARGET || 'https://tai-auth.transformativeai.co'
  // `secure: false` skips TLS verification for the Node→upstream hop (wrong cert hostname, self-signed, etc.).
  const authProxySecure = env.VITE_AUTH_PROXY_INSECURE === 'true' ? false : true
  const signalProxySecure = env.VITE_SIGNAL_PROXY_INSECURE === 'true' ? false : true

  return {
    plugins: [react()],
    envDir: '.',
    server: {
      proxy: {
        '/api/auth': {
          target: authProxyTarget,
          changeOrigin: true,
          secure: authProxySecure,
        },
        '/api/v1': {
          target: signalProxyTarget,
          changeOrigin: true,
          secure: signalProxySecure,
        },
      },
    },
  }
})
