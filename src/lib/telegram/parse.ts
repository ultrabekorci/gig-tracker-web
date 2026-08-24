export type EntryType = "INCOME" | "EXPENSE";

export interface ParsedEntry {
  type: EntryType;
  amount: number;
  description: string;
  /** Local "YYYY-MM-DD" when the message named a day; today otherwise. */
  date?: string;
}

const MONTHS: Record<string, number> = {
  yanvar: 1,
  fevral: 2,
  mart: 3,
  aprel: 4,
  may: 5,
  iyun: 6,
  iyul: 7,
  avgust: 8,
  sentabr: 9,
  sentyabr: 9,
  oktabr: 10,
  oktyabr: 10,
  noyabr: 11,
  dekabr: 12,
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function shiftDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return dateKey(d);
}

interface FoundDate {
  date: string;
  matched: string;
}

/**
 * Pulls a day out of the message: "bugun", "kecha", "12-avgust", "15.08.2026".
 * Runs before the amount is read, so the day's digits are never mistaken for
 * the amount.
 */
export function extractDate(text: string, today: Date = new Date()): FoundDate | null {
  const lower = text.toLowerCase();

  if (/\bbugun\b/.test(lower)) return { date: dateKey(today), matched: "" };
  if (/\bkecha(gi)?\b/.test(lower)) return { date: shiftDays(-1), matched: "" };
  if (/\bertaga\b/.test(lower)) return { date: shiftDays(1), matched: "" };

  // "12-avgust", "12 avgust", "avgustning 12si"
  const named =
    lower.match(new RegExp(`(\\d{1,2})\\s*-?\\s*(${Object.keys(MONTHS).join("|")})`)) ||
    lower.match(new RegExp(`(${Object.keys(MONTHS).join("|")})\\w*\\s+(\\d{1,2})`));
  if (named) {
    const day = parseInt(/^\d/.test(named[1]) ? named[1] : named[2], 10);
    const monthWord = /^\d/.test(named[1]) ? named[2] : named[1];
    const month = MONTHS[monthWord];
    if (day >= 1 && day <= 31 && month) {
      const year = today.getFullYear();
      const candidate = new Date(year, month - 1, day);
      // A month still ahead of us almost certainly means last year.
      if (candidate.getTime() - today.getTime() > 45 * 86400000) candidate.setFullYear(year - 1);
      return { date: dateKey(candidate), matched: named[0] };
    }
  }

  // "15.08", "15.08.2026", "15/08/26"
  const numeric = lower.match(/\b(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?\b/);
  if (numeric) {
    const day = parseInt(numeric[1], 10);
    const month = parseInt(numeric[2], 10);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      let year = numeric[3] ? parseInt(numeric[3], 10) : today.getFullYear();
      if (year < 100) year += 2000;
      return { date: dateKey(new Date(year, month - 1, day)), matched: numeric[0] };
    }
  }

  return null;
}

/** Words that mark the message as an expense. */
const EXPENSE_HINTS = [
  "xarajat",
  "harajat",
  "chiqim",
  "sarfladim",
  "sarf qildim",
  "sotib oldim",
  "xarid",
  "to'ladim",
  "toladim",
  "tuladim",
];

/** Words that mark the message as income. */
const INCOME_HINTS = [
  "kirim",
  "daromad",
  "ishladim",
  "ish haqi",
  "maosh",
  "oylik",
  "smena",
  "topdim",
  "tushdi",
  "oldim",
];

