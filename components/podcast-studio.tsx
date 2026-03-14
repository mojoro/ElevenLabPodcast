"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useRef, useState, useTransition } from "react";

import type { EpisodeAudio, GeneratePodcastResponse, VoiceOption } from "@/lib/types";

function isLikelyUrl(input: string): boolean {
  return /^https?:\/\//i.test(input.trim());
}

function bytesFromBase64(base64: string): Uint8Array {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function blobFromBase64(base64: string, mimeType: string): Blob {
  const bytes = bytesFromBase64(base64);
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return new Blob([buffer], { type: mimeType });
}

export function PodcastStudio() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<GeneratePodcastResponse | null>(null);
  const [audio, setAudio] = useState<EpisodeAudio | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [voicesError, setVoicesError] = useState<string | null>(null);
  const [voiceIdHostA, setVoiceIdHostA] = useState("");
  const [voiceIdHostB, setVoiceIdHostB] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const deferredInput = useDeferredValue(input);
  const lastAudioUrl = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadVoices() {
      const response = await fetch("/api/voices", { cache: "no-store" });
      const payload = (await response.json()) as {
        error?: string;
        voices?: VoiceOption[];
      };

      if (cancelled) {
        return;
      }

      if (!response.ok) {
        setVoices([]);
        setVoicesError(payload.error ?? "Set ELEVENLABS_API_KEY to load voice options.");
        return;
      }

      const loadedVoices = payload.voices ?? [];
      setVoices(loadedVoices);
      setVoicesError(null);

      setVoiceIdHostA((current) => current || loadedVoices[0]?.id || "");
      setVoiceIdHostB((current) => current || loadedVoices[1]?.id || "");
    }

    void loadVoices();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!audio) {
      if (lastAudioUrl.current) {
        URL.revokeObjectURL(lastAudioUrl.current);
        lastAudioUrl.current = null;
      }

      setAudioUrl(null);
      return;
    }

    const blob = blobFromBase64(audio.base64, audio.mimeType);
    const nextUrl = URL.createObjectURL(blob);

    if (lastAudioUrl.current) {
      URL.revokeObjectURL(lastAudioUrl.current);
    }

    lastAudioUrl.current = nextUrl;
    setAudioUrl(nextUrl);

    return () => {
      if (lastAudioUrl.current) {
        URL.revokeObjectURL(lastAudioUrl.current);
        lastAudioUrl.current = null;
      }
    };
  }, [audio]);

  async function runGeneration() {
    setIsSubmitting(true);
    setError(null);
    setResult(null);
    setAudio(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input,
          voiceIdHostA,
          voiceIdHostB,
        }),
      });

      const payload = (await response.json()) as GeneratePodcastResponse & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "The episode request failed.");
      }

      startTransition(() => {
        setResult(payload);
        setAudio(payload.audio);
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void runGeneration().catch((submissionError: unknown) => {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Something went wrong while generating the episode.",
      );
    });
  }

  const trimmedInput = deferredInput.trim();
  const inputMode = isLikelyUrl(trimmedInput) ? "URL article mode" : "Topic prompt mode";
  const isBusy = isSubmitting || isPending;

  return (
    <main className="relative overflow-hidden px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col gap-6">
        <section className="glass-card-strong wave-grid relative overflow-hidden rounded-[2rem] px-6 py-8 sm:px-8 lg:px-10">
          <div className="absolute top-0 right-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,_rgba(255,122,48,0.34),_transparent_68%)]" />
          <div className="absolute bottom-[-40px] left-[-20px] h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(23,109,105,0.22),_transparent_70%)]" />
          <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              <p className="label-mono text-[11px] text-[var(--muted)]">AI podcast generator</p>
              <div className="max-w-3xl space-y-4">
                <h1 className="max-w-3xl text-4xl leading-none font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
                  Drop turns a link or a topic into a finished two-host episode.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
                  Paste a URL for retrieval, or type a topic directly. The app extracts context
                  with Needle, writes the script with Featherless AI, voices it with ElevenLabs,
                  and returns a playable episode in one pass.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/how-it-works"
                    className="inline-flex items-center rounded-full border border-slate-900/10 bg-white/80 px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-[var(--accent)]"
                  >
                    See how it works
                  </Link>
                  <div className="inline-flex items-center rounded-full border border-slate-900/10 bg-white/60 px-4 py-2 text-sm text-[var(--muted)]">
                    Grounded mode: source facts only
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {[
                ["Needle", "URL extraction + semantic search"],
                ["Featherless AI", "Two-host script generation over the chat API"],
                ["ElevenLabs", "Dialogue audio and voice library"],
              ].map(([title, copy]) => (
                <article
                  key={title}
                  className="rounded-3xl border border-white/60 bg-white/65 px-4 py-4"
                >
                  <p className="label-mono text-[10px] text-[var(--muted)]">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-800">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <form onSubmit={handleSubmit} className="glass-card rounded-[2rem] p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="label-mono text-[11px] text-[var(--muted)]">Studio controls</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                  Source and voices
                </h2>
              </div>
              <div className="rounded-full border border-slate-900/10 bg-white/70 px-3 py-2 text-right">
                <p className="label-mono text-[10px] text-[var(--muted)]">Mode</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{inputMode}</p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="label-mono text-[11px] text-[var(--muted)]">
                  URL or topic
                </span>
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Paste a public article URL, or type a topic like 'the future of robotics in manufacturing'."
                  className="mt-2 min-h-48 w-full rounded-[1.6rem] border border-slate-900/10 bg-white/85 px-5 py-4 text-base leading-7 text-slate-900 outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(255,122,48,0.12)]"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="label-mono text-[11px] text-[var(--muted)]">Host A voice</span>
                  <select
                    value={voiceIdHostA}
                    onChange={(event) => setVoiceIdHostA(event.target.value)}
                    className="mt-2 h-[52px] w-full rounded-2xl border border-slate-900/10 bg-white/85 px-4 text-sm text-slate-900 outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(255,122,48,0.12)]"
                  >
                    <option value="">Use `.env.local` default</option>
                    {voices.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name}
                        {voice.category ? ` - ${voice.category}` : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="label-mono text-[11px] text-[var(--muted)]">Host B voice</span>
                  <select
                    value={voiceIdHostB}
                    onChange={(event) => setVoiceIdHostB(event.target.value)}
                    className="mt-2 h-[52px] w-full rounded-2xl border border-slate-900/10 bg-white/85 px-4 text-sm text-slate-900 outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(255,122,48,0.12)]"
                  >
                    <option value="">Use `.env.local` default</option>
                    {voices.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name}
                        {voice.category ? ` - ${voice.category}` : ""}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="rounded-[1.5rem] border border-slate-900/8 bg-white/60 px-4 py-4 text-sm leading-6 text-[var(--muted)]">
                <p className="label-mono text-[10px]">Voice loading</p>
                <p className="mt-2">
                  {voicesError
                    ? voicesError
                    : voices.length
                      ? "Voice options loaded from ElevenLabs. Pick two different voices or keep your `.env.local` defaults."
                      : "No live voices available yet. Add your ElevenLabs API key and reload the page."}
                </p>
              </div>

              {error ? (
                <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isBusy || !trimmedInput}
                className="flex h-14 w-full items-center justify-center rounded-full bg-[var(--accent)] px-6 text-base font-semibold text-white transition hover:bg-[var(--accent-deep)] disabled:cursor-not-allowed disabled:bg-[rgba(255,122,48,0.55)]"
              >
                {isBusy ? "Generating episode..." : "Generate podcast"}
              </button>
            </div>
          </form>

          <section className="space-y-6">
            <article className="glass-card rounded-[2rem] p-6 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="label-mono text-[11px] text-[var(--muted)]">Episode output</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                    {result?.episode.title ?? "Nothing generated yet"}
                  </h2>
                </div>
                <div className="flex gap-3">
                  <div className="rounded-full border border-slate-900/10 bg-white/75 px-3 py-2 text-sm">
                    {result?.sourceType === "url" ? "Retrieved article" : "Direct topic"}
                  </div>
                  <div className="rounded-full border border-slate-900/10 bg-white/75 px-3 py-2 text-sm">
                    {result?.episode.dialogue.length ?? 0} lines
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.6rem] border border-slate-900/10 bg-white/80 p-5">
                  <p className="label-mono text-[10px] text-[var(--muted)]">Hook</p>
                  <p className="mt-2 text-lg leading-8 text-slate-900">
                    {result?.episode.hook ?? "Generate an episode to see the topline angle."}
                  </p>

                  <p className="label-mono mt-5 text-[10px] text-[var(--muted)]">Summary</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                    {result?.episode.summary ??
                      "The model summary, retrieval preview, and audio player will land here after generation."}
                  </p>
                </div>

                <div className="rounded-[1.6rem] border border-slate-900/10 bg-slate-950 p-5 text-white">
                  <p className="label-mono text-[10px] text-white/50">Playback</p>
                  {audioUrl ? (
                    <>
                      <audio className="mt-4 w-full" controls src={audioUrl} />
                      <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/72">
                        <span>{result?.episode.estimatedCharacters ?? 0} chars</span>
                        <span>{result?.episode.dialogue.length ?? 0} scripted turns</span>
                      </div>
                      {result?.episode.usageWarning ? (
                        <p className="mt-3 text-sm text-amber-300">{result.episode.usageWarning}</p>
                      ) : null}
                      <a
                        href={audioUrl}
                        download={`${result?.episode.title ?? "drop-episode"}.mp3`}
                        className="mt-5 inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:border-white/35"
                      >
                        Download audio
                      </a>
                    </>
                  ) : (
                    <p className="mt-4 max-w-md text-sm leading-7 text-white/68">
                      The generated episode audio will appear here as a single playable file.
                    </p>
                  )}
                </div>
              </div>
            </article>

            <article className="glass-card rounded-[2rem] p-6 sm:p-7">
              <p className="label-mono text-[11px] text-[var(--muted)]">Extracted source</p>
              <div className="mt-4 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
                <div className="rounded-[1.6rem] border border-slate-900/10 bg-white/80 p-5">
                  <p className="label-mono text-[10px] text-[var(--muted)]">Source input</p>
                  <p className="mt-2 break-words text-sm leading-7 text-slate-900">
                    {result?.source || "Your original URL or topic will show here."}
                  </p>
                  <div className="mt-5 flex gap-3 text-sm text-[var(--muted)]">
                    <span>{result?.sourceType === "url" ? "Needle retrieval" : "Direct passthrough"}</span>
                    <span>{result?.contextLength ?? 0} chars</span>
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-slate-900/10 bg-white/80 p-5">
                  <p className="label-mono text-[10px] text-[var(--muted)]">Context preview</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--muted)]">
                    {result?.contextPreview ??
                      "If the source is a URL, this area shows the normalized retrieval result used for the script."}
                  </p>
                </div>
              </div>
            </article>

            <article className="glass-card rounded-[2rem] p-6 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="label-mono text-[11px] text-[var(--muted)]">Transcript</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                    Host-by-host script
                  </h2>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {result?.episode.dialogue.length ? (
                  result.episode.dialogue.map((line, index) => {
                    const host = result.episode.hosts.find((entry) => entry.id === line.speaker);

                    return (
                      <article
                        key={`${line.speaker}-${index}`}
                        className={`rounded-[1.6rem] border px-5 py-4 ${
                          line.speaker === "hostA"
                            ? "border-[rgba(255,122,48,0.22)] bg-[rgba(255,122,48,0.09)]"
                            : "border-[rgba(23,109,105,0.22)] bg-[rgba(23,109,105,0.09)]"
                        }`}
                      >
                        <p className="label-mono text-[10px] text-[var(--muted)]">
                          {host?.name ?? line.speaker} - {host?.role ?? "Host"}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-slate-900">{line.text}</p>
                      </article>
                    );
                  })
                ) : (
                  <p className="rounded-[1.6rem] border border-dashed border-slate-900/10 bg-white/60 px-5 py-6 text-sm leading-7 text-[var(--muted)]">
                    The final transcript lands here after generation.
                  </p>
                )}
              </div>
            </article>
          </section>
        </section>
      </div>
    </main>
  );
}
