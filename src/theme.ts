import { loadFont as loadFredoka } from '@remotion/google-fonts/Fredoka';
import { loadFont as loadNunito } from '@remotion/google-fonts/NunitoSans';
import { loadFont as loadPlex } from '@remotion/google-fonts/IBMPlexMono';
import timeline from './timeline.json';

export const DISPLAY = loadFredoka('normal', { weights: ['500', '600', '700'], subsets: ['latin'] }).fontFamily;
export const BODY = loadNunito('normal', { weights: ['400', '600', '700'], subsets: ['latin'] }).fontFamily;
export const MONO = loadPlex('normal', { weights: ['400', '500', '600'], subsets: ['latin'] }).fontFamily;

// openswap.live, day theme.
export const C = {
  paper: '#f7f2e8',
  paperDeep: '#ede4d3',
  card: '#fbf8f1',
  ink: '#111111',
  ink70: 'rgba(17,17,17,0.7)',
  ink45: 'rgba(17,17,17,0.45)',
  ink12: 'rgba(17,17,17,0.12)',
  line: 'rgba(17,17,17,0.055)',
  // Night accents, held back for the finale.
  orange: '#f7931a',
  green: '#00c853',
  amber: '#fbbf24',
  blue: '#3b82f6',
  night: '#050505',
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
