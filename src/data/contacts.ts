import { byId } from '@/engine/content';
import type { ContactDefinition } from '@/types';

/** Phone contacts who are not characters. Characters can be messaged by their id. */
export const contacts = byId<ContactDefinition>(
  [
    { id: 'unknown', name: 'Unknown number', color: '#a8b3c4' },
    { id: 'bank', name: 'Harbour & Coast Bank', color: '#8da3b8' },
    { id: 'ferry', name: 'Halcyon Ferries', color: '#d9b26a' },
  ],
  'contact',
);
