# Side Piece: SwiftUI Implementation Guide

## Executive Summary

Side Piece is a confidential liaison management application with a distinctive 1960s Playboy Club aesthetic meets Billy Wilder sophistication. This document provides comprehensive specifications for implementing the app in SwiftUI for iOS and macOS.

---

## Design Philosophy

**Aesthetic Direction:** Playboy 1960s executive lounge — sophisticated, seductive, masculine. Think Frank Sinatra's private office meets the executive suite at the Playboy Club. Rich jewel tones (forest green, cherry red, brass gold), luxurious textures, and understated elegance.

**Tone:** Cynthia is your devoted, capable, slightly flirtatious executive assistant. She's professional but personal, efficient but seductive. Think "The Apartment" meets "Mad Men" — sophisticated dialogue with underlying tension.

---

## Color Palette

```swift
// Primary Colors
let forestGreen = Color(hex: "#1B3022")      // Primary background (sidebar)
let deepForestGreen = Color(hex: "#16291D")  // Secondary background
let darkestGreen = Color(hex: "#142319")     // Borders

// Accent Colors
let cherryRed = Color(hex: "#991B1B")        // Hearts, alerts, danger
let brass = Color(hex: "#A68A56")            // Gold accents, highlights
let creamParchment = Color(hex: "#FDFBF7")   // Light background, text on dark

// Text Colors
let nearBlack = Color(hex: "#111827")        // Primary text on light
let charcoalGray = Color(hex: "#4B5563")     // Secondary text
let mutedGray = Color(hex: "#9CA3AF")        // Tertiary text
let borderGray = Color(hex: "#E5E7EB")       // Light borders

// Backgrounds
let white = Color.white
let lightGray = Color(hex: "#F3F4F6")        // Operation message background
let redLight = Color(hex: "#FEF2F2")         // Incident background
```

---

## Typography

### iOS Implementation
```swift
// Serif (Playfair Display or Georgia fallback)
.font(.custom("PlayfairDisplay-Italic", size: 72))  // Login title
.font(.custom("PlayfairDisplay-Bold", size: 32))    // Sidebar title
.font(.custom("PlayfairDisplay-Italic", size: 18))  // Buttons

// Monospace (IBM Plex Mono or SF Mono fallback)
.font(.custom("IBMPlexMono-Regular", size: 10))     // Labels, metadata
.font(.custom("IBMPlexMono-Regular", size: 13))     // Assistant messages
.font(.custom("IBMPlexMono-Regular", size: 9))      // Footer text

// Sans-serif (Inter or SF Pro fallback)
.font(.system(size: 15, weight: .regular))          // User messages
.font(.system(size: 14, weight: .medium))           // Conversation names
.font(.system(size: 11, weight: .regular))          // Conversation previews
```

### macOS Implementation
Same fonts, scale up by 1.1x for desktop viewing distance.

---

## Screen Specifications

### 1. Login Screen

**Purpose:** First impression. Elegant, seductive, mysterious.

