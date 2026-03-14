import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works | Drop",
  description:
    "A slide-like overview of how Drop uses Needle, Featherless AI, and ElevenLabs to turn a URL into a grounded podcast.",
};

const sectionLinks = [
  { href: "#problem", label: "Problem" },
  { href: "#solution", label: "Solution" },
  { href: "#flow", label: "Flow" },
  { href: "#stack", label: "Tool stack" },
  { href: "#trust", label: "Trust" },
  { href: "#future", label: "What's next" },
];

const problemCards = [
  {
    title: "Pages are noisy",
    detail:
      "Marketing sites mix nav items, repeated headers, social proof, and partial blurbs. Raw page text is rarely clean enough to narrate directly.",
  },
  {
    title: "Models smooth over gaps",
    detail:
      "If retrieval is thin, the script model can still make the output sound polished by adding implied momentum, opinions, or filler that never existed on the site.",
  },
  {
    title: "Audio makes bad facts feel real",
    detail:
      "Once a strong voice reads the script aloud, small unsupported claims feel more trustworthy than they should. The error becomes harder to catch.",
  },
];

const solutionPoints = [
  "Needle pulls evidence from the source instead of asking the model to reason from the URL alone.",
  "Featherless writes the first draft from retrieved context, then performs a second fact-check rewrite for URL inputs.",
  "ElevenLabs only speaks the final transcript after the content has already been constrained by the retrieval layer.",
];

const steps = [
  {
    number: "01",
    title: "Paste a URL or topic",
    detail:
      "A public link triggers retrieval mode. A plain topic triggers direct prompt mode.",
  },
  {
    number: "02",
    title: "Needle extracts evidence",
    detail:
      "The app indexes the source, searches for the most relevant chunks, and normalizes title and meta context.",
  },
  {
    number: "03",
    title: "Featherless drafts the episode",
    detail:
      "The model writes a two-host script using the retrieved context as the only source of truth.",
  },
  {
    number: "04",
    title: "Featherless fact-checks itself",
    detail:
      "For URL-based episodes, a second pass strips unsupported claims, soft hype, and implied outcomes.",
  },
  {
    number: "05",
    title: "You review the evidence",
    detail:
      "The studio shows source input, context preview, and transcript so drift is visible before audio render.",
  },
  {
    number: "06",
    title: "ElevenLabs renders audio",
    detail:
      "Two selected voices are stitched into one playback file after the script is already locked.",
  },
];

const tools = [
  {
    name: "Needle",
    role: "Retrieval and grounding",
    detail:
      "Used for indexing, search, and context assembly. This stage reduces hallucination risk by feeding the model evidence, not guesses.",
    bullets: ["URL ingestion", "Chunk search", "Metadata grounding"],
    toneClass: "bg-[rgba(255,122,48,0.1)] text-[var(--accent)] border-[rgba(255,122,48,0.16)]",
  },
  {
    name: "Featherless AI",
    role: "Script generation",
    detail:
      "Used twice in URL mode: draft creation first, fact-check rewrite second. The prompt explicitly forbids unsupported claims and marketing filler.",
    bullets: ["Draft pass", "Rewrite pass", "Structured JSON output"],
    toneClass: "bg-[rgba(23,109,105,0.12)] text-[var(--teal)] border-[rgba(23,109,105,0.18)]",
  },
  {
    name: "ElevenLabs",
    role: "Voice rendering",
    detail:
      "Used only after the script is finalized. It converts host-by-host dialogue into a single playable audio response.",
    bullets: ["Voice list", "Dialogue render", "Downloadable audio"],
    toneClass: "bg-[rgba(17,32,48,0.08)] text-slate-900 border-slate-900/10",
  },
];

const safeguards = [
  "Context preview shows exactly what the model saw before generation.",
  "Prompt rules block invented traction, success claims, opinions, and future promises.",
  "The second Featherless pass acts as a source-locked editor for URL episodes.",
  "Page title and meta description are prepended when available to stabilize thin sites.",
  "Needle queries were expanded for portfolio, bio, work, and project-style websites.",
  "The safest production flow is still review first, then render audio.",
];

