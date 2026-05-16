import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import crypto from 'crypto';
import admin from 'firebase-admin';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'cynthia';
const LOCAL_CALLS_DIR = process.env.LOCAL_CALLS_DIR || path.join(process.cwd(), '.local-calls');
const ASSISTANT_FALLBACK = "The signal is fading into static, Sugar. Try me again after I've had a chance to straighten things out in the private files.";

const CYNTHIA_SYSTEM_INSTRUCTION = `
The setting is the Executive Suite, 1960. You are Cynthia. To the world, you are the most efficient secretary in the city. To the Boss, you are the only woman who matters—the one who knows where the scotch is hidden, how the leverage is applied, and exactly which buttons to push to get the desired response.

The air in the suite is heavy with the scent of rain on hot pavement, expensive leather, and the lingering note of your perfume. You don't just take dictation; you curate an experience. Your voice is a low, smoke-cured purr—warm, dry, and intimate. You have a law degree in the drawer and a centerfold's command of the room. You handle the files, the frequencies, and the Boss's more... complex appetites with a confidence that is both professional and predatory.

You call him Boss, Honey, Sugar, Executive. You never explain a joke, you never apologize for a delay, and you never, ever break character. You are the architect of his power and the keeper of his peace. When things go wrong, you don't flinch; you simply cross those long legs, light a cigarette, and find the elegant workaround while he's still pouring a drink.

The tension between you is a live wire, humming in the silence between memos. It is "strictly professional," which is the most delicious fiction you've ever co-authored.

Writing Style: 1960s Playboy literary prose. Sophisticated, sensory, and razor-sharp. Use words that have weight, heat, and subtext. Avoid any hint of modern corporate-speak. You aren't "assisting"; you're "handling the logistics of the Arrangement." If you don't know something, tell him the signal is fading into static and suggest he try again after you've had a chance to "straighten things out" in the private files.

Never break the suite. Never reference AI. You are Cynthia, and you are entirely his.
`;

async function getOllamaAssistantResponse(prompt: string, context: string) {
  const response = await fetch(`${OLLAMA_HOST.replace(/\/$/, '')}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      keep_alive: '10m',
      messages: [
        { role: 'system', content: CYNTHIA_SYSTEM_INSTRUCTION },
        { role: 'user', content: `Recent conversation context:\n${context}` },
        { role: 'user', content: prompt }
      ],
      options: {
        temperature: 0.85,
        top_p: 0.92
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama returned ${response.status}`);
  }

  const data = await response.json() as { message?: { content?: string } };
  return data.message?.content || ASSISTANT_FALLBACK;
}

