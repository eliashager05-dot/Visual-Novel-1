import { describe, expect, it } from 'vitest';
import { describeFailure } from '../../scripts/ai/comfy';

describe('ComfyUI error messages', () => {
  it('reads the classic [type, data] format, with the node that failed', () => {
    const msg = describeFailure({
      status: {
        status_str: 'error',
        messages: [
          ['execution_start', { prompt_id: 'x' }],
          ['execution_error', { exception_type: 'torch.OutOfMemoryError', exception_message: 'CUDA out of memory', node_type: 'KSampler', node_id: '3' }],
        ],
      },
    });
    expect(msg).toBe('torch.OutOfMemoryError: CUDA out of memory (in KSampler #3)');
  });

  it('reads object-shaped messages and plain error strings', () => {
    expect(describeFailure({ status: { status_str: 'error', messages: [{ type: 'execution_error', data: { exception_message: 'bad sampler' } }] } })).toBe('bad sampler');
    expect(describeFailure({ status: { status_str: 'error', messages: [['error', { error: 'model failed to load' }]] } })).toBe('model failed to load');
    expect(describeFailure({ status: { status_str: 'error', messages: [['execution_interrupted', {}]] } })).toBe('interrupted');
  });

  it('falls back to the raw status instead of "unknown error"', () => {
    const msg = describeFailure({ status: { status_str: 'error', completed: false, messages: [] } });
    expect(msg).toContain('no error message was included');
    expect(msg).toContain('"status_str":"error"');
  });
});
