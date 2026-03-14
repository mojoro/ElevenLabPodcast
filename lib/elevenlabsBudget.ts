const WARNING_THRESHOLD = 6000;
const DANGER_THRESHOLD = 8000;

export function estimateCharacters(text: string): number {
  return text.length;
}

export function getUsageWarning(totalUsed: number): string | null {
  if (totalUsed >= DANGER_THRESHOLD) {
    return "WARNING: account is near ElevenLabs limit";
  }

  if (totalUsed >= WARNING_THRESHOLD) {
    return "Heads-up: usage is getting high";
  }

  return null;
}
