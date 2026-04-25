import { NextRequest } from "next/server";
import { isRateLimited } from "@/lib/demo-rate-limit";

const AZURE_WHISPER_ENDPOINT = process.env.AZURE_WHISPER_ENDPOINT ?? "";
const AZURE_WHISPER_KEY = process.env.AZURE_WHISPER_KEY ?? "";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const ALLOWED_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/mpga",
  "audio/m4a",
  "audio/wav",
  "audio/x-wav",
  "audio/webm",
  "audio/ogg",
  "video/webm", // MediaRecorder often reports video/webm for audio-only
]);

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  if (isRateLimited(ip, "transcribe")) {
    return Response.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 },
    );
  }

  if (!AZURE_WHISPER_ENDPOINT || !AZURE_WHISPER_KEY) {
    return Response.json(
      { error: "Transcription service not configured" },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return Response.json({ error: "No audio file provided" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return Response.json(
      { error: "File too large (max 25 MB)" },
      { status: 413 },
    );
  }

  // Only reject if type is explicitly non-audio (e.g. application/pdf)
  // Browser MediaRecorder blobs may have types like "audio/webm;codecs=opus"
  const mimeBase = file.type?.split(";")[0]?.trim() ?? "";
  if (mimeBase && !ALLOWED_TYPES.has(mimeBase) && !mimeBase.startsWith("audio/") && !mimeBase.startsWith("video/")) {
    return Response.json({ error: "Invalid audio format" }, { status: 400 });
  }

  const language = (formData.get("language") as string) ?? "cs";

  // Short Czech medical prompt anchor. Biases Whisper toward medical
  // Czech vocabulary and reduces silence-induced hallucinations on
  // ambiguous low-energy audio.
  const CZECH_MEDICAL_PROMPT =
    "Lékařská zpráva. Pacient udává obtíže, anamnéza, vyšetření, diagnóza, doporučení.";

  // Build multipart form for Azure Whisper API
  const azureForm = new FormData();
  azureForm.append("file", file, "audio.webm");
  azureForm.append("language", language);
  azureForm.append("prompt", CZECH_MEDICAL_PROMPT);

  try {
    const response = await fetch(AZURE_WHISPER_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": AZURE_WHISPER_KEY,
      },
      body: azureForm,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("Whisper API error:", response.status, text);
      return Response.json(
        { error: "Transcription failed" },
        { status: 502 },
      );
    }

    const data = await response.json();
    return Response.json({ transcript: data.text ?? "" });
  } catch (err) {
    console.error("Whisper API request failed:", err);
    return Response.json({ error: "Transcription failed" }, { status: 502 });
  }
}
