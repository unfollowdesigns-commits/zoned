/**
 * A small dark palette. Recovery colours are the load-bearing part: they carry
 * meaning, so they are defined once here and never inlined at a call site.
 */
export const theme = {
  bg: '#0B0D10',
  surface: '#14181D',
  surfaceAlt: '#1B2027',
  border: '#252B33',
  text: '#F2F5F8',
  textMuted: '#8A94A2',
  accent: '#4EA8FF',
  green: '#31D08A',
  yellow: '#F2C14E',
  red: '#F2635F',
} as const;

export function recoveryColor(band: 'red' | 'yellow' | 'green'): string {
  return band === 'green' ? theme.green : band === 'yellow' ? theme.yellow : theme.red;
}

export const spacing = (n: number) => n * 8;
