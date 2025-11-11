'use client';

import type { TextInputProps } from '@/types/braille';

export default function TextInput({ input }: TextInputProps) {
  return (
    <div className="flex-1 w-full">
      <div className="bg-transparent rounded-l-3xl md:rounded-l-3xl rounded-r-3xl md:rounded-r-none p-6 md:p-8 md:pl-12 md:pr-16 min-h-[300px] md:min-h-[400px] border border-[#2A2A2A] md:border-l md:border-t md:border-b md:border-r-0 font-mono text-[#E8E8E8] text-2xl md:text-3xl leading-relaxed shadow-2xl">
        {input || <span className="text-[#3A3A3A]">start typing...</span>}
        <span className="opacity-0">|</span>
      </div>
    </div>
  );
}
