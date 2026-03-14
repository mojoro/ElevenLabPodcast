import type { EpisodeDialogueLine, HostId, VoiceOption } from "@/lib/types";

const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";
const DEFAULT_MODEL_ID = process.env.ELEVENLABS_MODEL_ID?.trim() || "eleven_v3";

function getElevenLabsApiKey(): string {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing ELEVENLABS_API_KEY");
  }

  return apiKey;
}

async function readErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await response.json().catch(() => null)) as
      | { detail?: string; message?: string }
      | null;

    return payload?.detail || payload?.message || response.statusText;
  }

  const text = await response.text().catch(() => "");
  return text || response.statusText;
}

export async function listVoices(): Promise<VoiceOption[]> {
  const response = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
    headers: {
      "xi-api-key": getElevenLabsApiKey(),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs voices request failed: ${await readErrorMessage(response)}`);
  }

  const payload = (await response.json()) as {
    voices?: Array<{
      voice_id?: string;
      name?: string;
      preview_url?: string | null;
      category?: string | null;
    }>;
  };

  return (payload.voices ?? [])
    .filter((voice) => voice.voice_id && voice.name)
    .map((voice) => ({
      id: voice.voice_id as string,
      name: voice.name as string,
      previewUrl: voice.preview_url ?? null,
      category: voice.category ?? null,
    }));
}

export async function generateDialogueAudio({
  dialogue,
  voiceMap,
}: {
  dialogue: EpisodeDialogueLine[];
  voiceMap: Record<HostId, string>;
}): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(
    `${ELEVENLABS_BASE_URL}/text-to-dialogue?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": getElevenLabsApiKey(),
      },
      body: JSON.stringify({
        model_id: DEFAULT_MODEL_ID,
        inputs: dialogue.map((line) => ({
          text: line.text,
          voice_id: voiceMap[line.speaker],
        })),
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs audio generation failed: ${await readErrorMessage(response)}`);
  }

  const mimeType = response.headers.get("content-type") || "audio/mpeg";
  const buffer = Buffer.from(await response.arrayBuffer());

  return {
    base64: buffer.toString("base64"),
    mimeType,
  };
}
