/**
 * Classic long-polling bot ("anaviy usul"): run it with `npm run bot` on any
 * machine — no public URL or webhook needed.
 *
 * It shares its parsing, transcription and storage logic with the serverless
 * webhook (src/app/api/telegram/webhook), so both modes behave the same.
 */
import { Bot, Context, InlineKeyboard } from "grammy";
import dotenv from "dotenv";

import { parseEntry } from "@/lib/telegram/parse";
import { transcribeTelegramVoice } from "@/lib/telegram/voice";
import { isDatabaseConfigured, saveEntryForSender, getStatsForSender } from "@/lib/telegram/entries";
import {
  buildConfirmMessage,
  buildDeepLink,
  buildHelpMessage,
  buildSavedMessage,
  buildStartMessage,
  buildStatsMessage,
  buildUnparsedMessage,
  buildVoiceHeardMessage,
} from "@/lib/telegram/messages";

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("❌ TELEGRAM_BOT_TOKEN topilmadi! Iltimos .env fayliga bot tokeningizni kiriting.");
  process.exit(1);
}

const bot = new Bot(token);
const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
const openAiKey = process.env.OPENAI_API_KEY;
const defaultCurrency = process.env.DEFAULT_CURRENCY || "KRW";

const appKeyboard = () =>
  appUrl.startsWith("https://")
    ? new InlineKeyboard().webApp("🚀 Gig Tracker Mini App", appUrl)
    : undefined; // Telegram only accepts https URLs for web_app buttons

const html = { parse_mode: "HTML" as const };

bot.command("start", async (ctx) => {
  await ctx.reply(buildStartMessage(ctx.from?.first_name), { ...html, reply_markup: appKeyboard() });
});

bot.command("help", async (ctx) => {
  await ctx.reply(buildHelpMessage(), { ...html, reply_markup: appKeyboard() });
});

bot.command("stats", async (ctx) => {
  const stats = ctx.from ? await getStatsForSender(ctx.from) : null;
  if (!stats) {
    await ctx.reply(
      "📊 Hozircha yozuvlar yo'q yoki ma'lumotlar bazasi ulanmagan.\n" +
        "Kirim yozish uchun: <code>+150000 Zavod</code>",
      { ...html, reply_markup: appKeyboard() }
    );
    return;
  }
  await ctx.reply(buildStatsMessage(stats), { ...html, reply_markup: appKeyboard() });
});

/** Text and transcribed voice both end up here. */
async function handleEntryText(ctx: Context, text: string, fromVoice: boolean) {
  const entry = parseEntry(text);
  if (!entry) {
    await ctx.reply(buildUnparsedMessage(), { ...html, reply_markup: appKeyboard() });
    return;
  }

  const saved = ctx.from ? await saveEntryForSender(ctx.from, entry) : null;

  if (saved) {
    await ctx.reply(buildSavedMessage(entry, saved.currency) + (fromVoice ? "\n\n🎙 Ovozli xabardan yozildi." : ""), {
      ...html,
      reply_markup: appKeyboard(),
    });
    return;
  }

  // No database — hand the entry over to the Mini App instead of losing it.
  const keyboard = appUrl.startsWith("https://")
    ? new InlineKeyboard().webApp("📥 Ilovada Saqlash", buildDeepLink(appUrl, entry))
    : undefined;

  await ctx.reply(buildConfirmMessage(entry, defaultCurrency), { ...html, reply_markup: keyboard });
}

bot.on("message:text", async (ctx) => {
  await handleEntryText(ctx, ctx.message.text.trim(), false);
});

bot.on(["message:voice", "message:audio", "message:video_note"], async (ctx) => {
  const file = ctx.message.voice || ctx.message.audio || ctx.message.video_note;
  if (!file) return;

  if (!openAiKey) {
    await ctx.reply(
      "🎙 <b>Ovozli xabar qabul qilindi.</b>\n\n" +
        "Ammo ovozni matnga aylantirish uchun <code>OPENAI_API_KEY</code> ulanmagan.\n" +
        "Iltimos, matn orqali yozing.",
      html
    );
    return;
  }

  await ctx.reply("⏳ Ovozli xabar qayta ishlanmoqda...");

  const transcript = await transcribeTelegramVoice({
    botToken: token,
    fileId: file.file_id,
    apiKey: openAiKey,
  });

  if (!transcript) {
    await ctx.reply("❌ Ovozni aniqlab bo'lmadi. Yana bir bor urinib ko'ring yoki matn yozing.");
    return;
  }

  await ctx.reply(buildVoiceHeardMessage(transcript), html);
  await handleEntryText(ctx, transcript, true);
});

bot.catch((err) => {
  console.error("Bot xatosi:", err);
});

async function main() {
  // Telegram refuses getUpdates while a webhook is registered, so the classic
  // mode has to remove it first.
  try {
    await bot.api.deleteWebhook();
  } catch (e: any) {
    console.warn("⚠️  deleteWebhook o'tmadi (e'tiborsiz qoldirildi):", e?.message || e);
  }

  const me = await bot.api.getMe();

  console.log(`🤖 @${me.username} ishga tushdi (long-polling).`);
  console.log(
    `   Ma'lumotlar: ${isDatabaseConfigured() ? "ma'lumotlar bazasi (DATABASE_URL)" : "Mini App (qurilma xotirasi)"}`
  );
  console.log(`   Ovozli xabar: ${openAiKey ? "yoqilgan (Whisper)" : "o'chirilgan — OPENAI_API_KEY yo'q"}`);
  console.log(`   Mini App URL: ${appUrl}`);

  const stop = () => bot.stop();
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);

  await bot.start();
}

main().catch((e: any) => {
  console.error("❌ Botni ishga tushirib bo'lmadi:", e?.message || e);
  console.error("   TELEGRAM_BOT_TOKEN to'g'riligini va internet ulanishini tekshiring.");
  process.exit(1);
});
