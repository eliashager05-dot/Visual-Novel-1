import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { content } from './data';
import { validateContent } from './engine';

if (import.meta.env.DEV) {
  // QA handle for the browser console and automated tests.
  void Promise.all([import('./store/gameStore'), import('./store/uiStore'), import('./store/persistentStore')]).then(
    ([g, u, p]) => {
      (window as unknown as Record<string, unknown>).__halcyon = {
        game: g.useGameStore,
        ui: u.useUi,
        persistent: p.usePersistentStore,
      };
    },
  );

  // Surface broken content immediately while writing.
  const issues = validateContent(content);
  for (const i of issues) (i.level === 'error' ? console.error : console.warn)(`[content] ${i.where}: ${i.message}`);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
