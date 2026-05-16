import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Send, Phone, Info, MoreHorizontal, Heart, ShieldAlert, Terminal } from 'lucide-react';
import { Message, Conversation } from '../types';

interface ChatProps {
  conversation?: Conversation;
  messages: Message[];
  isAssistantTyping?: boolean;
  onBack?: () => void;
  onSendMessage: (content: string) => void;
}

export function ChatView({ conversation, messages, isAssistantTyping = false, onBack, onSendMessage }: ChatProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAssistantTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  if (!conversation) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center bg-[#FDFBF7] px-6 text-center text-[#404040]">
        <Heart size={48} className="mb-4 animate-pulse text-[#991B1B] opacity-20" />
        <p className="text-sm font-serif italic tracking-wide opacity-40">Choose a line to open, Boss.</p>
      </div>
    );
  }

  return (
    <div id="chat-view" className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-[#FDFBF7]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/pvc-venyl.png')]" />

      <div className="z-10 flex min-h-20 items-center justify-between gap-3 border-b border-[#E5E7EB] bg-white/50 px-4 py-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur-sm sm:px-6 sm:py-4 lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              title="Back to lines"
              className="rounded-full p-2 text-[#1B3022]/70 transition-colors hover:bg-[#1B3022]/5 hover:text-[#1B3022] md:hidden"
            >
              <ChevronLeft size={22} />
            </button>
          )}
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-serif text-xl font-bold tracking-tight text-[#1B3022]">{conversation.contactName}</span>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#A68A56]">{conversation.phoneNumber}</span>
              <span className="hidden text-[10px] text-[#E5E7EB] sm:inline">|</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#991B1B]">Private Office Line</span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-[#1B3022]/60 sm:gap-3">
          <a
            id="call-btn"
            href={`tel:${conversation.phoneNumber.replace(/[^\d+]/g, '')}`}
            title="Call this line"
            className="rounded-full p-2 transition-colors hover:bg-[#1B3022]/5 hover:text-[#991B1B]"
          >
            <Phone size={18} />
          </a>
          <button id="info-btn" type="button" title="Line details" className="rounded-full p-2 transition-colors hover:bg-[#1B3022]/5 hover:text-[#991B1B]">
            <Info size={18} />
          </button>
          <button id="more-btn" type="button" title="More actions" className="rounded-full p-2 transition-colors hover:bg-[#1B3022]/5 hover:text-[#991B1B]">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="custom-scroll z-0 flex flex-1 flex-col space-y-5 overflow-y-auto p-4 scroll-smooth sm:space-y-8 sm:p-6 lg:p-10"
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
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`flex flex-col ${(isOutgoing || isOperation || isIncident) ? 'items-end' : 'items-start'} group`}
              >
                <div className="mb-2 flex items-center space-x-3 px-1">
                  {(isAssistant || isOperation || isIncident) && (
                    <span className="animate-pulse">
                      {isIncident ? <ShieldAlert size={12} className="text-[#991B1B]" /> : <Heart size={12} className={isOperation ? 'text-[#1B3022]' : 'text-[#991B1B]'} />}
                    </span>
                  )}
                  <span className={`font-mono text-[10px] uppercase tracking-[0.2em] ${
                    isAssistant ? 'text-[#A68A56]' :
                    isOperation ? 'text-[#1B3022]' :
                    isIncident ? 'text-[#991B1B]' :
                    'text-[#9CA3AF]'
                  }`}>
                    {isAssistant ? 'Cynthia' :
                     isOperation ? 'Executive Ops' :
                     isIncident ? 'SOC Alert' :
                     isOutgoing ? 'Executive Desk' : 'External Signal'}
                  </span>
                  <span className="text-[10px] text-[#E5E7EB]">/</span>
                  <span className="font-mono text-[10px] text-[#9CA3AF]">{msg.timestamp}</span>
                </div>

                <div className={`
                  relative max-w-[88%] break-words rounded-sm px-4 py-3 text-sm leading-relaxed sm:max-w-[34rem] sm:px-6 sm:py-4 sm:text-[15px]
                  ${isOutgoing ? 'bg-[#1B3022] text-[#FDFBF7] shadow-xl font-sans' :
                    isAssistant ? 'bg-white border border-[#E5E7EB] text-[#4B5563] font-mono text-[13px] border-l-4 border-l-[#A68A56] shadow-sm' :
                    isOperation ? 'bg-[#F3F4F6] border-2 border-[#1B3022] text-[#1B3022] font-mono text-[11px] shadow-2xl overflow-x-auto whitespace-pre-wrap' :
                    isIncident ? 'bg-red-50 border-2 border-[#991B1B] text-[#991B1B] font-mono text-[12px] font-bold shadow-2xl whitespace-pre-wrap' :
                    'bg-white border border-[#E5E7EB] text-[#111827] font-serif shadow-sm'}
                `}>
                  {(isAssistant || isOperation) && (
                    <div className="absolute right-3 top-2 font-mono text-[9px] uppercase italic text-[#A68A56]/40">
                      {isOperation ? 'Strictly Classified' : 'Strictly Private'}
                    </div>
                  )}
                  {isOperation && <Terminal size={14} className="mb-4 opacity-50" />}
                  {msg.content}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <AnimatePresence>
          {isAssistantTyping && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="flex flex-col items-start"
            >
              <div className="mb-2 flex items-center space-x-3 px-1">
                <Heart size={12} className="animate-pulse text-[#991B1B]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A68A56]">Cynthia</span>
              </div>
              <div className="rounded-sm border border-[#E5E7EB] border-l-4 border-l-[#A68A56] bg-white px-5 py-3 font-mono text-[13px] text-[#4B5563] shadow-sm">
                Straightening things out...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="z-10 border-t border-[#E5E7EB] bg-white/40 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:p-6 lg:p-10">
        <div className="group relative mx-auto flex max-w-4xl items-center">
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Any special orders, Boss? (/wiretap, /ghost...)"
            className="w-full rounded-lg border border-[#E5E7EB] bg-white py-4 pl-5 pr-14 text-base font-sans shadow-sm transition-all placeholder-[#9CA3AF] focus:border-[#A68A56] focus:outline-none focus:ring-1 focus:ring-[#A68A56] sm:py-5 sm:pl-8 sm:pr-16"
          />
          <button
            id="send-btn"
            type="button"
            onClick={handleSend}
            className={`absolute right-4 rounded-lg p-3 transition-all duration-300 ${
              input.trim() ? 'translate-y-0 bg-[#1B3022] text-[#FDFBF7] shadow-lg' : 'translate-y-1 text-[#E5E7EB]'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
        <p className="mt-4 hidden items-center justify-center space-x-2 font-mono text-[9px] uppercase tracking-[0.3em] text-[#9CA3AF] sm:flex">
          <span>Cynthia's Private Desktop</span>
          <span className="text-[#A68A56]">/</span>
          <span>1962 Executive Edition</span>
        </p>
      </div>
    </div>
  );
}
