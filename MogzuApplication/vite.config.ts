import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const FIGMA_ASSET_PREFIX = 'figma:asset/'

function figmaAssetFallbackPlugin() {
  // Tiny transparent 1x1 PNG fallback for missing figma:asset imports.
  const transparentPngDataUri =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9s5lH5QAAAAASUVORK5CYII='

  return {
    name: 'figma-asset-fallback',
    enforce: 'pre' as const,
    resolveId(source: string) {
      if (source.startsWith(FIGMA_ASSET_PREFIX)) {
        return `\0figma-asset-fallback:${source}`
      }
      return null
    },
    load(id: string) {
      if (id.startsWith('\0figma-asset-fallback:')) {
        return `export default ${JSON.stringify(transparentPngDataUri)};`
      }
      return null
    },
  }
}

export default defineConfig({
  server: {
    // IPv4 bind for reliable localhost on Windows. strictPort false so dev still starts if 5173 is held by another process.
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    open: true,
  },
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    figmaAssetFallbackPlugin(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
})
