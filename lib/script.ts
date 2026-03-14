import type { EpisodeDialogueLine, EpisodeHost, HostId, PodcastEpisode } from "@/lib/types";

const FEATHERLESS_API_URL = "https://api.featherless.ai/v1/chat/completions";
const DEFAULT_MODEL =
  process.env.FEATHERLESS_MODEL?.trim() || "Qwen/Qwen2.5-7B-Instruct";

const BASE_SYSTEM_PROMPT = [
  "You create short, sharp two-host podcast episodes.",
  "Keep the finished spoken runtime around 90 to 150 seconds.",
  "Host A should be the confident explainer. Host B should be curious and slightly skeptical.",
  "Each dialogue turn should be concise, natural, and under 320 characters.",
  "Do not include stage directions, scene descriptions, or markdown.",
  "Return JSON only.",
].join(" ");

const URL_GROUNDING_RULES = [
  "Treat the provided context as the only source of truth.",
  "Stay grounded in the provided context and do not invent unsupported facts.",
  "If a detail is not explicit in the context, omit it.",
  "Do not add filler judgments such as impressive, exciting, successful, going well, or promising unless the source explicitly supports them.",
  "Do not infer future progress, motivations, current status, or business results beyond what the source states.",
  "Prefer source-anchored phrasing like 'the site says' or 'according to the source' when describing a person, company, or project.",
  "The tone should be neutral and factual, not promotional.",
].join(" ");

const JSON_SHAPE = {
  title: "Short episode title",
  hook: "One punchy sentence that sells the topic",
  summary: "Two short sentences summarizing the episode",
  hosts: [
    {
      id: "hostA",
      name: "Maya",
      role: "Lead explainer",
    },
    {
      id: "hostB",
      name: "Leo",
      role: "Curious co-host",
    },
  ],
  dialogue: [
    {
      speaker: "hostA",
      text: "First short dialogue turn",
    },
    {
      speaker: "hostB",
      text: "Second short dialogue turn",
    },
  ],
};

function getFeatherlessApiKey(): string {
  const apiKey = process.env.FEATHERLESS_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing FEATHERLESS_API_KEY");
  }

  return apiKey;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeHost(value: unknown, expectedId: HostId, fallbackName: string): EpisodeHost {
  if (!isRecord(value)) {
    return {
      id: expectedId,
      name: fallbackName,
      role: expectedId === "hostA" ? "Lead explainer" : "Curious co-host",
    };
  }

  const name = typeof value.name === "string" ? value.name.trim() : fallbackName;
  const role =
    typeof value.role === "string" && value.role.trim()
      ? value.role.trim()
      : expectedId === "hostA"
        ? "Lead explainer"
        : "Curious co-host";

  return {
    id: expectedId,
    name: name || fallbackName,
    role,
  };
}

function normalizeDialogue(value: unknown): EpisodeDialogueLine[] {
  if (!Array.isArray(value)) {
    throw new Error("Featherless returned an invalid dialogue payload.");
  }

  const dialogue = value
    .map((line) => {
      if (!isRecord(line)) {
        return null;
      }

      const speaker = line.speaker === "hostB" ? "hostB" : "hostA";
      const text = typeof line.text === "string" ? line.text.trim() : "";

      if (!text) {
        return null;
      }

      return {
        speaker,
        text: text.slice(0, 320),
      } satisfies EpisodeDialogueLine;
    })
    .filter((line): line is EpisodeDialogueLine => Boolean(line));

  if (dialogue.length < 6) {
    throw new Error("Featherless did not return enough dialogue.");
  }

  return dialogue;
}

function parseEpisodePayload(payload: string): PodcastEpisode {
  let parsed: unknown;

  try {
    parsed = JSON.parse(payload);
  } catch {
    throw new Error("Featherless returned malformed JSON.");
  }

  if (!isRecord(parsed)) {
    throw new Error("Featherless returned an invalid episode payload.");
  }

  const hostsRaw = Array.isArray(parsed.hosts) ? parsed.hosts : [];
  const hosts = [
    normalizeHost(hostsRaw[0], "hostA", "Maya"),
    normalizeHost(hostsRaw[1], "hostB", "Leo"),
  ];
  const title = typeof parsed.title === "string" ? parsed.title.trim() : "";
  const hook = typeof parsed.hook === "string" ? parsed.hook.trim() : "";
  const summary = typeof parsed.summary === "string" ? parsed.summary.trim() : "";
  const dialogue = normalizeDialogue(parsed.dialogue);

  if (!title || !hook || !summary) {
    throw new Error("Featherless returned an incomplete episode.");
  }

  return {
    title,
    hook,
    summary,
    hosts,
    dialogue,
  };
}

