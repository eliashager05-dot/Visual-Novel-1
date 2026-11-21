import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../../', import.meta.url));
export const CONFIG_PATH = join(ROOT, 'ai-render.config.json');

export interface AiConfig {
  /** Where ComfyUI is listening on this computer. */
  comfyUrl: string;
  /** Model file in ComfyUI/models/checkpoints. Empty = use the only one installed. */
  checkpoint: string;
  steps: number;
  cfg: number;
  sampler: string;
  scheduler: string;
  /** Generation size (SDXL's native 16:9 size). The result is resized to 1920×1080. */
  width: number;
  height: number;
  /** Second pass at full size: sharper, but slower and heavier on video memory. */
  hires: boolean;
  hiresDenoise: number;
  /** Replaces the default style wording at the start of every prompt. Empty = default. */
  style: string;
  /** Extra words added to the built-in negative prompt. */
  negative: string;
  /** Optional per-character LoRA files in ComfyUI/models/loras, keyed by character id. */
  loras: Record<string, { file: string; strength?: number }>;
  /** Optional path to your own ComfyUI workflow (API format) with %POSITIVE% etc. placeholders. */
  workflow: string;
  timeoutSeconds: number;
  /** Your image-to-video workflow, exported from ComfyUI in API format. Used by the studio's Animate button. */
  animateWorkflow: string;
  /** Clips take much longer than images. */
  animateTimeoutSeconds: number;
}

export const DEFAULT_CONFIG: AiConfig = {
  comfyUrl: 'http://127.0.0.1:8188',
  checkpoint: '',
  steps: 30,
  cfg: 6,
  sampler: 'dpmpp_2m',
  scheduler: 'karras',
  width: 1344,
  height: 768,
  hires: false,
  hiresDenoise: 0.45,
  style: '',
  negative: '',
  loras: {},
  workflow: '',
  timeoutSeconds: 900,
  animateWorkflow: 'ai-workflows/animate.json',
  animateTimeoutSeconds: 3600,
};

/** Reads ai-render.config.json, creating it with defaults on first use. */
export function loadConfig(): AiConfig {
  if (!existsSync(CONFIG_PATH)) {
    writeFileSync(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2) + '\n');
    console.log('Created ai-render.config.json with default settings.');
  }
  try {
    return { ...DEFAULT_CONFIG, ...(JSON.parse(readFileSync(CONFIG_PATH, 'utf8')) as Partial<AiConfig>) };
  } catch (e) {
    throw new Error(`ai-render.config.json is not valid JSON: ${(e as Error).message}`);
  }
}
