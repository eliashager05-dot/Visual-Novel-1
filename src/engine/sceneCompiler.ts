import type { ChoiceOption, Condition, JumpTarget, SceneDefinition, Step } from '@/types';

/**
 * The scene compiler turns authored, nested steps (if/else blocks and choice
 * branches) into a flat instruction list addressed by index. A flat program
 * gives us one trivially serialisable program counter — `{ scene, index }` —
 * which is what makes save/load exact at any line.
 */

type PassThroughStep = Exclude<Step, { type: 'if' | 'choice' | 'jump' | 'label' }>;

export interface CompiledOption extends Omit<ChoiceOption, 'steps' | 'goto'> {
  /** Instruction index where this option's branch starts. */
  target: number;
}

export type Instruction =
  | PassThroughStep
  /** Continue at `target` when the condition is FALSE. */
  | { type: 'branchUnless'; condition: Condition; target: number }
  | { type: 'goto'; target: number }
  /** Cross-scene jump, resolved at runtime. */
  | { type: 'jump'; target: JumpTarget & { scene: string } }
  | {
      type: 'choice';
      id: string;
      prompt?: string;
      options: CompiledOption[];
      timeout?: { seconds: number; defaultOption: string };
    };

export interface CompiledScene {
  id: string;
  instructions: Instruction[];
  labels: Record<string, number>;
}

export class SceneCompileError extends Error {
  constructor(sceneId: string, message: string) {
    super(`[scene ${sceneId}] ${message}`);
    this.name = 'SceneCompileError';
  }
}

export function compileScene(scene: SceneDefinition): CompiledScene {
  const out: Instruction[] = [];
  const labels: Record<string, number> = {};
  /** Local-label jumps to patch once all labels are known. */
  const pendingLocal: { index: number; label: string }[] = [];
  const choiceIds = new Set<string>();

  const fail = (msg: string): never => {
    throw new SceneCompileError(scene.id, msg);
  };

  const emitJump = (target: JumpTarget) => {
    if (target.scene && target.scene !== scene.id) {
      out.push({ type: 'jump', target: { scene: target.scene, label: target.label } });
    } else if (target.label) {
      pendingLocal.push({ index: out.length, label: target.label });
      out.push({ type: 'goto', target: -1 });
    } else {
      // Jump to the start of this same scene.
      out.push({ type: 'goto', target: 0 });
    }
  };

  const emitBlock = (steps: Step[]) => {
    for (const step of steps) emitStep(step);
  };

  const emitStep = (step: Step) => {
    switch (step.type) {
      case 'label':
        if (step.name in labels) fail(`duplicate label "${step.name}"`);
        labels[step.name] = out.length;
        return;
      case 'jump':
        emitJump(step.target);
        return;
      case 'if': {
        const branchIdx = out.length;
        out.push({ type: 'branchUnless', condition: step.condition, target: -1 });
        emitBlock(step.then);
        if (step.else && step.else.length > 0) {
          const skipElseIdx = out.length;
          out.push({ type: 'goto', target: -1 });
          (out[branchIdx] as { target: number }).target = out.length;
          emitBlock(step.else);
          (out[skipElseIdx] as { target: number }).target = out.length;
        } else {
          (out[branchIdx] as { target: number }).target = out.length;
        }
        return;
      }
      case 'choice': {
        if (choiceIds.has(step.id)) fail(`duplicate choice id "${step.id}"`);
        choiceIds.add(step.id);
        if (step.options.length === 0) fail(`choice "${step.id}" has no options`);
        const optionIds = new Set<string>();
        for (const o of step.options) {
          if (optionIds.has(o.id)) fail(`choice "${step.id}" has duplicate option id "${o.id}"`);
          optionIds.add(o.id);
        }
        if (step.timeout && !optionIds.has(step.timeout.defaultOption)) {
          fail(`choice "${step.id}" timeout default "${step.timeout.defaultOption}" is not an option`);
        }

        const compiled: CompiledOption[] = [];
        out.push({
          type: 'choice',
          id: step.id,
          prompt: step.prompt,
          options: compiled,
          timeout: step.timeout,
        });
        // Each option gets its own block; all blocks rejoin at `after`.
        const rejoin: number[] = [];
        for (const opt of step.options) {
          const { steps, goto, ...rest } = opt;
          compiled.push({ ...rest, target: out.length });
          if (steps) emitBlock(steps);
          if (goto) {
            emitJump(goto);
          } else {
            rejoin.push(out.length);
            out.push({ type: 'goto', target: -1 });
          }
        }
        const after = out.length;
        for (const idx of rejoin) (out[idx] as { target: number }).target = after;
        return;
      }
      default:
        out.push(step);
    }
  };

  emitBlock(scene.steps);

  for (const { index, label } of pendingLocal) {
    const target = labels[label];
    if (target === undefined) fail(`jump to unknown label "${label}"`);
    (out[index] as { target: number }).target = target as number;
  }

  return { id: scene.id, instructions: out, labels };
}
