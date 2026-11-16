// How long someone has been on the site. The start time is kept in sessionStorage, so it carries
// across pages in the same tab and ends when the tab is closed. It is never sent anywhere.

const KEY = 'portfolio-visit-start';
const loadedAt = Date.now(); // used if the browser blocks storage

export function visitStart(): number {
  try {
    const saved = Number(sessionStorage.getItem(KEY));
    if (saved > 0) return saved;
    sessionStorage.setItem(KEY, String(loadedAt));
  } catch {
    /* storage blocked: count from this page load */
  }
  return loadedAt;
}

/** The elapsed time as hh:mm:ss. */
export function elapsedText(): string {
  const total = Math.max(0, Math.floor((Date.now() - visitStart()) / 1000));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}
