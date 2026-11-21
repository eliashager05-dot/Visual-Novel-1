import { musicSrc, sfxSrc } from '@/lib/assetResolver';
import { playPlaceholderSfx } from './placeholderSfx';

/**
 * Plays music and sound effects. Lives outside React so fades are smooth and
 * nothing restarts on re-render. Browsers block sound until the first click
 * or key press, so anything requested before that is retried then.
 */

const DEFAULT_FADE = 2;

interface Channel {
  id: string;
  el: HTMLAudioElement;
  /** 0..1 fade level, multiplied by the music volume. */
  level: number;
  target: number;
  /** Level change per second. */
  rate: number;
}

class AudioEngine {
  private musicVolume = 0.7;
  private sfxVolume = 0.8;
  private muted = false;
  private channels: Channel[] = [];
  private current: string | null = null;
  private raf = 0;
  private last = 0;
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private unlockBound = false;

  setVolumes(music: number, sfx: number, muted: boolean) {
    this.musicVolume = music;
    this.sfxVolume = sfx;
    this.muted = muted;
    for (const c of this.channels) c.el.volume = this.effective(c.level);
    if (this.sfxGain) this.sfxGain.gain.value = muted ? 0 : sfx;
  }

  /** Switches music, cross-fading over `fade` seconds. `null` fades out. Same track = no change. */
  playMusic(id: string | null, fade = DEFAULT_FADE) {
    if (id === this.current) return;
    this.current = id;
    const rate = (seconds: number) => (seconds <= 0 ? Infinity : 1 / seconds);
    for (const c of this.channels) {
      c.target = 0;
      c.rate = rate(fade);
    }
    const src = id ? musicSrc(id) : null;
    if (id && src) {
      const el = new Audio(src);
      el.loop = true;
      el.preload = 'auto';
      el.volume = 0;
      const ch: Channel = { id, el, level: 0, target: 1, rate: rate(fade) };
      this.channels.push(ch);
      this.start(el);
    }
    this.tick();
  }

  playSfx(id: string) {
    if (this.muted || this.sfxVolume <= 0) return;
    const src = sfxSrc(id);
    if (src) {
      const el = new Audio(src);
      el.volume = this.sfxVolume;
      void el.play().catch(() => undefined); // a missed one-shot is not worth retrying later
      return;
    }
    const ctx = this.context();
    const gain = this.sfxGain;
    if (!ctx || !gain) return;
    if (ctx.state === 'running') {
      playPlaceholderSfx(ctx, gain, id);
      return;
    }
    // A new context can start suspended; play once it resumes, unless that takes too long to still fit the moment.
    const asked = performance.now();
    void ctx.resume().then(() => {
      if (performance.now() - asked < 400) playPlaceholderSfx(ctx, gain, id);
    });
  }

  /** For the debug handle and tests. */
  snapshot() {
    return {
      current: this.current,
      channels: this.channels.map((c) => ({ id: c.id, level: Number(c.level.toFixed(2)), volume: Number(c.el.volume.toFixed(2)), paused: c.el.paused })),
      muted: this.muted,
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      context: this.ctx?.state ?? 'none',
    };
  }

  private effective(level: number) {
    return this.muted ? 0 : Math.max(0, Math.min(1, level * this.musicVolume));
  }

  private start(el: HTMLAudioElement) {
    el.play().catch(() => this.unlockLater());
  }

  private context(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    this.ctx = new Ctor();
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = this.muted ? 0 : this.sfxVolume;
    this.sfxGain.connect(this.ctx.destination);
    if (this.ctx.state !== 'running') this.unlockLater();
    return this.ctx;
  }

  /** Retries playback on the first user gesture (browser autoplay rules). */
  private unlockLater() {
    if (this.unlockBound) return;
    this.unlockBound = true;
    const unlock = () => {
      this.unlockBound = false;
      window.removeEventListener('pointerdown', unlock, true);
      window.removeEventListener('keydown', unlock, true);
      void this.ctx?.resume();
      for (const c of this.channels) if (c.target > 0 && c.el.paused) this.start(c.el);
    };
    window.addEventListener('pointerdown', unlock, true);
    window.addEventListener('keydown', unlock, true);
  }

  /** Moves every channel toward its target level; drops channels that have faded out. */
  private tick = () => {
    cancelAnimationFrame(this.raf);
    this.last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.1, (now - this.last) / 1000);
      this.last = now;
      let moving = false;
      for (const c of this.channels) {
        if (c.level !== c.target) {
          const delta = c.rate === Infinity ? 1 : c.rate * dt;
          c.level = c.level < c.target ? Math.min(c.target, c.level + delta) : Math.max(c.target, c.level - delta);
          moving = true;
        }
        c.el.volume = this.effective(c.level);
      }
      const done = this.channels.filter((c) => c.target === 0 && c.level === 0);
      for (const c of done) {
        c.el.pause();
        c.el.removeAttribute('src');
        c.el.load();
      }
      this.channels = this.channels.filter((c) => !done.includes(c));
      if (moving) this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  };
}

export const audioEngine = new AudioEngine();
