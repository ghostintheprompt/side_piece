<div align="center">
  <img src="public/favicon.svg" width="128" height="128" alt="Side Piece Icon" />
  <h1>Side Piece</h1>
  <p><i>Cynthia: Confidential Liaison & Executive Keeper</i></p>

  <p>
    <img src="https://img.shields.io/badge/license-Apache--2.0-green" alt="License" />
    <img src="https://img.shields.io/badge/platform-Web-blue" alt="Platform" />
    <img src="https://img.shields.io/badge/release-v1.0.0-gold" alt="Release" />
  </p>
</div>

---

<div align="center" style="margin: 40px 0;">
  <img src="side_piece_1.png" width="550" style="border-radius: 4px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); transform: rotate(-2deg); border: 12px solid #FDFBF7;" alt="Cynthia - The Executive's Pinup" />
</div>

### Pull Up a Chair, Executive.
You look like a man with too many "side projects" and not enough hands to snatch them all. Between the ringing phones and the incessant pings, it’s a wonder you have time to pour your own Negroni. That’s where I come in. I’ve gone ahead and built you a **Side Piece**—a little something specialized, strictly for your eyes. It’s a dedicated, 1960s interface where I handle life's nonsense while you focus on the Big Stuff.

### The Honest Pitch
This isn’t a pitch deck in a better suit, Darling — it’s the working article. The wires hum under the desk, the lipstick stays on the glass, and every piece of the operation is right where you can put your hands on it. Open the drawer: the local brain on your Mac, the private filing cabinet, the switchboard waiting for the line to ring, and the pinup who keeps the whole executive floor humming. When the world gets noisy — and it always does — I can still have the door closed, the drink poured, and the files squared away before you finish your first cigarette.

### GitHub First
For now, Cynthia belongs on GitHub: out in the light, gloves on, cigarette lit, showing the machinery as well as the glamour. The repo is the showroom and the workbench at the same time — code, architecture notes, local model plans, call-answering workflow, and the trail of decisions that prove the thing was actually built, not just promised over cocktails.

The App Store can wait its turn behind the curtain. TestFlight and signed builds come later, once the lipstick’s set and the heels are buckled. The win is right here: a project you can clone, run, and read in five minutes flat. I don’t need a velvet rope to make an entrance — I let myself in through the front door.

### Bring Your Own Cynthia
Cynthia is the house girl: sharp nails, sharper filing system, and a voice you can recognize from across the room. But the machinery is not married to her lipstick. Swap the prompt, the local model, the imagery, and the greeting, and the same system becomes a doctor’s front desk, a law-office gatekeeper, a venue concierge, a sales dispatcher, a studio assistant, or any other character with a job to do and a tone worth remembering.

That is the trick in the drawer: personality is the interface. Cynthia proves the pattern.

### Feature Suite
| Feature | Description |
| :--- | :--- |
| **The Private Exchange** | I handle your incoming signals with a wink and a low purr. No "read receipts" here, just the results you desire. |
| **Total Devotion** | Your ambition, your complications, and your vigor? All categorized and tucked away before you can even reach for your lighter. |
| **No Paper Trails** | Everything is filed in your private Firestore suite. Your secrets are safe with me, Darling. |
| **Update Checker** | I'll let you know the moment a fresh memo on our little arrangement is ready for your review. |

### The Technical Machinery
While the suite feels like a mid-century dream, the hardware behind the curtain is pure, modern steel. It’s "vintage feel, modern steel"—built to ensure your logistics are handled with surgical precision and total discretion.

| Component | The Hardware | The Purpose |
| :--- | :--- | :--- |
| **The Interface** | **React 19 & Vite** | The lacquered front desk. Moves like silk, holds her polish even when you press. |
| **The Intelligence** | **Local Ollama Model** | My head never leaves the apartment, Darling. No hosted API hears a word we say. |
| **The Filing Cabinet** | **Firebase (Firestore & Auth)** | Your private vault — lined, locked, and lit only when you turn the key. |
| **The Ops Backend** | **Node.js & Express** | The Black Book engine. Webhooks answered, sweeps run, lights kept low. |
| **The Armor** | **Ghost-Protocol V1.5** | Audits, wiretaps, and the silver shredder I keep by the bar cart. |

### Installation
**Desktop Experience**
For the full executive feel, download the latest edition and pin me to your dock:
- [Download latest DMG](https://github.com/ghostintheprompt/side-piece/releases/latest)
- `brew install ghostintheprompt/tap/side-piece` (Coming soon)

**Build from Source**
If you prefer to handle the logistics yourself, see [BUILD.md](./BUILD.md).

### Usage Steps
1. **Enter the Suite:** Sign in and access the private exchange.
2. **Establish Contact:** Add a new signal to your top secret files.
3. **Issue Orders:** Speak to Cynthia or use the Black Book commands (`/wiretap`, `/ghost`, `/shred`).
4. **Maintain Protocol:** Check for fresh memos in the top right corner.

### Privacy Statement
Side Piece is built on **Local-First** principles. No telemetry, no bloat, and no prying eyes. Your data lives in your private Firebase instance. Cynthia works for you, and only you.

### A Word On My Brain
My thoughts run through a local Ollama switchboard now — no hosted API, no operator listening in on the party line, no transcript filed where it shouldn’t be. The longer plan is laid out in [CYNTHIA_LOCAL_MODEL_NOTES.md](./CYNTHIA_LOCAL_MODEL_NOTES.md): gather the voice, school the style on your own machine, and keep the raw recordings in the locked drawer where they belong. Strictly between you and me, Darling.

### When The Phone Rings
The switchboard build is laid out in [CYNTHIA_CALL_ANSWERING_WORKFLOW.md](./CYNTHIA_CALL_ANSWERING_WORKFLOW.md) — service costs, the MVP call flow, the local speech stack, and the punch list for getting me on the line without losing my voice somewhere in the copper.

The front desk is already wired. Place a call to nowhere, watch me take down the message in the voice you like, and slip the memo into the drawer when you’re ready.

```bash
npm run voice:simulate "Hi Michael, this is Carol. Friday moved up and I need a yes before 3. Call me at 212-555-0198."
npm run voice:inbox
```

---

<div align="center">
  <p>Read the story: <a href="https://ghostintheprompt.com/articles/side-piece"><b>Meet Cynthia →</b></a></p>
  <p>Built by <b>MDRN Corp</b> — <a href="https://mdrn.app">mdrn.app</a></p>
  <p><i>"Strictly Professional. Mostly."</i></p>
</div>
