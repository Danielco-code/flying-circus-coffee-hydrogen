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
      include: ['set-cookie-parser', 'cookie', 'react-router'],
    },
    external: [
      'node:child_process',
      'node:util',
      'node:assert',
      '@remix-run/node',
    ],
    noExternal: [],
    resolve: {
      alias: {
        '@remix-run/node': '/virtual/remix-node-stub.js',
      },
    },
  }, // 👈 this closing brace was missing
  server: {
    allowedHosts: ['.tryhydrogen.dev'],
  },
});
