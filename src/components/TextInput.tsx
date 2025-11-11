'use client';

import type { TextInputProps } from '@/types/braille';

export default function TextInput({ input }: TextInputProps) {
  return (
    <div className="flex-1">
      <div className="bg-transparent rounded-l-3xl p-6 pl-8 pr-16 min-h-[400px] border-l border-t border-b border-[#2A2A2A] font-mono text-[#E8E8E8] text-3xl leading-relaxed shadow-2xl">
        {input || <span className="text-[#3A3A3A]">start typing...</span>}
        <span className="opacity-0">|</span>
      </div>
    </div>
  );
}
