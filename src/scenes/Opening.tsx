import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from 'remotion';
import { BAR, BEAT, C, DISPLAY, MONO } from '../theme';
import { Chip, clamp, H, Logo, Paper, Rise, Scene, Typed, useBeat, useSpring } from '../components';

export const Intro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const beat = useBeat();
  const logoIn = useSpring(4, { damping: 11, mass: 1.1 });
  // A half turn on every bar from bar 2: the swap.
  const k = Math.floor((frame - BAR) / BAR);
  const ph = Math.min(1, (((frame - BAR) % BAR) + BAR) % BAR / 12);
  const turn = frame < BAR ? 0 : 180 * (k + Easing.out(Easing.back(1.6))(ph));
  const rotation = (1 - logoIn) * -540 + turn;
  const titleOn = frame >= BAR;
  const lift = interpolate(frame, [BAR - 10, BAR + 8], [0, -150], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const shrink = interpolate(frame, [BAR - 10, BAR + 8], [1, 0.62], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const lines = interpolate(frame, [0, 40], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

  return (
    <Scene duration={duration}>
      <Paper>
        {/* Crosshair drafting lines draw in. */}
        <AbsoluteFill>
          <div style={{ position: 'absolute', top: '50%', left: 0, height: 2, width: `${lines * 100}%`, background: C.ink12 }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, width: 2, height: `${lines * 100}%`, background: C.ink12 }} />
          {[260, 420, 600].map((r, i) => (
            <div
              key={r}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: r * 2,
                height: r * 2,
                marginLeft: -r,
                marginTop: -r,
                borderRadius: '50%',
                border: `2px dashed ${C.ink12}`,
                transform: `scale(${interpolate(frame, [i * 6, 30 + i * 6], [0.2, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) * (1 + beat * 0.012)}) rotate(${frame * (i % 2 ? -0.2 : 0.25)}deg)`,
              }}
            />
          ))}
        </AbsoluteFill>

        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ transform: `translateY(${lift}px) scale(${shrink * logoIn * (1 + beat * 0.03)})`, filter: 'drop-shadow(10px 12px 0 rgba(17,17,17,0.9))' }}>
            <Logo size={360} rotate={rotation} />
          </div>
        </AbsoluteFill>

        {titleOn && (
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 300 }}>
            <Rise
              text="OpenSwap"
              delay={BAR + 2}
              style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 190, color: C.ink, justifyContent: 'center', letterSpacing: '0.02em' }}
            />
            <Rise
              text="An Actually Decentralized Atomic-Swap Marketplace"
              delay={BAR + 14}
              stagger={2}
              style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 50, color: C.ink70, justifyContent: 'center', marginTop: 10 }}
            />
            <div style={{ marginTop: 34, display: 'flex', gap: 18, opacity: interpolate(frame, [BAR * 2, BAR * 2 + 8], [0, 1], clamp) }}>
              <Chip dark>release v0.2.3</Chip>
              <Chip>open source</Chip>
            </div>
          </AbsoluteFill>
        )}
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 46 }}>
          <Typed
            text="first release under the OpenSwap name"
            delay={BAR * 2 + BEAT * 2}
            style={{ fontSize: 24, color: C.ink45, letterSpacing: '0.08em' }}
          />
        </AbsoluteFill>
      </Paper>
    </Scene>
  );
};

const HOPS = [
  { x: 260, label: 'You', sub: 'taker' },
  { x: 760, label: 'Router A', sub: 'over Tor' },
  { x: 1160, label: 'Router B', sub: 'over Tor' },
  { x: 1660, label: 'You', sub: 'fresh coins' },
];
const IDS = ['a3f1·9e02', '7c0d·41ba', 'e95b·0c7f', '2d84·b613'];
const PILLS = ['Non-custodial', 'Atomic', 'Multi-hop', 'Over Tor', 'Found on Nostr', 'Fidelity bonds'];

