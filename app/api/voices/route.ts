import { NextResponse } from "next/server";

import { listVoices } from "@/lib/elevenlabs";

export const runtime = "nodejs";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to load ElevenLabs voices.";
}

export async function GET() {
  try {
    const voices = await listVoices();
    return NextResponse.json({ voices });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error), voices: [] }, { status: 503 });
  }
}
