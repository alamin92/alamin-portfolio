import { audio, tone, whoosh } from './sound';

// Sounds made from oscillators and noise: sweeping pitches, wobble and filtering. They are not
// recordings, so think of them as cartoon versions of the real thing.

export const sounds: Record<string, () => void> = {
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

  // Drum: a short beat and a fill (kick, hi-hat, snare, then three toms).
  drum() {
    const kick = (d: number) => {
      tone({ freq: 170, freq2: 45, dur: 0.28, type: 'sine', vol: 0.38, delay: d, attack: 0.003 });
      tone({ freq: 90, freq2: 40, dur: 0.2, type: 'triangle', vol: 0.14, delay: d, attack: 0.003 });
    };
    const snare = (d: number) => {
      whoosh(0.17, 3200, 1800, 0.24, d, 0.04);
      tone({ freq: 210, freq2: 150, dur: 0.1, type: 'triangle', vol: 0.14, delay: d, attack: 0.002 });
    };
    const hat = (d: number) => whoosh(0.05, 9500, 8500, 0.1, d, 0.05);
    const tom = (d: number, f: number) => tone({ freq: f, freq2: f * 0.55, dur: 0.3, type: 'sine', vol: 0.28, delay: d, attack: 0.003 });
    kick(0); hat(0);
    hat(0.2);
    snare(0.4); hat(0.4);
    hat(0.6); kick(0.6);
    kick(0.8); hat(0.8);
    snare(1.0); hat(1.0);
    tom(1.22, 260); tom(1.36, 200); tom(1.5, 150);
    kick(1.7); snare(1.7);
  },

  // Dreamcatcher: a soft breeze with tiny bells, like feathers and beads in the wind.
  dreamcatcher() {
    whoosh(3.2, 500, 1700, 0.045, 0, 0.5);
    const bell = (d: number, f: number) => {
      tone({ freq: f, dur: 1.7, type: 'sine', vol: 0.09, delay: d, attack: 0.004 });
      tone({ freq: f * 2.76, dur: 0.9, type: 'sine', vol: 0.03, delay: d, attack: 0.004 });
    };
    // A gentle pentatonic run: C, D, E, G, A.
    const notes: [number, number][] = [[0.15, 1318.5], [0.55, 1568], [0.95, 1046.5], [1.5, 1760], [1.85, 1174.7], [2.35, 1568]];
    notes.forEach(([d, f]) => bell(d, f));
  },

  // Thunder: a sharp crack, a long low rumble, and some rain.
  thunder() {
    whoosh(0.09, 3500, 900, 0.3, 0, 0.05);
    whoosh(2.6, 150, 50, 0.5, 0.08, 0.2);
    whoosh(2.4, 7000, 5500, 0.05, 0, 0.3);
    tone({ freq: 70, freq2: 38, dur: 1.8, type: 'sine', vol: 0.25, delay: 0.1, attack: 0.05 });
  },
};

export function initSoundBoard(tiles: HTMLElement[]): void {
  for (const tile of tiles) {
    tile.addEventListener('click', () => {
      const play = sounds[tile.dataset.sound!];
      if (!play || !audio()) return;
      play();
      tile.classList.remove('playing');
      void tile.offsetWidth; // restart the little bounce
      tile.classList.add('playing');
    });
  }
}
