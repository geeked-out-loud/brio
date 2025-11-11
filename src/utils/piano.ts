// Musical notes for each Braille key (F E W J I O)
// Using C major scale starting from middle C
export const keyToNote: Record<string, { frequency: number; note: string }> = {
  'f': { frequency: 261.63, note: 'C4' },  // Middle C
  'e': { frequency: 293.66, note: 'D4' },  // D
  'w': { frequency: 329.63, note: 'E4' },  // E
  'j': { frequency: 349.23, note: 'F4' },  // F
  'i': { frequency: 392.00, note: 'G4' },  // G
  'o': { frequency: 440.00, note: 'A4' },  // A (standard pitch)
};

/**
 * Trigger haptic feedback if available
 */
export function triggerHaptic(intensity: number = 50) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    // Different vibration patterns for different intensities
    const patterns: Record<number, number[]> = {
      1: [10],           // Dot 1 - very light tap
      2: [15],           // Dot 2 - light tap
      3: [20],           // Dot 3 - medium tap
      4: [25],           // Dot 4 - medium-strong tap
      5: [30],           // Dot 5 - strong tap
      6: [35],           // Dot 6 - strongest tap
    };
    
    navigator.vibrate(patterns[intensity] || [20]);
  }
}

/**
 * Play a musical note using Web Audio API with softer piano-like envelope
 * Returns a stop function to allow manual note termination
 */
export function playNote(frequency: number, duration: number = 2500, holdMode: boolean = false) {
  if (typeof window === 'undefined') return () => {};
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create multiple oscillators for richer piano-like sound
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const oscillator3 = audioContext.createOscillator();
    
    const gainNode = audioContext.createGain();
    const masterGain = audioContext.createGain();

    // Mix oscillators for richer tone
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    oscillator3.connect(gainNode);
    gainNode.connect(masterGain);
    masterGain.connect(audioContext.destination);

    // Fundamental frequency - softer with triangle wave
    oscillator1.frequency.value = frequency;
    oscillator1.type = 'triangle';
    
    // Harmonic (octave) - reduced volume
    oscillator2.frequency.value = frequency * 2;
    oscillator2.type = 'sine';
    
    // Sub harmonic for depth - reduced volume
    oscillator3.frequency.value = frequency * 0.5;
    oscillator3.type = 'sine';

    const now = audioContext.currentTime;
    const attackTime = 0.003;  // Slightly slower attack for softer sound
    const decayTime = 0.15;    // Gentle decay
    
    if (holdMode) {
      // Held note - sustain even longer with very slow fade
      const sustainLevel = 0.09;
      const holdDuration = duration / 1000;
      
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(0.18, now + attackTime);
      masterGain.gain.exponentialRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
      masterGain.gain.setValueAtTime(sustainLevel, now + attackTime + decayTime);
      // Very slow fade while holding
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + holdDuration);
    } else {
      // Single tap - still resonates nicely like a piano
      const sustainLevel = 0.1;
      const releaseTime = 2.0; // Longer natural resonance
      
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(0.2, now + attackTime);
      masterGain.gain.exponentialRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
      masterGain.gain.setValueAtTime(sustainLevel, now + attackTime + decayTime);
      // Slow natural piano decay
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + releaseTime);
    }

    oscillator1.start(now);
    oscillator2.start(now);
    oscillator3.start(now);
    
    const stopTime = now + (holdMode ? duration / 1000 : 2.0);
    oscillator1.stop(stopTime);
    oscillator2.stop(stopTime);
    oscillator3.stop(stopTime);
    
    // Return a function to stop the note early if needed
    return () => {
      const currentTime = audioContext.currentTime;
      masterGain.gain.cancelScheduledValues(currentTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, currentTime);
      // Gentle fade out over 0.3 seconds when releasing
      masterGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.3);
      oscillator1.stop(currentTime + 0.3);
      oscillator2.stop(currentTime + 0.3);
      oscillator3.stop(currentTime + 0.3);
    };
  } catch (error) {
    console.error('Audio playback error:', error);
    return () => {};
  }
}