const qualityLanes = [
  {
    label: "Low risk",
    title: "Pages with clear copy",
    detail: "About pages, product pages, founder bios, docs, and long-form articles usually retrieve cleanly.",
  },
  {
    label: "Medium risk",
    title: "Sparse portfolio sites",
    detail: "Beautiful sites with little text can still work, but you should inspect the context preview before trusting the narration.",
  },
  {
    label: "High risk",
    title: "Dynamic or gated content",
    detail: "Apps behind login, heavily interactive pages, or client-only content can starve the retrieval layer.",
  },
];

const useCases = [
  "Founder and portfolio websites",
  "Product launch pages",
  "Blog posts and essays",
  "Documentation and feature explainers",
  "Company about pages",
  "Research summaries and reports",
];

const roadmap = [
  {
    title: "Citation mode",
    detail: "Show which retrieved lines support each transcript block before audio render.",
  },
  {
    title: "Approve before render",
    detail: "Split generation into two steps so the script can be edited and approved before it reaches ElevenLabs.",
  },
  {
    title: "Multi-page crawl",
    detail: "When the root page is too thin, pull linked About, Work, Blog, or Docs pages to improve grounding.",
  },
  {
    title: "Confidence scoring",
    detail: "Warn when the retrieval looks too nav-heavy, too short, or too repetitive for a safe summary.",
  },
  {
    title: "Claim diff view",
    detail: "Highlight transcript lines that do not map cleanly back to evidence chunks.",
  },
  {
    title: "Shareable episode pages",
    detail: "Publish audio, transcript, and source URL on a lightweight public page.",
  },
];

