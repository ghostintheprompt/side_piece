import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Phone, 
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
  const categories = [
    { id: 'all', icon: MessageSquare, label: 'All' },
    { id: 'business', icon: Briefcase, label: 'Business' },
    { id: 'personal', icon: User, label: 'Personal' },
    { id: 'medical', icon: Stethoscope, label: 'Medical' },
  ];

  const filteredConversations = conversations.filter(c => 
    filter === 'all' || c.category === filter
  );

  return (
    <div id="sidebar" className="w-80 h-full bg-[#1B3022] border-r border-[#142319] flex flex-col shadow-2xl z-10">
      {/* Title Bar Area */}
      <div className="pt-10 pb-6 px-6 border-b border-[#142319] bg-[#16291D]">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#991B1B] shadow-[0_0_8px_rgba(153,27,27,0.6)]" />
            <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#A68A56]">Executive Suite</span>
          </div>
          <h1 className="text-3xl font-serif italic text-[#FDFBF7] tracking-tight">Cynthia</h1>
        </div>
      </div>

      {/* Navigation Rail */}
      <div className="px-3 py-6 flex flex-col space-y-1">
        {categories.map((cat) => (
          <button
            id={`cat-${cat.id}`}
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-300 group ${
              filter === cat.id 
                ? 'bg-[#FDFBF7] text-[#1B3022] shadow-xl translate-x-1' 
                : 'text-[#A68A56]/60 hover:text-[#FDFBF7] hover:bg-white/5'
            }`}
          >
            <cat.icon size={16} strokeWidth={filter === cat.id ? 2.5 : 2} />
            <span className={`text-xs font-medium tracking-wide uppercase ${filter === cat.id ? 'font-semibold' : ''}`}>
              {cat.label}
            </span>
          </button>
        ))}
      </div>

      <div className="px-4 mb-4">
        <div className="relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A68A56]/40 group-focus-within:text-[#FDFBF7] transition-colors" />
          <input 
            type="text" 
            placeholder="Search frequencies..." 
            className="w-full bg-[#142319] border-none rounded-md py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-[#A68A56] text-[#FDFBF7] placeholder-[#A68A56]/30"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 py-4 custom-scroll">
        {filteredConversations.map((conv, index) => (
          <motion.div
            id={`conv-${conv.id}`}
            key={conv.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            layout
            onClick={() => onSelect(conv.id)}
            className={`p-4 rounded-xl cursor-pointer transition-all duration-300 group relative overflow-hidden ${
              selectedId === conv.id ? 'bg-[#FDFBF7] shadow-lg' : 'hover:bg-white/5'
            }`}
          >
            {selectedId === conv.id && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#A68A56]" />
            )}
            <div className="flex justify-between items-start mb-1">
              <span className={`text-sm font-medium ${selectedId === conv.id ? 'text-[#1B3022]' : 'text-[#FDFBF7]/90 group-hover:text-white'}`}>
                {conv.contactName}
              </span>
              <span className={`text-[9px] font-mono opacity-50 ${selectedId === conv.id ? 'text-[#1B3022]' : 'text-[#A68A56]'}`}>
                {conv.timestamp}
              </span>
            </div>
            <p className={`text-[11px] truncate leading-relaxed ${selectedId === conv.id ? 'text-[#1B3022]/70' : 'text-[#A68A56]/60 list-item-preview'}`}>
              {conv.lastMessage}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Rotating Pinup */}
      <div className="px-6 py-8 flex justify-center border-t border-[#142319]/30 bg-black/5">
        <Pinup size="small" />
      </div>

      <div className="p-6 border-t border-[#142319] flex items-center justify-between bg-[#16291D]">
        <div className="flex items-center space-x-2 text-[#A68A56] hover:text-[#FDFBF7] cursor-help transition-colors group">
          <Heart size={16} className="group-hover:animate-bounce text-[#991B1B]" />
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] opacity-60">Status: Waiting for You</span>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            id="logout-btn" 
            onClick={onLogout}
            title="Terminate Session"
            className="p-2 rounded-full hover:bg-white/5 text-[#A68A56] hover:text-[#991B1B] transition-colors"
          >
            <Settings size={14} />
          </button>
          <button 
            id="add-contact" 
            onClick={onNewFrequency}
            title="New Frequency Entry"
            className="p-2.5 rounded-full bg-[#A68A56] hover:bg-[#FDFBF7] text-[#1B3022] transition-all shadow-xl active:scale-95"
          >
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}
