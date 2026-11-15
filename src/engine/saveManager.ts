import type { GameState, StageCharacter } from '@/types';
import { presentChoice } from './choiceEngine';
import { lineKey, presentLine, SAVE_SCHEMA_VERSION } from './dialogueEngine';
import type { SceneManager } from './sceneManager';
import { hashString } from './text';

/**
 * Save files. Pure logic with an injectable storage backend so it can be
 * unit-tested; the app passes a localStorage adapter.
 *
 * A save stores the full GameState plus enough metadata to draw the slot
 * (thumbnail stage, scene title, last line) without loading it, and a
 * fingerprint of the current scene so a later story update can be detected
 * and repaired on load.
 */

export const MANUAL_SLOTS = 18;
export const AUTO_SLOTS = 3;

export type SaveKind = 'manual' | 'auto' | 'quick';
export type SlotId = `manual-${number}` | `auto-${number}` | 'quick';

export interface SaveThumb {
  background: string | null;
  shot: string | null;
  cg: string | null;
  characters: StageCharacter[];
}

export interface SaveRecord {
  format: 'halcyon-save';
  schemaVersion: number;
  slot: SlotId;
  kind: SaveKind;
  createdAt: number;
  playerName: string;
  sceneId: string;
  sceneTitle: string;
  chapterTitle: string;
  lineCount: number;
  preview: { speakerName: string | null; text: string };
  thumb: SaveThumb;
  sceneFingerprint: string;
  state: GameState;
}

export interface SaveStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  keys(): string[];
}

const PREFIX = 'halcyon:save:';

export class SaveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SaveError';
  }
}

export function sceneFingerprint(manager: SceneManager, sceneId: string): string {
  return hashString(JSON.stringify(manager.getScene(sceneId).instructions));
}

export function createSaveRecord(
  manager: SceneManager,
  state: GameState,
  slot: SlotId,
  kind: SaveKind,
  now = Date.now(),
): SaveRecord {
  const p = state.presentation;
  const lastLine = [...state.history].reverse().find((h) => h.kind !== 'choice');
  const preview =
    p.kind === 'line'
      ? { speakerName: p.line.speakerName, text: p.line.text }
      : p.kind === 'choice'
        ? { speakerName: null, text: p.choice.prompt ?? lastLine?.text ?? 'A decision…' }
        : p.kind === 'title'
          ? { speakerName: null, text: [p.title, p.subtitle].filter(Boolean).join(' — ') }
          : { speakerName: null, text: lastLine?.text ?? '' };
  return {
    format: 'halcyon-save',
    schemaVersion: SAVE_SCHEMA_VERSION,
    slot,
    kind,
    createdAt: now,
    playerName: state.player.name,
    sceneId: state.pointer.scene,
    sceneTitle: manager.sceneTitle(state.pointer.scene),
    chapterTitle: manager.chapterOf(state.pointer.scene)?.title ?? '',
    lineCount: state.lineCount,
    preview: { ...preview, text: preview.text.slice(0, 160) },
    thumb: {
      background: state.stage.background,
      shot: state.stage.shot,
      cg: state.stage.cg,
      characters: state.stage.characters,
    },
    sceneFingerprint: sceneFingerprint(manager, state.pointer.scene),
    state,
  };
}

/** Upgrades older save formats. Add a case per schema bump. */
export function migrateRecord(raw: unknown): SaveRecord {
  const r = raw as Partial<SaveRecord> | null;
  if (!r || r.format !== 'halcyon-save' || !r.state) throw new SaveError('Not a Halcyon save file');
  const version = r.schemaVersion ?? 0;
  if (version > SAVE_SCHEMA_VERSION) throw new SaveError('This save was made by a newer version of the game');
  const rec = r as SaveRecord;
  // v1 → v2 placeholder: saves written before shots existed lack stage.shot.
  if (rec.state.stage.shot === undefined) rec.state.stage.shot = null;
  if (rec.thumb && rec.thumb.shot === undefined) rec.thumb.shot = null;
  rec.schemaVersion = SAVE_SCHEMA_VERSION;
  rec.state.schemaVersion = SAVE_SCHEMA_VERSION;
  return rec;
}

