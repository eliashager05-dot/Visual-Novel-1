/**
 * Synthesised stand-ins for sound effects, played only when no real file has
 * been added for that id. Rough by design: they mark the moment and its
 * mood, not the final sound.
 */

type Synth = (ctx: AudioContext, out: AudioNode) => void;

function noiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * seconds)), ctx.sampleRate);
  const d = buf.getChannelData(0);
  // Brown-ish noise: softer and more natural than white noise.
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    d[i] = last * 3.5;
  }
  return buf;
}

/** A filtered noise burst with an attack/decay envelope. */
function noise(ctx: AudioContext, out: AudioNode, o: { dur: number; type: BiquadFilterType; freq: number; q?: number; attack?: number; gain?: number; delay?: number; sweepTo?: number }) {
  const t = ctx.currentTime + (o.delay ?? 0);
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, o.dur);
  const f = ctx.createBiquadFilter();
  f.type = o.type;
  f.frequency.setValueAtTime(o.freq, t);
  if (o.sweepTo) f.frequency.exponentialRampToValueAtTime(o.sweepTo, t + o.dur);
  f.Q.value = o.q ?? 0.7;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(o.gain ?? 0.8, t + (o.attack ?? 0.01));
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
  src.connect(f).connect(g).connect(out);
  src.start(t);
  src.stop(t + o.dur + 0.05);
}

/** An oscillator note with an envelope, optional pitch glide. */
function tone(ctx: AudioContext, out: AudioNode, o: { freq: number; dur: number; type?: OscillatorType; gain?: number; attack?: number; delay?: number; glideTo?: number }) {
  const t = ctx.currentTime + (o.delay ?? 0);
  const osc = ctx.createOscillator();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(o.freq, t);
  if (o.glideTo) osc.frequency.exponentialRampToValueAtTime(o.glideTo, t + o.dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(o.gain ?? 0.3, t + (o.attack ?? 0.01));
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
  osc.connect(g).connect(out);
  osc.start(t);
  osc.stop(t + o.dur + 0.05);
}

const SYNTHS: Record<string, Synth> = {
  thunder: (c, o) => {
    noise(c, o, { dur: 0.35, type: 'lowpass', freq: 2500, gain: 0.9 });
    noise(c, o, { dur: 5, type: 'lowpass', freq: 220, attack: 0.15, gain: 1, delay: 0.1, sweepTo: 70 });
  },
  rain_heavy: (c, o) => noise(c, o, { dur: 5, type: 'highpass', freq: 900, attack: 1.2, gain: 0.35 }),
  splash: (c, o) => {
    for (let i = 0; i < 4; i++) noise(c, o, { dur: 0.25, type: 'bandpass', freq: 1400 + i * 200, q: 1.2, gain: 0.5, delay: i * 0.32 });
  },
  power_down: (c, o) => {
    tone(c, o, { freq: 120, dur: 1.4, type: 'sawtooth', gain: 0.12, glideTo: 30 });
    noise(c, o, { dur: 0.06, type: 'highpass', freq: 3000, gain: 0.6, delay: 1.4 });
  },
  piano_note: (c, o) => {
    for (const [mult, g] of [[1, 0.35], [2, 0.12], [3, 0.06], [4.02, 0.03]] as const) tone(c, o, { freq: 110 * mult, dur: 3.5, type: 'sine', gain: g, attack: 0.005 });
  },
  ferry_horn: (c, o) => {
    for (const f of [82, 123, 164]) tone(c, o, { freq: f, dur: 2.6, type: 'sawtooth', gain: 0.07, attack: 0.25 });
  },
  phone_buzz: (c, o) => {
    for (const d of [0, 0.5]) tone(c, o, { freq: 160, dur: 0.32, type: 'square', gain: 0.08, delay: d });
  },
  phone_message: (c, o) => {
    tone(c, o, { freq: 880, dur: 0.18, gain: 0.25 });
    tone(c, o, { freq: 1320, dur: 0.35, gain: 0.25, delay: 0.14 });
  },
  door_creak: (c, o) => tone(c, o, { freq: 180, dur: 1.3, type: 'sawtooth', gain: 0.06, attack: 0.2, glideTo: 320 }),
  glass_clink: (c, o) => {
    for (const d of [0, 0.09]) for (const f of [2637, 3951]) tone(c, o, { freq: f, dur: 0.6, gain: 0.08, delay: d });
  },
  key_turn: (c, o) => {
    for (const d of [0, 0.22]) noise(c, o, { dur: 0.05, type: 'bandpass', freq: 2500, q: 3, gain: 0.7, delay: d });
  },
  car_door: (c, o) => {
    noise(c, o, { dur: 0.3, type: 'lowpass', freq: 400, gain: 1 });
    noise(c, o, { dur: 0.05, type: 'bandpass', freq: 2000, q: 2, gain: 0.4, delay: 0.02 });
  },
  gull: (c, o) => {
    for (const d of [0, 0.45, 0.8]) tone(c, o, { freq: 1500, dur: 0.3, type: 'triangle', gain: 0.07, delay: d, glideTo: 900 });
  },
};

export function hasPlaceholderSfx(id: string): boolean {
  return id in SYNTHS;
}

export function playPlaceholderSfx(ctx: AudioContext, out: AudioNode, id: string): boolean {
  const synth = SYNTHS[id];
  if (!synth) return false;
  synth(ctx, out);
  return true;
}