export const WhatIs: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const beat = useBeat();
  const flowStart = BAR;
  const hopLen = BEAT * 3;
  const pathY = 560;
  const p = Math.max(0, (frame - flowStart) / hopLen);
  const hop = Math.min(HOPS.length - 1, Math.floor(p));
  const within = Math.min(1, p - Math.floor(p));
  const move = Easing.inOut(Easing.cubic)(Math.min(1, within * 1.6));
  const coinX = hop >= HOPS.length - 1 ? HOPS[HOPS.length - 1].x : interpolate(move, [0, 1], [HOPS[hop].x, HOPS[hop + 1].x]);
  const arrived = hop >= HOPS.length - 1;
  const idIdx = arrived ? 3 : move > 0.5 ? hop + 1 : hop;
  const coinPop = Math.max(0, 1 - Math.abs(move - 0.5) * 6);

  return (
    <Scene duration={duration}>
      <Paper>
        <AbsoluteFill style={{ padding: '90px 120px' }}>
          <Rise text="What is OpenSwap?" style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, color: C.ink }} />
          <div style={{ marginTop: 16, height: 50 }}>
            <Typed text="> non-custodial, atomic, multi-hop bitcoin swaps." delay={14} cps={1.6} style={{ fontSize: 34, color: C.ink70 }} />
          </div>
        </AbsoluteFill>

        {/* Route */}
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          {HOPS.slice(0, -1).map((h, i) => {
            const draw = interpolate(frame, [20 + i * 6, 44 + i * 6], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
            const x2 = h.x + (HOPS[i + 1].x - h.x) * draw;
            return (
              <g key={i}>
                <line x1={h.x} y1={pathY} x2={x2} y2={pathY} stroke={C.ink} strokeWidth={4} strokeDasharray="14 12" strokeDashoffset={-frame * 2} />
                {i > 0 && i < 3 && <rect x={h.x - 40} y={pathY - 120} width={80} height={240} rx={40} fill="none" stroke={C.ink12} strokeWidth={3} />}
              </g>
            );
          })}
        </svg>
        {HOPS.map((h, i) => {
          const s = interpolate(frame, [16 + i * 6, 30 + i * 6], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
          const lit = (arrived ? 3 : hop) === i;
          return (
            <div key={i} style={{ position: 'absolute', left: h.x - 90, top: pathY - 90, width: 180, textAlign: 'center', transform: `scale(${s})` }}>
              <div
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: 40,
                  border: `4px solid ${C.ink}`,
                  background: lit ? C.ink : C.card,
                  boxShadow: `8px 8px 0 ${C.ink}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: DISPLAY,
                  fontWeight: 600,
                  fontSize: 36,
                  color: lit ? C.paper : C.ink,
                }}
              >
                {h.label}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 22, marginTop: 22, color: C.ink45, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h.sub}</div>
            </div>
          );
        })}
        {/* The coin: same value, new history at every hop. */}
        {frame >= flowStart - 8 && (
          <div
            style={{
              position: 'absolute',
              left: coinX - 56,
              top: pathY - 230 - coinPop * 26,
              width: 112,
              textAlign: 'center',
              opacity: interpolate(frame, [flowStart - 8, flowStart], [0, 1], clamp),
            }}
          >
            <div
              style={{
                width: 112,
                height: 112,
                borderRadius: '50%',
                background: C.orange,
                border: `4px solid ${C.ink}`,
                boxShadow: `6px 6px 0 ${C.ink}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: 64,
                color: C.ink,
                transform: `rotateY(${move * 360}deg) scale(${1 + beat * 0.06})`,
              }}
            >
              ₿
            </div>
            <div style={{ fontFamily: MONO, fontSize: 22, marginTop: 10, color: C.ink, background: C.card, border: `2px solid ${C.ink}`, borderRadius: 10, padding: '2px 8px', whiteSpace: 'nowrap', marginLeft: -40, marginRight: -40 }}>
              txid {IDS[idIdx]}
            </div>
          </div>
        )}

        <AbsoluteFill style={{ justifyContent: 'flex-end', padding: '0 120px 86px' }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 34 }}>
            {PILLS.map((t, i) => {
              const at = BAR * 2 + i * BEAT;
              const s = interpolate(frame, [at, at + 8], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.4)) });
              return (
                <div key={t} style={{ transform: `scale(${s}) rotate(${(1 - s) * -8}deg)`, opacity: s }}>
                  <Chip dark={i % 2 === 0} style={{ fontSize: 26 }}>{t}</Chip>
                </div>
              );
            })}
          </div>
          <div style={{ opacity: interpolate(frame, [BAR * 4, BAR * 4 + 10], [0, 1], clamp) }}>
            <H size={46}>Break the transaction graph. No trust, no custodian, no shared history.</H>
          </div>
        </AbsoluteFill>
      </Paper>
    </Scene>
  );
};

