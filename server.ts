import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Private Line Forwarding Webhook (Cynthia Link)
  // This is a blueprint feature. Users can set up a Gmail filter to forward 
  // GV emails to this endpoint. In production, verify the secret against 
  // an environment variable to prevent unauthorized signals.
  app.post('/api/webhook/cynthia/:secret', (req, res) => {
    const { secret } = req.params;
    // TODO: Implement secret verification
    // TODO: Parse incoming signal and commit to Firestore
    console.log('[Webhook] Cynthia intercepted a signal:', req.body);
    res.json({ status: 'filed' });
  });

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
  });
}

startServer();
