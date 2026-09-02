import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    decoder: 'src/decoder/index.ts',
    rules: 'src/rules/index.ts',
    types: 'src/types/index.ts',
  },
  outDir: 'dist',
  format: ['esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
});