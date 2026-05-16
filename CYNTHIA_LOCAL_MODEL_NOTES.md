# Cynthia Local Model Notes

## Epiphany

Cynthia should not be a hosted-model wrapper. She is a portfolio piece, a voice study, and a private instrument. The right path is slower but better: keep the app local-first, teach a lightweight local model the house style, and let the iPhone act as the handset while the Mac runs the switchboard.

This will take time. That is the point. Each pass builds skill: corpus prep, OCR cleanup, style analysis, local inference, evaluation, and eventually a small adapter that carries Cynthia without sending the Arrangement outside the room.

The larger reason is work. Every Side Piece milestone should show a concrete skill: taste, restraint, privacy, local AI, voice design, telephony, and the ability to bridge messy real-world systems into something people can actually use.

## Working Principle

Train the voice, not the facts.

The goal is not to memorize magazines, essays, or private writing. The goal is to distill cadence, sentence shape, metaphor density, persona rules, taboo phrases, and response behavior into a small local model or adapter.

Keep raw source material private and out of the repo. If source text is copyrighted or personal, do not upload it to hosted training services and do not redistribute the cleaned corpus. Store it somewhere ignored, such as:

```text
local-corpus/
  raw/
  ocr/
  clean/
  notes/
  training/
```

## Phase 1: Local Cynthia Without Training

Use Ollama as the first switchboard.

```bash
brew install ollama
ollama serve
```

In another terminal:

```bash
npm run ollama:setup
npm run dev
```

Side Piece already calls:

```text
POST /api/assistant/respond
```

That endpoint talks to `OLLAMA_HOST` and `OLLAMA_MODEL`. The default model is `cynthia`, a lightweight Ollama model created from `ollama/Modelfile` on top of `llama3.2:3b`. The phone never calls a hosted model API; it only talks to the Mac running Side Piece.

## Phase 2: Build A Voice Bible

Read the source material and extract notes, not just text.

Track:

- sentence length: clipped, lush, winding, declarative
- address terms: Boss, Honey, Sugar, Executive
- favorite moves: aside, implication, command, velvet threat, dry joke
- sensory palette: rain, leather, brass, tobacco, office light, perfume, paper
- forbidden moves: modern corporate-speak, therapy voice, chatbot apologies, explaining jokes
- response shapes: one-line answer, three-line answer, operational report, flirtatious refusal, warning

The current system prompt in `server.ts` is the seed version of this voice bible.

## Phase 3: Make Training Pairs

Do not start by dumping raw magazine text into a trainer. Start by creating instruction pairs that teach behavior.

Example format:

```jsonl
{"messages":[{"role":"system","content":"You are Cynthia..."},{"role":"user","content":"hey cynthia summarize this call"},{"role":"assistant","content":"Boss, the line was mostly smoke and leverage..."}]}
```

Good pairs include:

- normal phone/message replies
- concise summaries
- refusals that stay in character
- Black Book command explanations
- follow-up questions
- “wrong tone” corrections
- before/after rewrites into Cynthia voice

Quality beats volume. A few hundred excellent pairs are better than thousands of lazy ones.

## Phase 4: Evaluate Before Fine-Tuning

Make a fixed eval set before training so progress is visible.

Create prompts like:

- “Cynthia, summarize this thread in three bullets.”
- “Write a brief response to a late-night client.”
- “Explain `/ghost` without breaking character.”
- “Say no to something risky, but stay warm.”
- “Rewrite this dry reminder in Cynthia’s voice.”

Score each response for:

- voice
- usefulness
- privacy
- brevity
- character integrity
- no modern chatbot smell

## Phase 5: Fine-Tune Locally

Once the eval set is stable, train a small local adapter. The likely path:

1. Pick a small instruct base model that runs well on the Mac.
2. Convert the training pairs to chat JSONL.
3. Run a local LoRA/QLoRA workflow.
4. Export or merge the adapter.
5. Load the result through Ollama or a local runtime.
6. Point `OLLAMA_MODEL` at the Cynthia model.

Model choice can change later. The important architecture is stable: local corpus, local training, local inference.

## Phase 6: Keep The Corpus Private

Add this to `.gitignore` before collecting source text:

```text
local-corpus/
*.jsonl
*.safetensors
*.gguf
```

Commit prompts, scripts, and notes. Do not commit raw scans, OCR dumps, copyrighted source text, generated training corpora that contain source passages, or model weights unless you are sure they are safe to publish.

## North Star

Cynthia should feel like she was written into existence for this app, not rented from a generic assistant. The app becomes the portfolio piece, the model becomes the craft project, and the phone becomes the private line.
