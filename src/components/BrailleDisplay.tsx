'use client';

import type { BrailleDisplayProps } from '@/types/braille';

export default function BrailleDisplay({ currentDots, pressedKeys, dotsToChar }: BrailleDisplayProps) {
  const renderBrailleDot = (position: number) => {
    const isActive = currentDots.includes(position);
    return (
      <div
        key={position}
        className={`w-7 h-7 md:w-8 md:h-8 rounded-full border-2 transition-all duration-200 ${
          isActive
            ? 'bg-[#E8F4FF] border-[#D0E8FF] shadow-[0_0_20px_rgba(224,240,255,0.9),0_0_40px_rgba(208,232,255,0.9)]'
            : 'bg-transparent border-[#2A2A2A]'
        }`}
      />
    );
  };

  return (
    <div className="flex flex-col items-center">
      {/* Braille Dots */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
        {/* Left column: dots 1,2,3 */}
        <div className="flex flex-col gap-3 md:gap-4">
          {renderBrailleDot(1)}
          {renderBrailleDot(2)}
          {renderBrailleDot(3)}
        </div>
        {/* Right column: dots 4,5,6 */}
        <div className="flex flex-col gap-3 md:gap-4">
          {renderBrailleDot(4)}
          {renderBrailleDot(5)}
          {renderBrailleDot(6)}
        </div>
      </div>

      {/* Current character preview */}
      <div className="text-[#E8F4FF] text-6xl md:text-7xl font-mono drop-shadow-[0_0_30px_rgba(232,244,255,0.7)]">
        {currentDots.length > 0 ? (dotsToChar[currentDots.join('')] || '?') : '.'}
      </div>
    </div>
  );
}
