import type { DisplayedLine, EngineEvent, GameState, StageCharacter } from '@/types';
import { presentChoice, resolveChoice } from './choiceEngine';
import { evaluateCondition } from './conditions';
import { applyEffects } from './effects';
import { createRelationship } from './relationshipEngine';
import type { Instruction } from './sceneCompiler';
import type { SceneManager } from './sceneManager';
import { hashString, interpolate } from './text';

/**
 * The interpreter. Pure functions: (state, input) → (new state, events).
 * The store owns the current state; the UI reacts to `presentation` and plays
 * `events` (sounds, transitions, toasts). Nothing in here touches the DOM.
 */

/** v2: stage.shot added. */
export const SAVE_SCHEMA_VERSION = 2;
export const HISTORY_LIMIT = 400;
/** Guards against authoring mistakes like an unconditional goto loop. */
const MAX_INSTRUCTIONS_PER_ADVANCE = 10_000;

export interface EngineResult {
  state: GameState;
  events: EngineEvent[];
}

export function createNewGame(
  manager: SceneManager,
  opts: { playerName: string; startScene?: string },
): EngineResult {
  const { content } = manager;
  const startScene = opts.startScene ?? content.chapters[0]?.startScene;
  if (!startScene) throw new Error('No start scene: define at least one chapter');

  const relationships: GameState['relationships'] = {};
  for (const def of Object.values(content.characters)) {
    if (def.role !== 'protagonist') relationships[def.id] = createRelationship(def);
  }

  const state: GameState = {
    schemaVersion: SAVE_SCHEMA_VERSION,
    player: { name: opts.playerName.trim() || content.defaultPlayerName },
    pointer: { scene: startScene, index: 0 },
    stage: { background: null, cg: null, shot: null, characters: [], music: null },
    presentation: { kind: 'idle' },
    relationships,
    flags: {},
    vars: {},
    choicesMade: {},
    visitedScenes: [],
    history: [],
    lineCount: 0,
  };
  const events: EngineEvent[] = [];
  enterScene(manager, state, startScene, events);
  return run(manager, state, events);
}

/** Continue past the current line/title card. No-op while a choice is pending. */
export function advance(manager: SceneManager, prev: GameState): EngineResult {
  const p = prev.presentation.kind;
  if (p === 'choice' || p === 'end') return { state: prev, events: [] };
  return run(manager, structuredClone(prev), []);
}

/** Runs from the current pointer (used after restoring a rewound save). */
export function resume(manager: SceneManager, prev: GameState): EngineResult {
  const state = structuredClone(prev);
  state.presentation = { kind: 'idle' };
  return run(manager, state, []);
}

export function choose(manager: SceneManager, prev: GameState, optionId: string): EngineResult {
  if (prev.presentation.kind !== 'choice') throw new Error('choose() called while no choice is pending');
  const state = structuredClone(prev);
  const events: EngineEvent[] = [];
  // The pointer sits just past the choice instruction.
  const scene = manager.getScene(state.pointer.scene);
  const instr = scene.instructions[state.pointer.index - 1];
  if (!instr || instr.type !== 'choice') throw new Error('Choice pointer is out of sync with scene');
  state.pointer.index = resolveChoice(instr, optionId, state, events);
  return run(manager, state, events);
}

// ---------------------------------------------------------------------------

function enterScene(manager: SceneManager, state: GameState, sceneId: string, events: EngineEvent[]) {
  if (!state.visitedScenes.includes(sceneId)) state.visitedScenes.push(sceneId);
  if (manager.content.scenes[sceneId]?.replayable) events.push({ type: 'unlockScene', id: sceneId });
}

function pushHistory(state: GameState, line: DisplayedLine) {
  state.history.push({ kind: line.kind, speaker: line.speaker, speakerName: line.speakerName, text: line.text });
  if (state.history.length > HISTORY_LIMIT) state.history.splice(0, state.history.length - HISTORY_LIMIT);
}

type LineInstruction = Extract<Instruction, { type: 'say' | 'narrate' | 'think' }>;

/** Stable read-tracking key: survives edits elsewhere in the scene. */
export function lineKey(sceneId: string, instr: LineInstruction): string {
  return `${sceneId}:${hashString((instr.type === 'say' ? instr.speaker : instr.type) + instr.text)}`;
}

/** Builds the on-screen line for an instruction. Pure: no state changes. */
export function presentLine(manager: SceneManager, state: GameState, sceneId: string, instr: LineInstruction): DisplayedLine {
  const text = interpolate(instr.text, state);
  if (instr.type !== 'say') {
    const think = instr.type === 'think';
    return {
      kind: instr.type,
      speaker: think ? 'player' : null,
      speakerName: think ? state.player.name : null,
      text,
      key: lineKey(sceneId, instr),
    };
  }
  let speakerName: string;
  if (instr.speaker === 'player') speakerName = state.player.name;
  else {
    const def = manager.content.characters[instr.speaker];
    if (!def) throw new Error(`Unknown speaker "${instr.speaker}"`);
    speakerName = instr.as ?? def.shortName ?? def.name;
  }
  return { kind: 'say', speaker: instr.speaker, speakerName, text, expression: instr.expression, key: lineKey(sceneId, instr) };
}

