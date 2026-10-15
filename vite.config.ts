import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { eixosFontes } from './vite-eixos-fontes';

export default defineConfig({
  // base relativa para que o build funcione via file:// dentro do Electron
  base: './',
  // eixosFontes: lê os eixos das fontes variáveis de public/fontes (efeito 'auto' do Gelatina)
  plugins: [react(), eixosFontes()],
  server: {
    port: 5173,
    host: '0.0.0.0',
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
