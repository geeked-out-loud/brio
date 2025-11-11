// FEWJIO mapping to Braille dots 1-6
export const keyToDot: Record<string, number> = {
  'f': 1,
  'e': 2,
  'w': 3,
  'j': 4,
  'i': 5,
  'o': 6,
};

// Braille character mapping (basic letters a-z)
export const dotsToChar: Record<string, string> = {
  '1': 'a',
  '12': 'b',
  '14': 'c',
  '145': 'd',
  '15': 'e',
  '124': 'f',
  '1245': 'g',
  '125': 'h',
  '24': 'i',
  '245': 'j',
  '13': 'k',
  '123': 'l',
  '134': 'm',
  '1345': 'n',
  '135': 'o',
  '1234': 'p',
  '12345': 'q',
  '1235': 'r',
  '234': 's',
  '2345': 't',
  '136': 'u',
  '1236': 'v',
  '2456': 'w',
  '1346': 'x',
  '13456': 'y',
  '1356': 'z',
};

/**
 * Converts a set of pressed keys to their corresponding Braille dots
 */
export function keysToDots(keys: Set<string>): number[] {
  return Array.from(keys)
    .map(k => keyToDot[k])
    .filter(Boolean)
    .sort((a, b) => a - b);
}

/**
 * Converts Braille dots to a character
 */
export function dotsToCharacter(dots: number[]): string {
  const dotPattern = dots.join('');
  return dotsToChar[dotPattern] || '?';
}
