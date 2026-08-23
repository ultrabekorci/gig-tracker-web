import { Client } from "@/types";

/** Ignores apostrophe variants so "o'zbek" and "oʻzbek" compare equal. */
function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[''`ʻʼ’]/g, "").trim();
}

/**
 * Finds the workplace a bot message referred to. Uzbek attaches case endings to
 * the name ("Yekaterinada", "Emartda"), so a prefix match is what works.
 */
export function matchWorkplace(text: string, workplaces: Client[]): Client | null {
  const haystack = normalizeName(text);
  if (!haystack) return null;

  const words = haystack.split(/\s+/);

  let best: Client | null = null;
  let bestKeyLength = 0;

  for (const wp of workplaces) {
    const name = normalizeName(wp.name);
    if (!name) continue;

    // "Zavod / Smena" is also referred to as just "zavod", so its leading word
    // counts as a key too (short ones are too generic to be safe).
    const leading = name.split(/[\s/(,-]+/)[0];
    const keys = leading.length >= 4 && leading !== name ? [name, leading] : [name];

    for (const key of keys) {
      const hit =
        haystack.includes(key) ||
        words.some((word) => word.startsWith(key) && word.length - key.length <= 5);

      // Prefer the most specific key, so "Zavod / Smena" beats a bare "Zavod".
      if (hit && key.length > bestKeyLength) {
        best = wp;
        bestKeyLength = key.length;
      }
    }
  }

  return best;
}
