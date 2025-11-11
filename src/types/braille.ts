export interface BrailleDisplayProps {
  currentDots: number[];
  pressedKeys: Set<string>;
  dotsToChar: Record<string, string>;
}

export interface TextInputProps {
  input: string;
}

export interface UseBrailleInputReturn {
  input: string;
  pressedKeys: Set<string>;
  currentDots: number[];
}
