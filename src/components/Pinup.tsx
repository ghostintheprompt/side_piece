import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const PINUPS = [
  '/side_piece_1.png',
  '/side_piece_2.png',
  '/side_piece_3.png',
  '/side_piece_4.png'
];

interface PinupProps {
  size?: 'small' | 'large';
  className?: string;
}

export function Pinup({ size = 'small', className = '' }: PinupProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % PINUPS.length);
    }, 15000); // Rotate every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const isSmall = size === 'small';

  return (
    <div className={`relative ${isSmall ? 'w-48 h-48' : 'w-full h-full'} ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: index % 2 === 0 ? 2 : -2 }}
          exit={{ opacity: 0, scale: 1.1, rotate: 5 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <div className={`
            bg-[#FDFBF7] p-2 shadow-2xl border border-[#A68A56]/20
            ${isSmall ? 'p-2' : 'p-4'}
          `}>
            <img 
              src={PINUPS[index]} 
              alt="Cynthia Pinup"
              className="w-full h-full object-cover grayscale-[0.2] contrast-125"
            />
            {isSmall && (
              <div className="mt-2 text-center">
                <span className="text-[8px] font-mono text-[#A68A56] uppercase tracking-[0.2em] opacity-40">
                  Property of MDRN Corp
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
