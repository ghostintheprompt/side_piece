# Cynthia Call Answering Workflow

## Working Idea

Cynthia answers a forwarded call, says Michael is busy, has a short conversation, writes the call up like a private office memo, and relays the important parts back into Side Piece.

## Portfolio Purpose

This project is not just a phone toy. It is a portfolio piece designed to show range and remove obstacles to getting work.

It demonstrates:

- product taste: a memorable assistant with a specific world, not a generic chatbot
- privacy judgment: local model, local transcription, local voice stack wherever possible
- systems thinking: phone network, webhooks, tunnels, local inference, app UI, Firestore logs
- practical AI: not hype, but a working assistant that handles real calls and writes useful summaries
- delivery skill: ship the reliable MVP first, then climb toward the cinematic version
- brand instinct: Cynthia is recognizable, opinionated, and demoable in under a minute

Every build step should answer: "Does this help someone understand what Michael can build, ship, and solve?"

The first version should be practical, not theatrical:

1. Caller reaches Cynthia's number.
2. Cynthia answers with a controlled greeting.
3. She collects the reason for the call.
4. She asks one or two clarifying questions.
5. She stores a transcript and summary.
6. She notifies Michael inside Side Piece.

Then we make her more alive: local speech-to-text, local Cynthia model, local text-to-speech, and a real back-and-forth conversation.

## Cost Snapshot

As of May 16, 2026, the cheapest sane path is Twilio for the phone number and phone network, then local everything else.

| Piece | Service | Estimated Cost |
| --- | --- | --- |
| Phone number | Twilio US local number | $1.15/month |
| Inbound calls | Twilio Programmable Voice local inbound | $0.0085/min |
| Outbound call leg, if Cynthia calls Michael | Twilio US/Canada outbound | $0.0140/min |
| Public tunnel to the Mac | Cloudflare Tunnel | Available on all Cloudflare plans |
| Speech-to-text | Local `whisper.cpp` or `faster-whisper` | $0 usage cost |
| Cynthia brain | Local Ollama model | $0 usage cost |
| Text-to-speech | Local Piper/Kokoro-style voice | $0 usage cost |

Twilio references:

- Twilio US local inbound: $0.0085/min and local number: $1.15/month  
  https://www.twilio.com/en-us/voice/pricing/us
- Twilio US/Canada outbound: $0.0140/min  
  https://www.twilio.com/en-us/voice/pricing/us
- Twilio real-time bidirectional call audio: Media Streams  
  https://www.twilio.com/docs/voice/media-streams
- Cloudflare Tunnel docs: available on all plans, public hostname to local service  
  https://developers.cloudflare.com/tunnel/

Example monthly cost before SMS or optional recordings:

| Minutes Answered | Approx Monthly Cost |
| --- | --- |
| 100 min | $1.15 + $0.85 = $2.00 |
| 500 min | $1.15 + $4.25 = $5.40 |
| 1,000 min | $1.15 + $8.50 = $9.65 |

If Cynthia also bridges or calls Michael by phone, add the outbound leg at about $0.014/min for that portion.

## Number Strategy

Yes: get a cheap dedicated line for Cynthia. Do not attach experiments to Michael's real number first.

The line should be:

- disposable enough to test with
- cheap enough to leave running
- separate from Michael's personal number
- programmable enough to hit our webhooks
- portable later if we outgrow the provider

Important distinction:

- A normal cheap cell/MVNO line can be under $10/month, but it is not easy for our app to answer, inspect, stream, or control. iOS will not let a web app or normal app take over cellular call audio.
- A programmable number like Twilio is technically VoIP/CPaaS, but it behaves like a real phone number to callers and gives us the hooks Cynthia needs: webhook on incoming call, recording callback, TwiML responses, and later Media Streams.

Recommendation:

1. Start with a Twilio local number for the build.
2. Forward Michael's missed/busy calls to Cynthia's number when testing.
3. Keep local STT/LLM/TTS on the Mac to avoid hosted AI costs.
4. If we later want a conventional carrier-owned number, port it into the programmable provider once the product is worth protecting.

Why not a cheap SIM first?

It looks cheaper on paper, but it becomes more expensive in engineering time. To make a normal SIM line answer like Cynthia, we would need an always-on phone, carrier forwarding tricks, Android telephony hacks, or a hardware modem. That is a nice future stunt, not the fastest portfolio win.

For this project, "cheap line" means "cheap programmable number," not a full VoIP phone system and not Michael's personal line.

## Call Modes

### Mode 1: Receptionist MVP

This is the first build.

Cynthia does not need full real-time conversation yet. She can answer, collect a message, ask a scripted follow-up, then summarize.

Greeting:

> Michael's tied up at the moment, Honey. Tell me what needs handling, and I will make sure it lands on the right desk.

Flow:

1. Twilio receives call.
2. Twilio plays Cynthia greeting.
3. Twilio records caller's message.
4. Server transcribes the recording locally.
5. Ollama turns transcript into Cynthia's memo.
6. Side Piece stores a new incident/message.
7. Michael sees summary in the app.

This avoids low-latency pain and proves the product.

### Mode 2: Turn-Taking Conversation

Cynthia has a back-and-forth, but one turn at a time.

Flow:

1. Caller speaks.
2. Local STT transcribes.
3. Ollama chooses Cynthia's reply.
4. Local TTS renders audio.
5. Twilio plays response.
6. Repeat until caller is done.

This is believable and much easier than live interruption.

### Mode 3: Real-Time Switchboard

Cynthia streams audio in and out over Twilio Media Streams.

Flow:

