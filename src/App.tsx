/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { Conversation, Message } from './types';
import { getAssistantResponse } from './services/gemini';
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
  orderBy, 
  doc,
  updateDoc
} from 'firebase/firestore';
import { LogIn, Plus, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  const [newContact, setNewContact] = useState({ name: '', phone: '', category: 'business' as const });

  const handleCreateFrequency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newContact.name || !newContact.phone) return;

    try {
      const convData = {
        contactName: newContact.name,
        phoneNumber: newContact.phone,
        lastMessage: 'Frequency Established.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: newContact.category,
        ownerId: user.uid,
        unreadCount: 0
      };
      
      const docRef = await addDoc(collection(db, 'conversations'), convData);
      
      await addDoc(collection(db, `conversations/${docRef.id}/messages`), {
        sender: 'Cynthia',
        content: "Oh, hello Boss. I've opened a new line for you. I'll be waiting for your orders... or anything else you might need.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'assistant',
        ownerId: user.uid
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
      where('ownerId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setConversations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Conversation[]);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || !selectedConvId) {
      setMessages([]);
      return;
    }
    const q = query(
      collection(db, `conversations/${selectedConvId}/messages`),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[]);
    });
    return () => unsubscribe();
  }, [user, selectedConvId]);

  const handleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = () => signOut(auth);

  const handleSendMessage = async (content: string) => {
    if (!user || !selectedConvId) return;

    try {
      await addDoc(collection(db, `conversations/${selectedConvId}/messages`), {
        sender: 'You',
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'outgoing',
        ownerId: user.uid
      });

      await updateDoc(doc(db, 'conversations', selectedConvId), {
        lastMessage: content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      if (content.toLowerCase().includes('cynthia') || content.toLowerCase().includes('hey') || content.toLowerCase().includes('summarize')) {
        setIsAssistantTyping(true);
        const context = messages.slice(-5).map(m => `${m.sender}: ${m.content}`).join('\n');
        const assistantText = await getAssistantResponse(content, context);
        
        await addDoc(collection(db, `conversations/${selectedConvId}/messages`), {
          sender: 'Cynthia',
          content: assistantText || "I'm sorry Boss, the line went fuzzy. Try again?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'assistant',
          ownerId: user.uid
        });
        setIsAssistantTyping(false);
      }
    } catch (error) {
      console.error("Transmission failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#1B3022] flex items-center justify-center">
        <Heart size={32} className="text-[#991B1B] animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen bg-[#1B3022] flex flex-col md:flex-row items-center justify-center relative overflow-hidden px-10">
        <div className="absolute inset-0 opacity-[0.05] grayscale contrast-125 bg-[url('https://www.transparenttextures.com/patterns/pvc-venyl.png')]" />
        <div className="absolute top-0 left-0 w-full h-1 bg-[#A68A56]/30" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-[#A68A56]/30" />
        
        <div className="relative z-10 w-full max-w-6xl flex flex-col md:flex-row items-center gap-20">
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
            className="flex flex-col items-center md:items-start space-y-8 flex-1"
          >
            <div className="flex flex-col items-center md:items-start space-y-2">
              <Heart size={80} className="text-[#991B1B]" strokeWidth={1} />
              <div className="h-[1px] w-12 bg-[#A68A56]/40" />
            </div>
            
            <div className="text-center md:text-left space-y-4">
              <h1 className="text-8xl font-serif italic text-[#FDFBF7] tracking-tighter leading-none">Cynthia</h1>
              <p className="text-[#A68A56] font-mono text-[12px] uppercase tracking-[0.4em] opacity-80">
                Private Desktop & Personal Secretary
              </p>
            </div>

            <div className="w-[1px] md:w-32 h-16 md:h-[1px] bg-gradient-to-b md:bg-gradient-to-r from-[#A68A56]/0 via-[#A68A56]/40 to-[#A68A56]/0" />

            <button 
              onClick={handleLogin}
              className="group relative flex items-center space-x-4 bg-transparent border border-[#A68A56]/50 px-10 py-5 rounded-sm hover:border-[#FDFBF7] transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-[#A68A56] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
              <LogIn size={20} className="relative z-10 text-[#FDFBF7] group-hover:text-[#1B3022] transition-colors" />
              <span className="relative z-10 text-[#FDFBF7] group-hover:text-[#1B3022] font-serif italic text-lg transition-colors">
                Knock on Cynthia's Door
              </span>
            </button>
          </motion.div>
        </div>

        <div className="absolute bottom-10 flex flex-col items-center space-y-2">
          <span className="text-[10px] font-mono text-[#A68A56]/40 uppercase tracking-[0.2em]">1962 Protocol Edition</span>
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
    <div id="app-root" className="flex h-screen bg-[#FDFBF7] text-[#111827] selection:bg-[#A68A56]/30 overflow-hidden">
      <AnimatePresence>
        {updateAvailable && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-[100] bg-[#1B3022] text-[#FDFBF7] px-6 py-3 rounded-sm border border-[#A68A56]/50 shadow-2xl flex items-center space-x-4"
          >
            <span className="font-serif italic text-sm">A new edition is ready, Boss.</span>
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
      <Sidebar 
        conversations={conversations} 
        selectedId={selectedConvId}
        onSelect={setSelectedConvId}
        onNewFrequency={() => setShowNewModal(true)}
        filter={filter}
        setFilter={setFilter}
        onLogout={handleLogout}
      />
      <ChatView 
        conversation={conversations.find(c => c.id === selectedConvId)}
        messages={messages}
        onSendMessage={handleSendMessage}
      />

      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#FDFBF7] border border-[#A68A56]/30 rounded-lg overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-[#A68A56]/10 flex justify-between items-center bg-white/40">
                <h3 className="text-xl font-serif italic text-[#1B3022]">Private File Entry</h3>
                <button onClick={() => setShowNewModal(false)} className="text-[#A68A56] hover:text-[#991B1B] transition-colors p-1">
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>
              <form onSubmit={handleCreateFrequency} className="p-8 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-[#A68A56] uppercase tracking-[0.2em]">Who is it, Boss?</label>
                  <input 
                    autoFocus
                    required
                    type="text" 
                    value={newContact.name}
                    onChange={e => setNewContact({...newContact, name: e.target.value})}
                    placeholder="Identity"
                    className="w-full bg-white border border-[#E5E7EB] rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#A68A56] focus:border-[#A68A56] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-[#A68A56] uppercase tracking-[0.2em]">Their Number</label>
                  <input 
                    required
                    type="text" 
                    value={newContact.phone}
                    onChange={e => setNewContact({...newContact, phone: e.target.value})}
                    placeholder="+1 (000) 000-0000"
                    className="w-full bg-white border border-[#E5E7EB] rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#A68A56] focus:border-[#A68A56] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-[#A68A56] uppercase tracking-[0.2em]">Classification</label>
                  <select 
                    value={newContact.category}
                    onChange={e => setNewContact({...newContact, category: e.target.value as any})}
                    className="w-full bg-white border border-[#E5E7EB] rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#A68A56] appearance-none cursor-pointer"
                  >
                    <option value="business">Official / Business</option>
                    <option value="personal">Social / Personal</option>
                    <option value="medical">Vital / Medical</option>
                    <option value="other">Other / Classified</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  className="w-full mt-6 bg-[#1B3022] text-[#FDFBF7] py-4 rounded-sm text-[11px] font-mono uppercase tracking-[0.3em] hover:bg-[#142319] transition-all active:scale-[0.98] shadow-lg"
                >
                  File it Away, Darling
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
