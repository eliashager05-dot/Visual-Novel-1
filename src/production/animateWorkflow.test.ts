import { describe, expect, it } from 'vitest';
import { findClip, motionPrompt, prepareAnimateWorkflow, WorkflowError } from './animateWorkflow';

const values = { image: 'halcyon_c1_x.png', prompt: 'She laughs.', negative: 'static', seed: 1234 };

/** Shaped like ComfyUI's "Wan 2.2 5B image to video" template, exported in API format. */
const wan22 = {
  '37': { class_type: 'UNETLoader', inputs: { unet_name: 'wan2.2_ti2v_5B_fp16.safetensors', weight_dtype: 'default' } },
  '38': { class_type: 'CLIPLoader', inputs: { clip_name: 'umt5_xxl_fp8_e4m3fn_scaled.safetensors', type: 'wan' } },
  '39': { class_type: 'VAELoader', inputs: { vae_name: 'wan2.2_vae.safetensors' } },
  '56': { class_type: 'LoadImage', inputs: { image: 'example.png' } },
  '6': { class_type: 'CLIPTextEncode', inputs: { text: 'a cat surfing', clip: ['38', 0] } },
  '7': { class_type: 'CLIPTextEncode', inputs: { text: 'blurry, static', clip: ['38', 0] } },
  '55': { class_type: 'Wan22ImageToVideoLatent', inputs: { vae: ['39', 0], start_image: ['56', 0], width: 1280, height: 704, length: 121, batch_size: 1 } },
  '3': { class_type: 'KSampler', inputs: { seed: 5, steps: 20, cfg: 5, model: ['37', 0], positive: ['6', 0], negative: ['7', 0], latent_image: ['55', 0] } },
  '8': { class_type: 'VAEDecode', inputs: { samples: ['3', 0], vae: ['39', 0] } },
  '57': { class_type: 'CreateVideo', inputs: { images: ['8', 0], fps: 24 } },
  '58': { class_type: 'SaveVideo', inputs: { video: ['57', 0], filename_prefix: 'video/ComfyUI', format: 'auto', codec: 'auto' } },
};

/** Wan 2.1 style: the prompts go through an image-to-video node before the sampler. */
const wan21 = {
  '52': { class_type: 'LoadImage', inputs: { image: 'x.png' } },
  '6': { class_type: 'CLIPTextEncode', inputs: { text: 'old', clip: ['38', 0] } },
  '7': { class_type: 'CLIPTextEncode', inputs: { text: 'neg', clip: ['38', 0] } },
  '50': { class_type: 'WanImageToVideo', inputs: { positive: ['6', 0], negative: ['7', 0], start_image: ['52', 0], width: 832, height: 480, length: 33 } },
  '3': { class_type: 'KSampler', inputs: { seed: 1, positive: ['50', 0], negative: ['50', 1], latent_image: ['50', 2] } },
  '9': { class_type: 'SamplerCustomAdvanced', inputs: { noise: ['10', 0] } },
  '10': { class_type: 'RandomNoise', inputs: { noise_seed: 77 } },
};

describe('animation workflow', () => {
  it('fills a Wan 2.2 template without any placeholders', () => {
    const wf = prepareAnimateWorkflow(JSON.stringify(wan22), values);
    expect(wf['56']!.inputs.image).toBe('halcyon_c1_x.png');
    expect(wf['6']!.inputs.text).toBe('She laughs.');
    expect(wf['7']!.inputs.text).toBe('blurry, static'); // the template's own negative is kept
    expect(wf['3']!.inputs.seed).toBe(1234);
    expect(wf['55']!.inputs.length).toBe(121); // everything else untouched
  });

  it('finds the prompt behind an image-to-video node, and sets noise seeds too', () => {
    const wf = prepareAnimateWorkflow(JSON.stringify(wan21), values);
    expect(wf['6']!.inputs.text).toBe('She laughs.');
    expect(wf['7']!.inputs.text).toBe('neg');
    expect(wf['10']!.inputs.noise_seed).toBe(1234);
  });

  it('honours placeholders instead of guessing', () => {
    const src = JSON.stringify({
      '1': { class_type: 'LoadImage', inputs: { image: 'a.png' } },
      '2': { class_type: 'LoadImage', inputs: { image: '%IMAGE%' } },
      '3': { class_type: 'SomeTextEncode', inputs: { prompt: '%PROMPT%, "quoted"' } },
      '4': { class_type: 'CLIPTextEncode', inputs: { text: '%NEGATIVE%' } },
      '5': { class_type: 'KSampler', inputs: { seed: '%SEED%', other_seed: 3 } },
    });
    const wf = prepareAnimateWorkflow(src, { ...values, prompt: 'Say "hi"' });
    expect(wf['1']!.inputs.image).toBe('a.png');
    expect(wf['2']!.inputs.image).toBe('halcyon_c1_x.png');
    expect(wf['3']!.inputs.prompt).toBe('Say "hi", "quoted"');
    expect(wf['4']!.inputs.text).toBe('static');
    expect(wf['5']!.inputs.seed).toBe(1234);
  });

  it('explains what is wrong with an unusable workflow', () => {
    expect(() => prepareAnimateWorkflow('{nope', values)).toThrow(WorkflowError);
    expect(() => prepareAnimateWorkflow(JSON.stringify({ nodes: [], links: [] }), values)).toThrow(/API format/);
    const noImage = { ...wan22 } as Record<string, unknown>;
    delete noImage['56'];
    expect(() => prepareAnimateWorkflow(JSON.stringify(noImage), values)).toThrow(/no Load Image/);
    const two = { ...wan22, '99': { class_type: 'LoadImage', inputs: { image: 'b.png' } } };
    expect(() => prepareAnimateWorkflow(JSON.stringify(two), values)).toThrow(/several Load Image/);
  });

  it('picks the MP4 from any output list, and reports other files', () => {
    expect(findClip({ '58': { images: [{ filename: 'ComfyUI_00001_.mp4', subfolder: 'video', type: 'output' }], animated: [true] } }).clip)
      .toEqual({ filename: 'ComfyUI_00001_.mp4', subfolder: 'video', type: 'output' });
    expect(findClip({ '9': { gifs: [{ filename: 'a.webm' }, { filename: 'a.mp4' }] } }).clip?.filename).toBe('a.mp4');
    expect(findClip({ '9': { images: [{ filename: 'a.webp' }] } })).toEqual({ clip: null, other: ['a.webp'] });
  });

  it('puts the movement first in the prompt', () => {
    expect(motionPrompt('Noor on the ferry.', 'she laughs.')).toMatch(/^she laughs\. Noor on the ferry\./);
    expect(motionPrompt('Noor on the ferry.')).toMatch(/^Subtle, natural movement/);
  });
});
