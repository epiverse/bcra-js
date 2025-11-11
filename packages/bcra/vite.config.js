import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'BCRA-R',
      formats: ['es', 'umd'],
      fileName: (format) => `bcra.${format}.js`,
    },
    rollupOptions: {
      // Externalize dependencies that shouldn't be bundled
      external: [],
      output: {
        globals: {},
      },
    },
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console for debugging
      },
    },
  },
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['test/**', 'node_modules/**', 'dist/**'],
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
  },
});
