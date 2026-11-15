import type { JumpTarget, ProgramPointer } from '@/types';
import type { GameContent } from './content';
import { compileScene, type CompiledScene } from './sceneCompiler';

/**
 * Owns the content and lazily compiles scenes. All runtime lookups of scenes,
 * labels and characters go through here so the engine never touches raw data.
 */
export class SceneManager {
  private compiled = new Map<string, CompiledScene>();

  constructor(readonly content: GameContent) {}

  getScene(id: string): CompiledScene {
    let c = this.compiled.get(id);
    if (!c) {
      const def = this.content.scenes[id];
      if (!def) throw new Error(`Unknown scene "${id}"`);
      c = compileScene(def);
      this.compiled.set(id, c);
    }
    return c;
  }

  hasScene(id: string): boolean {
    return id in this.content.scenes;
  }

  /** Resolves a cross-scene jump target to a concrete pointer. */
  resolve(target: JumpTarget & { scene: string }): ProgramPointer {
    const scene = this.getScene(target.scene);
    if (!target.label) return { scene: target.scene, index: 0 };
    const index = scene.labels[target.label];
    if (index === undefined) throw new Error(`Unknown label "${target.label}" in scene "${target.scene}"`);
    return { scene: target.scene, index };
  }

  sceneTitle(id: string): string {
    return this.content.scenes[id]?.title ?? id;
  }

  chapterOf(sceneId: string) {
    const chapterId = this.content.scenes[sceneId]?.chapter;
    return this.content.chapters.find((c) => c.id === chapterId);
  }

  /** Compiles everything up-front; used by the validator and tests. */
  compileAll(): CompiledScene[] {
    return Object.keys(this.content.scenes).map((id) => this.getScene(id));
  }
}
