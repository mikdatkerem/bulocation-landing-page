import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      allowedHosts: ['bulocation.com', '.bulocation.com'],
      proxy: {
        '/admin-api': {
          target: env.VITE_ADMIN_API_TARGET || 'http://localhost:5011',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/admin-api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (env.ADMIN_APP_SECRET) {
                proxyReq.setHeader('x-app-secret', env.ADMIN_APP_SECRET)
              }
            })
          },
        },
        '/storage/maps': {
          target: env.VITE_ADMIN_API_TARGET || 'http://localhost:5011',
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (env.ADMIN_APP_SECRET) {
                proxyReq.setHeader('x-app-secret', env.ADMIN_APP_SECRET)
              }
            })
          },
        },
        '/admin-map-assets': {
          target: env.VITE_ADMIN_API_TARGET || 'http://localhost:5011',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/admin-map-assets/, '/storage/maps'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (env.ADMIN_APP_SECRET) {
                proxyReq.setHeader('x-app-secret', env.ADMIN_APP_SECRET)
              }
            })
          },
        },
      },
    },
  }
})
