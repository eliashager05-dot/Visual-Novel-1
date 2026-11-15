import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { content } from './data';
import { validateContent } from './engine';

if (import.meta.env.DEV) {
  // Surface broken content immediately while writing.
  const issues = validateContent(content);
  for (const i of issues) (i.level === 'error' ? console.error : console.warn)(`[content] ${i.where}: ${i.message}`);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
