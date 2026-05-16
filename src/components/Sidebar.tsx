import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  MessageSquare,
  Settings,
  Search,
  Briefcase,
  Heart,
  Stethoscope,
  User,
  Plus
} from 'lucide-react';
import { Conversation } from '../types';
import { Pinup } from './Pinup';

interface SidebarProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onNewFrequency: () => void;
  filter: string;
  setFilter: (filter: string) => void;
  onLogout: () => void;
}

export function Sidebar({ conversations, selectedId, onSelect, onNewFrequency, filter, setFilter, onLogout }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', icon: MessageSquare, label: 'The Suite' },
    { id: 'business', icon: Briefcase, label: 'Ambition' },
    { id: 'personal', icon: User, label: 'Complications' },
    { id: 'medical', icon: Stethoscope, label: 'Vigor' },
  ];

  const filteredConversations = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return conversations.filter(c => {
      const categoryMatches = filter === 'all' || c.category === filter;
      if (!categoryMatches) return false;
      if (!normalizedSearch) return true;

      return [c.contactName, c.phoneNumber, c.lastMessage]
        .filter(Boolean)
        .some(value => value.toLowerCase().includes(normalizedSearch));
    });
  }, [conversations, filter, searchTerm]);

  return (
    <aside id="sidebar" className="flex h-full w-full shrink-0 flex-col bg-[#1B3022] shadow-2xl md:w-80 md:border-r md:border-[#142319]">
      <div className="border-b border-[#142319] bg-[#16291D] px-5 pb-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] sm:px-6 sm:pb-6 sm:pt-10">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-[#991B1B] shadow-[0_0_8px_rgba(153,27,27,0.6)]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A68A56]">Executive Suite</span>
            </div>
            <h1 className="font-serif text-3xl italic tracking-tight text-[#FDFBF7]">Cynthia</h1>
          </div>
          <button
            id="add-contact-mobile"
            type="button"
            onClick={onNewFrequency}
            title="Establish Connection"
            className="rounded-full bg-[#A68A56] p-3 text-[#1B3022] shadow-xl transition-all hover:bg-[#FDFBF7] active:scale-95 md:hidden"
          >
            <Plus size={18} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 px-3 py-4 sm:flex sm:flex-col sm:space-y-1 sm:py-6">
        {categories.map((cat) => (
          <button
            id={`cat-${cat.id}`}
            key={cat.id}
            type="button"
            onClick={() => setFilter(cat.id)}
            className={`group flex min-h-11 items-center space-x-3 rounded-lg px-4 py-2 transition-all duration-300 ${
              filter === cat.id
                ? 'bg-[#FDFBF7] text-[#1B3022] shadow-xl sm:translate-x-1'
                : 'text-[#A68A56]/70 hover:bg-white/5 hover:text-[#FDFBF7]'
            }`}
          >
            <cat.icon size={16} strokeWidth={filter === cat.id ? 2.5 : 2} />
            <span className={`truncate text-xs font-medium uppercase tracking-wide ${filter === cat.id ? 'font-semibold' : ''}`}>
              {cat.label}
            </span>
          </button>
        ))}
      </div>

      <div className="px-4 pb-4">
        <div className="group relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A68A56]/40 transition-colors group-focus-within:text-[#FDFBF7]" />
          <input
            type="search"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Scan the frequencies..."
            className="w-full rounded-md border-none bg-[#142319] py-3 pl-9 pr-4 text-base text-[#FDFBF7] placeholder-[#A68A56]/30 focus:ring-1 focus:ring-[#A68A56] sm:py-2 sm:text-xs"
          />
        </div>
      </div>

      <div className="custom-scroll flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {filteredConversations.length === 0 && (
          <div className="mx-2 rounded-lg border border-[#A68A56]/20 px-4 py-8 text-center">
            <Heart size={20} className="mx-auto mb-3 text-[#991B1B]/60" />
            <p className="font-serif text-sm italic text-[#FDFBF7]/70">The drawer is empty, Boss.</p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#A68A56]/50">Tap plus to tuck one away</p>
          </div>
        )}

        {filteredConversations.map((conv, index) => (
          <motion.button
            id={`conv-${conv.id}`}
            key={conv.id}
            type="button"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            layout
            onClick={() => onSelect(conv.id)}
            className={`group relative w-full overflow-hidden rounded-lg p-4 text-left transition-all duration-300 ${
              selectedId === conv.id ? 'bg-[#FDFBF7] shadow-lg' : 'hover:bg-white/5'
            }`}
          >
            {selectedId === conv.id && (
              <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#A68A56]" />
            )}
            <div className="mb-1 flex items-start justify-between gap-3">
              <span className={`truncate text-sm font-medium ${selectedId === conv.id ? 'text-[#1B3022]' : 'text-[#FDFBF7]/90 group-hover:text-white'}`}>
                {conv.contactName}
              </span>
              <span className={`shrink-0 font-mono text-[9px] opacity-50 ${selectedId === conv.id ? 'text-[#1B3022]' : 'text-[#A68A56]'}`}>
                {conv.timestamp}
              </span>
            </div>
            <p className={`truncate text-[11px] leading-relaxed ${selectedId === conv.id ? 'text-[#1B3022]/70' : 'text-[#A68A56]/60 list-item-preview'}`}>
              {conv.lastMessage}
            </p>
          </motion.button>
        ))}
      </div>

      <div className="hidden justify-center border-t border-[#142319]/30 bg-black/5 px-6 py-8 md:flex">
        <Pinup size="small" />
      </div>

      <div className="flex items-center justify-between border-t border-[#142319] bg-[#16291D] px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 sm:p-6">
        <div className="flex min-w-0 items-center space-x-2 text-[#A68A56] transition-colors hover:text-[#FDFBF7]">
          <Heart size={16} className="shrink-0 text-[#991B1B]" />
          <span className="truncate font-mono text-[9px] uppercase tracking-[0.18em] opacity-60">Status: Lighting your Lucky</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            id="logout-btn"
            type="button"
            onClick={onLogout}
            title="End the Arrangement"
            className="rounded-full p-2 text-[#A68A56] transition-colors hover:bg-white/5 hover:text-[#991B1B]"
          >
            <Settings size={14} />
          </button>
          <button
            id="add-contact"
            type="button"
            onClick={onNewFrequency}
            title="Establish Connection"
            className="hidden rounded-full bg-[#A68A56] p-2.5 text-[#1B3022] shadow-xl transition-all hover:bg-[#FDFBF7] active:scale-95 md:block"
          >
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>
      </div>
    </aside>
  );
}
