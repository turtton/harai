import path from 'node:path'
import build from '@hono/vite-build/cloudflare-workers'
import adapter from '@hono/vite-dev-server/cloudflare'
import tailwindcss from '@tailwindcss/vite'
import honox from 'honox/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  const common = {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './app'),
      },
    },
  }
  if (mode === 'client') {
    return {
      ...common,
      build: {
        rollupOptions: {
          input: ['./app/client.ts', './app/style.css'],
          output: {
            entryFileNames: 'static/client.js',
            chunkFileNames: 'static/assets/[name]-[hash].js',
            assetFileNames: 'static/assets/[name].[ext]',
          },
        },
        emptyOutDir: false,
      },
      plugins: [tailwindcss()],
    }
  } else {
    return {
      ...common,
      plugins: [
        honox({
          devServer: { adapter },
          client: { input: ['./app/style.css'] },
        }),
        tailwindcss(),
        build(),
      ],
      ssr: {
        external: ['react', 'react-dom'],
      },
    }
  }
})