function findOnStage(state: GameState, id: string): StageCharacter | undefined {
  return state.stage.characters.find((c) => c.id === id);
}

/**
 * Executes instructions on a DRAFT state until something needs the player:
 * a line, a title card, a choice, or the end of the content.
 */
function run(manager: SceneManager, state: GameState, events: EngineEvent[]): EngineResult {
  const { content } = manager;

  for (let guard = 0; guard < MAX_INSTRUCTIONS_PER_ADVANCE; guard++) {
    const scene = manager.getScene(state.pointer.scene);
    const instr = scene.instructions[state.pointer.index];

    if (!instr) {
      // Fell off the end of a scene without `end` or `jump`: the validator
      // flags this, but at runtime we stop gracefully rather than crash.
      state.presentation = { kind: 'end' };
      return { state, events };
    }
    state.pointer.index++;

    switch (instr.type) {
      case 'narrate':
      case 'think':
      case 'say': {
        if (instr.type === 'say' && instr.speaker !== 'player') {
          const rel = state.relationships[instr.speaker];
          if (rel && !instr.as && !rel.met) {
            rel.met = true;
            events.push({ type: 'characterMet', character: instr.speaker });
          }
          const onStage = findOnStage(state, instr.speaker);
          if (onStage) {
            if (instr.expression) onStage.expression = instr.expression;
            if (instr.pose) onStage.pose = instr.pose;
          }
        }
        const line = presentLine(manager, state, scene.id, instr);
        state.presentation = { kind: 'line', line };
        pushHistory(state, line);
        state.lineCount++;
        return { state, events };
      }

      case 'title':
        state.presentation = { kind: 'title', title: instr.title, subtitle: instr.subtitle };
        return { state, events };

      case 'background':
        state.stage.background = instr.id;
        state.stage.shot = null; // a new location starts in staged (sprite) mode
        if (instr.transition && instr.transition !== 'none') {
          events.push({ type: 'transition', kind: instr.transition });
        }
        break;

      case 'show': {
        const def = content.characters[instr.character];
        if (!def) throw new Error(`Unknown character "${instr.character}"`);
        const existing = findOnStage(state, instr.character);
        if (existing) {
          if (instr.position) existing.position = instr.position;
          if (instr.expression) existing.expression = instr.expression;
          if (instr.pose) existing.pose = instr.pose;
        } else {
          state.stage.characters.push({
            id: def.id,
            position: instr.position ?? 'center',
            pose: instr.pose ?? def.defaultPose,
            expression: instr.expression ?? 'neutral',
          });
        }
        break;
      }

      case 'hide':
        state.stage.characters =
          instr.character === '*' ? [] : state.stage.characters.filter((c) => c.id !== instr.character);
        break;

      case 'expression': {
        const c = findOnStage(state, instr.character);
        if (c) {
          c.expression = instr.expression;
          if (instr.pose) c.pose = instr.pose;
        }
        break;
      }

      case 'move': {
        const c = findOnStage(state, instr.character);
        if (c) c.position = instr.position;
        break;
      }

      case 'cg':
        state.stage.cg = instr.id;
        if (instr.id) events.push({ type: 'unlockGallery', id: instr.id });
        break;

      case 'shot':
        state.stage.shot = instr.id;
        break;

      case 'transition':
        events.push({ type: 'transition', kind: instr.kind, duration: instr.duration });
        break;

      case 'music':
        state.stage.music = instr.track;
        events.push({ type: 'music', track: instr.track, fade: instr.fade });
        break;

      case 'sfx':
        events.push({ type: 'sfx', id: instr.id });
        break;

      case 'effects':
        applyEffects(state, instr.effects, events);
        break;

      case 'unlock':
        events.push({ type: 'unlockGallery', id: instr.gallery });
        break;

      case 'branchUnless':
        if (!evaluateCondition(instr.condition, state)) state.pointer.index = instr.target;
        break;

      case 'goto':
        state.pointer.index = instr.target;
        break;

      case 'jump': {
        state.pointer = manager.resolve(instr.target);
        enterScene(manager, state, instr.target.scene, events);
        break;
      }

      case 'choice': {
        const choice = presentChoice(instr, state);
        if (!choice.options.some((o) => o.enabled)) {
          throw new Error(`Choice "${instr.id}" in "${scene.id}" has no available options in this state`);
        }
        state.presentation = { kind: 'choice', choice };
        return { state, events };
      }

      case 'end':
        if (instr.ending) events.push({ type: 'ending', id: instr.ending });
        state.presentation = {
          kind: 'end',
          ending: instr.ending,
          nextChapter: instr.nextChapter,
          ...(instr.chapterComplete ? { chapterComplete: true } : {}),
        };
        return { state, events };
    }
  }
  throw new Error(
    `Engine exceeded ${MAX_INSTRUCTIONS_PER_ADVANCE} instructions without reaching a line — probable infinite loop near ${state.pointer.scene}:${state.pointer.index}`,
  );
}
