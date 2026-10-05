import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import narration from './narration-timing.json';
import { FPS, SectionName, sectionFrames, T, TOTAL } from './theme';
import { Better, Intro, Legacy, PaySwap, Route, Taproot } from './scenes/Story';
import { Market } from './scenes/Market';
import { Backend, Cta, Deploy, PortalIntro } from './scenes/Portal';
import { RouterTour, WalletTour } from './scenes/Tours';
import { Lightning, Outro, Thanks } from './scenes/End';

type SceneC = React.FC<{ duration: number }>;

/** Every section, in order. Each also renders on its own as `Cut-<name>`. */
export const SCENES: Record<SectionName, SceneC> = {
  intro: Intro,
  route: Route,
  legacy: Legacy,
  better: Better,
  taproot: Taproot,
  payswap: PaySwap,
  market: Market,
  portal: PortalIntro,
  deploy: Deploy,
  backend: Backend,
  wallet: WalletTour,
  router: RouterTour,
  cta: Cta,
  thanks: Thanks,
  lightning: Lightning,
  outro: Outro,
};

type Clip = { startSec: number; durSec: number };
const CLIPS = narration as Record<string, Clip>;

/** Narrated cut: music only fills the gaps, silent whenever the narrator speaks. */
const gapVolume = (f: number) => {
  const t = f / FPS;
  const speaking = Object.values(CLIPS).reduce((acc, c) => {
    const inside = Math.min(t - (c.startSec - 0.4), c.startSec + c.durSec + 0.5 - t);
    return Math.max(acc, Math.min(1, Math.max(0, inside / 0.4)));
  }, 0);
  return 0.75 * (1 - speaking);
};

export const OpenSwapVideo: React.FC<{ narrated?: boolean }> = ({ narrated = false }) => (
  <AbsoluteFill style={{ background: '#000' }}>
    {(Object.keys(SCENES) as SectionName[]).map((name) => {
      const { from, duration } = sectionFrames(name);
      const S = SCENES[name];
      return (
        <Sequence key={name} from={from} durationInFrames={duration} name={name}>
          <S duration={duration} />
        </Sequence>
      );
    })}
    {narrated ? <Audio src={staticFile('audio/score-ambient.wav')} volume={gapVolume} /> : <Audio src={staticFile('audio/score.wav')} />}
    {narrated &&
      Object.entries(CLIPS).map(([scene, c]) => (
        <Sequence key={scene} from={Math.round(c.startSec * FPS)} durationInFrames={Math.ceil((c.durSec + 0.2) * FPS)} name={`voice: ${scene}`}>
          <Audio src={staticFile(`narration/${scene}.wav`)} />
        </Sequence>
      ))}
  </AbsoluteFill>
);

/** One section with its slice of the score, for cutting shorter videos. */
export const Cut: React.FC<{ name: SectionName }> = ({ name }) => {
  const { from, duration } = sectionFrames(name);
  const S = SCENES[name];
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <S duration={duration} />
      <Audio src={staticFile('audio/score.wav')} trimBefore={from} volume={(f) => Math.min(1, f / 6, (duration - f) / 12)} />
    </AbsoluteFill>
  );
};

export const DURATION = TOTAL;
export { T };
