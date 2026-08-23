/**
 * Voice message -> text. Uses OpenAI Whisper, the transcription service the
 * webhook already relied on.
 */
export async function transcribeTelegramVoice(params: {
  botToken: string;
  fileId: string;
  apiKey: string;
  language?: string;
}): Promise<string | null> {
  const { botToken, fileId, apiKey, language = "uz" } = params;

  const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
  const fileData = await fileRes.json();
  if (!fileData?.ok || !fileData.result?.file_path) return null;

  const audioRes = await fetch(`https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`);
  if (!audioRes.ok) return null;
  const audioBlob = await audioRes.blob();

  const formData = new FormData();
  formData.append("file", audioBlob, "voice.oga");
  formData.append("model", "whisper-1");
  formData.append("language", language);

  const aiRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!aiRes.ok) return null;
  const aiData = await aiRes.json();
  const text = typeof aiData?.text === "string" ? aiData.text.trim() : "";
  return text || null;
}
