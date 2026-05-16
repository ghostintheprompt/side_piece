# Side Piece: Claude Code Handoff Package

## Why There Are Two Prompt Files

- `CLAUDE_CODE_PROMPT.md` is the source-of-truth handoff. Use this when you want Claude Code to build the separate native SwiftUI/iOS/macOS version.
- `prompt for claude code.rtf` is the tiny copy/paste wrapper for that same handoff. It is not a second spec and should not override this file.
- The React app in this repo is still the working web/PWA prototype. Use it to test Cynthia on your phone now while the native app is still pending.

## Quick Start Guide

This package contains everything Claude Code needs to build Side Piece natively for iOS and macOS in Xcode.

---

## What to Do

### Step 1: Open Claude Code
Open the Claude Code chat interface in your browser or desktop app.

### Step 2: Drag These Files Into Claude Code
From this Side Piece project, drag these files directly into the Claude Code chat:

**Required Files:**
1. `IMPLEMENTATION.md` — Full SwiftUI specifications
2. `CLAUDE_CODE_PROMPT.md` — This file with instructions
3. `favicon.svg` — App icon source
4. The current React reference files (optional but helpful):
   - `src/App.tsx`
   - `src/components/Sidebar.tsx`
   - `src/components/ChatView.tsx`
   - `src/components/Pinup.tsx`

**Optional Reference Files:**
5. From this `side_piece` folder:
   - `side_piece/src/types.ts` — Data model reference
   - `side_piece/features.md` — Black Book command specs
   - `side_piece/README.md` — Project overview

### Step 3: Send This Prompt to Claude Code

Copy and paste this exact prompt:

```
I need you to build Side Piece as a native SwiftUI app for iOS and macOS using the attached IMPLEMENTATION.md specifications.

Project Requirements:
- Create a new Xcode project with SwiftUI for iOS 17+ and macOS 14+
- Use the exact color palette, typography, and component specs from IMPLEMENTATION.md
- Implement all screens: LoginScreen, Sidebar, ChatView, NewContactModal
- Set up Firebase Auth (Google Sign-In) and Firestore integration
- Integrate local-only Cynthia responses through Ollama or the Side Piece local switchboard
- Implement all three Black Book commands: /wiretap, /ghost, /shred
- Support all message types: outgoing, assistant, operation, incident
- Add animations and transitions as specified
- Create app icon from the attached favicon.svg

Start with:
1. Project structure and dependencies (Firebase and GoogleSignIn SPM packages)
2. Color+Font extensions
3. Data models (Conversation, Message, enums)
4. LoginScreen view
5. Main app with Sidebar + ChatView
6. Firebase services
7. LocalAssistant service

Ask me for my Firebase config and local Ollama model settings when you need them.
```

---

## What Claude Code Will Do

Claude Code will:
1. ✅ Create a new Xcode project structure
2. ✅ Set up Swift Package Manager dependencies (Firebase, Google Sign-In)
3. ✅ Build all SwiftUI views matching the design specs
4. ✅ Implement Firebase authentication and Firestore
5. ✅ Integrate the local Cynthia switchboard for her personality
6. ✅ Code the Black Book security operations
7. ✅ Add animations, keyboard shortcuts, and polish
8. ✅ Generate the app icon from the SVG
9. ✅ Test and debug until it runs

---

## What You'll Need to Provide

When Claude Code asks, you'll need:

### 1. Firebase Configuration
Your `firebase-applet-config.json` from the `side_piece` folder. It looks like:
```json
{
  "apiKey": "AIza...",
  "authDomain": "your-app.firebaseapp.com",
  "projectId": "your-project-id",
  "storageBucket": "your-app.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:ios:abc123"
}
```

### 2. Local Cynthia Model
Run Ollama on the Mac and pull the local model Cynthia should use:
```bash
ollama pull llama3.2:3b
ollama create cynthia -f ollama/Modelfile
ollama serve
```
Default local settings:
```env
OLLAMA_HOST=http://127.0.0.1:11434
OLLAMA_MODEL=cynthia
```

