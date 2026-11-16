import { audio, tone } from './sound';

// A little piano. Each note is a few sine waves stacked (the note plus a few overtones) that fade
// away, which is enough to sound piano-like without any audio files.

function playNote(freq: number): void {
  if (!audio()) return;
  const dur = Math.max(0.9, 2.2 - freq / 600); // low notes ring longer than high ones
  const partials: [number, number][] = [[1, 0.34], [2, 0.14], [3, 0.07], [4, 0.03]];
  for (const [mult, vol] of partials) {
    tone({ freq: freq * mult, dur: dur / (1 + (mult - 1) * 0.35), type: 'sine', vol, attack: 0.004 });
  }
}

type Song = { name: string; notes: [string, number][] };

const twinkle: [string, number][] = [
  ['C4', 1], ['C4', 1], ['G4', 1], ['G4', 1], ['A4', 1], ['A4', 1], ['G4', 2],
  ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 1], ['D4', 1], ['C4', 2],
  ['G4', 1], ['G4', 1], ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 2],
  ['G4', 1], ['G4', 1], ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 2],
  ['C4', 1], ['C4', 1], ['G4', 1], ['G4', 1], ['A4', 1], ['A4', 1], ['G4', 2],
  ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 1], ['D4', 1], ['C4', 2],
];
const ode: [string, number][] = [
  ['E4', 1], ['E4', 1], ['F4', 1], ['G4', 1], ['G4', 1], ['F4', 1], ['E4', 1], ['D4', 1],
  ['C4', 1], ['C4', 1], ['D4', 1], ['E4', 1], ['E4', 1.5], ['D4', 0.5], ['D4', 2],
  ['E4', 1], ['E4', 1], ['F4', 1], ['G4', 1], ['G4', 1], ['F4', 1], ['E4', 1], ['D4', 1],
  ['C4', 1], ['C4', 1], ['D4', 1], ['E4', 1], ['D4', 1.5], ['C4', 0.5], ['C4', 2],
];
export const songs: Record<string, Song> = {
  twinkle: { name: 'Twinkle Twinkle', notes: twinkle },
  ode: { name: 'Ode to Joy', notes: ode },
};

export function initPiano(root: HTMLElement, controls: { stop: HTMLElement; songButtons: HTMLElement[] }): void {
  const keys = Array.from(root.querySelectorAll<HTMLButtonElement>('.key'));
  const byNote = new Map(keys.map((k) => [k.dataset.note!, k]));
  const byKb = new Map(keys.map((k) => [k.dataset.kb!, k]));

  const down = (k: HTMLElement) => k.classList.add('down');
  const up = (k: HTMLElement) => k.classList.remove('down');
  const press = (k: HTMLElement) => { down(k); playNote(Number(k.dataset.f)); };

  // Mouse and touch. Sliding a finger or the mouse across the keys plays each one.
  const active = new Map<number, HTMLElement>();
  const keyAt = (x: number, y: number) => document.elementFromPoint(x, y)?.closest<HTMLElement>('.key') ?? null;
  root.addEventListener('pointerdown', (e) => {
    const k = (e.target as Element).closest<HTMLElement>('.key');
    if (!k) return;
    e.preventDefault();
    active.set(e.pointerId, k);
    press(k);
  });
  root.addEventListener('pointermove', (e) => {
    const cur = active.get(e.pointerId);
    if (!cur) return;
    const k = keyAt(e.clientX, e.clientY);
    if (k && k !== cur) {
      up(cur);
      active.set(e.pointerId, k);
      press(k);
    }
  });
  const release = (e: PointerEvent) => {
    const cur = active.get(e.pointerId);
    if (cur) { up(cur); active.delete(e.pointerId); }
  };
  root.addEventListener('pointerup', release);
  root.addEventListener('pointercancel', release);
  // Enter or Space on a focused key (these arrive as a click with no pointer).
  root.addEventListener('click', (e) => {
    if (e.detail !== 0) return;
    const k = (e.target as Element).closest<HTMLElement>('.key');
    if (k) { press(k); setTimeout(() => up(k), 150); }
  });

  // Computer keyboard: A S D F G H J K L ; for the white keys, W E T Y U O P for the black ones.
  window.addEventListener('keydown', (e) => {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = byKb.get(e.key.toLowerCase());
    if (!k) return;
    e.preventDefault();
    press(k);
  });
  window.addEventListener('keyup', (e) => {
    const k = byKb.get(e.key.toLowerCase());
    if (k) up(k);
  });

  // Songs that play themselves, lighting up the keys.
  let timers: number[] = [];
  const stop = () => { timers.forEach(clearTimeout); timers = []; keys.forEach(up); };
  const play = (song: Song) => {
    stop();
    if (!audio()) return;
    const beat = 420; // milliseconds
    let t = 250;
    for (const [note, beats] of song.notes) {
      const k = byNote.get(note);
      const at = t;
      if (k) {
        timers.push(window.setTimeout(() => press(k), at));
        timers.push(window.setTimeout(() => up(k), at + Math.min(beat * beats * 0.8, 600)));
      }
      t += beat * beats;
    }
    timers.push(window.setTimeout(stop, t + 200));
  };
  controls.songButtons.forEach((b) => b.addEventListener('click', () => play(songs[b.dataset.song!])));
  controls.stop.addEventListener('click', stop);
}