**Layout:**
- Full-screen dark forest green gradient (135deg, #1a2f23 → #0d1912)
- Centered content: Heart icon (80pt, cherry red) → Title → Subtitle → Divider → Button
- Subtle texture overlay (3% opacity, black linen pattern)

**Elements:**
```swift
// Heart Icon
Image(systemName: "heart.fill")
  .font(.system(size: 80, weight: .thin))
  .foregroundColor(cherryRed)
  .shadow(color: cherryRed.opacity(0.4), radius: 20)

// Title
Text("Cynthia")
  .font(.custom("PlayfairDisplay-Italic", size: 72))
  .foregroundColor(creamParchment)
  .tracking(-1.5)

// Subtitle
Text("THE ARRANGEMENT & THE EXECUTIVE SUITE")
  .font(.custom("IBMPlexMono-Regular", size: 10))
  .foregroundColor(brass)
  .kerning(4)
  .opacity(0.8)

// Login Button
Button("Unlock the Suite") {
  // Login action
}
.buttonStyle(ExecutiveButtonStyle())
```

**Button Style:**
```swift
struct ExecutiveButtonStyle: ButtonStyle {
  func makeBody(configuration: Configuration) -> some View {
    configuration.label
      .font(.custom("PlayfairDisplay-Italic", size: 18))
      .foregroundColor(creamParchment)
      .padding(.horizontal, 48)
      .padding(.vertical, 20)
      .background(
        RoundedRectangle(cornerRadius: 2)
          .stroke(brass.opacity(configuration.isPressed ? 1 : 0.5), lineWidth: 1)
          .background(
            brass.opacity(configuration.isPressed ? 0.2 : 0)
          )
      )
      .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
  }
}
```

---

### 2. Sidebar

**Width:** 320pt (iOS), 320pt (macOS)

**Structure:**
- Header (status dot, title)
- Category filters (4 buttons)
- Search bar
- Conversations list (scrollable)
- Footer (status text, add button)

**Header:**
```swift
VStack(alignment: .leading, spacing: 4) {
  HStack(spacing: 8) {
    Circle()
      .fill(cherryRed)
      .frame(width: 8, height: 8)
      .shadow(color: cherryRed.opacity(0.6), radius: 8)
    
    Text("EXECUTIVE SUITE")
      .font(.custom("IBMPlexMono-Regular", size: 9))
      .foregroundColor(brass)
      .kerning(2)
  }
  
  Text("Cynthia")
    .font(.custom("PlayfairDisplay-Italic", size: 32))
    .foregroundColor(creamParchment)
}
.padding(.horizontal, 24)
.padding(.vertical, 40)
.background(deepForestGreen)
```

**Category Buttons:**
```swift
// Active state
.background(creamParchment)
.foregroundColor(forestGreen)
.offset(x: 4)
.shadow(radius: 12)

// Inactive state
.background(Color.clear)
.foregroundColor(brass.opacity(0.6))
```

**Conversation Item:**
```swift
VStack(alignment: .leading, spacing: 4) {
  HStack {
    Text(conversation.contactName)
      .font(.system(size: 14, weight: .medium))
    Spacer()
    Text(conversation.timestamp)
      .font(.custom("IBMPlexMono-Regular", size: 9))
      .opacity(0.5)
  }
  
  Text(conversation.lastMessage)
    .font(.system(size: 11))
    .opacity(0.6)
    .lineLimit(1)
}
.padding(16)
.background(isSelected ? creamParchment : Color.clear)
.cornerRadius(12)
.overlay(
  Rectangle()
    .fill(brass)
    .frame(width: 4)
    .offset(x: -12),
  alignment: .leading
)
.opacity(isSelected ? 1 : 0)
```

---

### 3. Chat View

**Layout:**
- Header (contact info, action buttons)
- Messages area (scrollable)
- Input bar (text field + send button)

**Header:**
```swift
HStack {
  VStack(alignment: .leading, spacing: 2) {
    Text(conversation.contactName)
      .font(.custom("PlayfairDisplay-Bold", size: 22))
      .foregroundColor(nearBlack)
    
    HStack(spacing: 8) {
      Text(conversation.phoneNumber)
        .font(.custom("IBMPlexMono-Regular", size: 10))
        .foregroundColor(brass)
        .kerning(1.5)
      
      Text("|")
        .foregroundColor(borderGray)
      
      Text("PRIVATE OFFICE LINE")
        .font(.custom("IBMPlexMono-Regular", size: 10))
        .foregroundColor(cherryRed)
        .kerning(1.5)
    }
  }
  
  Spacer()
  
  HStack(spacing: 16) {
    Button(action: {}) { Image(systemName: "phone") }
    Button(action: {}) { Image(systemName: "info.circle") }
    Button(action: {}) { Image(systemName: "ellipsis") }
  }
  .foregroundColor(forestGreen.opacity(0.6))
}
.padding(.horizontal, 40)
.frame(height: 80)
.background(Color.white.opacity(0.4))
.overlay(Rectangle().fill(borderGray).frame(height: 1), alignment: .bottom)
```

**Message Bubble Types:**

1. **Outgoing (User):**
```swift
.padding(.horizontal, 24)
.padding(.vertical, 16)
.background(forestGreen)
.foregroundColor(creamParchment)
.font(.system(size: 15))
.cornerRadius(4)
.shadow(color: forestGreen.opacity(0.3), radius: 12)
.frame(maxWidth: .infinity, alignment: .trailing)
```

2. **Assistant (Cynthia):**
```swift
.padding(.horizontal, 24)
.padding(.vertical, 16)
.background(Color.white)
.foregroundColor(charcoalGray)
.font(.custom("IBMPlexMono-Regular", size: 13))
.cornerRadius(4)
.overlay(
  Rectangle()
    .fill(brass)
    .frame(width: 4),
  alignment: .leading
)
.shadow(color: Color.black.opacity(0.05), radius: 3)
.frame(maxWidth: .infinity, alignment: .leading)
```

3. **Operation (Black Book Command):**
```swift
.padding(.horizontal, 24)
.padding(.vertical, 16)
.background(lightGray)
.foregroundColor(forestGreen)
.font(.custom("IBMPlexMono-Regular", size: 11))
.cornerRadius(4)
.overlay(
  RoundedRectangle(cornerRadius: 4)
    .stroke(forestGreen, lineWidth: 2)
)
.shadow(color: Color.black.opacity(0.2), radius: 20)
.frame(maxWidth: .infinity, alignment: .trailing)
```

4. **Incident (SOC Alert):**
```swift
.padding(.horizontal, 24)
.padding(.vertical, 16)
.background(redLight)
.foregroundColor(cherryRed)
.font(.custom("IBMPlexMono-Regular", size: 12))
.fontWeight(.semibold)
.cornerRadius(4)
.overlay(
  RoundedRectangle(cornerRadius: 4)
    .stroke(cherryRed, lineWidth: 2)
)
.shadow(color: cherryRed.opacity(0.3), radius: 20)
.frame(maxWidth: .infinity, alignment: .trailing)
```

**Input Bar:**
```swift
HStack(spacing: 12) {
  TextField("Any special orders, Boss? (/wiretap, /ghost...)", text: $inputText)
    .font(.system(size: 14))
    .padding(.horizontal, 32)
    .padding(.vertical, 20)
    .background(Color.white)
    .cornerRadius(12)
    .overlay(
      RoundedRectangle(cornerRadius: 12)
        .stroke(isFocused ? brass : borderGray, lineWidth: 1)
    )
    .overlay(
      Button(action: sendMessage) {
        Image(systemName: "arrow.right")
          .foregroundColor(inputText.isEmpty ? mutedGray : creamParchment)
          .frame(width: 40, height: 40)
          .background(inputText.isEmpty ? borderGray : forestGreen)
          .cornerRadius(8)
      }
      .disabled(inputText.isEmpty),
      alignment: .trailing
    )
    .padding(.trailing, 12)
}
.padding(40)
.background(Color.white.opacity(0.3))
.overlay(Rectangle().fill(borderGray).frame(height: 1), alignment: .top)
```

---

### 4. New Contact Modal

**Size:** 480pt width (centered overlay)

**Structure:**
- Header (title + close button)
- Form fields (name, phone, category)
- Submit button

```swift
VStack(spacing: 0) {
  // Header
  HStack {
    Text("Top Secret Filing")
      .font(.custom("PlayfairDisplay-Italic", size: 22))
      .foregroundColor(forestGreen)
    
    Spacer()
    
    Button(action: dismiss) {
      Image(systemName: "xmark")
        .foregroundColor(brass)
        .rotationEffect(.degrees(45))
    }
  }
  .padding(32)
  .background(Color.white.opacity(0.4))
  .overlay(Rectangle().fill(brass.opacity(0.1)).frame(height: 1), alignment: .bottom)
  
  // Form
  VStack(alignment: .leading, spacing: 24) {
    FormField(label: "WHO'S CALLING, EXECUTIVE?", placeholder: "The Face", text: $name)
    FormField(label: "THE FREQUENCY", placeholder: "+1 (000) 000-0000", text: $phone)
    
    VStack(alignment: .leading, spacing: 6) {
      Text("THE NATURE OF THE SIGNAL")
        .font(.custom("IBMPlexMono-Regular", size: 10))
        .foregroundColor(brass)
        .kerning(2)
      
      Picker("Category", selection: $category) {
        Text("Ambition (Keep it dry)").tag("business")
        Text("Complications (Strictly Private)").tag("personal")
        Text("Vigor (Handle with care)").tag("medical")
        Text("Indiscretions (Eyes Only)").tag("other")
      }
      .pickerStyle(.menu)
    }
    
    Button("TUCK IT INTO THE DRAWER") {
      createContact()
    }
    .frame(maxWidth: .infinity)
    .padding(.vertical, 16)
    .background(forestGreen)
    .foregroundColor(creamParchment)
    .font(.custom("IBMPlexMono-Regular", size: 11))
    .kerning(3)
    .cornerRadius(4)
    .shadow(radius: 12)
  }
  .padding(32)
}
.frame(width: 480)
.background(creamParchment)
.cornerRadius(12)
.overlay(
  RoundedRectangle(cornerRadius: 12)
    .stroke(brass.opacity(0.3), lineWidth: 1)
)
.shadow(color: Color.black.opacity(0.3), radius: 40)
```

---

## Data Models

### Conversation
```swift
struct Conversation: Identifiable, Codable {
  let id: String
  var contactName: String
  var phoneNumber: String
  var lastMessage: String
  var timestamp: String
  var category: ConversationCategory
  var unreadCount: Int
  var ownerId: String
}

enum ConversationCategory: String, Codable {
  case business
  case personal
  case medical
  case other
}
```

### Message
```swift
struct Message: Identifiable, Codable {
  let id: String
  var sender: String
  var content: String
  var timestamp: String
  var type: MessageType
  var category: String?
  var metadata: [String: String]?
  var ownerId: String
}

enum MessageType: String, Codable {
  case incoming
  case outgoing
  case assistant
  case operation
  case incident
}
```

---

## Black Book Commands

### /wiretap
**Scenario s1:** Network reconnaissance using system tools.

**Implementation:**
```swift
func executeWiretap() async -> String {
  // Use Network framework to scan local network
  // Parse active devices, open ports
  // Format as terminal-style output
}
```

**Response Format:**
```
Active Network Devices:
192.168.1.1    - Gateway Router
192.168.1.12   - Executive Workstation (This Machine)
192.168.1.47   - Unknown Device (iPad Pro)

Open Ports:
22   - SSH (Secure)
443  - HTTPS (Active)
8080 - Development Server

No suspicious activity detected. The line is clean, Boss.
```

### /ghost
**Scenario s3:** Process and kernel integrity check.

**Implementation:**
```swift
func executeGhostCheck() async -> String {
  // Use ProcessInfo to audit running processes
  // Check for anomalies, persistence hooks
  // Verify kernel integrity
}
```

**Response Format:**
```
Process Audit Results:
✓ All system processes nominal
✓ No unauthorized parent-child deviations
✓ Kernel integrity verified
✓ No persistence hooks detected

Your machine is clean as a whistle, Executive. Sleep tight.
```

### /shred [filepath]
**Scenario s2:** Secure file deletion with DoD 5220.22-M overwrite.

**Implementation:**
```swift
func executeShred(filePath: String) async -> String {
  // Overwrite file with 7-pass DoD pattern
  // Verify deletion
  // Return status
}
```

**Response Format:**
```
The file at /tmp/sensitive_memo.pdf has been properly incinerated. No ashes remain.

Overwrite Pattern: DoD 5220.22-M (7-pass)
Verification: Complete
Recovery Probability: 0.00%
```

---

## Firebase Integration

### Authentication
```swift
import FirebaseAuth

class AuthService: ObservableObject {
  @Published var user: User?
  
  func signInWithGoogle() async throws {
    // Google Sign-In flow
    let credential = // ... obtain credential
    let result = try await Auth.auth().signIn(with: credential)
    self.user = result.user
  }
  
  func signOut() throws {
    try Auth.auth().signOut()
    self.user = nil
  }
}
```

### Firestore Data
```swift
import FirebaseFirestore

class FirestoreService {
  let db = Firestore.firestore()
  
  func loadConversations(userId: String) -> AnyPublisher<[Conversation], Error> {
    db.collection("conversations")
      .whereField("ownerId", isEqualTo: userId)
      .order(by: "timestamp", descending: true)
      .snapshotPublisher()
      .map { snapshot in
        snapshot.documents.compactMap { try? $0.data(as: Conversation.self) }
      }
      .eraseToAnyPublisher()
  }
  
  func loadMessages(conversationId: String) -> AnyPublisher<[Message], Error> {
    db.collection("conversations").document(conversationId)
      .collection("messages")
      .order(by: "timestamp")
      .snapshotPublisher()
      .map { snapshot in
        snapshot.documents.compactMap { try? $0.data(as: Message.self) }
      }
      .eraseToAnyPublisher()
  }
  
  func sendMessage(_ message: Message, conversationId: String) async throws {
    try await db.collection("conversations")
      .document(conversationId)
      .collection("messages")
      .addDocument(from: message)
  }
}
```

---

## Local Cynthia Model Integration

```swift
struct LocalAssistantResponse: Decodable {
  let text: String
  let provider: String?
  let model: String?
}

class LocalAssistantService {
  let switchboardURL: URL
  
  init(switchboardURL: URL = URL(string: "http://127.0.0.1:3000/api/assistant/respond")!) {
    self.switchboardURL = switchboardURL
  }
  
  func getAssistantResponse(userMessage: String, context: [Message], idToken: String) async throws -> String {
    let contextStr = context.map { "\($0.sender): \($0.content)" }.joined(separator: "\n")
    var request = URLRequest(url: switchboardURL)
    request.httpMethod = "POST"
    request.setValue("Bearer \(idToken)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try JSONSerialization.data(withJSONObject: [
      "prompt": userMessage,
      "context": contextStr
    ])

    let (data, _) = try await URLSession.shared.data(for: request)
    let response = try JSONDecoder().decode(LocalAssistantResponse.self, from: data)
    return response.text
  }
}
```

Side Piece does not use hosted model APIs. Cynthia's voice lives behind the local switchboard, backed by Ollama on the user's Mac. The web prototype defaults to `OLLAMA_MODEL=cynthia`, a lightweight model created from `ollama/Modelfile` on top of `llama3.2:3b`.

---

## Animation & Transitions

### Login → Main App
```swift
.transition(.asymmetric(
  insertion: .opacity.combined(with: .scale(scale: 0.95)),
  removal: .opacity.combined(with: .move(edge: .leading))
))
.animation(.easeInOut(duration: 0.5), value: showLogin)
```

### Message Appearance
```swift
.transition(.asymmetric(
  insertion: .move(edge: .bottom).combined(with: .opacity),
  removal: .opacity
))
.animation(.spring(response: 0.5, dampingFraction: 0.8), value: messages)
```

### Modal Presentation
```swift
.transition(.scale(scale: 0.95).combined(with: .opacity))
.animation(.spring(response: 0.4, dampingFraction: 0.85), value: showModal)
```

---

## macOS-Specific Considerations

### Keyboard Shortcuts
```swift
.keyboardShortcut("n", modifiers: [.command])  // New conversation
.keyboardShortcut("f", modifiers: [.command])  // Focus search
.keyboardShortcut("w", modifiers: [.command])  // Close window
.keyboardShortcut(.return, modifiers: [.command])  // Send message
```

### Window Management
```swift
WindowGroup {
  ContentView()
}
.defaultSize(width: 1280, height: 800)
.windowStyle(.titleBar)
.windowToolbarStyle(.unified)
```

### Traffic Light Positioning
Custom window chrome with traffic lights positioned in header.

---

## Asset Export Requirements

### App Icon
- 1024×1024 master (heart icon on forest green background)
- All iOS sizes (20pt–1024pt @1x, @2x, @3x)
- All macOS sizes (16pt–512pt @1x, @2x)

### SF Symbols Used
- heart.fill (login, status indicators)
- phone (call button)
- info.circle (info button)
- ellipsis (more menu)
- plus (add button)
- magnifyingglass (search)
- arrow.right (send button)
- xmark (close button)
- briefcase (business category)
- person (personal category)

---

## Testing Scenarios

1. **Login flow:** Google sign-in → transition to main app
2. **Conversation selection:** Tap conversation → load messages
3. **Send message:** Type text → tap send → update UI → assistant response
4. **Black Book commands:** Type `/wiretap` → execute → display operation result
5. **New contact:** Tap + → fill form → create → auto-select
6. **Category filtering:** Tap category → filter conversations
7. **Modal interaction:** Open modal → fill/cancel → close
8. **Empty states:** No conversations, no messages selected
9. **Typing indicator:** Show when assistant is generating response
10. **Real-time sync:** Multiple devices, conversation updates

---

## Performance Considerations

- Lazy loading for conversation list (100+ conversations)
- Message pagination (load 50 at a time, infinite scroll)
- Image caching for future pinup feature
- Debounced search (300ms delay)
- Optimized Firestore queries (compound indexes)

---

## Security Notes

- All data stored in user's private Firebase instance
- Firebase Auth UID used for ownership verification
- Black Book operations run locally (no telemetry)
- No analytics or crash reporting (privacy-first)
- Local-only assistant switchboard; no hosted model keys

---

## Next Steps for Implementation

1. Set up Xcode project with SwiftUI + Firebase SDK
2. Create color palette extension with hex initializer
3. Import custom fonts (Playfair Display, IBM Plex Mono, Inter)
4. Build LoginScreen view
5. Build Sidebar view with category filters
6. Build ChatView with message types
7. Build NewContactModal
8. Implement Firebase authentication
9. Implement Firestore listeners
10. Integrate local Cynthia assistant service
11. Implement Black Book commands
12. Add animations and transitions
13. Test on iOS simulator + device
14. Build macOS version with window chrome
15. Test keyboard shortcuts and window management

---

**End of Implementation Guide**

*"The files are in order, Boss. Let's see who's brave enough to try the door." — Cynthia*
