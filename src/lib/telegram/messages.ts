import { formatCurrency, formatDate, parseDateKey, toDateKey } from "@/lib/utils";
import type { ParsedEntry } from "./parse";
import type { TelegramStats } from "./entries";

/**
 * Telegram rejects a parse_mode=HTML message whose text contains raw "<", ">"
 * or "&", so anything coming from the user has to be escaped.
 */
export function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function buildStartMessage(firstName?: string): string {
  return (
    `👋 <b>Assalomu alaykum, ${escapeHtml(firstName || "do'stim")}!</b>\n\n` +
    `<b>Gig Tracker</b> — smena, kirim va xarajatlaringizni yuritadi.\n\n` +
    `💡 <b>Shunchaki yozing yoki ovozli xabar yuboring:</b>\n` +
    `• <code>+150000 Zavod smenasi</code> — kirim\n` +
    `• <code>-25000 Tushlik</code> — xarajat\n` +
    `• <code>120 ming zavodda ishladim</code>\n` +
    `• 🎙 "bugun yuz yigirma ming ishladim" — ovozli xabar\n\n` +
    `📊 <code>/stats</code> — hisobot\n` +
    `❓ <code>/help</code> — yordam`
  );
}

export function buildHelpMessage(): string {
  return (
    `❓ <b>Qanday ishlataman?</b>\n\n` +
    `<b>1. Matn orqali:</b>\n` +
    `<code>+150000 Emart smenasi</code>\n` +
    `<code>-25000 yo'lkira</code>\n` +
    `<code>120 ming zavodda ishladim</code>\n\n` +
    `<b>2. Ovozli xabar orqali:</b>\n` +
    `Mikrofon tugmasini bosib gapiring — bot ovozni matnga aylantirib, summani o'zi ajratadi.\n\n` +
    `<b>Eslatma:</b> "xarajat", "chiqim" so'zlari yoki <code>-</code> belgisi chiqim, qolgani kirim sifatida yoziladi.\n\n` +
    `📊 <code>/stats</code> — jami hisobot`
  );
}

/** Only worth showing when the entry is not for today. */
function dateLine(entry: ParsedEntry): string {
  if (!entry.date || entry.date === toDateKey(new Date())) return "";
  return `\n📅 Sana: <b>${formatDate(parseDateKey(entry.date))}</b>`;
}

export function buildSavedMessage(entry: ParsedEntry, currency: string): string {
  const sign = entry.type === "INCOME" ? "+" : "−";
  const label = entry.type === "INCOME" ? "💰 Kirim saqlandi!" : "💸 Xarajat saqlandi!";
  return (
    `✅ <b>${label}</b>\n\n` +
    `Summa: <b>${sign}${formatCurrency(entry.amount, currency)}</b>\n` +
    `📝 Izoh: <i>${escapeHtml(entry.description)}</i>` +
    dateLine(entry)
  );
}

/** Shown when there is no database: the entry is saved inside the Mini App. */
export function buildConfirmMessage(entry: ParsedEntry, currency: string): string {
  return (
    `✅ <b>Ma'lumot aniqlandi!</b>\n\n` +
    `${entry.type === "INCOME" ? "💰 Daromad" : "💸 Xarajat"}: ` +
    `<b>${formatCurrency(entry.amount, currency)}</b>\n` +
    `📝 Izoh: <i>${escapeHtml(entry.description)}</i>` +
    dateLine(entry) +
    `\n\nIlovaga saqlash uchun quyidagi tugmani bosing:`
  );
}

export function buildDeepLink(appUrl: string, entry: ParsedEntry): string {
  const params = new URLSearchParams({
    action: "add",
    type: entry.type,
    amount: String(entry.amount),
    desc: entry.description,
    ...(entry.date ? { date: entry.date } : {}),
  });
  return `${appUrl}?${params.toString()}`;
}

export function buildStatsMessage(stats: TelegramStats): string {
  return (
    `📊 <b>Sizning moliyaviy hisobotingiz:</b>\n\n` +
    `🟢 <b>Jami daromad:</b> ${formatCurrency(stats.income, stats.currency)}\n` +
    `🔴 <b>Jami xarajat:</b> ${formatCurrency(stats.expense, stats.currency)}\n` +
    `📈 <b>Sof foyda:</b> ${formatCurrency(stats.net, stats.currency)}\n` +
    `⏳ <b>Kutilayotgan:</b> ${formatCurrency(stats.pending, stats.currency)}\n\n` +
    `Jami ${stats.count} ta yozuv. Batafsil tahlil uchun Mini App'ga kiring!`
  );
}

export function buildVoiceHeardMessage(text: string): string {
  return `🗣 <b>Sizning gapingiz:</b>\n<i>"${escapeHtml(text)}"</i>`;
}

export function buildUnparsedMessage(): string {
  return (
    `❓ Summani aniqlay olmadim.\n\n` +
    `Masalan: <code>+150000 Zavod</code>, <code>-25000 tushlik</code> ` +
    `yoki <code>120 ming ishladim</code> deb yozing.\n` +
    `Ovozli xabar ham yuborishingiz mumkin 🎙`
  );
}
