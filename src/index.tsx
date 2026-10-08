import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './fonts';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Elemento #root não encontrado.');
}

// Sem StrictMode: o Genius mantém estado singleton (game/midi) que a dupla
// montagem do StrictMode em dev poderia duplicar.
createRoot(rootElement).render(<App />);
