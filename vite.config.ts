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
    assetsInlineLimit: 0,
  },
  resolve: {
    alias: {
      '@remix-run/node': '/virtual/remix-node-stub.js',
    },
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
  },
  server: {
    allowedHosts: ['.tryhydrogen.dev'],
  },
});
