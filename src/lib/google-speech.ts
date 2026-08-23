import { createSign } from "node:crypto";

/**
 * Google Cloud Speech-to-Text (REST v1).
 *
 * Authentication follows what is configured, in this order:
 *   1. GOOGLE_SPEECH_API_KEY — simplest, if the key is allowed to call the API;
 *   2. a service account (GOOGLE_SERVICE_ACCOUNT_JSON, or GOOGLE_CLIENT_EMAIL +
 *      GOOGLE_PRIVATE_KEY) — a short-lived OAuth token is minted from it.
 *
 * The synchronous endpoint used here accepts audio up to ~60 seconds, which
 * covers Telegram voice notes.
 */

const RECOGNIZE_URL = "https://speech.googleapis.com/v1/speech:recognize";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/cloud-platform";

/** Sync recognize limit on Google's side. */
export const MAX_SYNC_AUDIO_SECONDS = 60;

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

function readServiceAccount(): ServiceAccount | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (raw) {
    try {
      // Accepts both raw JSON and a base64-encoded copy of it, since some
      // hosting dashboards mangle multi-line values.
      const json = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
      const parsed = JSON.parse(json);
      if (parsed.client_email && parsed.private_key) {
        return { client_email: parsed.client_email, private_key: parsed.private_key };
      }
    } catch {
      console.error("GOOGLE_SERVICE_ACCOUNT_JSON o'qib bo'lmadi (JSON yoki base64 bo'lishi kerak)");
    }
  }

  const email = process.env.GOOGLE_CLIENT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;
  if (email && key) return { client_email: email, private_key: key };

  return null;
}

export function isGoogleSpeechConfigured(): boolean {
  return Boolean(process.env.GOOGLE_SPEECH_API_KEY) || readServiceAccount() !== null;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Signed JWT assertion for the OAuth2 service-account flow. */
export function buildJwtAssertion(account: ServiceAccount, now: number = Math.floor(Date.now() / 1000)): string {
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: account.client_email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  );

  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  // Env values usually carry escaped newlines.
  const privateKey = account.private_key.replace(/\\n/g, "\n");
  const signature = base64url(signer.sign(privateKey));

  return `${header}.${claims}.${signature}`;
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(account: ServiceAccount): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt - 60 > now) return cachedToken.value;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: buildJwtAssertion(account, now),
    }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.access_token) {
    console.error("Google OAuth token olinmadi:", data?.error_description || data?.error || res.status);
    return null;
  }

  cachedToken = { value: data.access_token, expiresAt: now + (data.expires_in || 3600) };
  return cachedToken.value;
}

export interface GoogleRecognizeOptions {
  /** Telegram voice notes are OGG/Opus at 48 kHz. */
  encoding?: string;
  sampleRateHertz?: number;
  languageCode?: string;
  alternativeLanguageCodes?: string[];
}

export function buildRecognizeRequest(audio: Buffer, options: GoogleRecognizeOptions = {}) {
  const alternatives =
    options.alternativeLanguageCodes ??
    (process.env.GOOGLE_SPEECH_ALT_LANGUAGES || "")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

  return {
    config: {
      encoding: options.encoding || "OGG_OPUS",
      sampleRateHertz: options.sampleRateHertz || 48000,
      languageCode: options.languageCode || process.env.GOOGLE_SPEECH_LANGUAGE || "uz-UZ",
      ...(alternatives.length ? { alternativeLanguageCodes: alternatives } : {}),
      enableAutomaticPunctuation: true,
      model: process.env.GOOGLE_SPEECH_MODEL || "default",
    },
    audio: { content: audio.toString("base64") },
  };
}

/** Joins the recognised segments of a speech:recognize response. */
export function extractTranscript(data: any): string {
  const results = Array.isArray(data?.results) ? data.results : [];
  return results
    .map((r: any) => r?.alternatives?.[0]?.transcript || "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function transcribeWithGoogle(
  audio: Buffer,
  options: GoogleRecognizeOptions = {}
): Promise<string | null> {
  const apiKey = process.env.GOOGLE_SPEECH_API_KEY;
  const account = apiKey ? null : readServiceAccount();
  if (!apiKey && !account) return null;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  let url = RECOGNIZE_URL;

  if (apiKey) {
    url = `${RECOGNIZE_URL}?key=${encodeURIComponent(apiKey)}`;
  } else {
    const token = await getAccessToken(account!);
    if (!token) return null;
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(buildRecognizeRequest(audio, options)),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    console.error("Google Speech-to-Text xatosi:", data?.error?.message || res.status);
    return null;
  }

  return extractTranscript(data) || null;
}
