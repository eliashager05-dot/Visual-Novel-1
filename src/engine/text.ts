import type { GameState } from '@/types';

/**
 * Replaces `{player}` and `{var:name}` tokens. Unknown tokens are left intact so
 * typos are visible in playtesting rather than silently swallowed.
 */
export function interpolate(text: string, state: GameState): string {
  return text.replace(/\{(player|var:([a-zA-Z0-9_.-]+))\}/g, (match, token: string, varName?: string) => {
    if (token === 'player') return state.player.name;
    if (varName !== undefined) {
      const v = state.vars[varName];
      return v === undefined ? match : String(v);
    }
    return match;
  });
}

/** Small stable string hash (FNV-1a) for read-tracking keys. */
export function hashString(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}
