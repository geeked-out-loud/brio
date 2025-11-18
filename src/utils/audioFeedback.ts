export type AudioMode = 'piano' | 'mechanical';

type StopFn = () => void;

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isUnlocked = false;
let activeNodes = new Set<AudioNode>();

export const DEFAULT_SETTINGS = {
  masterVolume: 0.18,
  piano: { attack: 0.006, decay: 0.12, sustain: 0.09, release: 0.25, overtoneMix: 0.5 },
  mechanical: { attack: 0.001, release: 0.09, gain: 0.14 },
  haptics: { enabled: true, debounceMs: 40 },
  pianoIntervals: [0, 4, 7], // root, major3, perf5
};

export const settings = { ...DEFAULT_SETTINGS };

export const keyToNote: Record<string, { frequency: number; note: string }> = {
  'f': { frequency: 261.63, note: 'C4' },
  'e': { frequency: 293.66, note: 'D4' },
  'w': { frequency: 329.63, note: 'E4' },
  'j': { frequency: 349.23, note: 'F4' },
  'i': { frequency: 392.00, note: 'G4' },
  'o': { frequency: 440.00, note: 'A4' },
};

export const keyToMechanical: Record<string, { 
  clickFreq: number;
  releaseFreq: number;
  clickDuration: number;
  releaseDuration: number;
}> = {
  'f': { clickFreq: 600, releaseFreq: 300, clickDuration: 12, releaseDuration: 15 },
  'e': { clickFreq: 850, releaseFreq: 425, clickDuration: 9, releaseDuration: 12 },
  'w': { clickFreq: 1100, releaseFreq: 550, clickDuration: 11, releaseDuration: 14 },
  'j': { clickFreq: 1400, releaseFreq: 700, clickDuration: 8, releaseDuration: 11 },
  'i': { clickFreq: 1750, releaseFreq: 875, clickDuration: 10, releaseDuration: 13 },
  'o': { clickFreq: 2100, releaseFreq: 1050, clickDuration: 7, releaseDuration: 10 },
};

function ensureAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.gain.value = settings.masterVolume;
    masterGain.connect(audioContext.destination);
  }
  return audioContext;
}

export async function unlockAudio(): Promise<boolean> {
  const ctx = ensureAudioContext();
  if (!ctx) return false;
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (e) {
      console.warn('Audio unlock failed, user gesture may be required');
    }
  }
  isUnlocked = ctx.state === 'running';
  return isUnlocked;
}

function connectNode(node: AudioNode) {
  if (!masterGain) {
    console.warn('masterGain missing in connectNode');
    return;
  }
  activeNodes.add(node);
  try { node.connect(masterGain); } catch (e) { /* ignore */ }
}

function cleanupNode(node: AudioNode | null) {
  if (!node) return;
  try { node.disconnect(); } catch { /* ignore */ }
  activeNodes.delete(node);
}

function applyADSR(
  gain: GainNode, 
  now: number, 
  attack: number, 
  decay: number, 
  sustain: number, 
  releaseAt: number, 
  release: number
) {
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(1.0, now + attack);
  gain.gain.linearRampToValueAtTime(sustain, now + attack + decay);
  gain.gain.setValueAtTime(gain.gain.value, releaseAt);
  gain.gain.linearRampToValueAtTime(0.0001, releaseAt + release);
}

export function playPianoNote(frequency: number, durationMs: number = 1200, holdMode = false): StopFn {
  const ctx = ensureAudioContext();
  if (!ctx || !masterGain) return () => {};
  if (!isUnlocked && ctx.state === 'suspended') {
    return () => {};
  }

  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc1.type = 'triangle';
  osc2.type = 'sine';
  osc1.frequency.value = frequency;
  osc2.frequency.value = frequency * 2.0;

  osc1.connect(gainNode);
  osc2.connect(gainNode);
  connectNode(gainNode);

  const attack = settings.piano.attack;
  const decay = settings.piano.decay;
  const sustain = settings.piano.sustain;
  const release = settings.piano.release;

  applyADSR(gainNode, now, attack, decay, sustain, now + (holdMode ? durationMs / 1000 : 1.0), release);

  osc1.start(now);
  osc2.start(now);
  const stopTime = now + (holdMode ? durationMs / 1000 + 0.5 : 2.0);

  osc1.stop(stopTime + 0.05);
  osc2.stop(stopTime + 0.05);

  const cleanup = () => {
    try { gainNode.disconnect(); } catch {}
    try { osc1.disconnect(); } catch {}
    try { osc2.disconnect(); } catch {}
    cleanupNode(gainNode);
  };

  try {
    (osc1 as any).onended = cleanup;
  } catch {}

  setTimeout(cleanup, (holdMode ? durationMs + 1000 : 3000));

  const stopFn = () => {
    try {
      const t = ctx.currentTime;
      gainNode.gain.cancelScheduledValues(t);
      gainNode.gain.setValueAtTime(gainNode.gain.value, t);
      gainNode.gain.linearRampToValueAtTime(0.0001, t + 0.12);
      osc1.stop(t + 0.13);
      osc2.stop(t + 0.13);
    } catch {}
    setTimeout(cleanup, 150);
  };

  return stopFn;
}

