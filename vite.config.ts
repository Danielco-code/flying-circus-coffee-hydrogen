import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import {reactRouter} from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    hydrogen(),
    oxygen(),
    reactRouter(),
    tsconfigPaths(),
  ],
  build: {
    // Allow a strict Content-Security-Policy
    // without inlining assets as base64:
    assetsInlineLimit: 0,
  },
  ssr: {
    optimizeDeps: {
      /**
       * Include dependencies here if they throw CJS<>ESM errors.
       * For example:
       * > ReferenceError: module is not defined
       * Then include 'example-dep' in the array below.
       */
      include: ['set-cookie-parser', 'cookie', 'react-router'],
    },
    /**
     * Externalize Node-only modules so Oxygen doesn’t try to bundle them.
     */
    external: [
      'node:child_process',
      'node:util',
      'node:assert',
      '@remix-run/node',
    ],
  },
  server: {
    allowedHosts: ['.tryhydrogen.dev'],
  },
});
