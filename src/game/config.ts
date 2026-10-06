export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 720;
export const HS_KEY = 'GAME_IPOOOEL';

export function getHighScore(): number {
  try {
    return parseInt(localStorage.getItem(HS_KEY) || '0', 10) || 0;
  } catch {
    return 0;
  }
}

export function saveHighScore(score: number): boolean {
  const current = getHighScore();
  if (score > current) {
    try {
      localStorage.setItem(HS_KEY, String(score));
    } catch {
      /* ignore */
    }
    return true;
  }
  return false;
}

export const FONT = '"Trebuchet MS", "Segoe UI", sans-serif';
