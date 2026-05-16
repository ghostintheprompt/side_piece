# Building Side Piece

### Prerequisites
- Node.js (v18+)
- Firebase Account (Firestore + Auth)
- Ollama running locally on the Mac

### Setup
1. **Clone the repository:**
   ```bash
   git clone https://github.com/ghostintheprompt/side-piece.git
   cd side-piece
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file with:
   ```env
   OLLAMA_HOST=http://127.0.0.1:11434
   OLLAMA_MODEL=cynthia
   ```

4. **Local Model:**
   Install Ollama first:
   ```bash
   brew install ollama
   ```

   Start the local switchboard:
   ```bash
   ollama serve
   ```

   In another terminal, create Cynthia's lightweight local model:
   ```bash
   npm run ollama:setup
   ```

   This uses `llama3.2:3b` as the base model and wraps it with `ollama/Modelfile`.

5. **Firebase Configuration:**
   Place your `firebase-applet-config.json` in the root directory.

### Development
```bash
npm run dev
```
Cynthia will be waiting for you at `http://localhost:3000`.

### Testing on iPhone
1. Put the Mac and iPhone on the same Wi-Fi network.
2. Start the app with `npm run dev`.
3. Find your Mac's local IP address:
   ```bash
   ipconfig getifaddr en0
   ```
4. Open `http://YOUR_MAC_IP:3000` on the iPhone.
5. In Safari, use Share → Add to Home Screen to install Cynthia like an app.

### Build & Release
To build the production web bundle:
```bash
npm run build
```

To package as a DMG (macOS only):
```bash
./make_dmg.sh
```

### Troubleshooting
- **Connection Fuzzy:** Make sure Ollama is running and `OLLAMA_MODEL` has been pulled.
- **Frequencies Missing:** Ensure Firestore rules allow the authenticated user to read/write their own `ownerId` documents.
