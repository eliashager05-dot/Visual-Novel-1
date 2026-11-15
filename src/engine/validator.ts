import { EXPRESSIONS, type Condition, type Effect, type Expression } from '@/types';
import type { GameContent } from './content';
import type { Instruction } from './sceneCompiler';
import { SceneManager } from './sceneManager';

export interface ValidationIssue {
  level: 'error' | 'warning';
  where: string;
  message: string;
}

export const MINIMUM_CHARACTER_AGE = 21;

/**
 * Static checks over all content. Run in tests (CI) and at dev start-up, so a
 * typo in a scene file fails loudly long before a player reaches it.
 */
export function validateContent(content: GameContent): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const err = (where: string, message: string) => issues.push({ level: 'error', where, message });
  const warn = (where: string, message: string) => issues.push({ level: 'warning', where, message });

  // --- Characters --------------------------------------------------------
  for (const [key, c] of Object.entries(content.characters)) {
    const where = `character ${key}`;
    if (c.id !== key) err(where, `id "${c.id}" does not match registry key`);
    if (!Number.isInteger(c.age) || c.age < MINIMUM_CHARACTER_AGE) {
      err(where, `age ${c.age} is below the minimum of ${MINIMUM_CHARACTER_AGE}`);
    }
    if (!c.poses.includes(c.defaultPose)) err(where, `defaultPose "${c.defaultPose}" not in poses`);
    for (const e of c.expressions) if (!EXPRESSIONS.includes(e)) err(where, `unknown expression "${e}"`);
    if (c.role === 'major' && c.expressions.length < EXPRESSIONS.length) {
      warn(where, `major character is missing expressions: ${EXPRESSIONS.filter((e) => !c.expressions.includes(e)).join(', ')}`);
    }
    if (!content.characterArt[key]) err(where, 'no entry in characterArt (needed to draw the character)');
    const ms = new Set<string>();
    for (const m of c.milestones) {
      if (ms.has(m.id)) err(where, `duplicate milestone "${m.id}"`);
      ms.add(m.id);
    }
  }

  // --- Shots -------------------------------------------------------------
  for (const [key, s] of Object.entries(content.shots)) {
    const where = `shot ${key}`;
    if (s.id !== key) err(where, `id "${s.id}" does not match registry key`);
    if (!content.backgrounds[s.background]) err(where, `unknown background "${s.background}"`);
    if (!s.description.trim()) warn(where, 'missing render description');
    for (const c of s.characters) {
      const def = content.characters[c.id];
      if (!def) {
        err(where, `unknown character "${c.id}"`);
        continue;
      }
      if (c.expression && !def.expressions.includes(c.expression)) err(where, `${c.id} has no expression "${c.expression}"`);
      if (c.pose && !def.poses.includes(c.pose)) err(where, `${c.id} has no pose "${c.pose}"`);
    }
  }

  // --- Chapters ----------------------------------------------------------
  if (content.chapters.length === 0) err('chapters', 'no chapters defined');
  for (const ch of content.chapters) {
    if (!content.scenes[ch.startScene]) err(`chapter ${ch.id}`, `startScene "${ch.startScene}" does not exist`);
  }

  // --- Scenes: compile first, then cross-reference -----------------------
  const manager = new SceneManager(content);
  const compiled = new Map<string, Instruction[]>();
  for (const [id, scene] of Object.entries(content.scenes)) {
    if (scene.id !== id) err(`scene ${id}`, `id "${scene.id}" does not match registry key`);
    if (!content.chapters.some((c) => c.id === scene.chapter)) {
      err(`scene ${id}`, `chapter "${scene.chapter}" does not exist`);
    }
    try {
      compiled.set(id, manager.getScene(id).instructions);
    } catch (e) {
      err(`scene ${id}`, (e as Error).message);
    }
  }

  // All choice/option ids, for validating `chose` conditions.
  const choiceOptions = new Map<string, Set<string>>();
  for (const instrs of compiled.values()) {
    for (const i of instrs) {
      if (i.type === 'choice') {
        if (choiceOptions.has(i.id)) err(`choice ${i.id}`, 'choice id is used in more than one scene');
        choiceOptions.set(i.id, new Set(i.options.map((o) => o.id)));
      }
    }
  }

  const checkCharacter = (where: string, id: string) => {
    if (!content.characters[id]) {
      err(where, `unknown character "${id}"`);
      return false;
    }
    return true;
  };
  const checkExpression = (where: string, charId: string, expr: Expression | undefined, pose?: string) => {
    const c = content.characters[charId];
    if (!c) return;
    if (expr && !c.expressions.includes(expr)) err(where, `${charId} has no expression "${expr}"`);
    if (pose && !c.poses.includes(pose)) err(where, `${charId} has no pose "${pose}"`);
  };
  const checkCondition = (where: string, cond: Condition): void => {
    switch (cond.type) {
      case 'affinity':
      case 'trust':
      case 'met':
        checkCharacter(where, cond.character);
        break;
      case 'milestone':
        if (checkCharacter(where, cond.character) &&
            !content.characters[cond.character]!.milestones.some((m) => m.id === cond.milestone)) {
          err(where, `${cond.character} has no milestone "${cond.milestone}"`);
        }
        break;
      case 'chose': {
        const opts = choiceOptions.get(cond.choice);
        if (!opts) err(where, `condition references unknown choice "${cond.choice}"`);
        else if (!opts.has(cond.option)) err(where, `choice "${cond.choice}" has no option "${cond.option}"`);
        break;
      }
      case 'visited':
        if (!content.scenes[cond.scene]) err(where, `condition references unknown scene "${cond.scene}"`);
        break;
      case 'all':
      case 'any':
        cond.conditions.forEach((c) => checkCondition(where, c));
        break;
      case 'not':
        checkCondition(where, cond.condition);
        break;
      default:
        break;
    }
  };
  const checkEffects = (where: string, effects: Effect[]) => {
    for (const e of effects) {
      if (e.type === 'affinity' || e.type === 'trust') checkCharacter(where, e.character);
      if (e.type === 'milestone' && checkCharacter(where, e.character) &&
          !content.characters[e.character]!.milestones.some((m) => m.id === e.milestone)) {
        err(where, `${e.character} has no milestone "${e.milestone}"`);
      }
    }
  };

  for (const [sceneId, instrs] of compiled) {
    instrs.forEach((i, idx) => {
      const where = `scene ${sceneId} #${idx} (${i.type})`;
      switch (i.type) {
        case 'say':
          if (i.speaker !== 'player' && checkCharacter(where, i.speaker)) {
            checkExpression(where, i.speaker, i.expression, i.pose);
          }
          break;
        case 'show':
        case 'expression':
          if (checkCharacter(where, i.character)) checkExpression(where, i.character, i.expression, i.pose);
          break;
        case 'move':
          checkCharacter(where, i.character);
          break;
        case 'hide':
          if (i.character !== '*') checkCharacter(where, i.character);
          break;
        case 'background':
          if (!content.backgrounds[i.id]) err(where, `unknown background "${i.id}"`);
          break;
        case 'cg':
          if (i.id && !content.cgs[i.id]) err(where, `unknown CG "${i.id}"`);
          break;
        case 'shot': {
          if (!i.id) break;
          const shot = content.shots[i.id];
          if (!shot) err(where, `unknown shot "${i.id}"`);
          break;
        }
        case 'unlock':
          if (!content.cgs[i.gallery]) err(where, `unknown gallery item "${i.gallery}"`);
          break;
        case 'music':
          if (i.track && !content.music[i.track]) err(where, `unknown music track "${i.track}"`);
          break;
        case 'sfx':
          if (!content.sfx[i.id]) err(where, `unknown sfx "${i.id}"`);
          break;
        case 'effects':
          checkEffects(where, i.effects);
          break;
        case 'branchUnless':
          checkCondition(where, i.condition);
          break;
        case 'jump': {
          const target = content.scenes[i.target.scene];
          if (!target) err(where, `jump to unknown scene "${i.target.scene}"`);
          else if (i.target.label) {
            try {
              manager.resolve(i.target);
            } catch (e) {
              err(where, (e as Error).message);
            }
          }
          break;
        }
        case 'choice':
          for (const o of i.options) {
            if (o.condition) checkCondition(`${where} option ${o.id}`, o.condition);
            if (o.effects) checkEffects(`${where} option ${o.id}`, o.effects);
          }
          break;
        case 'end':
          if (i.nextChapter && !content.chapters.some((c) => c.id === i.nextChapter)) {
            err(where, `nextChapter "${i.nextChapter}" does not exist`);
          }
          break;
        default:
          break;
      }
    });

    const last = instrs[instrs.length - 1];
    if (!last || !(last.type === 'end' || last.type === 'jump' || last.type === 'goto')) {
      err(`scene ${sceneId}`, 'scene must finish with an `end` or `jump` (it would fall through)');
    }
  }

  // --- Reachability (warning only) --------------------------------------
  const reachable = new Set<string>();
  const queue = content.chapters.map((c) => c.startScene);
  while (queue.length) {
    const id = queue.pop()!;
    if (reachable.has(id)) continue;
    reachable.add(id);
    for (const i of compiled.get(id) ?? []) if (i.type === 'jump') queue.push(i.target.scene);
  }
  for (const id of Object.keys(content.scenes)) {
    if (!reachable.has(id)) warn(`scene ${id}`, 'scene is not reachable from any chapter start');
  }

  return issues;
}