function extractMessageContent(message: unknown): string {
  if (typeof message === "string") {
    return message.trim();
  }

  if (Array.isArray(message)) {
    return message
      .map((part) => (isRecord(part) && typeof part.text === "string" ? part.text : ""))
      .join("\n")
      .trim();
  }

  return "";
}

function extractJsonPayload(content: string): string {
  const trimmed = content.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch?.[1]?.trim() || trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    throw new Error("Featherless did not return a JSON object.");
  }

  return candidate.slice(start, end + 1);
}

async function readErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await response.json().catch(() => null)) as
      | {
          error?: {
            message?: string;
          };
          message?: string;
        }
      | null;

    return payload?.error?.message || payload?.message || response.statusText;
  }

  const text = await response.text().catch(() => "");
  return text || response.statusText;
}

async function requestEpisodeJson({
  systemPrompt,
  userPrompt,
  temperature,
}: {
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
}): Promise<string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${getFeatherlessApiKey()}`,
    "Content-Type": "application/json",
    "X-Title": "Drop",
  };
  const referer = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (referer) {
    headers["HTTP-Referer"] = referer;
  }

  const response = await fetch(FEATHERLESS_API_URL, {
    method: "POST",
    headers,
    cache: "no-store",
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      temperature,
      max_tokens: 1100,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Featherless request failed: ${await readErrorMessage(response)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: unknown;
      };
    }>;
  };
  const content = extractMessageContent(payload.choices?.[0]?.message?.content);

  if (!content) {
    throw new Error("Featherless returned an empty response.");
  }

  return extractJsonPayload(content);
}

function buildDraftPrompt({
  source,
  context,
  sourceType,
}: {
  source: string;
  context: string;
  sourceType: "topic" | "url";
}): string {
  const requirements =
    sourceType === "url"
      ? [
          "- Use only facts supported by the context.",
          "- If the source is a personal or company website, speak as if summarizing what the site says. Do not invent extra context.",
          "- Do not imply progress, traction, quality, or outcomes unless the source says so explicitly.",
          "- Prefer specific concrete facts from the source: names, roles, numbers, technologies, projects, dates, locations.",
          "- If a line cannot be supported by the source, remove it rather than guessing.",
        ]
      : [
          "- Use general knowledge to explain the topic clearly.",
          "- Keep the explanation accessible and useful for a short podcast.",
          "- Avoid niche jargon unless one host immediately explains it.",
        ];

  return [
    "Build a podcast episode from the source and context below.",
    "Return JSON only with this exact shape:",
    JSON.stringify(JSON_SHAPE, null, 2),
    "Requirements:",
    "- Exactly 2 hosts: hostA and hostB.",
    "- 8 to 14 dialogue turns total.",
    "- Keep every dialogue turn under 320 characters.",
    ...requirements,
    "",
    `Source: ${source}`,
    "",
    "Context:",
    context,
  ].join("\n");
}

async function factCheckEpisode({
  source,
  context,
  draftJson,
}: {
  source: string;
  context: string;
  draftJson: string;
}): Promise<PodcastEpisode> {
  const reviewedJson = await requestEpisodeJson({
    systemPrompt: [
      BASE_SYSTEM_PROMPT,
      URL_GROUNDING_RULES,
      "You are now acting as a fact-checking editor.",
      "Rewrite the draft so every factual statement is directly supported by the source context.",
      "Delete or soften unsupported reactions, opinions, predictions, and filler.",
      "Fix awkward host lines if needed, but keep the episode compact.",
    ].join(" "),
    userPrompt: [
      "Review and rewrite this podcast draft.",
      "Return the same JSON shape.",
      "Remove or rewrite anything not clearly supported by the source.",
      "",
      `Source: ${source}`,
      "",
      "Context:",
      context,
      "",
      "Draft JSON:",
      draftJson,
    ].join("\n"),
    temperature: 0.05,
  });

  return parseEpisodePayload(reviewedJson);
}

export async function generatePodcastEpisode({
  source,
  context,
  sourceType,
}: {
  source: string;
  context: string;
  sourceType: "topic" | "url";
}): Promise<PodcastEpisode> {
  const draftJson = await requestEpisodeJson({
    systemPrompt:
      sourceType === "url"
        ? `${BASE_SYSTEM_PROMPT} ${URL_GROUNDING_RULES}`
        : BASE_SYSTEM_PROMPT,
    userPrompt: buildDraftPrompt({
      source,
      context,
      sourceType,
    }),
    temperature: sourceType === "url" ? 0.12 : 0.3,
  });

  if (sourceType === "url") {
    return factCheckEpisode({
      source,
      context,
      draftJson,
    });
  }

  return parseEpisodePayload(draftJson);
}
