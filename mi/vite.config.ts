import react from '@vitejs/plugin-react-swc';
import {resolve} from 'path';
import {defineConfig} from 'vite';
import glsl from 'vite-plugin-glsl';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.md'],
  plugins: [react(), glsl()],
});
