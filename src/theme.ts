import { loadFont as loadSpace } from '@remotion/google-fonts/SpaceMono';
import { loadFont as loadPlex } from '@remotion/google-fonts/IBMPlexMono';
import { loadFont as loadJet } from '@remotion/google-fonts/JetBrainsMono';
import timeline from './timeline.json';

// Portal's own type: Space Mono headers, IBM Plex Mono body, JetBrains Mono numbers.
export const HEAD = loadSpace('normal', { weights: ['400', '700'], subsets: ['latin'] }).fontFamily;
export const MONO = loadPlex('normal', { weights: ['400', '500', '600'], subsets: ['latin'] }).fontFamily;
export const NUM = loadJet('normal', { weights: ['400', '500', '700', '800'], subsets: ['latin'] }).fontFamily;

// Portal design tokens (portal/src/index.css).
export const C = {
  bg: '#0b0e13',
  surface: '#121722',
  raised: '#171d2a',
  line: 'rgba(255,255,255,0.08)',
  lineStrong: 'rgba(255,255,255,0.16)',
  fg: '#f4f6fa',
  muted: '#a2a9b8',
  subtle: '#72798a',
  azure: '#36abfc',
  violet: '#b990ff',
  green: '#31d158',
  amber: '#f5c451',
  red: '#ff5a5f',
  orange: '#f7931a',
};

export const T = timeline;
export const FPS = T.fps;
export const BEAT = (FPS * 60) / T.bpm;
export const BAR = BEAT * 4;
export type SectionName = keyof typeof T.sections;
export const sectionFrames = (name: SectionName) => {
  const [a, b] = T.sections[name];
  return { from: a * BAR, duration: (b - a) * BAR };
};
export const TOTAL = Math.max(...Object.values(T.sections).map(([, e]) => e)) * BAR;
