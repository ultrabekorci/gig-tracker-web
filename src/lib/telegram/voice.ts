import {
  isGoogleSpeechConfigured,
  transcribeWithGoogle,
  MAX_SYNC_AUDIO_SECONDS,
} from "@/lib/google-speech";

export { MAX_SYNC_AUDIO_SECONDS };

export type SpeechProvider = "google" | "openai";

/** Which speech-to-text service the current configuration can use. */
export function speechProvider(): SpeechProvider | null {
  if (isGoogleSpeechConfigured()) return "google";
  if (process.env.OPENAI_API_KEY) return "openai";
  return null;
}

export function isVoiceTranscriptionConfigured(): boolean {
  return speechProvider() !== null;
}

export function speechProviderLabel(): string {
  const provider = speechProvider();
  if (provider === "google") return "Google Speech-to-Text";
  if (provider === "openai") return "OpenAI Whisper";
  return "sozlanmagan";
}

/** Downloads the audio a Telegram message points at. */
async function downloadTelegramFile(botToken: string, fileId: string): Promise<Buffer | null> {
  const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
  const fileData = await fileRes.json().catch(() => null);
  if (!fileData?.ok || !fileData.result?.file_path) return null;

  const audioRes = await fetch(`https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`);
  if (!audioRes.ok) return null;

  return Buffer.from(await audioRes.arrayBuffer());
}

/** OpenAI Whisper — kept as a fallback when Google is not configured. */
async function transcribeWithWhisper(audio: Buffer, language: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const formData = new FormData();
  formData.append("file", new Blob([new Uint8Array(audio)], { type: "audio/ogg" }), "voice.oga");
  formData.append("model", "whisper-1");
  formData.append("language", language);

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!res.ok) {
    console.error("Whisper xatosi:", res.status);
    return null;
  }

  const data = await res.json().catch(() => null);
  const text = typeof data?.text === "string" ? data.text.trim() : "";
  return text || null;
}

/**
 * Voice message -> text, through Google Speech-to-Text (or Whisper when only
 * that is configured).
 */
export async function transcribeTelegramVoice(params: {
  botToken: string;
  fileId: string;
  /** Telegram reports the duration; Google's sync endpoint stops at 60s. */
  durationSeconds?: number;
  languageCode?: string;
}): Promise<string | null> {
  const provider = speechProvider();
  if (!provider) return null;

  const audio = await downloadTelegramFile(params.botToken, params.fileId);
  if (!audio) return null;

  const languageCode = params.languageCode || process.env.GOOGLE_SPEECH_LANGUAGE || "uz-UZ";

  if (provider === "google") {
    return transcribeWithGoogle(audio, { languageCode });
  }

  // Whisper expects a bare ISO language ("uz"), not a locale.
  return transcribeWithWhisper(audio, languageCode.split("-")[0]);
}