/** Filler words that should not end up in the description. */
const FILLER_WORDS =
  /\b(ming|mln|million|so'm|som|sum|won|vona|dollar|usd|krw|uzs|rub|bugun|kecha|kuni|men|uchun|edi|qildim|ishladim|ishlab)\b/gi;

/**
 * "120 000", "120.000" and "120,000" are grouped thousands, while "12.5" and
 * "12,5" are decimals.
 */
function normalizeNumber(raw: string): number {
  const compact = raw.replace(/\s/g, "");
  const grouped = /^\d{1,3}([.,]\d{3})+$/.test(compact);
  const normalized = grouped ? compact.replace(/[.,]/g, "") : compact.replace(",", ".");
  return parseFloat(normalized);
}

function multiplierFor(word: string | undefined): number {
  if (!word) return 1;
  const w = word.toLowerCase();
  if (w === "ming" || w === "k") return 1_000;
  if (w === "mln" || w === "million" || w === "m") return 1_000_000;
  return 1;
}

/** Uzbek number words — voice messages usually spell the amount out. */
const NUMBER_WORDS: Record<string, number> = {
  "nol": 0,
  "bir": 1,
  "ikki": 2,
  "uch": 3,
  "tort": 4,
  "besh": 5,
  "olti": 6,
  "yetti": 7,
  "sakkiz": 8,
  "toqqiz": 9,
  "on": 10,
  "yigirma": 20,
  "ottiz": 30,
  "qirq": 40,
  "ellik": 50,
  "oltmish": 60,
  "yetmish": 70,
  "sakson": 80,
  "toqson": 90,
};

const SCALE_WORDS: Record<string, number> = {
  "yuz": 100,
  "ming": 1_000,
  "million": 1_000_000,
  "milion": 1_000_000,
  "mln": 1_000_000,
};

/** Drops the apostrophe variants so "o'n" and "oʻn" both match "on". */
function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[''`ʻʼ’]/g, "");
}

interface WordNumber {
  value: number;
  words: string[];
}

/**
 * Reads a spelled-out amount such as "yuz yigirma ming" (120 000) from the
 * message, so a dictated voice note works as well as a typed number.
 */
function parseNumberWords(text: string): WordNumber | null {
  const tokens = text.split(/\s+/).filter(Boolean);

  let best: WordNumber | null = null;
  let total = 0;
  let current = 0;
  let used: string[] = [];
  let seenNumber = false;

  const flush = () => {
    const value = total + current;
    if (seenNumber && value > 0 && (!best || value > best.value)) {
      best = { value, words: [...used] };
    }
    total = 0;
    current = 0;
    used = [];
    seenNumber = false;
  };

  for (const token of tokens) {
    const word = normalizeWord(token);

    if (word in NUMBER_WORDS) {
      current += NUMBER_WORDS[word];
      used.push(token);
      seenNumber = true;
      continue;
    }

    if (word in SCALE_WORDS) {
      const scale = SCALE_WORDS[word];
      if (scale === 100) {
        current = (current || 1) * 100;
      } else {
        total += (current || 1) * scale;
        current = 0;
      }
      used.push(token);
      seenNumber = true;
      continue;
    }

    flush();
  }
  flush();

  return best;
}

/**
 * Turns a free-form Telegram message ("+150 Upwork", "-25 benzin",
 * "120 ming zavodda ishladim", "bugun 85000 so'm xarajat") into an entry.
 * Returns null when no usable amount is found.
 */
export function parseEntry(input: string): ParsedEntry | null {
  if (!input) return null;

  let body = input.trim();
  let type: EntryType | null = null;

  // The day is read (and removed) first so "12-avgust 121906" keeps 121906 as
  // the amount.
  const found = extractDate(body);
  if (found?.matched) {
    // "24.08.2026 da" — the date carries a case ending that must go with it.
    body = body.replace(new RegExp(`${escapeRegExp(found.matched)}\\s*(da|kuni|dagi)?\\b`, "i"), " ").trim();
  }

  if (body.startsWith("+")) {
    type = "INCOME";
    body = body.slice(1);
  } else if (body.startsWith("-") || body.startsWith("−") || body.startsWith("–")) {
    type = "EXPENSE";
    body = body.slice(1);
  }

  const lower = body.toLowerCase();
  if (!type) {
    if (EXPENSE_HINTS.some((h) => lower.includes(h))) type = "EXPENSE";
    else if (INCOME_HINTS.some((h) => lower.includes(h))) type = "INCOME";
    else type = "INCOME";
  }

  const match = body.match(/(\d[\d\s.,]*\d|\d)\s*(ming|mln|million|k|m)?\b/i);
  const spelled = match ? null : parseNumberWords(body);
  if (!match && !spelled) return null;

  const amount = match ? normalizeNumber(match[1]) * multiplierFor(match[2]) : spelled!.value;
  if (!isFinite(amount) || amount <= 0) return null;

  let remainder = body;
  if (match) {
    remainder = remainder.replace(match[0], " ");
  } else {
    for (const word of spelled!.words) {
      remainder = remainder.replace(word, " ");
    }
  }

  const description =
    remainder
      .replace(FILLER_WORDS, " ")
      .replace(/[^\p{L}\p{N}\s'’-]/gu, " ")
      .replace(/\s+/g, " ")
      .trim() || (type === "INCOME" ? "Kirim (Telegram bot)" : "Xarajat (Telegram bot)");

  return { type, amount, description, date: found?.date };
}
