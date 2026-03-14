import { Needle } from "@needle-ai/needle/v1";

const SEARCH_QUERIES = [
  "key claims, main arguments, summary, important points",
  "main content, key points, evidence, conclusions",
  "about, biography, experience, work, projects, skills, contact",
];

const NEEDLE_API_URL = process.env.NEEDLE_API_URL?.trim() || "https://needle.app";
const MAX_RETURN_CHARS = 8000;
const POLL_INTERVAL_MS = 2000;
const INDEX_TIMEOUT_MS = 45000;

function getNeedleApiKey(): string {
  const apiKey = process.env.NEEDLE_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing NEEDLE_API_KEY");
  }

  return apiKey;
}

function getNeedleClient(): Needle {
  return new Needle({ apiKey: getNeedleApiKey() });
}

export function isUrl(input: string): boolean {
  try {
    const url = new URL(input.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function truncateContext(text: string, maxChars = MAX_RETURN_CHARS): string {
  return text.length <= maxChars ? text : `${text.slice(0, maxChars - 3).trimEnd()}...`;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function cleanText(text: string): string {
  return decodeHtmlEntities(
    text
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
      .replace(/\\([[\]()*_`#+.!-])/g, "$1")
      .replace(/\r\n/g, "\n"),
  )
    .split("\n")
    .map((line) => line.trim())
    .filter((line, index, lines) => {
      if (!line) {
        return index > 0 && lines[index - 1] !== "";
      }

      return line.length > 1;
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function fetchPageMetadata(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        "User-Agent": "DropPodcastBot/1.0",
      },
    });

    if (!response.ok) {
      return "";
    }

    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const descriptionMatch = html.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i,
    );
    const title = titleMatch ? cleanText(titleMatch[1]) : "";
    const description = descriptionMatch ? cleanText(descriptionMatch[1]) : "";

    return [title, description].filter(Boolean).join("\n");
  } catch {
    return "";
  }
}

function normalizeResults(results: Array<{ content?: string }>): string {
  const seen = new Set<string>();
  const chunks: string[] = [];

  for (const result of results) {
    const content = cleanText(result.content?.trim() ?? "");

    if (!content || seen.has(content)) {
      continue;
    }

    seen.add(content);
    chunks.push(content);
  }

  return truncateContext(chunks.join("\n\n").trim());
}

async function getCollectionStatusSummary(collectionId: string): Promise<{
  indexedFiles: number;
  erroredFiles: number;
  activeFiles: number;
}> {
  const response = await fetch(`${NEEDLE_API_URL}/api/v1/collections/${collectionId}/stats`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": getNeedleApiKey(),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Needle could not read collection status");
  }

  const payload = (await response.json()) as {
    result?: {
      data_stats?: Array<{
        status?: string;
        files?: number;
      }>;
    };
  };
  const dataStats = payload.result?.data_stats ?? [];

  return dataStats.reduce(
    (summary, entry) => {
      const files = entry.files ?? 0;

      if (entry.status === "indexed") {
        summary.indexedFiles += files;
      } else if (entry.status === "error") {
        summary.erroredFiles += files;
      } else {
        summary.activeFiles += files;
      }

      return summary;
    },
    {
      indexedFiles: 0,
      erroredFiles: 0,
      activeFiles: 0,
    },
  );
}

async function waitForCollectionIndexing(collectionId: string): Promise<void> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < INDEX_TIMEOUT_MS) {
    const { activeFiles, indexedFiles, erroredFiles } =
      await getCollectionStatusSummary(collectionId);

    if (erroredFiles > 0) {
      throw new Error("Needle failed to index the source URL");
    }

    if (indexedFiles > 0 && activeFiles === 0) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error("Needle indexing timed out");
}

export async function extractContent(input: string): Promise<string> {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new Error("Input is required");
  }

  if (!isUrl(trimmed)) {
    return trimmed;
  }

  const needle = getNeedleClient();
  const pageMetadata = await fetchPageMetadata(trimmed);

  const collection = await needle.collections
    .create({
      name: `drop-${Date.now()}`,
      model: null,
    })
    .catch(() => {
      throw new Error("Needle could not create a collection");
    });

  const uploadedFiles = await needle.collections.files
    .add({
      collection_id: collection.id,
      files: [
        {
          name: "source-url",
          url: trimmed,
        },
      ],
    })
    .catch(() => {
      throw new Error("Needle could not add the source URL");
    });

  if (!uploadedFiles.length || uploadedFiles.some((file) => file.status === "error")) {
    throw new Error("Needle could not add the source URL");
  }

  await waitForCollectionIndexing(collection.id);

  for (const query of SEARCH_QUERIES) {
    const results = await needle.collections.search({
      collection_id: collection.id,
      text: query,
      top_k: 12,
    });

    const normalized = normalizeResults(results);

    if (normalized) {
      return truncateContext([pageMetadata, normalized].filter(Boolean).join("\n\n").trim());
    }
  }

  if (pageMetadata) {
    return truncateContext(pageMetadata);
  }

  throw new Error("Needle returned no meaningful content");
}
