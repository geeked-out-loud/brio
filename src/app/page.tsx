'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import BrailleDisplay from '@/components/BrailleDisplay';
import TextInput from '@/components/TextInput';
import { useBrailleInput } from '@/hooks/useBrailleInput';
import { dotsToChar } from '@/utils/brailleMapping';
import type { AudioMode } from '@/utils/audioFeedback';

export default function Home() {
  const [audioMode, setAudioMode] = useState<AudioMode>('piano');
  const { input, pressedKeys, currentDots } = useBrailleInput(audioMode);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus on mount for mobile keyboard accessibility
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleInputFocus = () => {
    // Keep input focused for keyboard access
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div 
      className="h-screen w-screen bg-[#0F0F0F] flex flex-col justify-between overflow-hidden p-4"
      onClick={handleInputFocus}
    >
      {/* Hidden accessible input for mobile keyboard trigger */}
      <input
        ref={inputRef}
        type="text"
        inputMode="none"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Braille input field"
        className="absolute opacity-0 pointer-events-none"
        style={{ left: '-9999px' }}
      />
      {/* Header */}
      <div className="text-center flex-shrink-0">
        <div className="flex items-center justify-center gap-4">
          <Image 
            src="/logo.png" 
            alt="Brio Logo" 
            width={100} 
            height={100}
            className="opacity-90"
          />
          <h1 className="text-4xl font-bold text-[#E8E8E8] tracking-tight">brio</h1>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={() => setAudioMode('piano')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              audioMode === 'piano'
                ? 'bg-[#2A2A2A] text-[#E8F4FF] shadow-lg'
                : 'bg-transparent text-[#3A3A3A] hover:text-[#6A6A6A]'
            }`}
          >
            🎹 Learning
          </button>
          <div className="w-px h-6 bg-[#2A2A2A]" />
          <button
            onClick={() => setAudioMode('mechanical')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              audioMode === 'mechanical'
                ? 'bg-[#2A2A2A] text-[#E8F4FF] shadow-lg'
                : 'bg-transparent text-[#3A3A3A] hover:text-[#6A6A6A]'
            }`}
          >
            ⌨️ Writing
          </button>
        </div>
      </div>

      {/* Main Content - Side by Side */}
      <div className="flex-1 w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 overflow-hidden px-8 md:px-16">
        {/* Left Side - Braille Display */}
        <div className="flex-shrink-0 px-6 md:px-10">
          <BrailleDisplay 
            currentDots={currentDots}
            pressedKeys={pressedKeys}
            dotsToChar={dotsToChar}
          />
        </div>

        {/* Right Side - Text Input */}
        <TextInput input={input} />
      </div>

      {/* Footer hint */}
      <div className="text-center flex-shrink-0">
        {/* Key Mapping Helper */}
        <div className="flex justify-center gap-2 text-xs text-[#3A3A3A] font-mono mb-1 flex-wrap">
          <span className={`transition-colors ${pressedKeys.has('f') ? 'text-[#E8F4FF]' : ''}`}>F=●₁</span>
          <span className={`transition-colors ${pressedKeys.has('e') ? 'text-[#E8F4FF]' : ''}`}>E=●₂</span>
          <span className={`transition-colors ${pressedKeys.has('w') ? 'text-[#E8F4FF]' : ''}`}>W=●₃</span>
          <span className={`transition-colors ${pressedKeys.has('j') ? 'text-[#E8F4FF]' : ''}`}>J=●₄</span>
          <span className={`transition-colors ${pressedKeys.has('i') ? 'text-[#E8F4FF]' : ''}`}>I=●₅</span>
          <span className={`transition-colors ${pressedKeys.has('o') ? 'text-[#E8F4FF]' : ''}`}>O=●₆</span>
        </div>
        <div className="text-[#3A3A3A] text-xs">
          press multiple keys together · space to add space · backspace to delete
        </div>
      </div>
    </div>
  );
}

