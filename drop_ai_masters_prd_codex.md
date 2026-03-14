# PRD for Codex — Drop Hackathon — AI Masters Student Scope

## Project
**Name:** Drop  
**One-liner:** Paste any URL or topic and generate a short two-host podcast episode.

## Goal of this PRD
This document is only for the **AI Masters Student** scope. The work here is intentionally narrow:
1. Build the **Needle ingestion + retrieval helper** in `lib/needle.ts`
2. Set up a tiny **ElevenLabs character budget tracker** for the team
3. Hand John one clean function he can import into the main pipeline

This PRD is written so Codex can implement the student-owned scope without touching unrelated parts of the app.

---

## Product context
The full product flow is:
1. User enters a website URL or free-text topic
2. Needle extracts useful text from the URL
3. Claude or Featherless turns that text into a dialogue script
4. ElevenLabs turns dialogue into audio
5. Audio is played and shared

### Important scoping rule
For the AI Masters Student role, **do not build the full pipeline**. Only build the data-ingestion layer plus usage tracking.

---

## Owner scope
### In scope
- `lib/needle.ts`
- Optional helper in `lib/elevenlabsBudget.ts`
- A very small local test script if needed
- Clean handoff notes for John

### Out of scope
- UI
- Claude route logic
- Featherless integration
- Audio stitching
- WhatsApp sharing
- Styling

---

## Primary deliverable
Create a production-safe helper:

```ts
export async function extractContent(input: string): Promise<string>
```

Behavior:
- If `input` is plain text, return it unchanged
- If `input` is a URL:
  - create a Needle collection
  - add the URL as a file
  - wait until indexing is ready, with timeout + polling
  - search the collection for the most useful chunks
  - return one plain-text string made from the top results
- On failure, throw a readable `Error`

John will import this function into `app/api/generate/route.ts`.

---

## Technical requirements
### Stack assumptions
- Next.js App Router
- TypeScript
- Node runtime
- Environment variable: `NEEDLE_API_KEY`

### Official SDK notes
Use Needle's TypeScript SDK package `@needle-ai/needle`. The official docs show:
- install with `npm install @needle-ai/needle`
- import from `@needle-ai/needle/v1`
- search via `needle.collections.search({ collection_id, text })`
- Needle collections/files are the core model, and indexing happens after a file is added

If the exact method signature for `collections.files.add` or `collections.files.list` differs in the installed SDK version, adapt the code to the installed typings but preserve the behavior described in this PRD.

---

## Functional requirements
### 1) URL detection
Implement a robust helper:
- Accept `http://` and `https://`
- Trim whitespace first
- Reject empty strings

### 2) Plain text passthrough
If input is not a URL, return it unchanged.

### 3) Needle collection lifecycle
For URL input:
- create a uniquely named collection, e.g. `drop-${Date.now()}`
- add the URL as a file to that collection
- poll collection files until the file is indexed, or timeout
- then run a semantic search

### 4) Search behavior
Search should aim to retrieve the content most useful for script generation.
Default query:
`key claims, main arguments, summary, important points`

Fallback query if results are weak:
`main content, key points, evidence, conclusions`

### 5) Return value
Return a single cleaned string built from search results.
- join chunks with `\n\n`
- trim whitespace
- deduplicate exact duplicate chunks
- cap total returned text to about 8,000 characters so later prompts stay manageable

### 6) Error handling
Throw clear errors for:
- missing `NEEDLE_API_KEY`
- empty input
- collection creation failure
- file upload failure
- indexing timeout
- no meaningful search results

---

## Non-functional requirements
- Keep code simple and readable
- No frontend code
- No silent failures
- No secrets logged
- Console logs may be used for local debugging only
- Add comments only where useful

---

## Files to create
### Required
#### `lib/needle.ts`
Responsibilities:
- initialize Needle client
- expose `extractContent(input)`
- contain small private helpers for:
  - `isUrl`
  - `waitForCollectionIndexing`
  - `normalizeResults`
  - `truncateContext`

### Optional
#### `lib/elevenlabsBudget.ts`
Responsibilities:
- estimate characters used
- return warnings when nearing the limit
- keep implementation dead simple

Possible exports:
```ts
export function estimateCharacters(text: string): number
export function getUsageWarning(totalUsed: number): string | null
```

---

## Implementation details for Codex
### `lib/needle.ts`
Codex should implement roughly this structure:

