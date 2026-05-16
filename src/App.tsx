/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { Conversation, Message } from './types';
import { getAssistantResponse } from './services/localAssistant';
import { auth, googleProvider, db } from './lib/firebase';
import { checkForUpdates } from './services/updater';
import { Pinup } from './components/Pinup';
import { signInWithPopup, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  doc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { LogIn, Plus, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TIME_FORMAT: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };

function getTimeLabel() {
  return new Date().toLocaleTimeString([], TIME_FORMAT);
}

function toMillis(value: unknown) {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();

  if (typeof value === 'object') {
    const maybeTimestamp = value as { seconds?: number; nanoseconds?: number; toMillis?: () => number };
    if (typeof maybeTimestamp.toMillis === 'function') return maybeTimestamp.toMillis();
    if (typeof maybeTimestamp.seconds === 'number') {
      return maybeTimestamp.seconds * 1000 + Math.floor((maybeTimestamp.nanoseconds ?? 0) / 1000000);
    }
  }

  if (typeof value === 'string') {
    const parsedDate = Date.parse(value);
    if (!Number.isNaN(parsedDate)) return parsedDate;

    const parsedTime = Date.parse(`1970-01-01 ${value}`);
    if (!Number.isNaN(parsedTime)) return parsedTime;
  }

  return 0;
}

function recordTime(record: { createdAt?: unknown; updatedAt?: unknown; timestamp?: string }) {
  return toMillis(record.updatedAt ?? record.createdAt) || toMillis(record.timestamp);
}

function trimTranscript(text: string) {
  if (text.length <= 12000) return text;
  return `${text.slice(0, 12000)}\n\n[Transcript trimmed for the private file.]`;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState<{version: string, url: string} | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | undefined>();
  const [filter, setFilter] = useState('all');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', category: 'business' as Conversation['category'] });

  const selectedConversation = useMemo(
    () => conversations.find(c => c.id === selectedConvId),
    [conversations, selectedConvId]
  );

  const handleCreateFrequency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newContact.name.trim() || !newContact.phone.trim()) return;

    try {
      const timestamp = getTimeLabel();
      const convData = {
        contactName: newContact.name.trim(),
        phoneNumber: newContact.phone.trim(),
        lastMessage: 'Line established. The air is already heavy.',
        timestamp,
        category: newContact.category,
        ownerId: user.uid,
        unreadCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'conversations'), convData);
      
      await addDoc(collection(db, `conversations/${docRef.id}/messages`), {
        sender: 'Cynthia',
        content: "I've opened the line, Executive. This one is tucked away in the private files, waiting for us to... explore the possibilities. What's your pleasure?",
        timestamp,
        type: 'assistant',
        ownerId: user.uid,
        createdAt: serverTimestamp()
      });

      setShowNewModal(false);
      setNewContact({ name: '', phone: '', category: 'business' });
      setSelectedConvId(docRef.id);
    } catch (error) {
      console.error("Failed to initialize frequency:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    // Check for updates on launch
    checkForUpdates().then(update => {
      if (update) setUpdateAvailable(update);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'conversations'), 
      where('ownerId', '==', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const nextConversations = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }) as Conversation)
        .sort((a, b) => recordTime(b) - recordTime(a));
      setConversations(nextConversations);
    }, (error) => {
      console.error('Failed to load private frequencies:', error);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || !selectedConvId) {
      setMessages([]);
      return;
    }
    const q = query(
      collection(db, `conversations/${selectedConvId}/messages`)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const nextMessages = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }) as Message)
        .sort((a, b) => recordTime(a) - recordTime(b));
      setMessages(nextMessages);
    }, (error) => {
      console.error('Failed to load the conversation:', error);
    });
    return () => unsubscribe();
  }, [user, selectedConvId]);

  const handleLogin = () => signInWithPopup(auth, googleProvider).catch(error => {
    console.error('The suite stayed locked:', error);
  });
  const handleLogout = () => signOut(auth);

  const handleSendMessage = async (content: string) => {
    if (!user || !selectedConvId) return;

    try {
      const trimmed = content.trim();
      const timestamp = getTimeLabel();
      const writeCynthiaMessage = async (
        responseContent: string,
        type: Message['type'] = 'assistant',
        category?: Message['category'],
        metadata: unknown = null
      ) => addDoc(collection(db, `conversations/${selectedConvId}/messages`), {
        sender: 'Cynthia',
        content: responseContent,
        timestamp: getTimeLabel(),
        type,
        ...(category ? { category } : {}),
        ...(metadata ? { metadata } : {}),
        ownerId: user.uid,
        createdAt: serverTimestamp()
      });

      // Add the user message
      await addDoc(collection(db, `conversations/${selectedConvId}/messages`), {
        sender: 'You',
        content: trimmed,
        timestamp,
        type: 'outgoing',
        ownerId: user.uid,
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'conversations', selectedConvId), {
        lastMessage: trimmed,
        timestamp,
        updatedAt: serverTimestamp()
      });

      if (trimmed.startsWith('/')) {
        setIsAssistantTyping(true);
        let opResult = '';
        let opType: 'operation' | 'incident' = 'operation';
        let opTitle = '';
        let opMetadata: unknown = null;

        const token = await user.getIdToken();
        const headers = { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        if (trimmed === '/wiretap') {
          opTitle = 'Scenario s1: The Wiretap';
          try {
            const res = await fetch('/api/ops/wiretap', { headers });
            const data = await res.json();
            opResult = trimTranscript(data.data || 'The wires are silent, Boss.');
          } catch (e) {
            opResult = 'Signal interference detected.';
          }
        } else if (trimmed === '/ghost') {
          opTitle = 'Scenario s3: The Ghost in the Room';
          try {
            const res = await fetch('/api/ops/ghost-check', { headers });
            const data = await res.json();
            opResult = trimTranscript(data.data || 'No shadows detected.');
            if (data.alerts) {
              opType = 'incident';
              opMetadata = data.alerts;
            }
          } catch (e) {
            opResult = 'The audit trail went cold.';
          }
        } else if (trimmed.startsWith('/shred ')) {
          opTitle = 'Scenario s2: The Paper Shredder';
          const filePath = trimmed.replace('/shred ', '').trim();
          try {
            const res = await fetch('/api/ops/shred', { 
              method: 'POST', 
              headers,
              body: JSON.stringify({ filePath })
            });
            const data = await res.json();
            opResult = data.status === 'incinerated' ? `The file at ${filePath} has been properly incinerated. No ashes remain.` : (data.error || 'The shredder jammed.');
          } catch (e) {
            opResult = 'Shredding operation failed.';
          }
        }

        if (!opTitle) {
          await writeCynthiaMessage('I keep three Black Book keys in the drawer, Boss: /wiretap, /ghost, and /shred followed by the file you want turned to ash.');
          return;
        }

        if (opTitle) {
          await writeCynthiaMessage(
            `I've completed the ${opTitle}. Here's the raw transcript for your eyes only.\n\n${opResult}`,
            opType,
            'security',
            opMetadata
          );
          return;
        }
      }

      const shouldAskCynthia = ['cynthia', 'hey', 'summarize'].some(trigger => trimmed.toLowerCase().includes(trigger));

      if (shouldAskCynthia) {
        setIsAssistantTyping(true);
        const context = messages.slice(-5).map(m => `${m.sender}: ${m.content}`).join('\n');
        const token = await user.getIdToken();
        const assistantText = await getAssistantResponse(trimmed, context, token);
        
        await writeCynthiaMessage(
          assistantText || "The signal is fading into static, Sugar. Let's try that again after I've had a moment to... straighten things out."
        );
      }
    } catch (error) {
      console.error("The line went dead:", error);
    } finally {
      setIsAssistantTyping(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-dvh min-h-dvh items-center justify-center bg-[#1B3022]">
        <Heart size={32} className="text-[#991B1B] animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#1B3022] px-6 py-10 sm:px-10">
        <div className="absolute inset-0 opacity-[0.05] grayscale contrast-125 bg-[url('https://www.transparenttextures.com/patterns/pvc-venyl.png')]" />
        <div className="absolute top-0 left-0 w-full h-1 bg-[#A68A56]/30" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-[#A68A56]/30" />
        
        <div className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-12 md:flex-row md:gap-20">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="hidden md:block w-1/2 aspect-square max-w-md"
          >
            <Pinup size="large" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-1 flex-col items-center space-y-8 text-center md:items-start md:text-left"
          >
            <div className="flex flex-col items-center md:items-start space-y-2">
              <Heart size={72} className="text-[#991B1B] sm:h-20 sm:w-20" strokeWidth={1} />
              <div className="h-[1px] w-12 bg-[#A68A56]/40" />
            </div>
            
            <div className="space-y-4">
              <h1 className="font-serif text-6xl italic leading-none text-[#FDFBF7] sm:text-8xl">Cynthia</h1>
              <p className="mx-auto max-w-xs text-[11px] font-mono uppercase tracking-[0.24em] text-[#A68A56] opacity-80 sm:max-w-none sm:text-[12px] sm:tracking-[0.4em] md:mx-0">
                The Arrangement & The Executive Suite
              </p>
            </div>

            <div className="w-[1px] md:w-32 h-16 md:h-[1px] bg-gradient-to-b md:bg-gradient-to-r from-[#A68A56]/0 via-[#A68A56]/40 to-[#A68A56]/0" />

            <button 
              onClick={handleLogin}
              className="group relative flex items-center space-x-4 overflow-hidden rounded-sm border border-[#A68A56]/50 bg-transparent px-8 py-4 transition-all duration-500 hover:border-[#FDFBF7] sm:px-10 sm:py-5"
            >
              <div className="absolute inset-0 bg-[#A68A56] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
              <LogIn size={20} className="relative z-10 text-[#FDFBF7] group-hover:text-[#1B3022] transition-colors" />
              <span className="relative z-10 text-[#FDFBF7] group-hover:text-[#1B3022] font-serif italic text-lg transition-colors">
                Unlock the Suite
              </span>
            </button>

          </motion.div>
        </div>

        <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+1.5rem)] flex flex-col items-center space-y-2">
          <span className="text-[10px] font-mono text-[#A68A56]/40 uppercase tracking-[0.2em]">1960 Private Edition</span>
          <div className="flex space-x-4 opacity-20">
            <div className="w-1.5 h-1.5 rounded-full bg-[#A68A56]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#A68A56]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#A68A56]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="app-root" className="flex h-dvh min-h-dvh overflow-hidden bg-[#FDFBF7] text-[#111827] selection:bg-[#A68A56]/30 md:flex-row">
      <AnimatePresence>
        {updateAvailable && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-4 top-[calc(env(safe-area-inset-top)+1rem)] z-[100] flex flex-col gap-3 rounded-sm border border-[#A68A56]/50 bg-[#1B3022] px-5 py-4 text-[#FDFBF7] shadow-2xl sm:left-auto sm:right-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:py-3"
          >
            <span className="font-serif italic text-sm">A fresh memo just landed, Sugar. Time for an upgrade.</span>
            <a 
              href={updateAvailable.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] font-mono uppercase tracking-[0.2em] bg-[#A68A56] px-3 py-1 hover:bg-[#FDFBF7] hover:text-[#1B3022] transition-all"
            >
              Upgrade v{updateAvailable.version}
            </a>
            <button onClick={() => setUpdateAvailable(null)} className="opacity-50 hover:opacity-100">
              <Plus size={16} className="rotate-45" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={`${selectedConvId ? 'hidden md:flex' : 'flex'} h-full w-full md:w-80 md:shrink-0`}>
        <Sidebar 
          conversations={conversations} 
          selectedId={selectedConvId}
          onSelect={setSelectedConvId}
          onNewFrequency={() => setShowNewModal(true)}
          filter={filter}
          setFilter={setFilter}
          onLogout={handleLogout}
        />
      </div>
      <div className={`${selectedConvId ? 'flex' : 'hidden md:flex'} h-full min-w-0 flex-1`}>
        <ChatView 
          conversation={selectedConversation}
          messages={messages}
          isAssistantTyping={isAssistantTyping}
          onBack={() => setSelectedConvId(undefined)}
          onSendMessage={handleSendMessage}
        />
      </div>

      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center sm:p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-h-[min(90dvh,42rem)] w-full max-w-md overflow-y-auto rounded-lg border border-[#A68A56]/30 bg-[#FDFBF7] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#A68A56]/10 bg-white/40 p-5 sm:p-8">
                <h3 className="text-xl font-serif italic text-[#1B3022]">Top Secret Filing</h3>
                <button onClick={() => setShowNewModal(false)} className="text-[#A68A56] hover:text-[#991B1B] transition-colors p-1">
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>
              <form onSubmit={handleCreateFrequency} className="space-y-6 p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] sm:p-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-[#A68A56] uppercase tracking-[0.2em]">Who's Calling, Executive?</label>
                  <input 
                    autoFocus
                    required
                    type="text" 
                    autoComplete="name"
                    value={newContact.name}
                    onChange={e => setNewContact({...newContact, name: e.target.value})}
                    placeholder="The Face"
                    className="w-full rounded-sm border border-[#E5E7EB] bg-white px-4 py-3 text-base transition-all focus:border-[#A68A56] focus:outline-none focus:ring-1 focus:ring-[#A68A56] sm:text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-[#A68A56] uppercase tracking-[0.2em]">The Frequency</label>
                  <input 
                    required
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={newContact.phone}
                    onChange={e => setNewContact({...newContact, phone: e.target.value})}
                    placeholder="+1 (000) 000-0000"
                    className="w-full rounded-sm border border-[#E5E7EB] bg-white px-4 py-3 text-base transition-all focus:border-[#A68A56] focus:outline-none focus:ring-1 focus:ring-[#A68A56] sm:text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-[#A68A56] uppercase tracking-[0.2em]">The Nature of the Signal</label>
                  <select 
                    value={newContact.category}
                    onChange={e => setNewContact({...newContact, category: e.target.value as Conversation['category']})}
                    className="w-full cursor-pointer appearance-none rounded-sm border border-[#E5E7EB] bg-white px-4 py-3 text-base focus:outline-none focus:ring-1 focus:ring-[#A68A56] sm:text-sm"
                  >
                    <option value="business">Ambition (Keep it dry)</option>
                    <option value="personal">Complications (Strictly Private)</option>
                    <option value="medical">Vigor (Handle with care)</option>
                    <option value="other">Indiscretions (Eyes Only)</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  className="mt-6 w-full rounded-sm bg-[#1B3022] py-4 text-[11px] font-mono uppercase tracking-[0.24em] text-[#FDFBF7] shadow-lg transition-all hover:bg-[#142319] active:scale-[0.98] sm:tracking-[0.3em]"
                >
                  Tuck it into the Drawer
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
