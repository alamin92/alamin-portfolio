import { audio, tone } from './sound';

// Animal "impressions" made from oscillators: sweeping pitches, wobble and filtering. They are not
// recordings, so think of them as cartoon versions of the real thing.

const chirp = (delay: number, f1: number, f2: number, dur: number, vol = 0.12) =>
  tone({ freq: f1, freq2: f2, dur, type: 'sine', vol, delay, attack: 0.008, vibrato: { rate: 26, depth: 35 } });

export const animals: Record<string, () => void> = {
  // Ruby: quick rising chirps, then a longer "tweeet".
  ruby() {
    chirp(0, 2300, 3000, 0.11);
    chirp(0.16, 2400, 3200, 0.11);
    chirp(0.32, 2500, 3400, 0.11);
    tone({ freq: 2800, freq2: 3800, dur: 0.34, type: 'sine', vol: 0.12, delay: 0.52, attack: 0.02, vibrato: { rate: 18, depth: 60 } });
  },

  // Tiki: a little whistled tune, the classic cockatiel call.
  tiki() {
    const notes: [number, number, number][] = [[1900, 0.0, 0.15], [2350, 0.19, 0.15], [1750, 0.38, 0.15]];
    for (const [f, d, dur] of notes) {
      tone({ freq: f, freq2: f * 1.05, dur, type: 'sine', vol: 0.13, delay: d, attack: 0.015, vibrato: { rate: 6, depth: 22 } });
    }
    tone({ freq: 2150, freq2: 1500, dur: 0.38, type: 'sine', vol: 0.13, delay: 0.58, attack: 0.02, vibrato: { rate: 7, depth: 30 } });
  },

  // Owl: soft, low "hoo, hoo-hoo, hooooo".
  owl() {
    const hoo = (delay: number, dur: number, f1: number, f2: number) => {
      tone({ freq: f1, freq2: f2, dur, type: 'sine', vol: 0.24, delay, attack: 0.06, filter: { type: 'lowpass', freq: 900 } });
      tone({ freq: f1 * 2, freq2: f2 * 2, dur, type: 'sine', vol: 0.05, delay, attack: 0.06 });
    };
    hoo(0, 0.34, 430, 360);
    hoo(0.55, 0.22, 410, 365);
    hoo(0.85, 0.22, 410, 365);
    hoo(1.2, 0.8, 400, 290);
  },

  // Wolf: a long rising howl that trails off.
  wolf() {
    tone({ freq: 330, freq2: 780, dur: 1.0, type: 'triangle', vol: 0.2, attack: 0.18, vibrato: { rate: 5.5, depth: 9 } });
    tone({ freq: 780, freq2: 430, dur: 1.7, type: 'triangle', vol: 0.2, delay: 0.98, attack: 0.02, vibrato: { rate: 5.5, depth: 12 } });
    tone({ freq: 660, freq2: 1560, dur: 1.0, type: 'sine', vol: 0.04, attack: 0.18 });
  },

  // Cricket: three bursts of tiny, very high pulses.
  cricket() {
    for (let c = 0; c < 3; c++) {
      for (let p = 0; p < 4; p++) {
        tone({ freq: 4300, dur: 0.04, type: 'sine', vol: 0.07, delay: c * 0.5 + p * 0.065, attack: 0.004 });
      }
    }
  },

  // Frog: a rough, low "ri-bbit".
  frog() {
    const croak = (delay: number, dur: number, f1: number, f2: number) =>
      tone({ freq: f1, freq2: f2, dur, type: 'sawtooth', vol: 0.2, delay, attack: 0.015, tremolo: { rate: 48, depth: 0.7 }, filter: { type: 'bandpass', freq: 700, q: 4 } });
    croak(0, 0.12, 150, 220);
    croak(0.17, 0.2, 180, 270);
    croak(0.75, 0.12, 150, 220);
    croak(0.92, 0.2, 180, 270);
  },

  // Cat: "mee-ow" with the pitch going up and then down.
  cat() {
    const formant = { type: 'bandpass' as BiquadFilterType, freq: 1400, q: 2.5 };
    tone({ freq: 430, freq2: 800, dur: 0.26, type: 'sawtooth', vol: 0.22, attack: 0.04, filter: formant });
    tone({ freq: 800, freq2: 330, dur: 0.55, type: 'sawtooth', vol: 0.22, delay: 0.25, attack: 0.01, vibrato: { rate: 6, depth: 14 }, filter: formant });
  },

  // Dog: "woof, woof."
  dog() {
    const woof = (delay: number) => {
      tone({ freq: 320, freq2: 140, dur: 0.16, type: 'sawtooth', vol: 0.28, delay, attack: 0.008, filter: { type: 'lowpass', freq: 1400 } });
      tone({ freq: 160, freq2: 90, dur: 0.18, type: 'square', vol: 0.06, delay, attack: 0.008, filter: { type: 'lowpass', freq: 600 } });
    };
    woof(0);
    woof(0.27);
  },

  // Deer: a fawn's nasal little bleat.
  deer() {
    const bleat = (delay: number, f1: number, f2: number) =>
      tone({ freq: f1, freq2: f2, dur: 0.5, type: 'sawtooth', vol: 0.16, delay, attack: 0.03, tremolo: { rate: 28, depth: 0.8 }, filter: { type: 'bandpass', freq: 1500, q: 3 } });
    bleat(0, 540, 440);
    bleat(0.7, 500, 400);
  },
};

export function initCritters(tiles: HTMLElement[]): void {
  for (const tile of tiles) {
    tile.addEventListener('click', () => {
      const play = animals[tile.dataset.animal!];
      if (!play || !audio()) return;
      play();
      tile.classList.remove('playing');
      void tile.offsetWidth; // restart the little bounce
      tile.classList.add('playing');
    });
  }
}
