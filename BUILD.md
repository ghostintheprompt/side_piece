# Building Side Piece

### Prerequisites
- Node.js (v18+)
- Firebase Account (Firestore + Auth)
- Gemini API Key

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
   GEMINI_API_KEY=your_key_here
   ```

4. **Firebase Configuration:**
   Place your `firebase-applet-config.json` in the root directory.

### Development
```bash
npm run dev
```
Cynthia will be waiting for you at `http://localhost:3000`.

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
- **Connection Fuzzy:** Check your `GEMINI_API_KEY`.
- **Frequencies Missing:** Ensure Firestore rules allow the authenticated user to read/write their own `ownerId` documents.
