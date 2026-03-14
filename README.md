# Drop

Drop is a Next.js App Router app that turns a pasted URL or topic into a short two-host podcast episode.

## Required APIs

Add these values to `.env.local`:

```bash
NEEDLE_API_KEY=
FEATHERLESS_API_KEY=
FEATHERLESS_MODEL=Qwen/Qwen2.5-7B-Instruct
ELEVENLABS_API_KEY=
ELEVENLABS_MODEL_ID=eleven_v3
ELEVENLABS_VOICE_ID_HOST_A=
ELEVENLABS_VOICE_ID_HOST_B=
```

What each one does:

- `NEEDLE_API_KEY`: extracts and semantically searches public URLs.
- `FEATHERLESS_API_KEY`: generates the structured two-host script.
- `FEATHERLESS_MODEL`: optional model override for Featherless. The default is `Qwen/Qwen2.5-7B-Instruct`.
- `ELEVENLABS_API_KEY`: lists voices and renders the final dialogue audio.
- `ELEVENLABS_VOICE_ID_HOST_A` and `ELEVENLABS_VOICE_ID_HOST_B`: optional defaults if you do not want to pick voices in the UI.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Main files

- `app/api/generate/route.ts`: end-to-end orchestration.
- `app/api/voices/route.ts`: loads available ElevenLabs voices for the UI.
- `lib/needle.ts`: URL extraction and retrieval helper.
- `lib/script.ts`: Featherless AI script generation.
- `lib/elevenlabs.ts`: voice listing and dialogue audio generation.

## Notes

- Plain text input bypasses Needle and goes straight to script generation.
- URL input requires `NEEDLE_API_KEY`.
- The ElevenLabs budget helper warns at 6,000+ characters and urgently at 8,000+.
