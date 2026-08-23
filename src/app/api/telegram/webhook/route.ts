import { NextResponse } from "next/server";
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

export const dynamic = "force-dynamic";

function appUrlFrom(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/$/, "");
  const host = request.headers.get("host") || "gig-tracker-web.vercel.app";
  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function GET(request: Request) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const { searchParams } = new URL(request.url);
    const webhookUrl = `${appUrlFrom(request)}/api/telegram/webhook`;

    if (!token) return NextResponse.json({ ok: false, error: "No token" });

    if (searchParams.get("set") === "true") {
      const params = new URLSearchParams({ url: webhookUrl });
      const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
      if (secret) params.set("secret_token", secret);

      const setRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook?${params.toString()}`);
      return NextResponse.json({ ok: true, telegramResponse: await setRes.json() });
    }

    if (searchParams.get("delete") === "true") {
      // Needed before switching to the long-polling ("classic") bot: Telegram
      // refuses getUpdates while a webhook is registered.
      const delRes = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);
      return NextResponse.json({ ok: true, telegramResponse: await delRes.json() });
    }

    const infoRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    return NextResponse.json({
      ok: true,
      webhookUrl,
      mode: isDatabaseConfigured() ? "database" : "mini-app",
      webhookInfo: await infoRes.json(),
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return NextResponse.json({ message: "No bot token configured" });

    // Anyone can POST to a public webhook, so honour Telegram's secret header
    // when one is configured.
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (secret && request.headers.get("x-telegram-bot-api-secret-token") !== secret) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const openAiKey = process.env.OPENAI_API_KEY;
    const appUrl = appUrlFrom(request);

    const message = body.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const sender = message.from;

    const sendMessage = async (msgText: string, replyMarkup?: any) => {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: msgText, parse_mode: "HTML", reply_markup: replyMarkup }),
      });
    };

    const appButton = { inline_keyboard: [[{ text: "🚀 Gig Tracker", web_app: { url: appUrl } }]] };

    let text: string = message.text || "";
    let fromVoice = false;

    // ---- Voice / audio message -> text ----
    const voice = message.voice || message.audio || message.video_note;
    if (voice) {
      if (!openAiKey) {
        await sendMessage(
          `🎙 <b>Ovozli xabar qabul qilindi.</b>\n\n` +
            `Ammo ovozni matnga aylantirish uchun serverda <code>OPENAI_API_KEY</code> ulanmagan.\n` +
            `Iltimos, hozircha matn orqali yozing yoki Mini App orqali kiriting.`
        );
        return NextResponse.json({ ok: true });
      }

      await sendMessage("⏳ Ovozli xabar qayta ishlanmoqda...");

      const transcript = await transcribeTelegramVoice({
        botToken: token,
        fileId: voice.file_id,
        apiKey: openAiKey,
      });

      if (!transcript) {
        await sendMessage("❌ Ovozni aniqlab bo'lmadi. Yana bir bor urinib ko'ring yoki matn yozing.");
        return NextResponse.json({ ok: true });
      }

      text = transcript;
      fromVoice = true;
      await sendMessage(buildVoiceHeardMessage(text));
    }

    if (!text) return NextResponse.json({ ok: true });
    text = text.trim();

    // ---- Commands ----
    if (text.startsWith("/start")) {
      await sendMessage(buildStartMessage(sender?.first_name), appButton);
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/help")) {
      await sendMessage(buildHelpMessage(), appButton);
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/stats")) {
      const stats = sender ? await getStatsForSender(sender) : null;
      if (stats) {
        await sendMessage(buildStatsMessage(stats), appButton);
      } else {
        await sendMessage(
          `📊 Hisobot Mini App ichida hisoblanadi — ma'lumotlaringiz shu qurilmada saqlanadi.\n\n` +
            `Ochish uchun tugmani bosing:`,
          appButton
        );
      }
      return NextResponse.json({ ok: true });
    }

    // ---- Income / expense entry (text and voice use the same parser) ----
    const entry = parseEntry(text);
    if (!entry) {
      await sendMessage(buildUnparsedMessage(), appButton);
      return NextResponse.json({ ok: true });
    }

    const saved = sender ? await saveEntryForSender(sender, entry) : null;

    if (saved) {
      // Classic mode: the bot itself stored the entry.
      await sendMessage(
        buildSavedMessage(entry, saved.currency) + (fromVoice ? "\n\n🎙 Ovozli xabardan yozildi." : ""),
        appButton
      );
    } else {
      // Mini App mode: the data lives on the device, so hand over a deep link.
      await sendMessage(buildConfirmMessage(entry, process.env.DEFAULT_CURRENCY || "KRW"), {
        inline_keyboard: [[{ text: "📥 Ilovada Saqlash", web_app: { url: buildDeepLink(appUrl, entry) } }]],
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