export function playChord(
  rootFreq: number,
  intervals: number[] = settings.pianoIntervals,
  durationMs = 900
): StopFn {
  const ctx = ensureAudioContext();
  if (!ctx || !masterGain) return () => {};
  if (!isUnlocked && ctx.state === 'suspended') return () => {};

  const now = ctx.currentTime;
  const attack = settings.piano.attack;
  const decay = settings.piano.decay;
  const sustain = settings.piano.sustain;
  const release = settings.piano.release;

  const nodes: Array<{ osc: OscillatorNode; gain: GainNode }> = [];

  intervals.forEach((semitones) => {
    const freq = rootFreq * Math.pow(2, semitones / 12);

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.value = freq;

    osc.connect(gainNode);
    connectNode(gainNode);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(1.0, now + attack);
    gainNode.gain.linearRampToValueAtTime(sustain, now + attack + decay);
    
    const releaseAt = now + (durationMs / 1000);
    gainNode.gain.setValueAtTime(gainNode.gain.value, releaseAt);
    gainNode.gain.linearRampToValueAtTime(0.0001, releaseAt + release);

    osc.start(now);
    osc.stop(releaseAt + release + 0.05);

    const cleanup = () => {
      try { gainNode.disconnect(); } catch {}
      try { osc.disconnect(); } catch {}
      activeNodes.delete(gainNode);
    };
    
    try {
      (osc as any).onended = cleanup;
    } catch {}
    
    setTimeout(cleanup, Math.max(2000, durationMs + (release * 1000) + 200));

    nodes.push({ osc, gain: gainNode });
  });

  const stopFn = () => {
    try {
      const t = ctx.currentTime;
      nodes.forEach(({ osc, gain }) => {
        try {
          gain.gain.cancelScheduledValues(t);
          gain.gain.setValueAtTime(gain.gain.value, t);
          gain.gain.linearRampToValueAtTime(0.0001, t + 0.06);
          osc.stop(t + 0.08);
        } catch {}
      });
    } catch {}
    
    setTimeout(() => {
      nodes.forEach(({ osc, gain }) => {
        try { gain.disconnect(); } catch {}
        try { osc.disconnect(); } catch {}
        activeNodes.delete(gain);
      });
    }, 150);
  };

  return stopFn;
}

export function playMechanicalClick(key: string): StopFn {
  const params = keyToMechanical[key];
  if (!params) return () => {};
  
  const ctx = ensureAudioContext();
  if (!ctx || !masterGain) return () => {};
  if (!isUnlocked && ctx.state === 'suspended') return () => {};

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'square';
  osc.frequency.value = params.clickFreq;
  osc.connect(gainNode);
  connectNode(gainNode);

  gainNode.gain.setValueAtTime(0.0001, now);
  gainNode.gain.linearRampToValueAtTime(settings.mechanical.gain, now + settings.mechanical.attack);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + (params.clickDuration / 1000));

  osc.start(now);
  osc.stop(now + (params.clickDuration / 1000) + 0.02);

  const cleanup = () => {
    try { gainNode.disconnect(); } catch {}
    try { osc.disconnect(); } catch {}
    cleanupNode(gainNode);
  };

  try {
    (osc as any).onended = cleanup;
  } catch {}

  setTimeout(cleanup, (params.clickDuration + 200));

  const stopFn = () => {
    try {
      const t = ctx.currentTime;
      gainNode.gain.cancelScheduledValues(t);
      gainNode.gain.setValueAtTime(0.0001, t);
      osc.stop(t + 0.01);
    } catch {}
    setTimeout(cleanup, 50);
  };

  return stopFn;
}

export function playMechanicalRelease(key: string) {
  const params = keyToMechanical[key];
  if (!params) return;
  
  const ctx = ensureAudioContext();
  if (!ctx || !masterGain) return;
  if (!isUnlocked && ctx.state === 'suspended') return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'square';
  osc.frequency.value = params.releaseFreq;
  osc.connect(gainNode);
  connectNode(gainNode);

  gainNode.gain.setValueAtTime(0.0001, now);
  gainNode.gain.linearRampToValueAtTime(0.06, now + 0.001);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + (params.releaseDuration / 1000));

  osc.start(now);
  osc.stop(now + (params.releaseDuration / 1000) + 0.02);

  const cleanup = () => {
    try { gainNode.disconnect(); } catch {}
    try { osc.disconnect(); } catch {}
    cleanupNode(gainNode);
  };

  try {
    (osc as any).onended = cleanup;
  } catch {}

  setTimeout(cleanup, (params.releaseDuration + 200));
}

let lastVibe = 0;
export function triggerHaptic(intensity = 1) {
  if (!settings.haptics.enabled || typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  const now = Date.now();
  if (now - lastVibe < settings.haptics.debounceMs) return;
  lastVibe = now;
  const patterns: Record<number, number[]> = {
    1: [8],
    2: [12],
    3: [18],
    4: [22],
    5: [28],
    6: [34],
  };
  navigator.vibrate(patterns[intensity] || [18]);
}

export function setMasterVolume(v: number) {
  const ctx = ensureAudioContext();
  if (!ctx || !masterGain) return;
  masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, v)), ctx.currentTime);
  settings.masterVolume = v;
}

export function shutdownAudio() {
  try {
    activeNodes.forEach((n) => {
      try { n.disconnect(); } catch {}
    });
    activeNodes.clear();
    if (audioContext) {
      audioContext.close();
    }
  } catch {}
  audioContext = null;
  masterGain = null;
  isUnlocked = false;
}