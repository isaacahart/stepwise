import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: 'static/', // This should match Django's settings.STATIC_URL
  build: {
    // Where Vite will save its output files.
    // This should be something in your settings.STATICFILES_DIRS
    outDir: path.resolve(__dirname, './static'),
    emptyOutDir: false, // Preserve the outDir to not clobber Django's other files.
    manifest: "manifest.json",
    rollupOptions: {
      input: {
        'play-level': path.resolve(__dirname, './front-end/js/ui/play_level.js'),
        'make-theorem-statement': path.resolve(__dirname, './front-end/js/ui/make_theorem_statement.js'),
        'world-map': path.resolve(__dirname, './front-end/js/ui/world_map.js'),
      },
      output: {
        // Output JS bundles to js/ directory with -bundle suffix
        entryFileNames: `js/[name]-bundle.js`,
      },
    },
  },
});