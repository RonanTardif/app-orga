import { defineConfig } from 'vitest/config'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// @anthropic-ai/sdk v0.102+ inclut un agent-toolset server-only (node:fs/crypto/path).
// On stubbe tout le sous-arbre agent-toolset et les modules node: — inutilisés côté browser.
const stubServerOnlyModules: Plugin = {
  name: 'stub-server-only-modules',
  enforce: 'pre',
  resolveId(id, importer) {
    // Stubbe le sous-arbre agent-toolset (server-only, jamais appelé depuis le browser)
    if (
      id.includes('agent-toolset') ||
      id.includes('fs-util') ||
      (importer && importer.includes('agent-toolset'))
    ) {
      return '\0agent-toolset-stub'
    }
    if (id.startsWith('node:')) return '\0' + id
  },
  load(id) {
    if (id === '\0agent-toolset-stub') return 'export default {}; export {};'
    if (id === '\0node:crypto') {
      return 'export const randomUUID = () => globalThis.crypto.randomUUID(); export default {};'
    }
    if (id.startsWith('\0node:')) return 'export default {}; export {};'
  },
}

export default defineConfig({
  // GitHub Pages déploie sous /app-orga/ — seulement en CI pour ne pas casser le dev local
  base: process.env.CI ? '/app-orga/' : '/',
  plugins: [stubServerOnlyModules, react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
