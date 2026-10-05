import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { SectionName, sectionFrames, T, TOTAL } from './theme';
import { Better, Intro, Legacy, PaySwap, Route, Taproot } from './scenes/Story';
import { Market } from './scenes/Market';
import { Backend, Cta, Deploy, PortalIntro, RouterUI, WalletUI } from './scenes/Portal';
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
  wallet: WalletUI,
  router: RouterUI,
  cta: Cta,
  thanks: Thanks,
  lightning: Lightning,
  outro: Outro,
};

export const OpenSwapVideo: React.FC = () => (
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
    <Audio src={staticFile('audio/score.wav')} />
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
