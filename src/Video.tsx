import React from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from 'remotion';
import { FPS, sectionFrames, T, TOTAL } from './theme';
import { Wipe } from './components';
import { Intro, WhatIs } from './scenes/Opening';
import { Protocol } from './scenes/Protocols';
import { PortalCta, PortalShots, PortalTitle } from './scenes/Portal';
import { EndCard, Finale, OneMore } from './scenes/Finale';

const Section: React.FC<{ name: Parameters<typeof sectionFrames>[0]; children: (duration: number) => React.ReactNode }> = ({ name, children }) => {
  const { from, duration } = sectionFrames(name);
  return (
    <Sequence from={from} durationInFrames={duration} name={name}>
      {children(duration)}
    </Sequence>
  );
};

// Ink wipes land on these cuts.
const WIPES = ['what', 'taproot', 'legacy', 'payswap', 'portalShots', 'portalCta', 'oneMore'] as const;

export const OpenSwapVideo: React.FC = () => {
  const lt = T.lightningTrack;
  const reel = sectionFrames('reel');
  const soon = sectionFrames('soon');
  const end = sectionFrames('end');
  const trackLen = reel.duration + soon.duration + end.duration;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Section name="intro">{(d) => <Intro duration={d} />}</Section>
      <Section name="what">{(d) => <WhatIs duration={d} />}</Section>
      <Section name="taproot">{(d) => <Protocol mode="taproot" duration={d} />}</Section>
      <Section name="legacy">{(d) => <Protocol mode="legacy" duration={d} />}</Section>
      <Section name="payswap">{(d) => <Protocol mode="payswap" duration={d} />}</Section>
      <Section name="portalTitle">{(d) => <PortalTitle duration={d} />}</Section>
      <Section name="portalShots">{(d) => <PortalShots duration={d} />}</Section>
      <Section name="portalCta">{(d) => <PortalCta duration={d} />}</Section>
      <Section name="oneMore">{(d) => <OneMore duration={d} />}</Section>
      <Sequence from={reel.from} durationInFrames={reel.duration + soon.duration} name="reel + stamp">
        <Finale reelDuration={reel.duration} duration={reel.duration + soon.duration} />
      </Sequence>
      <Section name="end">{(d) => <EndCard duration={d} />}</Section>

      {WIPES.map((w) => (
        <Sequence key={w} from={sectionFrames(w).from - 7} durationInFrames={16} name={`wipe → ${w}`}>
          <Wipe />
        </Sequence>
      ))}

      <Audio src={staticFile('audio/score.wav')} />
      {lt.enabled && (
        // The peak of the track hits as the reels start spinning.
        <Sequence from={reel.from} durationInFrames={trackLen} name="lightning track">
          <Audio
            src={staticFile(lt.file)}
            trimBefore={Math.max(0, Math.round(lt.peakAtSec * FPS) - T.reel.spinStart)}
            volume={(f) => lt.volume * interpolate(f, [0, 6, trackLen - 60, trackLen], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
          />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};

export const DURATION = TOTAL;
