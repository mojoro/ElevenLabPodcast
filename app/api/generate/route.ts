import { NextResponse } from "next/server";

import { generateDialogueAudio } from "@/lib/elevenlabs";
import { estimateCharacters, getUsageWarning } from "@/lib/elevenlabsBudget";
import { extractContent, isUrl } from "@/lib/needle";
import { generatePodcastEpisode } from "@/lib/script";
import type { GeneratePodcastResponse, HostId } from "@/lib/types";

export const runtime = "nodejs";

const MAX_INPUT_CHARS = 3000;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong while generating the episode.";
}

function resolveVoiceMap(body: {
  voiceIdHostA?: unknown;
  voiceIdHostB?: unknown;
}): Record<HostId, string> {
  const hostA =
    typeof body.voiceIdHostA === "string" && body.voiceIdHostA.trim()
      ? body.voiceIdHostA.trim()
      : process.env.ELEVENLABS_VOICE_ID_HOST_A?.trim();
  const hostB =
    typeof body.voiceIdHostB === "string" && body.voiceIdHostB.trim()
      ? body.voiceIdHostB.trim()
      : process.env.ELEVENLABS_VOICE_ID_HOST_B?.trim();

  if (!hostA || !hostB) {
    throw new Error(
      "Provide ElevenLabs voice IDs in the form or set ELEVENLABS_VOICE_ID_HOST_A and ELEVENLABS_VOICE_ID_HOST_B.",
    );
  }

  if (hostA === hostB) {
    throw new Error("Choose two different ElevenLabs voices so both hosts sound distinct.");
  }

  return {
    hostA,
    hostB,
  };
}

function buildContextPreview(context: string): string {
  const preview = context.trim();

  if (preview.length <= 1800) {
    return preview;
  }

  return `${preview.slice(0, 1797).trimEnd()}...`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as
      | {
          input?: unknown;
          voiceIdHostA?: unknown;
          voiceIdHostB?: unknown;
        }
      | null;

    const input = typeof body?.input === "string" ? body.input.trim() : "";

    if (!input) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    if (input.length > MAX_INPUT_CHARS) {
      return NextResponse.json(
        { error: `Input is too long. Keep it under ${MAX_INPUT_CHARS} characters.` },
        { status: 400 },
      );
    }

    const sourceType = isUrl(input) ? "url" : "topic";
    const voiceMap = resolveVoiceMap(body ?? {});
    const context = await extractContent(input);
    const episode = await generatePodcastEpisode({
      source: input,
      context,
      sourceType,
    });
    const audio = await generateDialogueAudio({
      dialogue: episode.dialogue,
      voiceMap,
    });
    const estimatedCharacters = estimateCharacters(
      episode.dialogue.map((line) => line.text).join(" "),
    );
    const payload: GeneratePodcastResponse = {
      source: input,
      sourceType,
      contextPreview: buildContextPreview(context),
      contextLength: context.length,
      episode: {
        ...episode,
        estimatedCharacters,
        usageWarning: getUsageWarning(estimatedCharacters),
      },
      audio,
    };

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