```ts
import { Needle } from "@needle-ai/needle/v1";

const needle = new Needle({
  apiKey: process.env.NEEDLE_API_KEY,
});

const SEARCH_QUERIES = [
  "key claims, main arguments, summary, important points",
  "main content, key points, evidence, conclusions",
];

const MAX_RETURN_CHARS = 8000;
const POLL_INTERVAL_MS = 2000;
const INDEX_TIMEOUT_MS = 45000;

function isUrl(input: string): boolean {
  try {
    const url = new URL(input.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function truncateContext(text: string, maxChars = MAX_RETURN_CHARS): string {
  return text.length <= maxChars ? text : text.slice(0, maxChars);
}

function normalizeResults(results: Array<{ content?: string }>): string {
  const seen = new Set<string>();
  const chunks: string[] = [];

  for (const result of results ?? []) {
    const content = result?.content?.trim();
    if (!content) continue;
    if (seen.has(content)) continue;
    seen.add(content);
    chunks.push(content);
  }

  return truncateContext(chunks.join("\n\n").trim());
}

async function waitForCollectionIndexing(collectionId: string): Promise<void> {
  const start = Date.now();

  while (Date.now() - start < INDEX_TIMEOUT_MS) {
    const files = await needle.collections.files.list({
      collection_id: collectionId,
    });

    if (files?.length && files.every((file: any) => file.status === "indexed")) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error("Needle indexing timed out");
}

export async function extractContent(input: string): Promise<string> {
  if (!process.env.NEEDLE_API_KEY) {
    throw new Error("Missing NEEDLE_API_KEY");
  }

  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Input is required");
  }

  if (!isUrl(trimmed)) {
    return trimmed;
  }

  const collection = await needle.collections.create({
    name: `drop-${Date.now()}`,
  });

  await needle.collections.files.add({
    collection_id: collection.id,
    files: [
      {
        url: trimmed,
        name: "source-url",
      },
    ],
  });

  await waitForCollectionIndexing(collection.id);

  for (const query of SEARCH_QUERIES) {
    const results = await needle.collections.search({
      collection_id: collection.id,
      text: query,
    });

    const normalized = normalizeResults(results as Array<{ content?: string }>);
    if (normalized) return normalized;
  }

  throw new Error("Needle returned no meaningful content");
}
```

### Important note for Codex
The exact response shapes may differ by SDK version. Prefer the installed type definitions in the repo over this sketch.

---

## Budget tracking requirement
The team must not burn ElevenLabs credits during dev.

### Rules
- Dev test phrase only: `Hello, this is a test.`
- Each teammate uses their own ElevenLabs key
- Pre-generate demo audio before the pitch
- Warn team loudly near 8,000 characters on any account

### Minimal helper
Create an optional utility that only estimates characters; it does not need persistence.

```ts
export function estimateCharacters(text: string): number {
  return text.length;
}

export function getUsageWarning(totalUsed: number): string | null {
  if (totalUsed >= 8000) return "WARNING: account is near ElevenLabs limit";
  if (totalUsed >= 6000) return "Heads-up: usage is getting high";
  return null;
}
```

This can be used manually in development logs or in a simple notebook/text file. No database needed.

---

## Acceptance criteria
### Needle helper
- `extractContent("artificial intelligence")` returns `"artificial intelligence"`
- `extractContent("https://example.com")` returns readable plain text
- returned text is not raw HTML
- errors are human-readable
- indexing timeout is handled cleanly

### Budget helper
- returns exact `text.length`
- warns at 6,000+
- urgent warning at 8,000+

---

## Testing checklist
### Local setup
1. Add `NEEDLE_API_KEY` to `.env.local`
2. Install SDK: `npm install @needle-ai/needle`
3. Run the app or a simple node test script

### Manual tests
#### Test A — plain text
Input:
`artificial intelligence`

Expected:
same string returned

#### Test B — valid URL
Input:
A public article URL

Expected:
- collection created
- file indexed
- search returns readable text
- function resolves with plain text

#### Test C — bad input
Input:
empty string

Expected:
throws `Input is required`

#### Test D — timeout path
Simulate indexing failure or use a very low timeout during test

Expected:
throws `Needle indexing timed out`

---

## Handoff to John
When done, send John exactly this:

> Needle helper is ready in `lib/needle.ts`. Import `extractContent(input)` into the generate route. It returns plain text for topics and retrieved text for URLs. It throws readable errors and waits for indexing before search.

Also mention:
- package installed: `@needle-ai/needle`
- env required: `NEEDLE_API_KEY`
- any SDK signature changes you had to make

---

## Nice-to-have improvements if time remains
Only do these after the basic helper works:
1. better retrieval query tuning
2. result scoring or chunk filtering
3. cleanup of temporary collections if SDK supports deletion easily
4. domain-specific fallback for pages with poor extraction

Do not spend more than 15 extra minutes on nice-to-haves.

---

## Do not do
- do not build the full podcast pipeline
- do not add frontend work
- do not refactor John's route
- do not touch Featherless unless explicitly asked
- do not spend time polishing architecture
- do not optimize early

---

## One-sentence mission for Codex
Implement a reliable `extractContent(input)` helper for Drop that turns a pasted URL into clean searchable text via Needle, plus a tiny ElevenLabs usage warning helper, with clear errors and fast handoff to the pipeline owner.
