'use client';

import type { TextInputProps } from '@/types/braille';

export default function TextInput({ input }: TextInputProps) {
  return (
    <div className="flex-1 w-full h-full max-h-[40vh] md:max-h-[50vh]">
      <div className="bg-transparent rounded-2xl md:rounded-l-2xl md:rounded-r-none p-4 md:p-6 h-full border border-[#2A2A2A] md:border-l md:border-t md:border-b md:border-r-0 font-mono text-[#E8E8E8] text-xl md:text-2xl leading-relaxed shadow-2xl overflow-y-auto">
        {input || <span className="text-[#3A3A3A]">start typing...</span>}
        <span className="opacity-0">|</span>
      </div>
    </div>
  );
}
