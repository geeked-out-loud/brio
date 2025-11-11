'use client';

import type { BrailleDisplayProps } from '@/types/braille';

export default function BrailleDisplay({ currentDots, pressedKeys, dotsToChar }: BrailleDisplayProps) {
  const renderBrailleDot = (position: number) => {
    const isActive = currentDots.includes(position);
    return (
      <div
        key={position}
        className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 transition-all duration-200 ${
          isActive
            ? 'bg-[#E8F4FF] border-[#D0E8FF] shadow-[0_0_25px_rgba(224,240,255,0.9),0_0_50px_rgba(208,232,255,0.9)]'
            : 'bg-transparent border-[#2A2A2A]'
        }`}
      />
    );
  };

  return (
    <div className="relative flex flex-col items-center mx-8 md:mx-24">
      {/* Braille Dots */}
      <div className="grid grid-cols-2 gap-4 md:gap-5 mb-8 md:mb-12">
        {/* Left column: dots 1,2,3 */}
        <div className="flex flex-col gap-4 md:gap-5">
          {renderBrailleDot(1)}
          {renderBrailleDot(2)}
          {renderBrailleDot(3)}
        </div>
        {/* Right column: dots 4,5,6 */}
        <div className="flex flex-col gap-4 md:gap-5">
          {renderBrailleDot(4)}
          {renderBrailleDot(5)}
          {renderBrailleDot(6)}
        </div>
      </div>

      {/* Current character preview */}
      <div className="text-[#E8F4FF] text-7xl md:text-8xl font-mono drop-shadow-[0_0_30px_rgba(232,244,255,0.7)]">
        {currentDots.length > 0 ? (dotsToChar[currentDots.join('')] || '?') : '.'}
      </div>
    </div>
  );
}
