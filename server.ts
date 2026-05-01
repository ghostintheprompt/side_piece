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
