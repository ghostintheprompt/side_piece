import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Phone, Info, MoreHorizontal, Heart, ShieldAlert, Terminal } from 'lucide-react';
import { Message, Conversation } from '../types';

interface ChatProps {
  conversation?: Conversation;
  messages: Message[];
  onSendMessage: (content: string) => void;
}

export function ChatView({ conversation, messages, onSendMessage }: ChatProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  if (!conversation) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center text-[#404040]">
        <Heart size={48} className="mb-4 text-[#991B1B] opacity-20 animate-pulse" />
        <p className="text-sm font-serif italic tracking-wide opacity-40">Choose a line to open, Boss.</p>
      </div>
    );
  }

  return (
    <div id="chat-view" className="flex-1 h-full flex flex-col relative overflow-hidden bg-[#FDFBF7]">
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/pvc-venyl.png')]" />

      {/* Header */}
      <div className="h-20 border-b border-[#E5E7EB] flex items-center justify-between px-10 bg-white/40 backdrop-blur-sm z-10">
        <div className="flex flex-col">
          <span className="text-xl font-serif font-bold text-[#1B3022] tracking-tight">{conversation.contactName}</span>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono text-[#A68A56] uppercase tracking-widest">{conversation.phoneNumber}</span>
            <span className="text-[10px] text-[#E5E7EB]">|</span>
            <span className="text-[10px] font-mono text-[#9CA3AF] uppercase text-[#991B1B]">Private Office Line</span>
          </div>
        </div>
        <div className="flex items-center space-x-6 text-[#1B3022]/60">
          <button id="call-btn" className="p-2 hover:text-[#991B1B] transition-colors"><Phone size={18} /></button>
          <button id="info-btn" className="p-2 hover:text-[#991B1B] transition-colors"><Info size={18} /></button>
          <button id="more-btn" className="p-2 hover:text-[#991B1B] transition-colors"><MoreHorizontal size={18} /></button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-10 space-y-10 flex flex-col scroll-smooth z-0 custom-scroll"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isAssistant = msg.type === 'assistant';
            const isOutgoing = msg.type === 'outgoing';
            const isOperation = msg.type === 'operation';
            const isIncident = msg.type === 'incident';
            
            return (
              <motion.div
                id={`msg-${msg.id}`}
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`flex flex-col ${(isOutgoing || isOperation || isIncident) ? 'items-end' : 'items-start'} group`}
              >
                <div className="flex items-center space-x-3 mb-2 px-1">
                  {(isAssistant || isOperation || isIncident) && (
                    <span className="animate-pulse">
                      {isIncident ? <ShieldAlert size={12} className="text-[#991B1B]" /> : <Heart size={12} className={isOperation ? "text-[#1B3022]" : "text-[#991B1B]"} />}
                    </span>
                  )}
                  <span className={`text-[10px] font-mono uppercase tracking-[0.2em] ${
                    isAssistant ? 'text-[#A68A56]' : 
                    isOperation ? 'text-[#1B3022]' : 
                    isIncident ? 'text-[#991B1B]' : 
                    'text-[#9CA3AF]'
                  }`}>
                    {isAssistant ? 'Cynthia' : 
                     isOperation ? 'Executive Ops' : 
                     isIncident ? 'SOC ALERT' : 
                     isOutgoing ? 'Executive Desk' : 'External Signal'}
                  </span>
                  <span className="text-[10px] text-[#E5E7EB]">/</span>
                  <span className="text-[10px] font-mono text-[#9CA3AF]">{msg.timestamp}</span>
                </div>
                
                <div className={`
                  max-w-[85%] px-6 py-4 rounded-sm text-[15px] leading-relaxed relative
                  ${isOutgoing ? 'bg-[#1B3022] text-[#FDFBF7] shadow-xl font-sans' : 
                    isAssistant ? 'bg-white border border-[#E5E7EB] text-[#4B5563] font-mono text-[13px] border-l-4 border-l-[#A68A56] shadow-sm' : 
                    isOperation ? 'bg-[#F3F4F6] border-2 border-[#1B3022] text-[#1B3022] font-mono text-[11px] shadow-2xl overflow-x-auto whitespace-pre-wrap' :
                    isIncident ? 'bg-red-50 border-2 border-[#991B1B] text-[#991B1B] font-mono text-[12px] font-bold shadow-2xl' :
                    'bg-white border border-[#E5E7EB] text-[#111827] font-serif shadow-sm'}
                `}>
                  {(isAssistant || isOperation) && <div className="absolute top-2 right-3 text-[9px] font-mono text-[#A68A56]/40 uppercase italic">{isOperation ? 'Strictly Classified' : 'Strictly Private'}</div>}
                  {isOperation && <Terminal size={14} className="mb-4 opacity-50" />}
                  {msg.content}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-10 bg-white/30 border-t border-[#E5E7EB] z-10">
        <div className="relative flex items-center group max-w-4xl mx-auto">
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Any special orders, Boss? (/wiretap, /ghost...)"
            className="w-full bg-white border border-[#E5E7EB] rounded-lg py-5 pl-8 pr-16 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-[#A68A56] focus:border-[#A68A56] transition-all shadow-sm placeholder-[#9CA3AF]"
          />
          <button
            id="send-btn"
            onClick={handleSend}
            className={`absolute right-4 p-3 rounded-lg transition-all duration-300 ${
              input.trim() ? 'bg-[#1B3022] text-[#FDFBF7] shadow-lg translate-y-0' : 'text-[#E5E7EB] translate-y-1'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
        <p className="mt-4 text-[9px] font-mono text-[#9CA3AF] flex items-center justify-center space-x-2 uppercase tracking-[0.3em]">
          <span>Cynthia's Private Desktop</span>
          <span className="text-[#A68A56]">•</span>
          <span>1962 Executive Edition</span>
        </p>
      </div>
    </div>
  );
}