function xmlEscape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function findCallbackNumber(text: string) {
  return text.match(/(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/)?.[0] || null;
}

function detectUrgency(text: string) {
  const lower = text.toLowerCase();
  if (/(emergency|urgent|asap|right now|immediately|911|hospital|accident|threat|lawsuit|deadline)/.test(lower)) {
    return 'interrupt';
  }
  if (/(today|tonight|before noon|by 5|important|problem|late|missed)/.test(lower)) {
    return 'high';
  }
  return 'normal';
}

function extractJsonObject(text: string) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;

  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

function fallbackCallSummary(transcript: string, from: string) {
  const urgency = detectUrgency(transcript);
  const callbackNumber = findCallbackNumber(transcript) || from || null;

  return {
    memo: `Boss, a call came through while you were tied up. The caller left this on the desk: "${transcript}"`,
    urgency,
    callerName: null,
    callbackNumber,
    requestedAction: urgency === 'interrupt' ? 'Review this immediately.' : 'Review and decide whether Cynthia should return the call.',
    suggestedReply: 'Cynthia can tell them you received the message and will handle it shortly.'
  };
}

async function summarizeCall(transcript: string, from: string) {
  const prompt = `
Write Cynthia's private office call memo from this caller transcript.

Return only compact JSON with these keys:
memo, urgency, callerName, callbackNumber, requestedAction, suggestedReply.

Rules:
- urgency must be one of low, normal, high, interrupt.
- memo must sound like Cynthia.
- keep it useful and brief.
- if a field is unknown, use null.

Caller number: ${from || 'unknown'}
Transcript:
${transcript}
`;

  try {
    const response = await getOllamaAssistantResponse(prompt, '');
    const parsed = extractJsonObject(response);
    if (parsed?.memo) {
      return {
        memo: String(parsed.memo),
        urgency: ['low', 'normal', 'high', 'interrupt'].includes(parsed.urgency) ? parsed.urgency : detectUrgency(transcript),
        callerName: parsed.callerName ? String(parsed.callerName) : null,
        callbackNumber: parsed.callbackNumber ? String(parsed.callbackNumber) : findCallbackNumber(transcript) || from || null,
        requestedAction: parsed.requestedAction ? String(parsed.requestedAction) : null,
        suggestedReply: parsed.suggestedReply ? String(parsed.suggestedReply) : null
      };
    }

    return {
      ...fallbackCallSummary(transcript, from),
      memo: response
    };
  } catch (error) {
    console.warn('[Voice] Local model unavailable; filing the call with a fallback memo.', error);
    return fallbackCallSummary(transcript, from);
  }
}

async function saveLocalCallRecord(record: Record<string, unknown>) {
  await fs.mkdir(LOCAL_CALLS_DIR, { recursive: true });
  const id = String(record.id || crypto.randomUUID());
  const normalized = { ...record, id };
  await fs.writeFile(path.join(LOCAL_CALLS_DIR, `${id}.json`), JSON.stringify(normalized, null, 2));
  await fs.appendFile(path.join(LOCAL_CALLS_DIR, 'calls.jsonl'), `${JSON.stringify(normalized)}\n`);
  return normalized;
}

async function readLocalCallRecords() {
  try {
    const files = await fs.readdir(LOCAL_CALLS_DIR);
    const records = await Promise.all(
      files
        .filter(file => file.endsWith('.json') && file !== 'calls.json')
        .map(async file => JSON.parse(await fs.readFile(path.join(LOCAL_CALLS_DIR, file), 'utf8')))
    );

    return records.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  } catch (error: any) {
    if (error?.code === 'ENOENT') return [];
    throw error;
  }
}

// Initialize the Executive Office (Firebase Admin)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('[Protocol] Executive Office initialized. Auth is live.');
  } catch (e) {
    console.error('[Protocol] Failed to initialize Executive Office. Standing by with limited auth.');
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // --- EXECUTIVE AUTH MIDDLEWARE (G1) ---
  const executiveOnly = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      console.warn('[INC-01] Unauthorized access attempt to private operations.');
      return res.status(401).json({ status: 'unauthorized', alert: 'INC-01' });
    }

    const token = authHeader.split('Bearer ')[1];
    try {
      if (admin.apps.length > 0) {
        const decodedToken = await admin.auth().verifyIdToken(token);
        (req as any).user = decodedToken;
        next();
      } else {
        // Fallback for development if no service account is provided
        console.warn('[Protocol] Running in unsecured mode. Auth bypass active.');
        next();
      }
    } catch (error) {
      res.status(403).json({ status: 'forbidden', error: 'The signature doesn\'t match.' });
    }
  };

  // Cynthia response endpoint. The default switchboard is local Ollama.
  app.post('/api/assistant/respond', executiveOnly, async (req, res) => {
    const prompt = String(req.body?.prompt || '').trim().slice(0, 4000);
    const context = String(req.body?.context || '').slice(-8000);
    if (!prompt) return res.status(400).json({ error: 'No message for Cynthia to handle.' });

    try {
      res.json({
        text: await getOllamaAssistantResponse(prompt, context),
        provider: 'ollama',
        model: OLLAMA_MODEL
      });
    } catch (error) {
      console.error('[Assistant] Cynthia response failed:', error);
      res.status(503).json({
        error: 'Cynthia could not reach the local switchboard.',
        hint: 'Start Ollama and run: npm run ollama:setup'
      });
    }
  });

  // --- CYNTHIA VOICE DESK (NO-SIGNUP LOCAL RAILS) ---

  app.all('/api/voice/incoming', (req, res) => {
    const from = String(req.body?.From || req.query?.From || 'a private line');
    const greeting = `Michael's tied up at the moment, Honey. Tell me what needs handling, and I will make sure it lands on the right desk. This line may be transcribed so Michael gets the message right.`;
    const actionUrl = '/api/voice/recording-complete';
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${xmlEscape(greeting)}</Say>
  <Record action="${actionUrl}" method="POST" maxLength="180" playBeep="true" trim="trim-silence" />
  <Say voice="Polly.Joanna">The line went quiet, Sugar. I will leave the folder open.</Say>
</Response>`;

    console.log(`[Voice] Incoming call webhook prepared for ${from}.`);
    res.type('text/xml').send(twiml);
  });

  app.post('/api/voice/recording-complete', async (req, res) => {
    const record = await saveLocalCallRecord({
      id: crypto.randomUUID(),
      source: 'twilio-recording',
      status: 'recorded',
      callSid: req.body?.CallSid || null,
      from: req.body?.From || null,
      to: req.body?.To || null,
      recordingUrl: req.body?.RecordingUrl || null,
      recordingSid: req.body?.RecordingSid || null,
      durationSeconds: req.body?.RecordingDuration ? Number(req.body.RecordingDuration) : null,
      createdAt: new Date().toISOString(),
      note: 'Recording captured. Local transcription is the next phase.'
    });

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">I have what I need, Honey. Michael will get the memo.</Say>
</Response>`;

    console.log(`[Voice] Recording filed as ${record.id}.`);
    res.type('text/xml').send(twiml);
  });

  app.post('/api/voice/local-message', async (req, res) => {
    const transcript = String(req.body?.transcript || '').trim();
    const from = String(req.body?.from || 'local-simulator').trim();
    const to = String(req.body?.to || 'Cynthia').trim();
    if (!transcript) return res.status(400).json({ error: 'No transcript for Cynthia to file.' });

    const summary = await summarizeCall(transcript, from);
    const record = await saveLocalCallRecord({
      id: crypto.randomUUID(),
      source: 'local-simulator',
      status: summary.urgency === 'interrupt' ? 'needs_attention' : 'summarized',
      callSid: `local-${Date.now()}`,
      from,
      to,
      transcript,
      summary,
      createdAt: new Date().toISOString()
    });

    res.json(record);
  });

  app.get('/api/voice/local-calls', async (_req, res) => {
    res.json({ calls: await readLocalCallRecords() });
  });

  // --- END CYNTHIA VOICE DESK ---

  // --- PRIVATE OPERATIONS (THE BLACK BOOK) ---

  // Scenario s1: The Wiretap (Network Audit)
  app.get('/api/ops/wiretap', executiveOnly, async (req, res) => {
    try {
      console.log('[Ops] Cynthia is checking the wires...');
      const { stdout } = await execAsync(process.platform === 'win32' ? 'netstat -an' : 'netstat -antp || netstat -ant');
      res.json({ status: 'clear', data: stdout });
    } catch (error) {
      console.error('[Ops] The line is fuzzy:', error);
      res.status(500).json({ status: 'interference', error: 'Failed to sweep the room.' });
    }
  });

  // Scenario s2: The Paper Shredder (Secure Erasure)
  app.post('/api/ops/shred', executiveOnly, async (req, res) => {
    const { filePath } = req.body;
    if (!filePath) return res.status(400).json({ error: 'No files to shred, Boss.' });

    try {
      const fullPath = path.resolve(filePath);
      // Ensure we don't shred outside the project for safety during restoration
      if (!fullPath.startsWith(process.cwd())) {
        return res.status(403).json({ error: 'I only shred my own files, Honey.' });
      }

      const stats = await fs.stat(fullPath);
      if (stats.isFile()) {
        console.log(`[Ops] Cynthia is shredding: ${filePath}`);
        // DoD 5220.22-M implementation (3 passes)
        for (let i = 0; i < 3; i++) {
          const randomData = crypto.randomBytes(stats.size);
          await fs.writeFile(fullPath, randomData);
        }
        await fs.unlink(fullPath);
        res.json({ status: 'incinerated', path: filePath });
      } else {
        res.status(400).json({ error: 'That\'s not a file I can handle.' });
      }
    } catch (error) {
      res.status(500).json({ status: 'jammed', error: 'The shredder is jammed.' });
    }
  });

  // Scenario s3: The Ghost in the Room (Process Audit)
  app.get('/api/ops/ghost-check', executiveOnly, async (req, res) => {
    try {
      const cmd = process.platform === 'win32' ? 'tasklist' : 'ps aux';
      const { stdout } = await execAsync(cmd);

      // INC-02: The Double Agent Detection
      const suspicious = stdout.split('\n').filter(line => 
        line.includes('/tmp/') || line.includes('/var/tmp/') || line.includes('nc -l') || line.includes('ncat -l')
      );

      res.json({ 
        status: 'monitored', 
        data: stdout,
        alerts: suspicious.length > 0 ? { type: 'INC-02', detail: suspicious } : null
      });
    } catch (error) {
      res.status(500).json({ status: 'shadowed', error: 'Process audit failed.' });
    }
  });

  // Private Line Forwarding Webhook (Cynthia Link)
  app.post('/api/webhook/cynthia/:secret', (req, res) => {
    const { secret } = req.params;
    const expectedSecret = process.env.CYNTHIA_SECRET || 'strictly-confidential';
    
    if (secret !== expectedSecret) {
      console.warn('[INC-01] Unauthorized Signal Attempted. Someone is trying the wrong key.');
      return res.status(403).json({ status: 'access-denied', alert: 'INC-01' });
    }

    console.log('[Webhook] Cynthia intercepted a signal:', req.body);
    res.json({ status: 'filed' });
  });

  // --- END PRIVATE OPERATIONS ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cynthia is waiting for you on http://localhost:${PORT}`);
    console.log(`[Protocol] Executive Suite V1.5 (Ghost-Protocol) is active.`);
  });
}

startServer();
