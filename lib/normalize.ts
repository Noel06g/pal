/** Lowercase, trim, and strip diacritics (Noël → noel, Çela → cela). */
export function deaccent(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

/**
 * Normalized email used as the real uniqueness key for expert profiles
 * (dedup + account claim matching). Returns null if it isn't an email.
 */
export function normalizeEmail(s: string): string | null {
  const t = deaccent(s.trim().toLowerCase());
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t) ? t : null;
}

export function looksLikeEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}
