import { NextResponse } from "next/server";
import { parseEntry } from "@/lib/telegram/parse";
import {
  transcribeTelegramVoice,
  isVoiceTranscriptionConfigured,
  speechProviderLabel,
  MAX_SYNC_AUDIO_SECONDS,
} from "@/lib/telegram/voice";
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
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    // A value stored without a scheme ("my-app.vercel.app") would make every
    // web_app button invalid, so it is completed here instead.
    const withScheme = /^https?:\/\//i.test(configured) ? configured : `https://${configured}`;
    return withScheme.replace(/\/$/, "");
  }
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
    const info = await infoRes.json();
    const appUrl = appUrlFrom(request);

    return NextResponse.json({
      ok: true,
      webhookUrl,
      registeredUrl: info?.result?.url || null,
      registered: Boolean(info?.result?.url),
      lastError: info?.result?.last_error_message || null,
      pendingUpdates: info?.result?.pending_update_count ?? null,
      appUrl,
      miniAppButtons: appUrl.startsWith("https://"),
      secretRequired: Boolean(process.env.TELEGRAM_WEBHOOK_SECRET),
      mode: isDatabaseConfigured() ? "database" : "mini-app",
      speechToText: speechProviderLabel(),
      webhookInfo: info,
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
    const appUrl = appUrlFrom(request);

    const message = body.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const sender = message.from;

    const post = async (payload: any) => {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json().catch(() => null);
    };

    /**
     * Telegram silently drops a message it does not like (bad HTML, a web_app
     * URL that is not https, ...). Without a retry the user just sees nothing,
     * so a rejected message is logged and resent as plain text.
     */
    const sendMessage = async (msgText: string, replyMarkup?: any) => {
      const result = await post({
        chat_id: chatId,
        text: msgText,
        parse_mode: "HTML",
        reply_markup: replyMarkup,
      });
      if (result?.ok) return;

      console.error("Telegram sendMessage rad etdi:", result?.description || "noma'lum xato");
      await post({ chat_id: chatId, text: msgText.replace(/<[^>]+>/g, "") });
    };

    // Telegram only accepts https URLs in web_app buttons; attaching an invalid
    // one makes the whole message fail.
    const canOpenMiniApp = appUrl.startsWith("https://");
    const appButton = canOpenMiniApp
      ? { inline_keyboard: [[{ text: "🚀 Gig Tracker", web_app: { url: appUrl } }]] }
      : undefined;

    let text: string = message.text || "";
    let fromVoice = false;

    // ---- Voice / audio message -> text ----
    const voice = message.voice || message.audio || message.video_note;
    if (voice) {
      if (!isVoiceTranscriptionConfigured()) {
        await sendMessage(
          `🎙 <b>Ovozli xabar qabul qilindi.</b>\n\n` +
            `Ammo ovozni matnga aylantirish serverda sozlanmagan ` +
            `(<code>GOOGLE_SPEECH_API_KEY</code> yoki <code>GOOGLE_SERVICE_ACCOUNT_JSON</code>).\n` +
            `Iltimos, hozircha matn orqali yozing yoki Mini App orqali kiriting.`
        );
        return NextResponse.json({ ok: true });
      }

      if (voice.duration && voice.duration > MAX_SYNC_AUDIO_SECONDS) {
        await sendMessage(
          `🎙 Ovozli xabar juda uzun (${voice.duration} soniya).\n` +
            `Iltimos, ${MAX_SYNC_AUDIO_SECONDS} soniyagacha bo'lgan qisqa xabar yuboring.`
        );
        return NextResponse.json({ ok: true });
      }

      await sendMessage("⏳ Ovozli xabar qayta ishlanmoqda...");

      const transcript = await transcribeTelegramVoice({
        botToken: token,
        fileId: voice.file_id,
        durationSeconds: voice.duration,
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
      await sendMessage(
        buildConfirmMessage(entry, process.env.DEFAULT_CURRENCY || "KRW"),
        canOpenMiniApp
          ? { inline_keyboard: [[{ text: "📥 Ilovada Saqlash", web_app: { url: buildDeepLink(appUrl, entry) } }]] }
          : undefined
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
