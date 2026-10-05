import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C, HEAD, MONO } from '../theme';
import { Backdrop, Body, clamp, Decode, easeInOut, FadeUp, Logo, Neon, Pill, Scene, Title } from '../components';

type D = { duration: number };

// Core team first in the requested order, then by contribution score.
const CREW = ['mojoX911', 'stark-3k', 'keraliss', '0xEgao', 'ManthanNimodiya', 'Godzilla-oss', 'uqlidi', 'Atishyy27', 'NeoZ666', 'Supremesv715', 'YoganshSharma', 'hulxv', 'tanishkaa08'];

export const Thanks: React.FC<D> = ({ duration }) => {
  const frame = useCurrentFrame();
  return (
    <Scene duration={duration}>
      <Backdrop>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 200px' }}>
          <Decode text="Thank you" at={2} speed={0.7} style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 110, color: C.fg }} />
          <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: '0.3em', color: C.subtle, margin: '22px 0 40px' }}>BUILT IN THE OPEN BY</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '18px 46px' }}>
            {CREW.map((n, i) => {
              const at = 18 + i * 3;
              const o = interpolate(frame, [at, at + 10], [0, 1], clamp);
              return (
                <div key={n} style={{ opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>
                  <Title size={44} style={{ color: i % 2 ? C.muted : C.fg }}>{n}</Title>
                </div>
              );
            })}
          </div>
          <FadeUp at={80} style={{ marginTop: 50 }}>
            <Body size={30} style={{ textAlign: 'center' }}>…and thank you to everyone else who contributed.</Body>
          </FadeUp>
        </AbsoluteFill>
      </Backdrop>
    </Scene>
  );
};

/** A quiet tease: a bolt draws itself, the words decode, a small pill. */
export const Lightning: React.FC<D> = ({ duration }) => {
  const frame = useCurrentFrame();
  const bolt = interpolate(frame, [6, 40], [0, 1], { ...clamp, easing: easeInOut });
  return (
    <Scene duration={duration}>
      <Backdrop accent={C.amber} grid={0.5}>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <svg width={120} height={170} viewBox="0 0 100 140">
            <Neon d="M60 4 L14 80 L46 80 L36 136 L88 54 L56 54 Z" color={C.amber} progress={bolt} width={3} />
          </svg>
          <div style={{ marginTop: 30 }}>
            <Decode text="Lightning swaps" at={30} speed={0.9} style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 84, color: C.fg }} />
          </div>
          <FadeUp at={62} style={{ marginTop: 26 }}>
            <Pill color={C.amber}>coming soon</Pill>
          </FadeUp>
        </AbsoluteFill>
      </Backdrop>
    </Scene>
  );
};

export const Outro: React.FC<D> = ({ duration }) => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [duration - 30, duration], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Backdrop>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 260px', opacity: fade }}>
          <FadeUp at={4}>
            <Title size={64} style={{ textAlign: 'center', lineHeight: 1.25 }}>
              “Privacy is necessary for an open society in the electronic age.”
            </Title>
          </FadeUp>
          <FadeUp at={30} style={{ marginTop: 30 }}>
            <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: '0.16em', color: C.subtle }}>— ERIC HUGHES, A CYPHERPUNK'S MANIFESTO, 1993</div>
          </FadeUp>
          <FadeUp at={70} style={{ marginTop: 80, display: 'flex', alignItems: 'center', gap: 22 }}>
            <Logo size={64} rotate={frame * 1.5} />
            <Title size={54}>Much more to come.</Title>
          </FadeUp>
          <FadeUp at={86} style={{ marginTop: 18 }}>
            <div style={{ fontFamily: MONO, fontSize: 28, color: C.azure }}>openswap.live</div>
          </FadeUp>
        </AbsoluteFill>
      </Backdrop>
    </AbsoluteFill>
  );
};
