'use client';

import BrailleDisplay from '@/components/BrailleDisplay';
import TextInput from '@/components/TextInput';
import { useBrailleInput } from '@/hooks/useBrailleInput';
import { dotsToChar } from '@/utils/brailleMapping';

export default function Home() {
  const { input, pressedKeys, currentDots } = useBrailleInput();

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col justify-center">
      {/* Header */}
      <div className="text-center mb-16 px-8">
        <h1 className="text-5xl font-bold text-[#E8E8E8] mb-3 tracking-tight">brio</h1>
        <p className="text-[#3A3A3A] text-sm tracking-wider uppercase">braille input optimizer</p>
      </div>

      {/* Main Content - Side by Side */}
      <div className="w-full flex items-center gap-24 pl-16">
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
      <div className="text-center mt-12 px-8">
        {/* Key Mapping Helper */}
        <div className="flex justify-center gap-3 text-sm text-[#3A3A3A] font-mono mb-2">
          <span className={`transition-colors ${pressedKeys.has('f') ? 'text-[#E8F4FF]' : ''}`}>F=●₁</span>
          <span className={`transition-colors ${pressedKeys.has('e') ? 'text-[#E8F4FF]' : ''}`}>E=●₂</span>
          <span className={`transition-colors ${pressedKeys.has('w') ? 'text-[#E8F4FF]' : ''}`}>W=●₃</span>
          <span className={`transition-colors ${pressedKeys.has('j') ? 'text-[#E8F4FF]' : ''}`}>J=●₄</span>
          <span className={`transition-colors ${pressedKeys.has('i') ? 'text-[#E8F4FF]' : ''}`}>I=●₅</span>
          <span className={`transition-colors ${pressedKeys.has('o') ? 'text-[#E8F4FF]' : ''}`}>O=●₆</span>
        </div>
        <div className="text-[#3A3A3A] text-sm">
          press multiple keys together · space to add space · backspace to delete
        </div>
      </div>
    </div>
  );
}

