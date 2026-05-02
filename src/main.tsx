import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Elemento root não encontrado");
}

try {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (error) {
  console.error("Erro fatal na inicialização:", error);
  rootElement.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;">
    <h1>Erro ao carregar a aplicação</h1>
    <p>${error instanceof Error ? error.message : "Erro desconhecido"}</p>
  </div>`;
}