const faqItems = [
  {
    question: "Why did one site return incorrect information?",
    answer:
      "Usually because the retrieval was thin or the script model added filler on top of partial evidence. The new URL flow is stricter, but sparse and dynamic sites still need review.",
  },
  {
    question: "How do you reduce false information?",
    answer:
      "By separating retrieval, generation, and voice rendering. Needle finds evidence, Featherless writes and then rewrites against that evidence, and ElevenLabs only reads the final approved script.",
  },
  {
    question: "Can I use this for topic prompts without a URL?",
    answer:
      "Yes. Topic mode skips Needle and uses Featherless directly. It is useful, but it is less grounded than URL mode because it does not have source retrieval.",
  },
  {
    question: "What should I check before generating audio?",
    answer:
      "Look at the context preview first. If the extracted text is thin, obviously wrong, or mostly navigation, the narration should not be trusted yet.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute top-[-80px] right-[-60px] h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(255,122,48,0.26),_transparent_68%)]" />
        <div className="absolute bottom-[-120px] left-[-40px] h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(23,109,105,0.22),_transparent_70%)]" />
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="how-slide how-slide-hero rounded-[2.4rem] px-6 py-8 sm:px-8 lg:min-h-[82vh] lg:px-12 lg:py-12">
          <div className="relative grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div className="max-w-3xl">
              <p className="label-mono text-[11px] text-[var(--muted)]">How Drop works</p>
              <h1 className="mt-4 max-w-4xl text-4xl leading-none font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-7xl">
                A landing page that reads like slides, but explains a grounded AI pipeline.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
                Drop turns a URL into a two-host podcast by splitting one risky job into three
                narrower ones: retrieval with Needle, script generation with Featherless AI, and
                voice rendering with ElevenLabs.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)]"
                >
                  Back to studio
                </Link>
                <div className="inline-flex items-center rounded-full border border-slate-900/10 bg-white/70 px-4 py-3 text-sm text-slate-900">
                  Built for grounded URL-to-audio generation
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {sectionLinks.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center rounded-full border border-slate-900/10 bg-white/55 px-3 py-2 text-sm text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-slate-900"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[620px]">
              <div className="how-float-card absolute top-0 right-0 z-10 hidden rounded-[1.2rem] border border-white/60 bg-white/70 px-4 py-3 text-sm text-slate-900 shadow-[0_20px_60px_rgba(24,39,58,0.12)] sm:block">
                Source facts only
              </div>

              <div className="glass-card-strong relative overflow-hidden rounded-[2rem] p-5 sm:p-6">
                <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(255,122,48,0.18),_transparent_70%)]" />
                <div className="absolute bottom-[-24px] left-[-24px] h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(23,109,105,0.2),_transparent_72%)]" />

                <div className="relative space-y-4">
                  <div className="grid gap-3 sm:grid-cols-[0.95fr_1.05fr]">
                    <article className="rounded-[1.5rem] border border-slate-900/10 bg-white/78 p-4">
                      <p className="label-mono text-[10px] text-[var(--muted)]">Input</p>
                      <p className="mt-2 rounded-2xl border border-dashed border-slate-900/10 bg-white/80 px-3 py-3 text-sm leading-6 text-slate-900">
                        https://rahulai.com
                      </p>
                      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                        Or a direct topic prompt when retrieval is not needed.
                      </p>
                    </article>

                    <article className="rounded-[1.5rem] border border-slate-900/10 bg-slate-950 p-4 text-white">
                      <p className="label-mono text-[10px] text-white/55">Output</p>
                      <div className="mt-3 rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4">
                        <p className="text-sm text-white/74">Two-host episode + playable audio</p>
                        <div className="mt-4 flex items-end gap-1">
                          {[22, 36, 18, 46, 28, 39, 21, 33].map((height, index) => (
                            <span
                              key={`${height}-${index}`}
                              className="how-wave-bar w-2 rounded-full bg-white/80"
                              style={{ height }}
                            />
                          ))}
                        </div>
                      </div>
                    </article>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-3">
                    <article className="how-stage-card rounded-[1.6rem] border border-[rgba(255,122,48,0.18)] bg-[rgba(255,122,48,0.08)] p-4">
                      <p className="label-mono text-[10px] text-[var(--accent)]">Needle</p>
                      <p className="mt-2 text-base font-semibold text-slate-950">
                        Retrieve evidence
                      </p>
                      <div className="mt-4 space-y-2">
                        <div className="h-2 rounded-full bg-[rgba(255,122,48,0.3)]" />
                        <div className="h-2 w-5/6 rounded-full bg-[rgba(255,122,48,0.22)]" />
                        <div className="h-2 w-3/4 rounded-full bg-[rgba(255,122,48,0.18)]" />
                      </div>
                    </article>

                    <article className="how-stage-card rounded-[1.6rem] border border-[rgba(23,109,105,0.18)] bg-[rgba(23,109,105,0.09)] p-4">
                      <p className="label-mono text-[10px] text-[var(--teal)]">Featherless</p>
                      <p className="mt-2 text-base font-semibold text-slate-950">Write + verify</p>
                      <div className="mt-4 space-y-2">
                        <div className="h-2 w-4/5 rounded-full bg-[rgba(23,109,105,0.26)]" />
                        <div className="h-2 rounded-full bg-[rgba(23,109,105,0.18)]" />
                        <div className="h-2 w-2/3 rounded-full bg-[rgba(23,109,105,0.22)]" />
                      </div>
                    </article>

                    <article className="how-stage-card rounded-[1.6rem] border border-slate-900/10 bg-white/80 p-4">
                      <p className="label-mono text-[10px] text-[var(--muted)]">ElevenLabs</p>
                      <p className="mt-2 text-base font-semibold text-slate-950">Render audio</p>
                      <div className="mt-4 flex items-end gap-1">
                        {[14, 24, 30, 18, 34, 20, 28].map((height, index) => (
                          <span
                            key={`${height}-${index}`}
                            className="how-wave-bar w-2 rounded-full bg-slate-900/70"
                            style={{ height }}
                          />
                        ))}
                      </div>
                    </article>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="problem"
          className="how-slide rounded-[2.2rem] px-6 py-8 sm:px-8 lg:min-h-[66vh] lg:px-10 lg:py-10"
        >
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="max-w-xl">
              <p className="label-mono text-[11px] text-[var(--muted)]">01 / Problem</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                Wrong information usually appears between retrieval and narration.
              </h2>
              <p className="mt-5 text-base leading-7 text-[var(--muted)]">
                If the context preview is wrong, the retrieval stage needs work. If the preview is
                right but the episode adds unsupported detail, the generation stage is drifting.
                That distinction matters because the fix is different.
              </p>

              <div className="mt-6 rounded-[1.7rem] border border-slate-900/10 bg-slate-950 px-5 py-5 text-white">
                <p className="label-mono text-[10px] text-white/55">Failure map</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold">Preview is wrong</p>
                    <p className="mt-2 text-sm leading-6 text-white/72">
                      Site structure, rendering, or search quality is the main issue.
                    </p>
                  </div>
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold">Preview is right</p>
                    <p className="mt-2 text-sm leading-6 text-white/72">
                      The script model is adding polish that the source did not earn.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {problemCards.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[1.8rem] border border-slate-900/10 bg-white/78 p-5 shadow-[0_18px_50px_rgba(24,39,58,0.08)]"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[1rem] border border-slate-900/10 bg-[rgba(255,122,48,0.08)] text-sm font-semibold text-[var(--accent)]">
                    {item.title.slice(0, 2).toUpperCase()}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="solution"
          className="how-slide rounded-[2.2rem] px-6 py-8 sm:px-8 lg:min-h-[64vh] lg:px-10 lg:py-10"
        >
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div>
              <p className="label-mono text-[11px] text-[var(--muted)]">02 / Solution</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                Make each stage narrow enough that it can be trusted.
              </h2>
              <div className="mt-6 rounded-[1.9rem] border border-[rgba(255,122,48,0.16)] bg-[linear-gradient(135deg,rgba(255,122,48,0.1),rgba(23,109,105,0.08))] p-6">
                <p className="text-xl leading-9 text-slate-950 sm:text-2xl">
                  Retrieval should find evidence. Generation should only rephrase that evidence.
                  Audio should only speak the final approved script.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {solutionPoints.map((item, index) => (
                <div
                  key={item}
                  className="rounded-[1.5rem] border border-slate-900/10 bg-white/78 px-4 py-4"
                >
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-900/10 bg-white text-sm font-semibold text-slate-950">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-7 text-[var(--muted)]">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="flow"
          className="how-slide rounded-[2.2rem] px-6 py-8 sm:px-8 lg:min-h-[76vh] lg:px-10 lg:py-10"
        >
          <div className="flex flex-col gap-8">
            <div className="max-w-3xl">
              <p className="label-mono text-[11px] text-[var(--muted)]">03 / Flow</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                From source to spoken episode in six steps.
              </h2>
              <p className="mt-4 text-base leading-7 text-[var(--muted)]">
                The layout below is intentionally slide-like: one big process story, not a dense
                block of documentation.
              </p>
            </div>

            <div className="hidden lg:block">
              <div className="relative rounded-[2rem] border border-slate-900/10 bg-white/72 p-6">
                <div className="absolute top-14 left-10 right-10 h-px bg-[linear-gradient(90deg,rgba(255,122,48,0.2),rgba(23,109,105,0.35),rgba(17,32,48,0.16))]" />
                <div className="grid grid-cols-6 gap-4">
                  {steps.map((step) => (
                    <article key={step.number} className="relative flex flex-col items-center text-center">
                      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-slate-900/10 bg-white text-sm font-semibold text-slate-950 shadow-[0_10px_30px_rgba(24,39,58,0.1)]">
                        {step.number}
                      </div>
                      <h3 className="mt-4 text-sm font-semibold text-slate-950">{step.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{step.detail}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 lg:hidden">
              {steps.map((step) => (
                <article
                  key={step.number}
                  className="relative rounded-[1.7rem] border border-slate-900/10 bg-white/78 px-5 py-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-900/10 bg-white text-sm font-semibold text-slate-950">
                      {step.number}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-950">{step.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{step.detail}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.6rem] border border-slate-900/10 bg-white/78 p-5">
                <p className="label-mono text-[10px] text-[var(--muted)]">Checkpoint</p>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                  URL mode is safer because the script is grounded in retrieved evidence.
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-slate-900/10 bg-white/78 p-5">
                <p className="label-mono text-[10px] text-[var(--muted)]">Checkpoint</p>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                  The transcript should be reviewed before voice generation, especially for sparse
                  sites.
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-slate-900/10 bg-white/78 p-5">
                <p className="label-mono text-[10px] text-[var(--muted)]">Checkpoint</p>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                  Audio quality cannot compensate for weak evidence. The upstream stages still
                  decide trust.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="stack"
          className="how-slide rounded-[2.2rem] px-6 py-8 sm:px-8 lg:min-h-[70vh] lg:px-10 lg:py-10"
        >
          <div className="max-w-3xl">
            <p className="label-mono text-[11px] text-[var(--muted)]">04 / Tool stack</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              How the three tools are actually used.
            </h2>
          </div>

          <div className="mt-8 grid gap-5 xl:grid-cols-3">
            {tools.map((tool) => (
              <article
                key={tool.name}
                className="rounded-[1.9rem] border border-slate-900/10 bg-white/78 p-6 shadow-[0_20px_60px_rgba(24,39,58,0.08)]"
              >
                <div
                  className={`inline-flex rounded-full border px-3 py-2 text-sm font-medium ${tool.toneClass}`}
                >
                  {tool.name}
                </div>
                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                  {tool.role}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{tool.detail}</p>

                <div className="mt-5 rounded-[1.5rem] border border-slate-900/10 bg-[rgba(255,255,255,0.72)] p-4">
                  {tool.name === "Needle" ? (
                    <div className="space-y-3">
                      <div className="rounded-full bg-[rgba(255,122,48,0.18)] px-3 py-2 text-xs text-slate-900">
                        source page
                      </div>
                      <div className="rounded-full bg-[rgba(255,122,48,0.12)] px-3 py-2 text-xs text-slate-900">
                        top chunks
                      </div>
                      <div className="rounded-full bg-[rgba(255,122,48,0.08)] px-3 py-2 text-xs text-slate-900">
                        grounded context
                      </div>
                    </div>
                  ) : null}

                  {tool.name === "Featherless AI" ? (
                    <div className="space-y-3">
                      <div className="rounded-[1rem] bg-[rgba(23,109,105,0.1)] px-3 py-3 text-xs text-slate-900">
                        Host A: evidence-backed introduction
                      </div>
                      <div className="rounded-[1rem] bg-[rgba(23,109,105,0.14)] px-3 py-3 text-xs text-slate-900">
                        Host B: verified response
                      </div>
                      <div className="rounded-[1rem] bg-[rgba(23,109,105,0.08)] px-3 py-3 text-xs text-slate-900">
                        Rewrite pass removes unsupported claims
                      </div>
                    </div>
                  ) : null}

                  {tool.name === "ElevenLabs" ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-[1rem] bg-slate-950 px-3 py-3 text-xs text-white/80">
                          Voice A
                        </div>
                        <div className="rounded-[1rem] bg-slate-950 px-3 py-3 text-xs text-white/80">
                          Voice B
                        </div>
                      </div>
                      <div className="flex items-end gap-1">
                        {[18, 28, 22, 36, 20, 31, 25, 40, 22].map((height, index) => (
                          <span
                            key={`${height}-${index}`}
                            className="how-wave-bar w-2 rounded-full bg-slate-900/70"
                            style={{ height }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {tool.bullets.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-900/10 bg-white/85 px-3 py-2 text-xs text-[var(--muted)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="trust"
          className="how-slide rounded-[2.2rem] px-6 py-8 sm:px-8 lg:min-h-[70vh] lg:px-10 lg:py-10"
        >
          <div className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
            <article className="rounded-[1.9rem] border border-slate-900/10 bg-white/78 p-6">
              <p className="label-mono text-[11px] text-[var(--muted)]">05 / Trust</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                What reduces false information today.
              </h2>
              <div className="mt-6 space-y-3">
                {safeguards.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.4rem] border border-slate-900/10 bg-white/85 px-4 py-4 text-sm leading-7 text-[var(--muted)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[1.9rem] border border-slate-900/10 bg-slate-950 p-6 text-white">
              <p className="label-mono text-[11px] text-white/55">Quality lanes</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                Not every site deserves the same confidence.
              </h3>
              <div className="mt-6 space-y-4">
                {qualityLanes.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4"
                  >
                    <p className="label-mono text-[10px] text-white/45">{item.label}</p>
                    <h4 className="mt-2 text-base font-semibold">{item.title}</h4>
                    <p className="mt-2 text-sm leading-7 text-white/70">{item.detail}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section id="future" className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
          <article className="how-slide rounded-[2.2rem] px-6 py-8 sm:px-8 lg:min-h-[62vh] lg:px-10 lg:py-10">
            <p className="label-mono text-[11px] text-[var(--muted)]">06 / Use cases</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Where this product fits well right now.
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {useCases.map((item, index) => (
                <article
                  key={item}
                  className="rounded-[1.6rem] border border-slate-900/10 bg-white/80 px-4 py-5"
                >
                  <p className="label-mono text-[10px] text-[var(--muted)]">
                    Case {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-900">{item}</p>
                </article>
              ))}
            </div>
          </article>

          <article className="how-slide rounded-[2.2rem] px-6 py-8 sm:px-8 lg:min-h-[62vh] lg:px-10 lg:py-10">
            <p className="label-mono text-[11px] text-[var(--muted)]">07 / What&apos;s next</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Additional features worth building next.
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {roadmap.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[1.6rem] border border-slate-900/10 bg-white/80 p-5"
                >
                  <h3 className="text-base font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.detail}</p>
                </article>
              ))}
            </div>
          </article>
        </section>

        <section className="how-slide rounded-[2.2rem] px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="max-w-xl">
              <p className="label-mono text-[11px] text-[var(--muted)]">08 / FAQ</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                Common questions about reliability.
              </h2>
              <p className="mt-5 text-base leading-7 text-[var(--muted)]">
                This page is intentionally blunt: grounded generation is a workflow problem, not a
                magic prompt problem.
              </p>
            </div>

            <div className="space-y-3">
              {faqItems.map((item) => (
                <details
                  key={item.question}
                  className="how-faq-item rounded-[1.5rem] border border-slate-900/10 bg-white/80 px-5 py-4"
                >
                  <summary className="how-faq-summary cursor-pointer list-none pr-8 text-base font-semibold text-slate-950">
                    {item.question}
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="how-slide how-slide-dark rounded-[2.2rem] px-6 py-8 sm:px-8 lg:px-10 lg:py-12">
          <div className="mx-auto max-w-3xl text-center">
            <p className="label-mono text-[11px] text-white/50">Final slide</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              Retrieval first. Script second. Audio last.
            </h2>
            <p className="mt-5 text-base leading-7 text-white/72 sm:text-lg">
              That order is the reason the product can improve. Each stage is measurable,
              debuggable, and replaceable without pretending that one model should do everything.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
              >
                Open the studio
              </Link>
              <a
                href="#problem"
                className="inline-flex items-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/35"
              >
                Revisit the problem
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
