import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const apiTarget = env.VITE_API_TARGET || 'http://localhost:8090'
  let rewriteApiPrefix = env.VITE_API_REWRITE !== 'false'
  if (!env.VITE_API_REWRITE) {
    try {
      rewriteApiPrefix = new URL(apiTarget).port !== '88'
    } catch {
      rewriteApiPrefix = true
    }
  }

  return {
    base: '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    plugins: [
      vue(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        resolvers: [ElementPlusResolver()],
        dts: false
      }),
      Components({ resolvers: [ElementPlusResolver()] })
    ],
    server: {
      host: '0.0.0.0',
      port: 5173,
      open: true,
      proxy: {
        '/api/product': {
          target: env.VITE_PRODUCT_API_TARGET || 'http://localhost:11000',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, '')
        },
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          ...(rewriteApiPrefix ? { rewrite: (p) => p.replace(/^\/api/, '') } : {})
        }
      }
    }
  }
})
