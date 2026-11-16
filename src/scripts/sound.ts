// Tiny sound engine built on the Web Audio API. Every sound is made from oscillators and noise,
// so there are no audio files to download. Browsers only allow audio after a click or tap, so the
// audio context is created lazily from a user gesture.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;

const KEY = 'portfolio-sound';

/** Get (or create) the audio context. Call this from a click, tap or key press. */
export function audio(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.85;
      // A gentle compressor keeps chords and fast taps from clipping.
      const comp = ctx.createDynamicsCompressor();
      master.connect(comp);
      comp.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** The "sound effects" switch in the header. Off by default, remembered in this browser. */
export function soundOn(): boolean {
  try { return localStorage.getItem(KEY) === 'on'; } catch { return false; }
}
export function setSound(on: boolean): void {
  try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* private mode: just don't remember */ }
}

export interface ToneOptions {
  freq: number;
  /** Glide to this frequency over the length of the sound. */
  freq2?: number;
  dur: number;
  type?: OscillatorType;
  vol?: number;
  /** Seconds from now. */
  delay?: number;
  attack?: number;
  /** Wobble the pitch (birds, wolves, owls). */
  vibrato?: { rate: number; depth: number };
  /** Wobble the loudness (frogs, crickets). */
  tremolo?: { rate: number; depth: number };
  filter?: { type: BiquadFilterType; freq: number; q?: number };
}

/** Play one note or chirp. */
export function tone(o: ToneOptions): void {
  const c = audio();
  if (!c || !master) return;
  const t0 = c.currentTime + (o.delay ?? 0);
  const t1 = t0 + o.dur;
  const vol = o.vol ?? 0.2;
  const attack = Math.min(o.attack ?? 0.01, o.dur / 2);

  const osc = c.createOscillator();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.freq2 && o.freq2 !== o.freq) osc.frequency.exponentialRampToValueAtTime(o.freq2, t1);

  const env = c.createGain();
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(vol, t0 + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, t1);

  let node: AudioNode = osc;
  if (o.filter) {
    const f = c.createBiquadFilter();
    f.type = o.filter.type;
    f.frequency.value = o.filter.freq;
    f.Q.value = o.filter.q ?? 1;
    node.connect(f);
    node = f;
  }
  node.connect(env);
  env.connect(master);

  const extras: OscillatorNode[] = [];
  if (o.vibrato) {
    const lfo = c.createOscillator();
    const depth = c.createGain();
    lfo.frequency.value = o.vibrato.rate;
    depth.gain.value = o.vibrato.depth;
    lfo.connect(depth);
    depth.connect(osc.frequency);
    extras.push(lfo);
  }
  if (o.tremolo) {
    const lfo = c.createOscillator();
    const depth = c.createGain();
    lfo.frequency.value = o.tremolo.rate;
    depth.gain.value = o.tremolo.depth * vol;
    lfo.connect(depth);
    depth.connect(env.gain);
    extras.push(lfo);
  }

  osc.start(t0);
  osc.stop(t1 + 0.05);
  extras.forEach((e) => { e.start(t0); e.stop(t1 + 0.05); });
}

/** A burst of filtered noise that sweeps in pitch: whooshes, breath, rustle. */
export function whoosh(dur: number, from: number, to: number, vol = 0.08, delay = 0, peak = 0.35): void {
  const c = audio();
  if (!c || !master) return;
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t0 = c.currentTime + delay;
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = 1.2;
  f.frequency.setValueAtTime(from, t0);
  f.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const env = c.createGain();
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(vol, t0 + dur * peak);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f);
  f.connect(env);
  env.connect(master);
  src.start(t0);
  src.stop(t0 + dur + 0.05);
}

// ---- Interface sound ----
// Just one, very quiet: a soft breath of air when the About photo flips. It only plays when the
// header switch is on. There are no click or ping sounds.

export const ui = {
  flip() {
    if (!soundOn()) return;
    whoosh(0.3, 500, 2400, 0.09);
  },
};