### 3. Google Sign-In Setup
You'll need to:
- Enable Google Sign-In in your Firebase Console
- Download `GoogleService-Info.plist` from Firebase (for iOS)
- Add it to your Xcode project when Claude Code tells you

---

## Xcode Setup Steps (Claude Code will guide you)

1. **Open the generated project** in Xcode
2. **Add GoogleService-Info.plist** to the project (drag into Xcode)
3. **Set your Team** in Signing & Capabilities
4. **Add URL Scheme** for Google Sign-In (Claude Code will provide the value)
5. **Run on Simulator or Device**

---

## File Structure Claude Code Will Create

```
SidePiece/
├── SidePieceApp.swift              // App entry point
├── ContentView.swift               // Main coordinator
├── Models/
│   ├── Conversation.swift
│   ├── Message.swift
│   └── MessageType.swift
├── Views/
│   ├── LoginScreen.swift
│   ├── Sidebar.swift
│   ├── ChatView.swift
│   ├── NewContactModal.swift
│   └── Components/
│       ├── MessageBubble.swift
│       ├── ConversationRow.swift
│       └── CategoryButton.swift
├── Services/
│   ├── AuthService.swift
│   ├── FirestoreService.swift
│   └── LocalAssistantService.swift
├── Operations/
│   ├── WiretapOperation.swift
│   ├── GhostCheckOperation.swift
│   └── ShredOperation.swift
├── Extensions/
│   ├── Color+Hex.swift
│   └── Font+Custom.swift
├── Resources/
│   ├── GoogleService-Info.plist
│   └── Assets.xcassets/
│       └── AppIcon.appiconset/
└── Config/
    └── Config.swift                // local host/model settings (gitignored)
```

---

## Testing the App

Once Claude Code builds it:

### iOS Testing
1. Run in Xcode iOS Simulator
2. Tap "Unlock the Suite" → Google Sign-In
3. Create a new conversation with the + button
4. Send messages and watch Cynthia respond
5. Try Black Book commands: `/wiretap`, `/ghost`, `/shred /path/to/file`

### macOS Testing
1. Run in Xcode macOS target
2. Test keyboard shortcuts:
   - `Cmd+N` — New conversation
   - `Cmd+F` — Focus search
   - `Cmd+Return` — Send message
3. Verify window chrome and traffic lights

---

## Troubleshooting

**"Firebase won't authenticate"**
→ Make sure GoogleService-Info.plist is in the project and the bundle ID matches Firebase Console

**"Cynthia can't reach the switchboard"**
→ Start Ollama on the Mac and confirm `OLLAMA_MODEL` has been pulled

**"Black Book commands don't work"**
→ On macOS, check System Preferences → Privacy → Full Disk Access
→ On iOS, some operations are sandboxed (this is expected)

**"Fonts look wrong"**
→ Add Playfair Display and IBM Plex Mono to the project, or let SwiftUI use fallbacks (Georgia, SF Mono)

---

## Next Steps After Build

1. **Test thoroughly** on real devices (iPhone, Mac)
2. **Add your Firebase Firestore rules** from `side_piece/firestore.rules`
3. **Customize Cynthia's personality** in LocalAssistantService.swift and the local model notes
4. **Add app icons** for all sizes (Claude Code will help)
5. **Set up TestFlight** for beta testing
6. **Submit to App Store** when ready

---

## Pro Tips

- **Keep the prototype open** while Claude Code builds — reference it for exact spacing, colors, interactions
- **Ask Claude Code to screenshot** each screen as it builds to verify against the prototypes
- **Request SwiftUI previews** for each component so you can iterate quickly
- **Test Black Book commands** on macOS first (more permissive than iOS sandbox)

---

## Support

If you get stuck:
1. Share the error with Claude Code
2. Reference the IMPLEMENTATION.md section that's not working
3. Show Claude Code the prototype HTML for visual comparison

---

**You're all set!** Drag `IMPLEMENTATION.md`, this file, and `favicon.svg` into Claude Code and send the prompt above. Cynthia will be waiting for you in Xcode shortly.

*"The files are in order, Boss. Let's see who's brave enough to try the door." — Cynthia*
