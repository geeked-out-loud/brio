'use client';

import type { TextInputProps } from '@/types/braille';

export default function TextInput({ input }: TextInputProps) {
  return (
    <div className="flex-1 w-full h-full max-h-[40vh] md:max-h-[50vh] relative">
      {/* Shadow layer that fades to the right */}
      <div 
        className="absolute inset-0 rounded-2xl md:rounded-l-2xl md:rounded-r-none pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.25) 0%, transparent 90%)',
          filter: 'blur(12px)',
          transform: 'translateX(-8px)',
        }}
      />
      {/* Outer wrapper with gradient border effect */}
      <div 
        className="h-full rounded-2xl md:rounded-l-2xl md:rounded-r-none p-[1px] relative"
        style={{
          background: 'linear-gradient(to right, #2A2A2A 0%, transparent 90%)',
        }}
      >
        {/* Inner content */}
        <div className="bg-[#0F0F0F] rounded-2xl md:rounded-l-2xl md:rounded-r-none p-4 md:p-6 h-full font-mono text-[#E8E8E8] text-xl md:text-2xl leading-relaxed overflow-y-auto">
          {input || <span className="text-[#3A3A3A]">start typing...</span>}
          <span className="opacity-0">|</span>
        </div>
      </div>
    </div>
  );
}