export type RestoreOutcome = 'exact' | 'relocated' | 'rewound';

/**
 * Turns a record back into a playable state. If the scene was edited since the
 * save, find the same line/choice in the new version by its stable key; if
 * that fails, rewind to the start of the scene (and say so).
 */
export function restoreState(manager: SceneManager, record: SaveRecord): { state: GameState; outcome: RestoreOutcome } {
  const state = structuredClone(record.state);
  const sceneId = state.pointer.scene;
  if (!manager.hasScene(sceneId)) {
    throw new SaveError(`This save points to a part of the story that no longer exists ("${sceneId}")`);
  }
  if (sceneFingerprint(manager, sceneId) === record.sceneFingerprint) return { state, outcome: 'exact' };

  const instrs = manager.getScene(sceneId).instructions;
  const p = state.presentation;
  if (p.kind === 'line') {
    const idx = instrs.findIndex(
      (i) => (i.type === 'say' || i.type === 'narrate' || i.type === 'think') && lineKey(sceneId, i) === p.line.key,
    );
    const instr = instrs[idx];
    if (instr && (instr.type === 'say' || instr.type === 'narrate' || instr.type === 'think')) {
      state.pointer.index = idx + 1;
      state.presentation = { kind: 'line', line: presentLine(manager, state, sceneId, instr) };
      return { state, outcome: 'relocated' };
    }
  } else if (p.kind === 'choice') {
    const idx = instrs.findIndex((i) => i.type === 'choice' && i.id === p.choice.choiceId);
    const instr = instrs[idx];
    if (instr && instr.type === 'choice') {
      state.pointer.index = idx + 1;
      state.presentation = { kind: 'choice', choice: presentChoice(instr, state) };
      return { state, outcome: 'relocated' };
    }
  }
  // Fallback: restart the scene from its first instruction. The caller runs it.
  state.pointer.index = 0;
  state.presentation = { kind: 'idle' };
  return { state, outcome: 'rewound' };
}

/** Thin repository over a key-value storage. */
export class SaveRepository {
  constructor(private storage: SaveStorage) {}

  private key(slot: SlotId) {
    return PREFIX + slot;
  }

  write(record: SaveRecord): void {
    try {
      this.storage.set(this.key(record.slot), JSON.stringify(record));
    } catch (e) {
      const quota = e instanceof DOMException && /quota/i.test(e.name + e.message);
      throw new SaveError(quota ? 'Storage is full — delete some saves and try again' : `Could not save: ${(e as Error).message}`);
    }
  }

  read(slot: SlotId): SaveRecord | null {
    const raw = this.storage.get(this.key(slot));
    if (!raw) return null;
    try {
      return migrateRecord(JSON.parse(raw));
    } catch {
      return null; // corrupt slot: treat as empty rather than crashing menus
    }
  }

  remove(slot: SlotId): void {
    this.storage.remove(this.key(slot));
  }

  list(): SaveRecord[] {
    return this.storage
      .keys()
      .filter((k) => k.startsWith(PREFIX))
      .map((k) => this.read(k.slice(PREFIX.length) as SlotId))
      .filter((r): r is SaveRecord => r !== null)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  latest(): SaveRecord | null {
    return this.list()[0] ?? null;
  }

  /** Autosaves rotate: overwrite the oldest (or first empty) auto slot. */
  nextAutoSlot(): SlotId {
    let oldest: { slot: SlotId; at: number } | null = null;
    for (let i = 1; i <= AUTO_SLOTS; i++) {
      const slot = `auto-${i}` as SlotId;
      const r = this.read(slot);
      if (!r) return slot;
      if (!oldest || r.createdAt < oldest.at) oldest = { slot, at: r.createdAt };
    }
    return oldest!.slot;
  }

  clearAll(): void {
    for (const k of this.storage.keys()) if (k.startsWith(PREFIX)) this.storage.remove(k);
  }
}

export function memoryStorage(): SaveStorage {
  const m = new Map<string, string>();
  return {
    get: (k) => m.get(k) ?? null,
    set: (k, v) => void m.set(k, v),
    remove: (k) => void m.delete(k),
    keys: () => [...m.keys()],
  };
}
