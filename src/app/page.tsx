'use client';

import Image from 'next/image';
import BrailleDisplay from '@/components/BrailleDisplay';
import TextInput from '@/components/TextInput';
import { useBrailleInput } from '@/hooks/useBrailleInput';
import { dotsToChar } from '@/utils/brailleMapping';

export default function Home() {
  const { input, pressedKeys, currentDots } = useBrailleInput();

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col justify-center px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12 md:mb-16">
        <div className="flex items-center justify-center gap-4 md:gap-5 mb-3 md:mb-4">
          <Image 
            src="/logo.png" 
            alt="Brio Logo" 
            width={120} 
            height={120}
            className="opacity-90 md:w-[120px] md:h-[120px]"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-[#E8E8E8] tracking-tight">brio</h1>
        </div>
        <p className="text-[#3A3A3A] text-xs md:text-sm tracking-wider uppercase">braille input optimizer</p>
      </div>

      {/* Main Content - Side by Side */}
      <div className="w-full flex flex-col md:flex-row items-center gap-12 md:gap-24 md:pl-16">
        {/* Left Side - Braille Display */}
        <div className="flex-shrink-0">
          <BrailleDisplay 
            currentDots={currentDots}
            pressedKeys={pressedKeys}
            dotsToChar={dotsToChar}
          />
        </div>

        {/* Right Side - Text Input (extends to edge) */}
        <TextInput input={input} />
      </div>

      {/* Footer hint */}
      <div className="text-center mt-8 md:mt-12">
        {/* Key Mapping Helper */}
        <div className="flex justify-center gap-2 md:gap-3 text-xs md:text-sm text-[#3A3A3A] font-mono mb-2 flex-wrap">
          <span className={`transition-colors ${pressedKeys.has('f') ? 'text-[#E8F4FF]' : ''}`}>F=●₁</span>
          <span className={`transition-colors ${pressedKeys.has('e') ? 'text-[#E8F4FF]' : ''}`}>E=●₂</span>
          <span className={`transition-colors ${pressedKeys.has('w') ? 'text-[#E8F4FF]' : ''}`}>W=●₃</span>
          <span className={`transition-colors ${pressedKeys.has('j') ? 'text-[#E8F4FF]' : ''}`}>J=●₄</span>
          <span className={`transition-colors ${pressedKeys.has('i') ? 'text-[#E8F4FF]' : ''}`}>I=●₅</span>
          <span className={`transition-colors ${pressedKeys.has('o') ? 'text-[#E8F4FF]' : ''}`}>O=●₆</span>
        </div>
        <div className="text-[#3A3A3A] text-xs md:text-sm px-4">
          press multiple keys together · space to add space · backspace to delete
        </div>
      </div>
    </div>
  );
}