1. Twilio `<Connect><Stream>` opens a bidirectional WebSocket.
2. Server receives raw caller audio.
3. Local STT streams partial transcript.
4. Ollama replies.
5. Local TTS streams audio back to Twilio.
6. Cynthia can interrupt, clarify, and transfer.

This is the cinematic version. Build it after Modes 1 and 2 work.

## Architecture

```text
Caller
  -> Twilio number
  -> Cynthia webhook on public HTTPS URL
  -> Side Piece server on Mac
  -> local STT
  -> local Ollama cynthia model
  -> local TTS
  -> Twilio voice response
  -> Side Piece call log + summary
```

Public URL options:

- Cloudflare Tunnel: best default if we have a domain.
- ngrok: good for experiments, but production usage may need a paid plan and stable endpoint.
- Deployed server: later, if the Mac should not be the switchboard.

## Punch List

### Phase -1: No-Signup Local Desk

This phase is already scaffolded so we can build without waiting on a phone provider.

- `/api/voice/incoming` returns Twilio-compatible TwiML for Cynthia's greeting and recording step.
- `/api/voice/recording-complete` accepts the eventual provider recording webhook and files it locally.
- `/api/voice/local-message` simulates a caller transcript today, runs Cynthia's local summary path, and writes a call record.
- `/api/voice/local-calls` shows the local call drawer.
- `npm run voice:simulate` creates a simulated call.
- `npm run voice:inbox` reads the local call drawer.
- `.local-calls/` is ignored by git so transcripts and call records stay private.

Try it:

```bash
npm run dev
npm run voice:simulate "Hi Michael, this is Carol. Friday moved up and I need a yes before 3. Call me at 212-555-0198."
npm run voice:inbox
```

Success condition:

- No external account is required.
- A simulated call produces a Cynthia memo.
- The private call record lands in `.local-calls/`.

### Phase 0: Decide The Phone Path

- Buy/claim a Twilio local phone number.
- Decide whether Michael forwards missed calls, busy calls, or all calls.
- Decide greeting disclosure:
  - "This line may be transcribed so Michael gets the message right."
- Decide where summaries appear:
  - Side Piece conversation
  - SMS to Michael
  - email
  - desktop notification

### Phase 1: Webhook MVP

- Add `/api/voice/incoming` route.
- Return TwiML greeting.
- Add recording or speech-gather step.
- Add `/api/voice/recording-complete` route.
- Download recording or receive transcript.
- Store call record in Firestore.
- Create a Side Piece message from Cynthia.

Success condition:

- Call Cynthia number.
- Hear greeting.
- Leave message.
- Summary appears in Side Piece.

### Phase 2: Local Transcription

- Install local STT:
  - `whisper.cpp` for lightweight CPU-friendly runs
  - or `faster-whisper` for better speed if GPU/Metal path is comfortable
- Save Twilio recording temporarily.
- Transcribe locally.
- Delete raw audio after summary unless explicitly archived.
- Store transcript and summary.

Success condition:

- No hosted transcription service is used.
- Call transcript appears locally.

### Phase 3: Cynthia Summary Brain

- Send transcript to local Ollama `cynthia`.
- Generate:
  - executive summary
  - urgency level
  - caller name
  - callback number
  - requested action
  - suggested reply
- Add "interrupt Michael now" classifier.

Success condition:

- Cynthia's memo sounds like Cynthia, not a voicemail robot.

### Phase 4: Turn-Taking Conversation

- Add Twilio `<Gather>` or Media Streams turn capture.
- Generate Cynthia reply locally.
- Render reply with local TTS.
- Play reply back to caller.
- Loop until caller hangs up or says done.

Success condition:

- Caller can have a simple two-to-four-turn conversation.

### Phase 5: Real-Time Media Stream

- Add Twilio bidirectional `<Connect><Stream>`.
- Add WebSocket server route.
- Decode inbound μ-law audio.
- Stream to local STT.
- Stream local TTS audio back to Twilio.
- Add latency budget and barge-in handling.

Success condition:

- Cynthia answers and responds with less awkward delay.

### Phase 6: Training Cynthia

- Build private corpus in `local-corpus/`.
- Build voice bible.
- Create instruction pairs.
- Make fixed eval prompts.
- Fine-tune local adapter.
- Replace or augment `ollama/Modelfile`.

Success condition:

- Smaller model carries Cynthia's tone without a giant prompt.

## Files To Add Later

```text
src/services/calls.ts
src/services/transcription.ts
src/services/tts.ts
src/services/callSummaries.ts
src/types/calls.ts
server/voiceRoutes.ts
server/mediaStream.ts
scripts/stt/
scripts/tts/
```

## Data Model Draft

```ts
interface CallRecord {
  id: string;
  ownerId: string;
  callSid: string;
  from: string;
  to: string;
  status: 'new' | 'transcribing' | 'summarized' | 'needs_attention' | 'archived';
  startedAt: unknown;
  endedAt?: unknown;
  durationSeconds?: number;
  transcript?: string;
  summary?: string;
  urgency?: 'low' | 'normal' | 'high' | 'interrupt';
  callerName?: string;
  callbackNumber?: string;
  requestedAction?: string;
}
```

## Consent And Safety

Recording/transcription laws vary by state and call participants. Default Cynthia should disclose transcription before collecting a message.

Default phrase:

> This line may be transcribed so Michael gets the message right.

If the caller says emergency, medical crisis, threat, or legal trouble, Cynthia should stop being cute and mark the call `interrupt`.

## First Build Recommendation

Start with Mode 1. It is cheap, reliable, and immediately useful.

Do not start with real-time streaming. That version is seductive, but it adds latency, audio codecs, WebSockets, streaming STT, streaming TTS, and failure modes all at once.

Mode 1 gives us Cynthia answering the phone quickly. Then we teach her to talk.
