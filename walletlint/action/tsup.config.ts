import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['cjs'],
  target: 'node20',
  splitting: false,
  sourcemap: false,
  clean: true,
  noExternal: ['@actions/core', '@actions/exec', '@actions/github'],
});
